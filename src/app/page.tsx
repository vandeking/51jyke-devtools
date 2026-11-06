'use client';

import { useEffect, useState } from "react";
import { ArrowDownUp, Check, ChevronDown, Clipboard, RotateCcw } from "lucide-react";
import { convertSql, dialects, initializeSqlEngine, type ConversionResult, type Dialect, type OraclePaginationMode } from "@/lib/sql-converter";

const example = "SELECT id, name FROM users ORDER BY id LIMIT 5, 20;";
const initialResult: ConversionResult = { status: "unchanged", sql: example, originalSql: example, warnings: [] };

export default function HomePage() {
  const [source, setSource] = useState<Dialect>("MySQL");
  const [target, setTarget] = useState<Dialect>("Oracle");
  const [sql, setSql] = useState(example);
  const [mode, setMode] = useState<OraclePaginationMode>("modern");
  const [result, setResult] = useState(initialResult);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    initializeSqlEngine().then(() => setBusy(false)).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "SQL engine initialization failed.");
      setBusy(false);
    });
  }, []);
  useEffect(() => {
    let active = true;
    setBusy(true);
    setError("");
    convertSql(sql, source, target, mode).then((next) => {
      if (active) setResult(next);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Conversion failed.");
    }).finally(() => {
      if (active) setBusy(false);
    });
    return () => { active = false; };
  }, [sql, source, target, mode]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback("Copied to clipboard.");
    } catch {
      setFeedback("Copy failed. Check clipboard permissions.");
    }
  }

  function selectControl(label: string, value: string, onChange: (value: string) => void, options: { value: string; label: string }[]) {
    return <label className="grid gap-1.5 text-xs font-medium text-[#40504b]">{label}<span className="relative block"><select className="h-10 w-full appearance-none rounded border border-[#ccd5d1] bg-white py-2 pl-3 pr-10 text-sm text-[#182622] outline-none focus-visible:border-[#17664f] focus-visible:ring-2 focus-visible:ring-[#17664f]/20" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5b6965]" size={16} /></span></label>;
  }

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#182622]">
      <section className="mx-auto w-[calc(100%-32px)] max-w-[1120px] py-10 sm:py-16">
        <div className="mb-8 border-b border-[#dce3df] pb-7">
          <p className="font-mono text-xs uppercase text-[#17664f]">51JYKE DevTools <span className="text-[#87938e]">/ SQL</span></p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">SQL Dialect Converter</h1>
          <p className="mt-3 max-w-[760px] text-[15px] leading-7 text-[#5b6965]">A parser-first converter powered by the @polyglot-sql SDK. It is configured for PostgreSQL, MySQL, SQL Server/T-SQL, SQLite, and Oracle; actual conversion coverage depends on supported syntax.</p>
          <p className="mt-2 max-w-[760px] text-sm leading-6 text-[#5b6965]">SQL stays in this browser. Unsupported or risky input is retained with warnings and fallback details; review every result before use.</p>
          <p className="mt-3 font-medium text-[#17664f]">Free to use. No ads.</p>
        </div>
        <div className="mb-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(145px,1fr)_40px_minmax(145px,1fr)_minmax(190px,1fr)_auto]">
          {selectControl("From", source, (value) => setSource(value as Dialect), dialects.map((dialect) => ({ value: dialect, label: dialect })))}
          <button aria-label="Swap source and target databases" className="h-10 rounded border border-[#ccd5d1] bg-white text-[#40504b] hover:bg-[#eef3f0]" onClick={() => { setSource(target); setTarget(source); }}><ArrowDownUp className="mx-auto" size={16} /></button>
          {selectControl("To", target, (value) => setTarget(value as Dialect), dialects.map((dialect) => ({ value: dialect, label: dialect })))}
          {target === "Oracle" ? selectControl("Oracle mode", mode, (value) => setMode(value as OraclePaginationMode), [{ value: "modern", label: "Modern FETCH (12c+)" }, { value: "legacy", label: "Legacy ROWNUM" }]) : <span />}
          <button className="h-10 px-2 text-sm text-[#40504b] hover:text-[#17664f]" onClick={() => setSql(example)}><RotateCcw className="mr-1 inline" size={14} />Load example</button>
        </div>
        <div className="grid overflow-hidden rounded border border-[#d7dfdb] bg-white md:grid-cols-2">
          <section className="flex flex-col border-b border-[#d7dfdb] md:border-b-0 md:border-r"><h2 className="border-b border-[#e5eae7] bg-[#f8faf9] p-3 font-mono text-xs">INPUT.SQL · {source}</h2><textarea aria-label="SQL input query" className="block min-h-[280px] w-full flex-1 resize-none border-0 p-4 font-mono text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#17664f]/30" value={sql} onChange={(event) => setSql(event.target.value)} /></section>
          <section className="flex flex-col"><h2 className="border-b border-[#e5eae7] bg-[#f8faf9] p-3 font-mono text-xs">OUTPUT.SQL · {target}</h2><pre aria-live="polite" className="min-h-[280px] flex-1 whitespace-pre-wrap break-words p-4 font-mono text-sm leading-6">{result.sql || "Converted SQL will appear here"}</pre></section>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p role="status" className="text-sm text-[#17664f]">{feedback}</p>
          <button aria-label="Copy output" className="inline-flex h-8 shrink-0 items-center gap-1 rounded border border-[#2563eb] bg-[#2563eb] px-3 text-xs font-medium text-white hover:border-[#1d4ed8] hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50" disabled={busy} onClick={() => void copy(result.sql)}>{feedback === "Copied to clipboard." ? <Check size={13} /> : <Clipboard size={13} />}Copy output</button>
        </div>
        {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}

        {result.status === "unchanged" && <section className="mt-4 border-t border-[#dce3df] py-4"><div className="flex items-center justify-between gap-3"><h2 className="font-medium">Original / fallback</h2><button className="inline-flex h-7 items-center gap-1 rounded border border-[#ccd5d1] bg-white px-2 text-xs text-[#40504b] hover:bg-[#eef3f0]" onClick={() => void copy(result.originalSql)}><Clipboard size={13} />Copy original</button></div><pre className="mt-3 whitespace-pre-wrap break-words font-mono text-sm">{result.originalSql}</pre></section>}
        {result.suggestedSql && <section className="mt-4 border-t border-[#dce3df] py-4"><div className="flex items-center justify-between gap-3"><h2 className="font-medium">Suggested alternative</h2><button className="inline-flex h-7 items-center gap-1 rounded border border-[#ccd5d1] bg-white px-2 text-xs text-[#40504b] hover:bg-[#eef3f0]" onClick={() => void copy(result.suggestedSql!)}><Clipboard size={13} />Copy suggestion</button></div><pre className="mt-3 whitespace-pre-wrap break-words font-mono text-sm">{result.suggestedSql}</pre></section>}
        {result.warnings.length > 0 && <ul aria-label="Conversion warnings" className="mt-4 border-l-2 border-amber-500 bg-amber-50 p-4 text-sm leading-6">{result.warnings.map((warning, index) => <li key={`${warning.code}-${index}`}><b>{warning.severity} · {warning.code}</b>: {warning.message}{warning.line ? ` (line ${warning.line}${warning.column ? `, column ${warning.column}` : ""})` : ""}</li>)}</ul>}
        <section className="mt-10 grid gap-5 border-t border-[#dce3df] py-6 sm:grid-cols-3"><article><h2 className="font-semibold">Parser-first coverage</h2><p className="mt-2 text-sm leading-6 text-[#5b6965]">Configured dialects: PostgreSQL, MySQL, SQL Server/T-SQL, SQLite, and Oracle. SELECT, WITH, JOIN, aggregation, window expressions, INSERT, UPDATE, and DELETE are tested statement families; syntax coverage varies by dialect and engine support.</p></article><article><h2 className="font-semibold">Warnings and fallback</h2><p className="mt-2 text-sm leading-6 text-[#5b6965]">When parsing or safe transpilation fails, the original SQL is preserved with a warning. A suggested alternative appears only when generated output passes target parsing.</p></article><article><h2 className="font-semibold">Local processing</h2><p className="mt-2 text-sm leading-6 text-[#5b6965]">Conversion runs in this browser. Syntax translation does not guarantee semantic or execution-plan equivalence; review functions, data types, NULL ordering, transactions, and vendor-specific behavior.</p></article></section>
      </section>
    </main>
  );
}
