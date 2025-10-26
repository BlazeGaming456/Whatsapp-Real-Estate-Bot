import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ConnectionGuard from "../components/ConnectionGuard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Real Estate Listings Extractor and Dashboard",
  description:
    "Real-time estate listings extracted from Whatsapp chats using AI and displayed on a dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Providers>
          <ConnectionGuard>
            <Navbar />
            {children}
            <Footer />
          </ConnectionGuard>
        </Providers>
      </body>
    </html>
  );
}
