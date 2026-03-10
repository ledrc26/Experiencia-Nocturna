'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import {
  FaceTracker,
  HeadMaskMesh,
  Loader,
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

export default function FaceFilterCanvas() {

  const [faceDetected, setFaceDetected] = useState(false);

  return (
    <main style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ZapparCanvas>
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

        <Loader />
      </ZapparCanvas>
    </main>
  );
}