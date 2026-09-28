import Link from "next/link";
import { ArrowRight, Compass, ImageIcon, ScanSearch, SlidersHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Ripples } from "@/components/site/ambient";
import { BeforeAfterSlider } from "@/components/compare/before-after-slider";
import { ChangeCard } from "@/components/results/change-cards";
import { RatingBadge } from "@/components/results/alignment-panel";
import { PrinciplesGrid } from "@/components/learn/principles";
import { Button } from "@/components/ui/button";
import { SAMPLE_BEDROOM_ANALYSIS, SAMPLE_IMAGES } from "@/lib/ai/demo-fixture";
import { ALIGNMENT_CATEGORIES, ALIGNMENT_LABELS } from "@/lib/domain/options";
import { ALIGNMENT_EXPLAINERS } from "@/lib/domain/glossary";

const STEPS = [
  {
    n: "01",
    title: "Upload a photo",
    body: "One photo from a corner or doorway is enough. We check it, straighten it, and remove location data.",
  },
  {
    n: "02",
    title: "We read the room",
    body: "A vision model maps doors, windows, furniture, walkways, light and visual weight, then weighs them against Feng Shui principles.",
  },
  {
    n: "03",
    title: "See it rearranged",
    body: "We edit your own photograph — not a stock interior — and explain every change in plain words.",
  },
];

const PILLARS = [
  { icon: ScanSearch, title: "AI-powered room analysis", body: "What we see, kept separate from what we suggest." },
  { icon: Compass, title: "Feng Shui principles", body: "Traditional, modern or minimalist — every term explained." },
  { icon: ImageIcon, title: "Photorealistic visualization", body: "Same walls, windows and camera angle. Only what can move, moves." },
  { icon: SlidersHorizontal, title: "Personalized recommendations", body: "Weighted toward rest, focus, gathering or space." },
];

const HERO_NOTES = ["Bed moved to a solid wall", "Clear path from the door", "Living greenery", "Warm, layered light"];

