"use client";

// This file automnatically redirects the user after connection or being disconnected from the whatsapp-web.js api.
// It also provides the loading screen in-between routing.

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWhatsApp } from "../contexts/WhatsAppContext";
import { motion } from "framer-motion";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
export default function ConnectionGuard({ children }) {
  const { isConnected, isLoading, connectionError } = useWhatsApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (isConnected && pathname === "/qr-scanner") {
      console.log("WhatsApp connected - redirecting to dashboard");
      router.push("/");
      return;
    }

    if (!isConnected && pathname === "/") {
      console.log("WhatsApp not connected - redirecting to QR scanner");
      router.push("/qr-scanner");
      return;
    }
  }, [isConnected, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
            <div className="flex justify-center mb-4">
              <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Checking Connection
            </h2>
            <p className="text-gray-600">
              Verifying WhatsApp connection status...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (connectionError && pathname === "/") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
            <div className="flex justify-center mb-4">
              <WifiOff className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Error
            </h2>
            <p className="text-gray-600 mb-4">{connectionError}</p>
            <button
              onClick={() => router.push("/qr-scanner")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to QR Scanner
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}