from __future__ import annotations

import math
import os
import shutil
import tempfile
from pathlib import Path
from typing import Any

import cv2
from fastapi import FastAPI, File, HTTPException, UploadFile
from ultralytics import YOLO


DISCLAIMER = "This result is only a behavior-risk hint and does not constitute veterinary diagnosis."
MODEL_NAME = os.getenv("YOLO_MODEL_NAME", "yolo11n.pt")
FRAME_STRIDE = max(1, int(os.getenv("VIDEO_FRAME_STRIDE", "12")))
MAX_ANALYZED_FRAMES = max(20, int(os.getenv("MAX_ANALYZED_FRAMES", "360")))
PET_LABELS = {"cat", "dog"}

app = FastAPI(title="PawTrace Pet Video Behavior Analysis", version="0.1.0")
_model: YOLO | None = None


def get_model() -> YOLO:
    global _model
    if _model is None:
        _model = YOLO(MODEL_NAME)
    return _model


def risk_for_behavior(behavior: str) -> str:
    if behavior == "poor_video_quality":
        return "medium"
    if behavior == "frequent_fast_movement":
        return "medium"
    return "low"


def classify_activity(detection_rate: float, movement_score: float) -> str:
    if detection_rate < 0.2:
        return "poor_video_quality"
    if movement_score < 12:
        return "low_activity_or_resting"
    if movement_score > 58:
        return "frequent_fast_movement"
    return "normal_movement"


def advice_for(activity_type: str, events_count: int) -> str:
    if activity_type == "poor_video_quality":
        return "The pet was detected in too few sampled frames. Try a brighter, steadier video with the pet fully visible."
    if activity_type == "low_activity_or_resting":
        return "Activity appears low in this short clip. Compare with the pet's usual routine and keep observing appetite, water intake, and energy."
    if activity_type == "frequent_fast_movement" or events_count:
        return "Sudden movement was detected. Record when it happens, how often it repeats, and whether there are changes in appetite, gait, ear odor, redness, or discharge."
    return "Movement pattern looks generally normal in this short video."


def find_pet_center(result: Any, frame_width: int, frame_height: int) -> tuple[float, float, float] | None:
    names = getattr(result, "names", {}) or {}
    boxes = getattr(result, "boxes", None)
    if boxes is None:
        return None

    best: tuple[float, float, float] | None = None
    best_area = 0.0
    for box in boxes:
        cls_id = int(box.cls[0])
        label = str(names.get(cls_id, cls_id)).lower()
        if label not in PET_LABELS:
            continue
        confidence = float(box.conf[0])
        if confidence < 0.25:
            continue
        x1, y1, x2, y2 = [float(v) for v in box.xyxy[0]]
        area = max(0.0, x2 - x1) * max(0.0, y2 - y1)
        if area <= best_area:
            continue
        center_x = ((x1 + x2) / 2) / max(frame_width, 1)
        center_y = ((y1 + y2) / 2) / max(frame_height, 1)
        best = (center_x, center_y, confidence)
        best_area = area
    return best


def build_timeline(samples: list[dict[str, Any]], duration_sec: float) -> list[dict[str, Any]]:
    if duration_sec <= 0:
        return []

    segment_size = 10.0
    segments: list[dict[str, Any]] = []
    start = 0.0
    while start < duration_sec:
        end = min(duration_sec, start + segment_size)
        bucket = [s for s in samples if start <= s["timeSec"] < end]
        detected = [s for s in bucket if s.get("detected")]
        detection_rate = len(detected) / len(bucket) if bucket else 0.0
        avg_movement = sum(float(s.get("movement", 0.0)) for s in detected) / len(detected) if detected else 0.0
        behavior = classify_activity(detection_rate, min(100.0, avg_movement * 180.0))
        segments.append(
            {
                "startSec": round(start, 1),
                "endSec": round(end, 1),
                "behavior": behavior,
                "risk": risk_for_behavior(behavior),
            }
        )
        start = end
    return segments


def analyze_video_file(video_path: Path) -> dict[str, Any]:
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise HTTPException(status_code=400, detail="Unable to read uploaded video.")

    fps = cap.get(cv2.CAP_PROP_FPS) or 0
    if not fps or not math.isfinite(fps) or fps <= 1:
        fps = 30.0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    duration_sec = frame_count / fps if frame_count > 0 else 0.0

    model = get_model()
    frame_index = 0
    analyzed_frames = 0
    detected_frames = 0
    previous_center: tuple[float, float] | None = None
    movement_values: list[float] = []
    samples: list[dict[str, Any]] = []
    events: list[dict[str, Any]] = []

    while analyzed_frames < MAX_ANALYZED_FRAMES:
        ok, frame = cap.read()
        if not ok:
            break
        if frame_index % FRAME_STRIDE != 0:
            frame_index += 1
            continue

        analyzed_frames += 1
        height, width = frame.shape[:2]
        time_sec = frame_index / fps
        result = model(frame, verbose=False, imgsz=640)[0]
        center = find_pet_center(result, width, height)
        sample: dict[str, Any] = {"timeSec": time_sec, "detected": False, "movement": 0.0}

        if center:
            detected_frames += 1
            cx, cy, confidence = center
            sample["detected"] = True
            sample["confidence"] = confidence
            if previous_center:
                distance = math.dist((cx, cy), previous_center)
                movement_values.append(distance)
                sample["movement"] = distance
                if distance > 0.18:
                    events.append(
                        {
                            "timeSec": round(time_sec, 1),
                            "type": "rapid_body_movement",
                            "confidence": round(min(0.99, 0.62 + distance * 1.6), 2),
                            "note": "Detected sudden fast movement. This may indicate excitement, shaking, scratching, or unstable video.",
                        }
                    )
            previous_center = (cx, cy)

        samples.append(sample)
        frame_index += 1

    cap.release()

    detection_rate = detected_frames / analyzed_frames if analyzed_frames else 0.0
    avg_movement = sum(movement_values) / len(movement_values) if movement_values else 0.0
    movement_score = round(min(100.0, avg_movement * 180.0), 1)
    activity_type = classify_activity(detection_rate, movement_score)
    risk_level = "medium" if activity_type in {"poor_video_quality", "frequent_fast_movement"} or len(events) >= 3 else "low"

    return {
        "success": True,
        "summary": {
            "durationSec": round(duration_sec, 1),
            "analyzedFrames": analyzed_frames,
            "detectedFrames": detected_frames,
            "detectionRate": round(detection_rate, 3),
            "movementScore": movement_score,
            "activityType": activity_type,
            "riskLevel": risk_level,
        },
        "timeline": build_timeline(samples, duration_sec),
        "events": events[:20],
        "advice": advice_for(activity_type, len(events)),
        "disclaimer": DISCLAIMER,
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": MODEL_NAME}


@app.post("/analyze-video")
async def analyze_video(video: UploadFile = File(...)) -> dict[str, Any]:
    suffix = Path(video.filename or "pet-video.mp4").suffix.lower()
    if suffix not in {".mp4", ".mov", ".avi", ".webm"}:
        raise HTTPException(status_code=400, detail="Unsupported video format. Use mp4, mov, avi, or webm.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        temp_path = Path(tmp.name)
        shutil.copyfileobj(video.file, tmp)

    try:
        return analyze_video_file(temp_path)
    finally:
        temp_path.unlink(missing_ok=True)
