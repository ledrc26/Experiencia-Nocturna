"use client";

// Importamos la herramienta dinámica de Next.js
import dynamic from "next/dynamic";

// Importamos tu visor AR (VisorZappar.tsx), pero le PROHIBIMOS que se ejecute en el servidor (ssr: false)
const VisorZapparSinSSR = dynamic(() => import("./VisorZappar"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "black",
        color: "white",
      }}
    >
      <h2>Preparando cámara y mariposas...</h2>
    </div>
  ),
});

export default function PageEnjambre() {
  return (
    <main
      style={{
        backgroundColor: "black",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Aquí inyectamos el visor de forma segura solo cuando ya estamos en el navegador del usuario */}
      <VisorZapparSinSSR />
    </main>
  );
}
