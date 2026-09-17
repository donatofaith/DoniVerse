import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppAccessGate from "@/components/AppAccessGate";
import AppBottomNavigation from "@/components/AppBottomNavigation";
import AdminAccessChip from "@/components/AdminAccessChip";
import LegacyBrandBridge from "@/components/LegacyBrandBridge";
import PlaceSuggestionEntryPoints from "@/components/PlaceSuggestionEntryPoints";
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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
