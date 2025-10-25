"use client";

import { motion } from "framer-motion";
import { Smartphone, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useQRCode } from "../../hooks";
import QRCodeDisplay from "../../components/QRCodeDisplay";
import { useWhatsApp } from "../../contexts/WhatsAppContext";

export default function QRScannerPage() {
  const { isConnected: whatsappConnected, connectionError } = useWhatsApp();
  const { qrCode, isLoading, requestQRCode } = useQRCode();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Connect to WhatsApp!
          </h1>
          <p className="text-gray-600 text-lg">
            Scan the QR code and start recording property listings
          </p>
        </motion.div>

        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 max-w-lg w-full"
          >
            {/* QR Code Display */}
            <div className="flex justify-center mb-6">
              {isLoading ? (
                <div className="w-72 h-72 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <RefreshCw className="w-10 h-10 text-gray-400 animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      Loading QR Code...
                    </p>
                  </div>
                </div>
              ) : qrCode ? (
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                  <QRCodeDisplay qrCode={qrCode} size={280} />
                  <p className="text-center text-sm text-gray-500 mt-4 font-medium">
                    Open WhatsApp → Settings → Linked Devices → Link a Device
                  </p>
                </div>
              ) : (
                <div className="w-72 h-72 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      No QR Code Available
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Click below to generate one
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={requestQRCode}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
            >
              {isLoading ? "Generating..." : "Generate QR Code"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
