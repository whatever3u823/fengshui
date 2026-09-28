"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The brand mark: a single drop on still water. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="10.25" strokeWidth={1.1} opacity={0.4} />
      <circle cx="12" cy="12" r="6" strokeWidth={1.2} opacity={0.75} />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <Link href="/" className="-my-2 inline-flex items-center gap-2.5 py-2" aria-label="Feng Shui AI, home">
      <Mark className="size-[26px] text-primary" />
      <span className="flex items-baseline gap-1.5">
        <span className="font-display text-[1.6rem] font-medium leading-none tracking-[-0.01em]">Feng Shui</span>
        <span className="text-[10px] font-semibold tracking-[0.2em] text-subtle-foreground">AI</span>
      </span>
    </Link>
  );
}

const NAV = [
  { href: "/#practice", label: "The practice" },
  { href: "/example", label: "Example" },
];

export function SiteHeader({ showCta = true }: { showCta?: boolean }) {
  // The header stays weightless at the top of the page and gains its hairline once content scrolls beneath it.
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ease-calm",
        scrolled ? "border-border/70 bg-background/92 backdrop-blur-xl" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Wordmark />
        <nav className={cn("flex items-center gap-1 sm:gap-2", !showCta && "sm:-mr-3.5")} aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden rounded-full px-3.5 py-2 text-[15px] text-muted-foreground transition-colors duration-300 hover:text-foreground sm:block"
            >
              {item.label}
            </Link>
          ))}
          {showCta && (
            <Button asChild size="sm" className="ml-2">
              <Link href="/optimize">
                Optimize My Room <ArrowRight />
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
