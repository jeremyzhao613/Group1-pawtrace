# PawTrace AI Video Service

FastAPI service for the PawTrace **Pet Video Behavior Analysis** feature.

The service accepts a short pet video, samples frames with OpenCV, uses an Ultralytics YOLO model to detect cats/dogs, tracks detected pet-center movement between sampled frames, and returns behavior-risk hints. It does **not** diagnose diseases.

## Setup

```bash
cd ai-video-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8008
```

The first run may download the configured YOLO model. By default the service uses `yolov8n.pt`.

## Endpoint

`POST /analyze-video`

Multipart form field:

```text
video
```

Supported file extensions:

```text
mp4, mov, avi, webm
```

Example:

```bash
curl -X POST http://127.0.0.1:8008/analyze-video \
  -F "video=@/path/to/pet-video.mp4"
```

## Optional Environment Variables

- `YOLO_MODEL_NAME`: defaults to `yolov8n.pt`
- `VIDEO_FRAME_STRIDE`: defaults to `12`
- `MAX_ANALYZED_FRAMES`: defaults to `360`

If the machine cannot access the model download URL, place the weight file locally and point `YOLO_MODEL_NAME` to it:

```bash
mkdir -p models
# put yolov8n.pt under ai-video-service/models/
YOLO_MODEL_NAME=./models/yolov8n.pt uvicorn app:app --host 0.0.0.0 --port 8008
```

If `cv2` fails with a NumPy 2.x compatibility error, recreate the virtual environment and reinstall with this repository's pinned `numpy<2.0` requirement.

## Output

The response includes:

- `summary.durationSec`
- `summary.analyzedFrames`
- `summary.detectedFrames`
- `summary.detectionRate`
- `summary.movementScore`
- `summary.activityType`
- `summary.riskLevel`
- `timeline`
- `events`
- `advice`
- `disclaimer`

Disclaimer:

```text
This result is only a behavior-risk hint and does not constitute veterinary diagnosis.
```
