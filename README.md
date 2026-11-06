# 51JYKE DevTools

Source code for [51jyke.com](https://51jyke.com).

51JYKE DevTools is a free-to-use, no-ads parser-first SQL dialect converter using the browser-only dynamic `@polyglot-sql/sdk` WebAssembly parser/transpiler. Conversion runs in the browser; SQL query text is not uploaded for conversion. Server rendering and static prerendering do not initialize the engine.

## Supported scope and boundaries

The SDK is configured for PostgreSQL, MySQL, SQL Server/T-SQL, SQLite, and Oracle. Tested statement families include SELECT, WITH, JOIN, aggregation, window expressions, INSERT, UPDATE, and DELETE; actual coverage depends on SDK parser/transpiler support for the specific dialect and syntax. Failures preserve original SQL with structured warnings. Suggested alternative appears only for generated SQL that passes target parsing.

Oracle Modern uses OFFSET/FETCH (12c+); Legacy uses a double-layer ROWNUM wrapper for safe simple SELECT pagination, preserving ordering. Complex shapes are preserved with warnings. Conversion does not guarantee semantic or execution-plan equivalence. Review functions, types, NULL ordering, transactions, and vendor-specific behavior before execution.

## Commands

```bash
npm install
npx tsc --noEmit
npx tsc --module commonjs --target es2020 --outDir .test-build src/lib/sql-converter.ts src/lib/sql-converter.test.ts --esModuleInterop --skipLibCheck
node --test .test-build/sql-converter.test.js
npm run build
npm run start
```

Tests cover initialization, statement families, dialect pagination, Oracle modes, literals/comments/identifiers, multi-statements, parse errors and empty input. `.test-build` is temporary. No lint script is configured.

## Routes and deployment

`/` is the converter; `/about` documents its limits. Verify `/`, `/about`, `/robots.txt` and `/sitemap.xml` after deployment, then submit the sitemap to Search Console.