export default function LandingPage() {
  const sample = SAMPLE_BEDROOM_ANALYSIS;
  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-clip">
        {/* Hero */}
        <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:pt-24">
          <div className="grid gap-8 xl:grid-cols-12 xl:items-end">
            <div className="animate-fade-up xl:col-span-7">
              <p className="eyebrow mb-5 flex items-center gap-2">
                <span className="inline-block size-1.5 rounded-full bg-sage" /> AI room analysis · Feng Shui principles
              </p>
              <h1 className="font-display text-[2.9rem] leading-[1.02] sm:text-7xl lg:text-[4.6rem] xl:text-[5.4rem]">
                Transform Your Space With <em className="text-primary">Feng Shui AI</em>
              </h1>
            </div>
            <div className="animate-fade-up space-y-6 [animation-delay:120ms] max-w-xl xl:col-span-5 xl:max-w-none xl:pb-2 xl:pl-6">
              <p className="text-[17px] leading-relaxed text-foreground/80">
                Upload a photo of your room. We&apos;ll analyze the space and show you how to improve its flow, balance, and
                energy.
              </p>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
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

          <div className="animate-fade-up relative mt-12 [animation-delay:220ms] sm:mt-16">
            <Ripples className="-left-28 top-24 hidden size-80 md:block" />
            <Ripples className="-bottom-28 -right-20 hidden size-96 md:block" />
            <div className="relative rounded-[28px] border border-white/60 bg-gradient-to-br from-sage-soft/80 via-surface/50 to-mist/80 p-2 shadow-[0_30px_80px_-40px_rgba(31,58,45,0.45)] backdrop-blur-sm sm:p-3">
              <BeforeAfterSlider
                beforeSrc={SAMPLE_IMAGES.before}
                afterSrc={SAMPLE_IMAGES.after}
                width={SAMPLE_IMAGES.width}
                height={SAMPLE_IMAGES.height}
                beforeAlt="Sample bedroom before: bed under the window, desk blocking the door, boxes on the floor"
                afterAlt="The same bedroom after: bed on the solid wall with matched nightstands, clear entry, plant and rug"
                initialPosition={52}
                className="rounded-[20px]"
                priority
              />
            </div>
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <ul className="flex flex-wrap gap-2">
                {HERO_NOTES.map((note) => (
                  <li key={note} className="rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs text-foreground/80 backdrop-blur-sm">
                    {note}
                  </li>
                ))}
              </ul>
              <span className="text-xs text-subtle-foreground">Illustrative sample room · drag to compare · same walls, window and floor</span>
            </div>
          </div>
        </section>

        {/* Feng Shui in plain words */}
        <section id="principles" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="reveal mb-12 grid gap-4 lg:grid-cols-12">
              <p className="eyebrow lg:col-span-4">Feng Shui, in plain words</p>
              <div className="lg:col-span-8">
                <h2 className="font-display text-4xl leading-tight sm:text-5xl">
                  Five ideas behind every suggestion. <span className="text-muted-foreground">No prior knowledge needed.</span>
                </h2>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                  Each principle has an everyday reason you can see and feel, and a classical idea behind it. Tap any
                  underlined term — here or in your results — for the full meaning.
                </p>
              </div>
            </div>
            <PrinciplesGrid />
          </div>
        </section>

        {/* How it works — a deep, calm color block */}
        <section id="how" className="relative scroll-mt-20 overflow-hidden bg-pine text-primary-foreground">
          <Ripples tone="light" className="-right-32 -top-32 size-[28rem]" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="reveal mb-14 grid gap-4 lg:grid-cols-12">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground/55 lg:col-span-4">How it works</p>
              <h2 className="font-display text-4xl leading-tight sm:text-5xl lg:col-span-8">
                Photograph → spatial analysis → design decisions → a careful edit of <em>your</em> room.
              </h2>
            </div>
            <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((step) => (
                <li key={step.n} className="reveal border-t border-primary-foreground/20 pt-5">
                  <span className="font-mono text-xs text-sage">{step.n}</span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-primary-foreground/70">{step.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-16 grid gap-6 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.04] p-6 sm:grid-cols-2 lg:grid-cols-4">
              {PILLARS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="space-y-2">
                  <Icon className="size-5 text-sage" strokeWidth={1.5} aria-hidden />
                  <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
                  <p className="text-sm leading-relaxed text-primary-foreground/65">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Result preview */}
        <section>
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="reveal mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
                <ChangeCard key={change.id} change={change} index={i} issues={sample.issues} className="reveal" />
              ))}
            </div>

            <div className="reveal mt-16 space-y-8 rounded-2xl border border-border bg-sand/45 p-6 sm:p-8">
              <div className="max-w-2xl">
                <p className="eyebrow mb-3">Feng Shui Alignment</p>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  A qualitative read across six principles, each phrased as a question you can check yourself — never a
                  score out of 100. It&apos;s an AI interpretation of a traditional practice, not a scientific measurement.
                </p>
              </div>
              <ul className="grid gap-x-12 gap-y-5 md:grid-cols-2">
                {ALIGNMENT_CATEGORIES.map((key) => (
                  <li key={key} className="border-b border-border-strong/60 pb-4">
                    <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
                      <span className="text-sm font-medium">{ALIGNMENT_LABELS[key]}</span>
                      <span className="flex items-center gap-1.5">
                        <RatingBadge rating={sample.alignment[key].current} />
                        <ArrowRight className="size-3 shrink-0 text-subtle-foreground" aria-hidden />
                        <RatingBadge rating={sample.alignment[key].projected} />
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{ALIGNMENT_EXPLAINERS[key].question}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Closing invitation */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="relative overflow-hidden rounded-[28px] bg-primary px-6 py-16 text-primary-foreground sm:px-12 sm:py-20">
            <Ripples tone="light" className="-bottom-40 -left-24 size-[30rem]" />
            <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground/60">
                  A traditional practice, applied with restraint
                </p>
                <h2 className="font-display text-4xl leading-tight sm:text-6xl">See your room, rearranged.</h2>
                <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-primary-foreground/70">
                  Flow, light and balance — shown in your own photo, with the reasoning behind every move.
                </p>
              </div>
              <div className="lg:col-span-4 lg:justify-self-end">
                <Button asChild size="lg" className="bg-primary-foreground text-primary shadow-none hover:bg-sand">
                  <Link href="/optimize">
                    Optimize My Room <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
