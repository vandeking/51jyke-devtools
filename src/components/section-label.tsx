import type { ReactNode } from "react";

export function SectionLabel({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <p className={`text-ink-soft font-mono text-[11px] tracking-[0]${accent ? " flex items-center gap-2.5" : ""}`}>
      {accent && <span className="bg-[#d26747] size-[7px] rounded-full" aria-hidden="true" />}
      {children}
    </p>
  );
}
