"use client";

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      {/* Incrustamos el HTML puro y le damos permiso a la cámara */}
      <iframe
        src="/visor-ar.html"
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="camera; display-capture"
        title="Visor de Realidad Aumentada"
      ></iframe>
    </main>
  );
}
