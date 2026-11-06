import assert from "node:assert/strict";
import test from "node:test";
import { convertSql, initializeSqlEngine } from "./sql-converter";
test("initialization", async()=>{await initializeSqlEngine()});
test("MySQL limit forms to Oracle FETCH", async()=>{for(const [q,re] of [["SELECT id FROM t LIMIT 5",/FETCH FIRST 5 ROWS ONLY/],["SELECT id FROM t LIMIT 5, 20",/OFFSET 5 ROWS FETCH FIRST 20 ROWS ONLY/]] as const){const r=await convertSql(q,"MySQL","Oracle");assert.equal(r.status,"converted");assert.match(r.sql,re)}});
test("legacy ROWNUM wrapper",async()=>{const r=await convertSql("SELECT id FROM t ORDER BY id LIMIT 5, 20","MySQL","Oracle","legacy");assert.match(r.sql,/ORDER BY id/);assert.match(r.sql,/ROWNUM <= 25/);assert.match(r.sql,/qb_rn > 5/)});
test("common statements including window and DML",async()=>{for(const q of ["SELECT a, COUNT(*) FROM t JOIN u ON t.id=u.id GROUP BY a","WITH x AS (SELECT 1 a) SELECT a FROM x","SELECT ROW_NUMBER() OVER (ORDER BY id) FROM t","INSERT INTO t(a) VALUES(1)","UPDATE t SET a=2","DELETE FROM t WHERE a=1"]){assert.notEqual((await convertSql(q,"PostgreSQL","Oracle")).status,"unchanged",q)}});
test("strings, comments and identifiers; parse failure warning", async () => {
  const result = await convertSql("SELECT `select`, 'LIMIT 2' AS label /* LIMIT 9 */ FROM `order` LIMIT 2", "MySQL", "Oracle");
  assert.equal(result.status, "converted"); assert.match(result.sql, /'LIMIT 2'/);
  const bad = await convertSql("SELECT FROM", "MySQL", "Oracle"); assert.equal(bad.sql, "SELECT FROM"); assert.equal(bad.warnings[0]?.code, "parse-error");
});
test("empty, PG/SQL Server pagination, multi-statement roundtrip",async()=>{assert.equal((await convertSql("","MySQL","Oracle")).sql,"");assert.match((await convertSql("SELECT id FROM t LIMIT 5 OFFSET 2","PostgreSQL","Oracle")).sql,/OFFSET 2 ROWS/);assert.match((await convertSql("SELECT TOP 5 id FROM t","SQL Server","Oracle")).sql,/FETCH FIRST 5 ROWS ONLY/);assert.equal((await convertSql("SELECT 1; SELECT 2","PostgreSQL","MySQL")).status,"converted")});
test("whitespace-only input remains unchanged", async () => {
  const result = await convertSql(" \n\t ", "MySQL", "Oracle");
  assert.deepEqual(result, { status: "unchanged", sql: " \n\t ", originalSql: " \n\t ", warnings: [] });
});
test("pagination keywords inside literals and comments do not trigger legacy wrapping", async () => {
  const result = await convertSql("SELECT 'LIMIT 5' AS label /* LIMIT 9 */ FROM t", "MySQL", "Oracle", "legacy");
  assert.equal(result.status, "converted");
  assert.doesNotMatch(result.sql, /ROWNUM/);
  assert.match(result.sql, /'LIMIT 5'/);
});
test("legacy pagination preserves complex ORDER BY with an unsafe warning", async () => {
  const sql = "SELECT id FROM t ORDER BY CASE WHEN active = 1 THEN 0 ELSE 1 END, score() LIMIT 5";
  const result = await convertSql(sql, "MySQL", "Oracle", "legacy");
  assert.equal(result.status, "unchanged");
  assert.equal(result.sql, sql);
  assert.equal(result.warnings[0]?.code, "legacy-pagination-unsafe");
});
test("unchanged result always has an original fallback in the page source", async () => {
  const { readFile } = await import("node:fs/promises");
  const page = await readFile("src/app/page.tsx", "utf8");
  assert.match(page, /result\.status === "unchanged"/);
  assert.doesNotMatch(page, /result\.status === "unchanged" && result\.warnings\.length > 0/);
});
