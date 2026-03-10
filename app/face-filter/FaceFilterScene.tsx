'use client';

import { useEffect, useState } from 'react';
import FaceFilterCanvas from './FaceFilterCanvas';

export default function FaceFilterScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;

    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setMounted(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, []);

  if (!mounted) {
    return (
      <main
        style={{
          width: '100vw',
          height: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#000',
          color: '#fff',
        }}
      >
        Iniciando cámara...
      </main>
    );
  }

  return <FaceFilterCanvas />;
}