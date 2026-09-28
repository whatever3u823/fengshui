import Link from "next/link";
import { Wordmark } from "@/components/site/site-header";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md space-y-3">
          <Wordmark />
          <p className="text-xs leading-relaxed text-subtle-foreground">
            Feng Shui is a traditional philosophy of spatial arrangement. Feng Shui AI offers design suggestions
            informed by it and makes no claims about health, wealth or other outcomes. Images are AI-generated
            visualizations.
          </p>
        </div>
        <nav className="flex gap-8 text-sm text-muted-foreground">
          <Link href="/optimize" className="hover:text-foreground">Optimize a room</Link>
          <Link href="/example" className="hover:text-foreground">Example</Link>
          <Link href="/#how" className="hover:text-foreground">How it works</Link>
        </nav>
      </div>
    </footer>
  );
}
