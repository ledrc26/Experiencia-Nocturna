"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import {
  ZapparCamera,
  InstantTracker,
  ZapparCanvas,
} from "@zappar/zappar-react-three-fiber";
import { useGLTF, useAnimations } from "@react-three/drei";

// 1. EL MODELO 3D (Con el parche antidesaparición)
function ModeloMariposas() {
  const { scene, animations } = useGLTF("/mariposas5.glb");
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    Object.values(actions).forEach((action) => {
      if (action) action.play();
    });

    // Apagamos el recorte de Three.js para evitar parpadeos
    scene.traverse((hijo: any) => {
      if (hijo.isMesh) hijo.frustumCulled = false;
    });
  }, [actions, scene]);

  return (
    <primitive
      object={scene}
      scale={1}
      position={[0, 0, 0]}
      frustumCulled={false}
    />
  );
}

// 2. LA INTERFAZ DE USUARIO (Maneja el contador y el botón)
function InterfazUsuario({
  colocado,
  onLiberar,
  onReposicionar,
}: {
  colocado: boolean;
  onLiberar: () => void;
  onReposicionar: () => void;
}) {
  const [contador, setContador] = useState(4);
  const [mensaje, setMensaje] = useState(
    "Apunta tu cámara hacia la pista de baile...",
  );

  // Cuando el usuario hace clic en "Reposicionar", reactivamos la UI
  useEffect(() => {
    if (!colocado) {
      setContador(4);
      setMensaje("Apunta tu cámara hacia la pista de baile...");
    }
  }, [colocado]);

  // Lógica del contador
  useEffect(() => {
    if (!colocado) {
      if (contador > 0) {
        const timer = setTimeout(() => setContador((c) => c - 1), 1000);
        return () => clearTimeout(timer);
      } else if (contador === 0) {
        setMensaje("¡Las mariposas han sido liberadas!");
        onLiberar(); // Le avisa al motor que ancle el modelo
        setTimeout(() => setMensaje(""), 3000); // Limpiamos la pantalla
      }
    }
  }, [contador, colocado, onLiberar]);

  return (
    <>
      {/* Textos y Contador */}
      {mensaje && (
        <div
          style={{
            position: "absolute",
            zIndex: 10,
            width: "100%",
            top: "40%",
            textAlign: "center",
            color: "white",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            pointerEvents: "none",
          }}
        >
          <h2 style={{ fontSize: "24px", padding: "0 20px" }}>{mensaje}</h2>
          {!colocado && contador > 0 && (
            <h1 style={{ fontSize: "60px", margin: "10px 0" }}>{contador}</h1>
          )}
        </div>
      )}

      {/* EL BOTÓN DE RESCATE: Solo aparece cuando las mariposas ya están ancladas */}
      {colocado && (
        <button
          onClick={onReposicionar}
          style={{
            position: "absolute",
            bottom: "50px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 24px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            border: "2px solid white",
            color: "white",
            borderRadius: "30px",
            fontSize: "16px",
            fontWeight: "bold",
            backdropFilter: "blur(4px)",
            zIndex: 20,
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          }}
        >
          Reposicionar Mariposas
        </button>
      )}
    </>
  );
}

// 3. EL COMPONENTE PRINCIPAL (Dueño de la verdad)
export default function VisorZappar() {
  const [colocado, setColocado] = useState(false);

  // Usamos useCallback para que React no recree estas funciones y tire la cámara
  const handleLiberar = useCallback(() => setColocado(true), []);
  const handleReposicionar = useCallback(() => setColocado(false), []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        backgroundColor: "black",
      }}
    >
      {/* Le pasamos el control a la interfaz */}
      <InterfazUsuario
        colocado={colocado}
        onLiberar={handleLiberar}
        onReposicionar={handleReposicionar}
      />

      <ZapparCanvas>
        <ZapparCamera />
        <Suspense fallback={null}>
          <InstantTracker
            placementMode={!colocado}
            placementCameraOffset={[0, -1, -4]}
          >
            <ModeloMariposas />
          </InstantTracker>
        </Suspense>
        <directionalLight position={[2.5, 8, 5]} intensity={1.5} />
        <ambientLight intensity={0.5} />
      </ZapparCanvas>
    </div>
  );
}
