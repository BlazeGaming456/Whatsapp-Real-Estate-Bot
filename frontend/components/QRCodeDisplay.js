"use client";

import { useEffect, useRef } from "react";

/**
 * QR Code Display Component
 * Renders an actual QR code using the qrcode library
 */
export default function QRCodeDisplay({ qrCode, size = 256 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (qrCode && canvasRef.current) {
      // Import qrcode dynamically to avoid SSR issues
      import("qrcode").then((QRCode) => {
        QRCode.toCanvas(canvasRef.current, qrCode, {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        }).catch((error) => {
          console.error("Error generating QR code:", error);
        });
      });
    }
  }, [qrCode, size]);

  if (!qrCode) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
