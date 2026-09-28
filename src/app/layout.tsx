import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Figtree } from "next/font/google";
import { Toaster } from "sonner";
import { AmbientBackground } from "@/components/site/ambient";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], weight: ["400", "500", "600"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Feng Shui AI — Your room, at ease",
    template: "%s · Feng Shui AI",
  },
  description:
    "Upload a photo of your room. Feng Shui AI reads the space and shows it calmly rearranged — the same room, with better flow, balance and light, and every change explained.",
};

export const viewport: Viewport = {
  themeColor: "#f4f1ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${cormorant.variable} h-full`}>
      <body className="relative flex min-h-full flex-col">
        <AmbientBackground />
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            className: "!rounded-full !border-border !bg-surface !px-5 !text-foreground !shadow-lg !font-sans",
          }}
        />
      </body>
    </html>
  );
}
