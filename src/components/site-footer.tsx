import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-line bg-paper-deep border-t">
      <div className="text-[#717973] mx-auto flex min-h-[76px] w-[calc(100%-40px)] flex-wrap items-center justify-between gap-x-5 gap-y-2 py-4 text-xs sm:min-h-[82px] sm:w-[calc(100%-48px)] lg:max-w-[1120px]">
        <Link className="text-[#202d29] text-[15px] font-bold" href="/">
          51JYKE DevTools
        </Link>
        <p className="hidden sm:block">Browser-local SQL conversion. Free to use. No ads.</p>
        <Link href="/about">Review converted SQL before use.</Link>
      </div>
    </footer>
  );
}
