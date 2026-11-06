import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-line bg-paper border-b">
      <div className="mx-auto flex min-h-[68px] w-[calc(100%-40px)] items-center justify-between sm:min-h-[76px] sm:w-[calc(100%-48px)] lg:max-w-[1120px]">
        <Link className="flex items-center gap-2.5 text-[19px] font-bold text-[#202d29]" href="/" aria-label="51JYKE DevTools home">
          <span className="grid size-[30px] place-items-center rounded border border-[#9ebbb0] bg-[#e3eeea] font-mono text-xs text-[#17664f]" aria-hidden="true">51</span>
          <span>51JYKE DevTools</span>
        </Link>
        <nav className="text-ink-soft flex items-center gap-[18px] text-[13px] sm:gap-[34px] sm:text-sm" aria-label="Main navigation">
          <Link className="transition-colors hover:text-clay" href="/">Converter</Link>
          <Link className="transition-colors hover:text-clay" href="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}
