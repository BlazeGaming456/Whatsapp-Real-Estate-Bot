import { useEffect, useState, useCallback } from "react";
import socket from "../lib/socket";
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [error, setError] = useState(null);

  const connect = useCallback(() => {
    console.log("Attempting to connect to WebSocket...");
    socket.connect();
  }, []);

  const disconnect = useCallback(() => {
    console.log("Disconnecting from WebSocket...");
    socket.disconnect();
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
      setConnectionStatus("connected");
      setError(null);
    };

    const handleDisconnect = () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
      setConnectionStatus("disconnected");
    };

    const handleConnectError = (error) => {
      console.error("WebSocket connection error:", error);
      setConnectionStatus("error");
      setError(error.message || "Connection failed");
    };

    const handleReconnect = (attemptNumber) => {
      console.log(`Attempting to reconnect... (attempt ${attemptNumber})`);
      setConnectionStatus("reconnecting");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("reconnect", handleReconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("reconnect", handleReconnect);
    };
  }, []);

  return {
    socket,
    isConnected,
    connectionStatus,
    error,
    connect,
    disconnect,
  };
};
