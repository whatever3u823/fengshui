import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Serif, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AmbientBackground } from "@/components/site/ambient";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Feng Shui AI — See your room, rearranged",
    template: "%s · Feng Shui AI",
  },
  description:
    "Upload a photo of your room. Feng Shui AI analyzes the space and shows you how to improve its flow, balance, and energy — in a photorealistic render of your own room.",
};

export const viewport: Viewport = {
  themeColor: "#f3f0e7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} ${geistMono.variable} h-full`}>
      <body className="relative flex min-h-full flex-col">
        <AmbientBackground />
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            className: "!rounded-xl !border-border !bg-surface !text-foreground !shadow-md !font-sans",
          }}
        />
      </body>
    </html>
  );
}
