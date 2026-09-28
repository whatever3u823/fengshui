import type { Metadata } from "next";
import { Info } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ResultsView } from "@/components/results/results-view";
import { SAMPLE_BEDROOM_ANALYSIS, SAMPLE_IMAGES } from "@/lib/ai/demo-fixture";

export const metadata: Metadata = {
  title: "Example transformation",
  description: "An illustrative Feng Shui AI result for a sample bedroom.",
};

export default function ExamplePage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full flex-1 overflow-x-clip"><div className="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
        <ResultsView
          context="example"
          original={{ src: SAMPLE_IMAGES.before, width: SAMPLE_IMAGES.width, height: SAMPLE_IMAGES.height, mimeType: "image/jpeg" }}
          optimized={{ src: SAMPLE_IMAGES.after, width: SAMPLE_IMAGES.width, height: SAMPLE_IMAGES.height, mimeType: "image/jpeg" }}
          analysis={SAMPLE_BEDROOM_ANALYSIS}
          fengShuiMode="traditional"
          renderState={{ status: "done" }}
          notice={
            <p className="flex items-start gap-2.5 rounded-xl border border-border bg-surface/70 px-4 py-3 text-sm text-muted-foreground backdrop-blur-sm">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              This is an illustrative example using a sample room. Upload your own photo to get an analysis of your space.
            </p>
          }
        />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
