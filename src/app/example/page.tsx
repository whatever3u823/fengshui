import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ResultsView } from "@/components/results/results-view";
import { Notice } from "@/components/ui/notice";
import { SAMPLE_BEDROOM_ANALYSIS, SAMPLE_IMAGES } from "@/lib/ai/demo-fixture";

export const metadata: Metadata = {
  title: "Example transformation",
  description: "An illustrative Feng Shui AI result for a sample bedroom.",
};

export default function ExamplePage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full flex-1 overflow-x-clip">
        <div className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8 sm:pt-16">
          <ResultsView
            context="example"
            original={{ src: SAMPLE_IMAGES.before, width: SAMPLE_IMAGES.width, height: SAMPLE_IMAGES.height, mimeType: "image/jpeg" }}
            optimized={{ src: SAMPLE_IMAGES.after, width: SAMPLE_IMAGES.width, height: SAMPLE_IMAGES.height, mimeType: "image/jpeg" }}
            analysis={SAMPLE_BEDROOM_ANALYSIS}
            fengShuiMode="traditional"
            renderState={{ status: "done" }}
            notice={
              <Notice icon={<Info aria-hidden />} className="bg-mist/70 [&_svg]:text-water">
                An illustrative example with a sample room.{" "}
                <Link href="/optimize" className="font-medium underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground">
                  Try your own
                </Link>
              </Notice>
            }
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
