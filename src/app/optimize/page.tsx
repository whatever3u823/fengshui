import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { OptimizeFlow } from "@/components/flow/optimize-flow";
import { getPublicConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Optimize your room",
  description: "Upload a photo of your room for a Feng Shui analysis and a photorealistic rearrangement.",
};

// Mode depends on runtime environment variables, so render per request.
export const dynamic = "force-dynamic";

export default function OptimizePage() {
  const config = getPublicConfig();
  return (
    <>
      <SiteHeader showCta={false} />
      <main className="flex-1 overflow-x-clip">
        <OptimizeFlow config={config} />
      </main>
      <SiteFooter />
    </>
  );
}
