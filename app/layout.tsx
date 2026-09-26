import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppAccessGate from "@/components/AppAccessGate";
import AppBottomNavigation from "@/components/AppBottomNavigation";
import AdminAccessChip from "@/components/AdminAccessChip";
import LegacyBrandBridge from "@/components/LegacyBrandBridge";
import PlaceSuggestionEntryPoints from "@/components/PlaceSuggestionEntryPoints";
import PWAServiceWorker from "@/components/PWAServiceWorker";
import "./globals.css";
import "./form-controls.css";
import "./doniverse-motion.css";
import "./doniverse-campus.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DoniVerse",
  description: "Your whole campus world, in one place.",
  applicationName: "DoniVerse",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/favicon?v=1",
        sizes: "64x64",
        type: "image/png",
      },
      {
        url: "/icon?v=2",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: "/favicon?v=1",
    apple: [
      {
        url: "/apple-icon?v=2",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DoniVerse",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#174d31",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PWAServiceWorker />
        <LegacyBrandBridge />
        <AppAccessGate>
          {children}
          <PlaceSuggestionEntryPoints />
          <AdminAccessChip />
          <AppBottomNavigation />
        </AppAccessGate>
      </body>
    </html>
  );
}
