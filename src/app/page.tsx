import Link from "next/link";
import { ArrowRight, Compass, ImageIcon, ScanSearch, SlidersHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { BeforeAfterSlider } from "@/components/compare/before-after-slider";
import { ChangeCard } from "@/components/results/change-cards";
import { RatingBadge } from "@/components/results/alignment-panel";
import { Button } from "@/components/ui/button";
import { SAMPLE_BEDROOM_ANALYSIS, SAMPLE_IMAGES } from "@/lib/ai/demo-fixture";
import { ALIGNMENT_CATEGORIES, ALIGNMENT_LABELS } from "@/lib/domain/options";

const STEPS = [
  {
    n: "01",
    title: "Upload a photo",
    body: "One photo taken from a corner or doorway is enough. We check it, correct its orientation and strip location data.",
  },
  {
    n: "02",
    title: "Read the room",
    body: "A vision model maps doors, windows, furniture, pathways, light and visual weight — then evaluates them against Feng Shui principles.",
  },
  {
    n: "03",
    title: "See it rearranged",
    body: "We edit your own photograph, not a stock interior, to show the improved arrangement — with every change explained.",
  },
];

const PILLARS = [
  {
    icon: ScanSearch,
    title: "AI-powered room analysis",
    body: "Structured observations of layout, light and circulation, kept clearly separate from recommendations.",
  },
  {
    icon: Compass,
    title: "Feng Shui principles",
    body: "Command position, clear pathways, balance and natural elements — in a traditional, modern or minimalist reading.",
  },
  {
    icon: ImageIcon,
    title: "Photorealistic visualization",
    body: "The same walls, windows, floor and camera angle. Only what can move, moves.",
  },
  {
    icon: SlidersHorizontal,
    title: "Personalized recommendations",
    body: "Weighted toward what you care about — rest, focus, gathering, or simply more space.",
  },
];

export default function LandingPage() {
  const sample = SAMPLE_BEDROOM_ANALYSIS;
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:pt-24">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="animate-fade-up lg:col-span-8">
              <p className="eyebrow mb-5">AI room analysis · Feng Shui principles</p>
              <h1 className="font-display text-[2.9rem] leading-[1.02] sm:text-7xl lg:text-[5.4rem]">
                Transform Your Space With Feng Shui AI
              </h1>
            </div>
            <div className="animate-fade-up space-y-6 [animation-delay:120ms] lg:col-span-4 lg:pb-2">
              <p className="text-[17px] leading-relaxed text-foreground/80">
                Upload a photo of your room. We&apos;ll analyze the space and show you how to improve its flow, balance, and
                energy.
              </p>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/optimize">
                    Optimize My Room <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/example">See an Example</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="animate-fade-up mt-12 [animation-delay:220ms] sm:mt-16">
            <BeforeAfterSlider
              beforeSrc={SAMPLE_IMAGES.before}
              afterSrc={SAMPLE_IMAGES.after}
              width={SAMPLE_IMAGES.width}
              height={SAMPLE_IMAGES.height}
              beforeAlt="Sample bedroom before: bed under the window, desk blocking the door, boxes on the floor"
              afterAlt="The same bedroom after: bed on the solid wall with matched nightstands, clear entry, plant and rug"
              initialPosition={52}
              priority
            />
            <div className="mt-3 flex flex-col justify-between gap-1 text-xs text-subtle-foreground sm:flex-row">
              <span>Illustrative sample room · drag the divider to compare</span>
              <span>Same room, same camera — walls, window, door and floor unchanged</span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="mb-12 grid gap-4 lg:grid-cols-12">
              <p className="eyebrow lg:col-span-4">How it works</p>
              <h2 className="font-display text-4xl leading-tight sm:text-5xl lg:col-span-8">
                Photograph → spatial analysis → design decisions → a careful edit of your room.
              </h2>
            </div>
            <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((step) => (
                <li key={step.n} className="border-t border-border-strong pt-5">
                  <span className="font-mono text-xs text-subtle-foreground">{step.n}</span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pillars */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-px overflow-hidden px-4 py-20 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="space-y-3 py-6 sm:pr-8">
                <Icon className="size-5 text-foreground" strokeWidth={1.5} aria-hidden />
                <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Result preview */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow mb-4">Every change, explained</p>
                <h2 className="font-display text-4xl leading-tight sm:text-5xl">
                  Not a prettier room. <span className="text-muted-foreground">Your room, with reasons.</span>
                </h2>
              </div>
              <Button asChild variant="outline">
                <Link href="/example">
                  See the full example <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="grid gap-x-8 gap-y-10 md:grid-cols-3">
              {sample.changes.slice(0, 3).map((change, i) => (
                <ChangeCard key={change.id} change={change} index={i} />
              ))}
            </div>

            <div className="mt-16 space-y-8 rounded-md border border-border bg-surface p-6 sm:p-8">
              <div className="max-w-2xl">
                <p className="eyebrow mb-3">Feng Shui Alignment</p>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  A qualitative read across six principles — never a score out of 100. It&apos;s an AI interpretation of
                  a traditional practice, not a scientific measurement.
                </p>
              </div>
              <ul className="grid gap-x-12 gap-y-4 md:grid-cols-2">
                {ALIGNMENT_CATEGORIES.map((key) => (
                  <li key={key} className="flex items-center justify-between gap-3 border-b border-border pb-3">
                    <span className="text-sm font-medium">{ALIGNMENT_LABELS[key]}</span>
                    <span className="flex items-center gap-1.5">
                      <RatingBadge rating={sample.alignment[key].current} />
                      <ArrowRight className="size-3 text-subtle-foreground" aria-hidden />
                      <RatingBadge rating={sample.alignment[key].projected} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Philosophy + CTA */}
        <section className="border-t border-border bg-primary text-primary-foreground">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-primary-foreground/60">
                A traditional practice, applied with restraint
              </p>
              <h2 className="font-display text-4xl leading-tight sm:text-5xl">See your room, rearranged.</h2>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-primary-foreground/70">
                Feng Shui is a centuries-old tradition of arranging space. We use it as a design lens — flow, light,
                balance — and describe its traditional meanings as beliefs, never promises.
              </p>
            </div>
            <div className="lg:col-span-5 lg:justify-self-end">
              <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Link href="/optimize">
                  Optimize My Room <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
