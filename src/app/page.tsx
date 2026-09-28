import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SectionHeader } from "@/components/site/section-header";
import { Ripples } from "@/components/site/ambient";
import { BeforeAfterSlider } from "@/components/compare/before-after-slider";
import { PrinciplesGrid } from "@/components/learn/principles";
import { Button } from "@/components/ui/button";
import { SAMPLE_BEDROOM_ANALYSIS, SAMPLE_IMAGES } from "@/lib/ai/demo-fixture";

const STEPS = [
  {
    title: "Share a photograph",
    body: "One picture of the room, taken from a doorway or a corner. We quietly remove its location data.",
  },
  {
    title: "We read the room",
    body: "Doors, light, furniture and the way you move through the space, weighed against Feng Shui principles and what matters most to you.",
  },
  {
    title: "See it rearranged",
    body: "Your own room, from the same angle, photorealistically rearranged, with every change explained in plain words.",
  },
];

export default function LandingPage() {
  const { contrast } = SAMPLE_BEDROOM_ANALYSIS;
  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-clip">
        {/* Promise */}
        <section className="mx-auto max-w-6xl px-5 pb-24 pt-14 sm:px-8 sm:pb-32 sm:pt-20">
          <div className="animate-fade-up mx-auto max-w-4xl text-center">
            <h1 className="font-display-light text-[2.9rem] leading-[1] sm:text-[4.75rem] sm:leading-[0.98] lg:text-[6rem]">
              Transform Your Space <br className="hidden sm:block" />
              With <em className="text-primary">Feng Shui AI</em>
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Upload a photo of your room. We&apos;ll analyze the space and show you how to improve its flow, balance, and
              energy.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
              <Button asChild size="lg">
                <Link href="/optimize">
                  Optimize My Room <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="link" className="text-[15px]">
                <Link href="/example">See an Example</Link>
              </Button>
            </div>
          </div>

          <figure className="animate-fade-up relative mt-16 [animation-delay:200ms] sm:mt-20">
            <Ripples className="left-1/2 top-1/2 hidden aspect-square w-[85%] -translate-x-1/2 -translate-y-1/2 md:block" />
            <div className="relative rounded-[2rem] border border-white/70 bg-surface/50 p-2 shadow-[0_40px_100px_-50px_rgba(34,56,44,0.5)] backdrop-blur-sm sm:p-3">
              <BeforeAfterSlider
                beforeSrc={SAMPLE_IMAGES.before}
                afterSrc={SAMPLE_IMAGES.after}
                width={SAMPLE_IMAGES.width}
                height={SAMPLE_IMAGES.height}
                beforeAlt="A sample bedroom before: the bed beneath the window, a desk in the doorway, boxes on the floor"
                afterAlt="The same bedroom after: the bed against a solid wall between matching lamps, a clear entry, a plant and a rug"
                initialPosition={50}
                className="rounded-[1.5rem]"
                priority
              />
            </div>
            <figcaption className="mt-5 text-center text-sm text-subtle-foreground">
              A sample room. Drag to compare. The walls, window and floor never change.
            </figcaption>
          </figure>
        </section>

        {/* The idea */}
        <section id="practice" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="practice-title">
          <SectionHeader id="practice-title" kicker="The practice" title="Five quiet ideas, centuries old.">
            Every suggestion rests on one of them: a reason you can see and feel, and the classical idea behind it. Tap
            any underlined word to learn more.
          </SectionHeader>
          <PrinciplesGrid className="mt-16 sm:mt-20" />
        </section>

        {/* The process */}
        <section id="how" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="how-title">
          <SectionHeader id="how-title" kicker="How it works" title="Three unhurried steps." />
          <ol className="mt-16 grid gap-12 sm:mt-20 md:grid-cols-3 md:gap-10">
            {STEPS.map((step, i) => (
              <li key={step.title} className="reveal text-center">
                <span className="font-display-light text-6xl leading-none text-primary/70 [font-variant-numeric:lining-nums]" aria-hidden>
                  {i + 1}
                </span>
                <h3 className="mt-5 font-display text-[1.7rem] font-medium leading-tight">{step.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* The outcome */}
        <section className="px-5 py-12 sm:px-8 sm:py-16" aria-labelledby="difference-title">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-pine px-5 py-20 sm:rounded-[2.5rem] text-primary-foreground sm:px-12 sm:py-28">
            <SectionHeader id="difference-title" kicker="The difference" title="Not a new room. A calmer one." tone="dark" />
            <ul className="mx-auto mt-16 max-w-3xl divide-y divide-primary-foreground/10 border-y border-primary-foreground/10">
              {contrast.before.map((before, i) => {
                const after = contrast.after[i];
                return (
                  <li key={before.feeling} className="reveal grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-7 sm:gap-8 sm:py-8">
                    <div className="text-right">
                      <p className="font-display-light text-[1.7rem] leading-none text-clay-light sm:text-5xl">{before.feeling}</p>
                      <p className="mt-2 text-xs text-primary-foreground/55 sm:text-sm">{before.title}</p>
                    </div>
                    <ArrowRight className="size-4 text-primary-foreground/35 sm:size-5" strokeWidth={1.5} aria-label="becomes" />
                    <div>
                      <p className="font-display-light text-[1.7rem] leading-none text-sage-light sm:text-5xl">{after?.feeling}</p>
                      <p className="mt-2 text-xs text-primary-foreground/55 sm:text-sm">{after?.title}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-12 text-center">
              <Button asChild variant="link" className="text-[15px] text-primary-foreground decoration-primary-foreground/30 hover:decoration-primary-foreground/80">
                <Link href="/example">
                  See the full example <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* The invitation */}
        <section className="mx-auto max-w-6xl px-5 py-28 text-center sm:px-8 sm:py-36">
          <h2 className="reveal font-display-light text-[2.8rem] leading-[1.02] sm:text-[4.25rem]">
            Your room, <em className="text-primary">at ease.</em>
          </h2>
          <p className="mt-5 text-[17px] text-muted-foreground">It begins with a single photograph.</p>
          <Button asChild size="lg" className="mt-10">
            <Link href="/optimize">
              Optimize My Room <ArrowRight />
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
