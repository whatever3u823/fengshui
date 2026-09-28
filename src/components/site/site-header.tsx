import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Wordmark() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Feng Shui AI home">
      <svg viewBox="0 0 24 24" className="size-6 text-foreground" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <path d="M3 12h18M12 3v18" strokeOpacity={0.35} />
        <circle cx="12" cy="12" r="3.2" />
      </svg>
      <span className="font-display text-[22px] leading-none tracking-tight">
        Feng Shui <span className="font-sans text-[13px] font-semibold tracking-[0.12em] text-muted-foreground">AI</span>
      </span>
    </Link>
  );
}

export function SiteHeader({ showCta = true }: { showCta?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Wordmark />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/#how" className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:block">
            How it works
          </Link>
          <Link href="/example" className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
            Example
          </Link>
          {showCta && (
            <Button asChild size="sm" className="ml-1">
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
