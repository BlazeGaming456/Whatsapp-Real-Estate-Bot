import { useState, useEffect, useCallback } from "react";
import socket from "../lib/socket";
export const useQRCode = () => {
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const requestQRCode = useCallback(() => {
    console.log("Requesting new QR code...");
    setIsLoading(true);
    setQrCode("");
    setConnectionError(null);
    socket.emit("request_qr");
  }, []);

  useEffect(() => {
    const handleQRCode = (data) => {
      console.log("QR Code received:", data.qr);
      setQrCode(data.qr);
      setIsLoading(false);
      setConnectionError(null);
    };

    const handleWhatsAppReady = () => {
      console.log("WhatsApp connected successfully!");
      setIsConnected(true);
      setIsLoading(false);
      setQrCode("");
      setConnectionError(null);
    };

    const handleWhatsAppDisconnected = (reason) => {
      console.log("WhatsApp disconnected:", reason);
      setIsConnected(false);
      setConnectionError(`Disconnected: ${reason}`);
    };

    const handleConnectionError = (error) => {
      console.error("WhatsApp connection error:", error);
      setConnectionError(error.message || "Connection failed");
      setIsLoading(false);
    };

    const handleQRExpired = () => {
      console.log("QR Code expired");
      setQrCode("");
      setIsLoading(true);
      setTimeout(() => {
        requestQRCode();
      }, 1000);
    };

    socket.on("qr_code", handleQRCode);
    socket.on("whatsapp_ready", handleWhatsAppReady);
    socket.on("whatsapp_disconnected", handleWhatsAppDisconnected);
    socket.on("whatsapp_error", handleConnectionError);
    socket.on("qr_expired", handleQRExpired);

    return () => {
      socket.off("qr_code", handleQRCode);
      socket.off("whatsapp_ready", handleWhatsAppReady);
      socket.off("whatsapp_disconnected", handleWhatsAppDisconnected);
      socket.off("whatsapp_error", handleConnectionError);
      socket.off("qr_expired", handleQRExpired);
    };
  }, [requestQRCode]);

  return {
    qrCode,
    isLoading,
    isConnected,
    connectionError,
    requestQRCode,
  };
};
