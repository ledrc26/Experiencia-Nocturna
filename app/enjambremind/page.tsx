"use client";

export default function PageEnjambreGiroscopio() {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        backgroundColor: "black",
      }}
    >
      {/* El iframe llama al nuevo archivo HTML que guardaste en public */}
      <iframe
        src="/visor-giroscopio.html"
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="camera; gyroscope; accelerometer"
        title="Experiencia Mariposas Giroscopio"
      ></iframe>
    </main>
  );
}
