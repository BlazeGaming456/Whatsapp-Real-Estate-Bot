import React from "react";
import { Mail, Github, Code } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <span className="mr-2">🏠</span>
              Property Listings Dashboard
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Real-time property listings extracted from WhatsApp groups and
              organized in a centralized database for easy viewing and
              management.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">About</h3>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">
                This application monitors WhatsApp groups for real estate
                listings, automatically extracting and categorizing property
                information including price, location, BHK, and other details.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2024 Property Listings Dashboard. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Built with Next.js & Tailwind CSS</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
