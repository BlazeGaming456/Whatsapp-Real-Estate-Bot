"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWhatsApp } from "../contexts/WhatsAppContext";
import { useSocket } from "../hooks/useSocket";
import { Home, ScanLine } from "lucide-react";

const Navbar = () => {
  const { isConnected: whatsappConnected } = useWhatsApp();
  const { isConnected: socketConnected } = useSocket();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/qr-scanner", label: "Connect", icon: ScanLine },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🏠</span>
              <h1 className="text-xl font-bold text-gray-800">
                Property Listings
              </h1>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <div
                className={`w-2 h-2 rounded-full ${
                  whatsappConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600 hidden sm:inline">
                {whatsappConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="p-[2px] rounded-full hover:bg-gray-200 hover:cursor-pointer transition-all duration-200">
              <Image
                src="/account.png"
                width={32}
                height={32}
                alt="Account"
                className="rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
