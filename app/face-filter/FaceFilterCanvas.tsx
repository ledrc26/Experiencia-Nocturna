'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGLTF, useAnimations } from '@react-three/drei';
import {
  FaceTracker,
  HeadMaskMesh,
  ZapparCamera,
  ZapparCanvas,
} from '@zappar/zappar-react-three-fiber';
import * as THREE from 'three';

function ButterflyFilterModel() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/filter_butterflies.glb');
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (names.length > 0) {
      actions[names[0]]?.reset().fadeIn(0.3).play();
    }
  }, [actions, names]);

  return (
    <group
      ref={group}
      position={[0, 0.6, 0.35]}
      scale={[0.35, 0.35, 0.35]}
      rotation={[0, Math.PI, 0]}
    >
      <primitive object={scene} />
    </group>
  );
}

function CaptureButton({
  isSaving,
  onCapture,
}: {
  isSaving: boolean;
  onCapture: () => void;
}) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onCapture();
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onCapture();
      }}
      disabled={isSaving}
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2147483647,
        border: 'none',
        borderRadius: 999,
        padding: '14px 22px',
        fontSize: 16,
        fontWeight: 600,
        background: '#ffffff',
        color: '#111111',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        cursor: isSaving ? 'not-allowed' : 'pointer',
        pointerEvents: 'auto',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {isSaving ? 'Guardando...' : 'Tomar foto'}
    </button>,
    document.body
  );
}

export default function FaceFilterCanvas() {
  const [faceDetected, setFaceDetected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const disableCanvasEvents = () => {
      const root = containerRef.current;
      if (!root) return;

      const canvases = root.querySelectorAll('canvas');
      canvases.forEach((canvas) => {
        (canvas as HTMLCanvasElement).style.pointerEvents = 'none';
      });

      const videos = root.querySelectorAll('video');
      videos.forEach((video) => {
        (video as HTMLVideoElement).style.pointerEvents = 'none';
      });

      const divs = root.querySelectorAll('div');
      divs.forEach((div) => {
        const el = div as HTMLDivElement;
        if (el !== root) {
          el.style.pointerEvents = 'none';
        }
      });
    };

    disableCanvasEvents();
    const id = window.setInterval(disableCanvasEvents, 500);

    return () => window.clearInterval(id);
  }, []);

  const getCanvasBlob = async (): Promise<Blob | null> => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) {
      alert('No se encontró el canvas de la escena.');
      return null;
    }

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCapture = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      const blob = await getCanvasBlob();
      if (!blob) {
        alert('No fue posible capturar la imagen.');
        return;
      }

      const fileName = `face-filter-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (
        'canShare' in navigator &&
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        'share' in navigator &&
        navigator.share
      ) {
        await navigator.share({
          files: [file],
          title: 'Mi foto con filtro AR',
          text: 'Foto tomada con el filtro de mariposas',
        });
      } else {
        downloadBlob(blob, fileName);
      }
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al guardar la foto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <ZapparCanvas gl={{ preserveDrawingBuffer: true } as any}>
        <ZapparCamera userFacing userCameraMirrorMode="poses" />

        <ambientLight intensity={1.2} />
        <directionalLight position={[2.5, 8, 5]} intensity={1.5} />

        <FaceTracker
          onVisible={() => setFaceDetected(true)}
          onNotVisible={() => setFaceDetected(false)}
        >
          <Suspense fallback={null}>
            <HeadMaskMesh />
            {faceDetected && <ButterflyFilterModel />}
          </Suspense>
        </FaceTracker>
      </ZapparCanvas>

      <CaptureButton isSaving={isSaving} onCapture={handleCapture} />
    </main>
  );
}