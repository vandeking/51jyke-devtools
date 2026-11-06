import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About 51JYKE DevTools",
  description: "Learn the supported SQL dialects, parser boundaries, browser-local processing, warnings, and fallback behavior of 51JYKE DevTools.",
  alternates: { canonical: "/about" },
  openGraph: { type: "website", siteName: "51JYKE DevTools", title: "About 51JYKE DevTools", description: "A free, browser-based SQL dialect converter with clear limits and local processing.", url: "https://51jyke.com/about" },
  twitter: { card: "summary", title: "About 51JYKE DevTools", description: "A free, browser-based SQL dialect converter with clear limits and local processing." },
};

export default function AboutPage() {
  return <main className="mx-auto w-[calc(100%-40px)] max-w-[820px] py-14 sm:py-20">
    <p className="font-mono text-xs uppercase text-green">51JYKE DevTools</p>
    <h1 className="mt-4 text-4xl font-semibold">About 51JYKE DevTools</h1>
    <p className="mt-6 max-w-2xl text-base leading-7 text-ink-soft">A free-to-use, no-ads browser tool for converting supported SQL syntax across PostgreSQL, MySQL, SQL Server/T-SQL, SQLite, and Oracle. Processing stays in your browser.</p>
    <section className="mt-10 border-t border-line pt-7"><h2 className="text-xl font-semibold">What it can do</h2><p className="mt-3 leading-7 text-ink-soft">The parser-led engine handles supported SELECT, WITH, JOIN, aggregation, window, INSERT, UPDATE, and DELETE constructs across five dialects. Oracle output supports modern OFFSET/FETCH and a guarded legacy ROWNUM mode. Coverage depends on the parser engine; unsupported or unsafe conversions preserve the original SQL with a warning instead of claiming equivalence.</p></section>
    <section className="mt-8 border-t border-line pt-7"><h2 className="text-xl font-semibold">Privacy and limitations</h2><p className="mt-3 leading-7 text-ink-soft">Conversion runs locally in your browser; this site does not upload query text for conversion. Unsupported or ambiguous syntax may remain unchanged with a warning. Always review and test output in the target database.</p></section>
    <section className="mt-8 border-t border-line pt-7"><h2 className="text-xl font-semibold">Contact</h2><p className="mt-3 leading-7 text-ink-soft"><a className="underline underline-offset-4" href="mailto:van.deking.1@gmail.com">van.deking.1@gmail.com</a></p></section>
  </main>;
}
