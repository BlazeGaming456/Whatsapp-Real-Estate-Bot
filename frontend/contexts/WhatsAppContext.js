"use client";

// Creates a central context that allows different parts of the application to know the current state such as connection, loading, etc.
// It also adds 4 event listeners to the socket.

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import socket from "../lib/socket";

const WhatsAppContext = createContext();

// Returns the context value
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
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    socket.connect();

    const handleWhatsAppReady = () => {
      console.log("WhatsApp connected - redirecting to dashboard");
      setIsConnected(true);
      setIsLoading(false);
      setIsWhatsAppLoading(false);
      setConnectionError(null);

      if (window.location.pathname === "/qr-scanner") {
        router.push("/");
      }
    };

    const handleWhatsAppLoading = (data) => {
      console.log("WhatsApp is loading:", data.percent, data.message);
      setIsWhatsAppLoading(true);
      setLoadingProgress({
        percent: data.percent,
        message: data.message,
      });
    };

    const handleWhatsAppDisconnected = (data) => {
      console.log("WhatsApp disconnected - redirecting to QR scanner");
      setIsConnected(false);
      setIsLoading(false);
      setIsWhatsAppLoading(false);
      setConnectionError(data?.reason || "Disconnected");

      if (window.location.pathname === "/") {
        router.push("/qr-scanner");
      }
    };

    const handleConnectionError = (error) => {
      console.error("WhatsApp connection error:", error);
      setIsConnected(false);
      setIsLoading(false);
      setIsWhatsAppLoading(false);
      setConnectionError(error.message || "Connection failed");

      if (window.location.pathname === "/") {
        router.push("/qr-scanner");
      }
    };

    // Adds 4 event listeners to the socket
    socket.on("whatsapp_ready", handleWhatsAppReady);
    socket.on("whatsapp_loading", handleWhatsAppLoading);
    socket.on("whatsapp_disconnected", handleWhatsAppDisconnected);
    socket.on("whatsapp_error", handleConnectionError);

    const checkInitialStatus = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      // Cleanup functionality
      socket.off("whatsapp_ready", handleWhatsAppReady);
      socket.off("whatsapp_loading", handleWhatsAppLoading);
      socket.off("whatsapp_disconnected", handleWhatsAppDisconnected);
      socket.off("whatsapp_error", handleConnectionError);
      clearTimeout(checkInitialStatus);
    };
    // It runs once on mount, and would re-run only if the router changes (effectively runs once)
  }, [router]);

  // The context value object
  const value = {
    isConnected,
    isLoading,
    isWhatsAppLoading,
    loadingProgress,
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
