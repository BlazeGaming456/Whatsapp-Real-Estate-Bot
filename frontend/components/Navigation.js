"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  QrCode,
  Building2,
  Wifi,
  WifiOff,
  Smartphone,
} from "lucide-react";
import { useSocket } from "../hooks/useSocket";
import { useWhatsApp } from "../contexts/WhatsAppContext";

/**
 * Navigation component with connection status indicator
 * Shows the current WebSocket connection status and provides navigation
 */
export default function Navigation() {
  const pathname = usePathname();
  const { isConnected: socketConnected, connectionStatus } = useSocket();
  const { isConnected: whatsappConnected, connectionError } = useWhatsApp();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/qr-scanner", label: "QR Scanner", icon: QrCode },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Real Estate Dashboard
              </h1>
              <p className="text-sm text-gray-500">WhatsApp Integration</p>
            </div>
          </div>

          {/* Navigation links */}
          <div className="flex items-center space-x-8">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}

            {/* Connection status indicators */}
            <div className="flex items-center space-x-4">
              {/* WebSocket Status */}
              <div className="flex items-center space-x-2">
                {socketConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    socketConnected ? "text-green-600" : "text-red-600"
                  }`}
                >
                  WebSocket
                </span>
              </div>

              {/* WhatsApp Status */}
              <div className="flex items-center space-x-2">
                {whatsappConnected ? (
                  <Smartphone className="w-4 h-4 text-green-500" />
                ) : (
                  <Smartphone className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    whatsappConnected ? "text-green-600" : "text-red-600"
                  }`}
                >
                  WhatsApp
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
