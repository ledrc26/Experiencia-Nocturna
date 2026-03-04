"use client";

export default function EnjambreAR() {
  return (
    <main style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      {/* Incrustamos el HTML del enjambre y le damos permiso a la cámara */}
      <iframe
        src="/visor-enjambre.html"
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="camera; display-capture; gyroscope; accelerometer"
        title="Enjambre de Mariposas en AR"
      ></iframe>
    </main>
  );
}
