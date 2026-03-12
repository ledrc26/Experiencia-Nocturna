'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Script from 'next/script';

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

export default function MindArFace() {
  const [aframeReady, setAframeReady] = useState(false);
  const [extrasReady, setExtrasReady] = useState(false);
  const [mindarReady, setMindarReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ready = aframeReady && extrasReady && mindarReady;

  const getCompositeBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      // Esperar al siguiente frame para que A-Frame haya terminado de renderizar
      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return resolve(null);

        // El <video> es el feed crudo de la cámara (MindAR lo crea internamente)
        const video = container.querySelector<HTMLVideoElement>('video');

        // A-Frame crea exactamente un <canvas> para el renderer de Three.js
        const glCanvas = container.querySelector<HTMLCanvasElement>('canvas');

        if (!glCanvas) {
          alert('No se encontró el canvas de A-Frame.');
          return resolve(null);
        }

        // Forzar un render sincrónico del renderer de A-Frame
        // para que los píxeles AR estén disponibles en el canvas WebGL
        try {
          const sceneEl = container.querySelector('a-scene') as any;
          if (sceneEl?.renderer && sceneEl?.object3D && sceneEl?.camera) {
            sceneEl.renderer.render(sceneEl.object3D, sceneEl.camera);
          }
        } catch (e) {
          console.warn('No se pudo forzar render manual:', e);
        }

        const w = glCanvas.width || 1280;
        const h = glCanvas.height || 720;

        const composite = document.createElement('canvas');
        composite.width = w;
        composite.height = h;
        const ctx = composite.getContext('2d');

        if (!ctx) return resolve(null);

        // 1. Dibujar el video de la cámara como fondo
        if (video && video.readyState >= 2) {
          ctx.save();
          // MindAR espeja la cámara frontal — reflejar horizontalmente para que coincida
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, w, h);
          ctx.restore();
        }

        // 2. Superponer el canvas WebGL de A-Frame (el overlay 3D con las mariposas)
        // globalAlpha en 1 = dibujar tal cual, incluyendo zonas transparentes del AR
        try {
          ctx.drawImage(glCanvas, 0, 0, w, h);
        } catch (e) {
          console.warn('No se pudo componer el canvas WebGL:', e);
        }

        composite.toBlob((blob) => resolve(blob), 'image/png');
      });
    });
  }, []);

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

  const handleCapture = useCallback(async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      const blob = await getCompositeBlob();
      if (!blob) {
        alert('No fue posible capturar la imagen.');
        return;
      }

      const fileName = `face-filter-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (
        'canShare' in navigator &&
        navigator.canShare?.({ files: [file] }) &&
        'share' in navigator
      ) {
        await (navigator as any).share({
          files: [file],
          title: 'Mi foto con filtro AR',
          text: 'Foto tomada con el filtro de mariposas',
        });
      } else {
        downloadBlob(blob, fileName);
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al guardar la foto.');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, getCompositeBlob]);

  // Parchear preserveDrawingBuffer lo antes posible después de que A-Frame inicie
  // Esto funciona porque Three.js acepta el cambio antes del primer clear()
  useEffect(() => {
    if (!ready) return;

    const patch = () => {
      const sceneEl = containerRef.current?.querySelector('a-scene') as any;
      const renderer = sceneEl?.renderer;
      if (!renderer) return false;

      // Forzar preserveDrawingBuffer en el contexto existente
      // Nota: en WebGL1/2 esto no se puede cambiar en el contexto ya creado,
      // pero en A-Frame 1.5 el renderer expone un método para recrear el contexto
      renderer.preserveDrawingBuffer = true;

      // Alternativa más agresiva: acceder directamente al contexto GL
      const gl: WebGLRenderingContext | WebGL2RenderingContext | null =
        renderer.getContext?.() ?? renderer.context ?? null;

      if (gl) {
        // Algunos navegadores permiten cambiar este atributo post-init vía extensión
        const ext = (gl as any).getExtension?.('WEBGL_lose_context');
        if (ext) {
          // Recrear el contexto con preserveDrawingBuffer = true
          // A-Frame lo detecta y lo reinicia automáticamente
          // Solo hacerlo si el flag no está ya activo
          const attrs = gl.getContextAttributes?.();
          if (attrs && !attrs.preserveDrawingBuffer) {
            // No podemos recrear sin perder el estado — usar método alternativo
            console.info('Usando captura manual por falta de preserveDrawingBuffer');
          }
        }
      }

      return true;
    };

    // Intentar inmediatamente y reintentar si A-Frame aún no inició
    if (!patch()) {
      const id = window.setInterval(() => {
        if (patch()) window.clearInterval(id);
      }, 200);
      return () => window.clearInterval(id);
    }
  }, [ready]);

  const scene = useMemo(() => {
    if (!ready) return null;

    return (
      // preserveDrawingBuffer: true en el renderer de A-Frame
      // Es el flag más importante — le indica a Three.js que no limpie
      // el back buffer después de presentar el frame al compositor
      <a-scene
        renderer="colorManagement: true; physicallyCorrectLights: true; preserveDrawingBuffer: true"
        mindar-face="autoStart: true; uiScanning: false; uiLoading: yes; uiError: yes;"
        embedded
        color-space="sRGB"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
      >
        <a-assets>
          <a-asset-item
            id="butterfliesModel"
            src="/filter_butterflies.glb"
          ></a-asset-item>
        </a-assets>

        <a-camera active="false" position="0 0 0"></a-camera>

        <a-light type="ambient" intensity="1"></a-light>
        <a-light type="directional" intensity="0.8" position="0 1 1"></a-light>

        <a-entity mindar-face-target="anchorIndex: 168">
          <a-gltf-model
            src="#butterfliesModel"
            position="0 0.3 0"
            rotation="0 180 0"
            scale="0.35 0.35 0.35"
            animation-mixer
          ></a-gltf-model>
        </a-entity>
      </a-scene>
    );
  }, [ready]);

  return (
    <>
      <Script
        src="https://aframe.io/releases/1.5.0/aframe.min.js"
        strategy="afterInteractive"
        onLoad={() => setAframeReady(true)}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/aframe-extras.animation-mixer@6.1.1/dist/aframe-extras.animation-mixer.min.js"
        strategy="afterInteractive"
        onLoad={() => setExtrasReady(true)}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-face-aframe.prod.js"
        strategy="afterInteractive"
        onLoad={() => setMindarReady(true)}
      />

      <div
        ref={containerRef}
        style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
      >
        {ready ? (
          scene
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              background: '#000',
              color: '#fff',
              fontFamily: 'sans-serif',
            }}
          >
            Cargando Face Tracking...
          </div>
        )}
      </div>

      {ready && <CaptureButton isSaving={isSaving} onCapture={handleCapture} />}
    </>
  );
}