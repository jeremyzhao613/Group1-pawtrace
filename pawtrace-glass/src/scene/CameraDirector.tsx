import { MutableRefObject, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { Vector3 } from 'three';
import type { PoiRecord } from '@/types';

export type CameraControlsHandle = {
  target: Vector3;
  update: () => void;
} | null;

interface CameraDirectorProps {
  activePoi: PoiRecord;
  controlsRef: MutableRefObject<CameraControlsHandle>;
}

export const CameraDirector = ({
  activePoi,
  controlsRef,
}: CameraDirectorProps) => {
  const { camera } = useThree();
  const introCompleteRef = useRef(false);
  const rigRef = useRef({
    x: 22,
    y: 12,
    z: 22,
    tx: 0,
    ty: 1.1,
    tz: 0,
  });
  const desiredPosition = useRef(new Vector3());
  const desiredTarget = useRef(new Vector3());

  useEffect(() => {
    introCompleteRef.current = false;

    const introTimeline = gsap.timeline({
      defaults: {
        ease: 'power3.inOut',
      },
    });

    introTimeline
      .set(rigRef.current, {
        x: 22,
        y: 12,
        z: 22,
        tx: 0,
        ty: 1.1,
        tz: 0,
      })
      .to(rigRef.current, {
        duration: 2.8,
        x: 14.8,
        y: 8.4,
        z: 16,
      })
      .to(
        rigRef.current,
        {
          duration: 2.4,
          x: activePoi.cameraPosition[0] + 1.2,
          y: activePoi.cameraPosition[1] + 0.8,
          z: activePoi.cameraPosition[2] + 1.5,
        },
        '-=1.1',
      )
      .to(rigRef.current, {
        duration: 1.7,
        ease: 'sine.out',
        x: activePoi.cameraPosition[0],
        y: activePoi.cameraPosition[1],
        z: activePoi.cameraPosition[2],
        tx: activePoi.focusTarget[0],
        ty: activePoi.focusTarget[1],
        tz: activePoi.focusTarget[2],
        onComplete: () => {
          introCompleteRef.current = true;
        },
      });

    return () => {
      introTimeline.kill();
    };
  }, []);

  useEffect(() => {
    if (!introCompleteRef.current) {
      return;
    }

    const focusTween = gsap.to(rigRef.current, {
      duration: 1.6,
      ease: 'power3.inOut',
      x: activePoi.cameraPosition[0],
      y: activePoi.cameraPosition[1],
      z: activePoi.cameraPosition[2],
      tx: activePoi.focusTarget[0],
      ty: activePoi.focusTarget[1],
      tz: activePoi.focusTarget[2],
    });

    return () => {
      focusTween.kill();
    };
  }, [activePoi]);

  useFrame((_, delta) => {
    desiredPosition.current.set(rigRef.current.x, rigRef.current.y, rigRef.current.z);
    desiredTarget.current.set(rigRef.current.tx, rigRef.current.ty, rigRef.current.tz);

    const easing = 1 - Math.exp(-delta * 3.5);

    camera.position.lerp(desiredPosition.current, easing);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredTarget.current, easing);
      controlsRef.current.update();
    } else {
      camera.lookAt(desiredTarget.current);
    }
  });

  return null;
};
