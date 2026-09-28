/** Centered section opening shared by the landing page and results. */
export function SectionHeader({
  kicker,
  title,
  children,
  id,
  tone = "light",
}: {
  kicker: string;
  title: string;
  children?: React.ReactNode;
  id?: string;
  tone?: "light" | "dark";
}) {
  return (
    <header className="reveal mx-auto max-w-2xl text-center">
      <p className={tone === "dark" ? "kicker text-sage-light" : "kicker text-primary"}>{kicker}</p>
      <h2 id={id} className="mt-3 font-display-light text-[2.6rem] leading-[1.05] sm:text-[3.5rem]">
        {title}
      </h2>
      {children && (
        <p className={tone === "dark" ? "mt-5 text-[17px] leading-relaxed text-primary-foreground/70" : "mt-5 text-[17px] leading-relaxed text-muted-foreground"}>
          {children}
        </p>
      )}
    </header>
  );
}
