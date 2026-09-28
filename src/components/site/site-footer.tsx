import Link from "next/link";
import { Wordmark } from "@/components/site/site-header";

export function SiteFooter() {
  return (
    <footer className="site-footer mt-auto">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-8 border-t border-border py-12 sm:flex-row sm:items-center sm:justify-between">
          <Wordmark />
          <nav className="-my-2 flex flex-wrap gap-x-7 text-sm text-muted-foreground" aria-label="Footer">
            <Link href="/#practice" className="py-2 transition-colors hover:text-foreground">The practice</Link>
            <Link href="/example" className="py-2 transition-colors hover:text-foreground">Example</Link>
            <Link href="/optimize" className="py-2 transition-colors hover:text-foreground">Optimize a room</Link>
          </nav>
        </div>
        <p className="max-w-2xl pb-10 text-xs leading-relaxed text-subtle-foreground">
          Feng Shui is a traditional philosophy of arranging space. Our suggestions are design ideas inspired by it,
          not promises of health, wealth or fortune. Images are AI-generated visualizations.
        </p>
      </div>
    </footer>
  );
}
