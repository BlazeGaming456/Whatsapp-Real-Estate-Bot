"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import socket from "../lib/socket";

const WhatsAppContext = createContext();

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error("useWhatsApp must be used within a WhatsAppProvider");
  }
  return context;
};

export const WhatsAppProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    socket.connect();

    const handleWhatsAppReady = () => {
      console.log("WhatsApp connected - redirecting to dashboard");
      setIsConnected(true);
      setIsLoading(false);
      setConnectionError(null);

      if (window.location.pathname === "/qr-scanner") {
        router.push("/");
      }
    };

    const handleWhatsAppDisconnected = (data) => {
      console.log("WhatsApp disconnected - redirecting to QR scanner");
      setIsConnected(false);
      setIsLoading(false);
      setConnectionError(data?.reason || "Disconnected");

      if (window.location.pathname === "/") {
        router.push("/qr-scanner");
      }
    };

    const handleConnectionError = (error) => {
      console.error("WhatsApp connection error:", error);
      setIsConnected(false);
      setIsLoading(false);
      setConnectionError(error.message || "Connection failed");

      if (window.location.pathname === "/") {
        router.push("/qr-scanner");
      }
    };

    socket.on("whatsapp_ready", handleWhatsAppReady);
    socket.on("whatsapp_disconnected", handleWhatsAppDisconnected);
    socket.on("whatsapp_error", handleConnectionError);

    const checkInitialStatus = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      socket.off("whatsapp_ready", handleWhatsAppReady);
      socket.off("whatsapp_disconnected", handleWhatsAppDisconnected);
      socket.off("whatsapp_error", handleConnectionError);
      clearTimeout(checkInitialStatus);
    };
  }, [router]);

  const value = {
    isConnected,
    isLoading,
    connectionError,
    setIsConnected,
    setConnectionError,
  };

  return (
    <WhatsAppContext.Provider value={value}>
      {children}
    </WhatsAppContext.Provider>
  );
};
