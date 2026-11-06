import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = DM_Sans({ variable: "--font-query-sans", subsets: ["latin"] });
const geistMono = IBM_Plex_Mono({ variable: "--font-query-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://51jyke.com"),
  title: { default: "SQL Dialect Converter | 51JYKE DevTools", template: "%s | 51JYKE DevTools" },
  applicationName: "51JYKE DevTools",
  description: "Convert supported SQL between PostgreSQL, MySQL, SQL Server/T-SQL, SQLite and Oracle in your browser. Review warnings and fallback before use. Free to use. No ads.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "51JYKE DevTools", title: "SQL Dialect Converter | 51JYKE DevTools", description: "Parser-first SQL conversion for supported syntax across five configured dialects. Browser-local, free to use, and no ads.", url: "https://51jyke.com/" },
  twitter: { card: "summary", title: "SQL Dialect Converter | 51JYKE DevTools", description: "Parser-first SQL conversion for supported syntax across five configured dialects. Browser-local, free to use, and no ads." },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
