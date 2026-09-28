import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Ripples } from "@/components/site/ambient";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="relative flex flex-1 items-center justify-center overflow-x-clip px-5 py-28 text-center sm:px-8">
        <Ripples className="left-1/2 top-1/2 aspect-square w-[min(34rem,90vw)] -translate-x-1/2 -translate-y-1/2" />
        <div className="relative">
          <p className="kicker text-primary">Page not found</p>
          <h1 className="mt-3 font-display-light text-[2.75rem] leading-[1.05] sm:text-[4rem]">This path leads nowhere.</h1>
          <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-muted-foreground">
            The page you were looking for has moved, or never existed.
          </p>
          <Button asChild size="lg" className="mt-10">
            <Link href="/">
              Return home <ArrowRight />
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
