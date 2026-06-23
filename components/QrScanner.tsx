"use client";

import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";

type QrScannerProps = {
  onResult: (value: string) => void;
  onClose: () => void;
};

export default function QrScanner({ onResult, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const [message, setMessage] = useState("Kamera wird geöffnet...");

  useEffect(() => {
    let isActive = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setMessage("QR-Code in den Rahmen halten.");
        scanFrame();
      } catch {
        setMessage("Kamera konnte nicht geöffnet werden.");
      }
    }

    function scanFrame() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d", { willReadFrequently: true });

      if (video && canvas && context && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code?.data) {
          onResult(code.data);
          return;
        }
      }

      animationRef.current = window.requestAnimationFrame(scanFrame);
    }

    void startCamera();

    return () => {
      isActive = false;

      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">QR-Code scannen</h2>
            <p className="mt-1 text-slate-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700"
          >
            Schließen
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border-4 border-blue-600 bg-slate-900">
          <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}
