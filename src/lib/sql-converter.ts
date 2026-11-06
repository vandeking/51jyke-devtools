import type { Dialect as E } from "@polyglot-sql/sdk";
type Engine = typeof import("@polyglot-sql/sdk");
let enginePromise: Promise<Engine> | undefined;
let ready: Promise<void> | undefined;
async function loadEngine(): Promise<Engine> {
  if (typeof window === "undefined" && typeof process === "undefined") throw new Error("SQL engine requires a browser or Node.js runtime.");
  enginePromise ??= import("@polyglot-sql/sdk");
  return enginePromise;
}
export const dialects = ["PostgreSQL", "MySQL", "SQL Server", "SQLite", "Oracle"] as const;
export type Dialect = typeof dialects[number];
export type OraclePaginationMode = "modern" | "legacy";
export type ConversionWarning = {severity:"info"|"warning"|"error";code:string;message:string;line?:number;column?:number};
export type ConversionResult = {status:"converted"|"partial"|"unchanged";sql:string;originalSql:string;warnings:ConversionWarning[];suggestedSql?:string;alternatives?:{label:string;sql:string}[]};
const map = (E: Engine["Dialect"]): Record<Dialect, Engine["Dialect"][keyof Engine["Dialect"]]> => ({PostgreSQL:E.PostgreSQL,MySQL:E.MySQL,"SQL Server":E.TSQL,SQLite:E.SQLite,Oracle:E.Oracle});
export function initializeSqlEngine(){ready??=loadEngine().then(({init})=>init());return ready;}
export const initSqlConverter=initializeSqlEngine;
export async function convertSql(sql:string,source:Dialect,target:Dialect,mode:OraclePaginationMode="modern"):Promise<ConversionResult>{
 if(!sql.trim())return{status:"unchanged",sql,originalSql:sql,warnings:[]};
 const fail=(code:string,message:string,line?:number,column?:number,suggestedSql?:string):ConversionResult=>({status:"unchanged",sql,originalSql:sql,...(suggestedSql?{suggestedSql,alternatives:[{label:"Suggested alternative",sql:suggestedSql}]}:{}),warnings:[{severity:"warning",code,message,...(line?{line}:{}),...(column?{column}:{})}]});
 if(source===target&&!(target==="Oracle"&&mode==="legacy"))return{status:"unchanged",sql,originalSql:sql,warnings:[]};
 try{const m=await loadEngine();await initializeSqlEngine();const d:Record<Dialect,E>={PostgreSQL:m.Dialect.PostgreSQL,MySQL:m.Dialect.MySQL,"SQL Server":m.Dialect.TSQL,SQLite:m.Dialect.SQLite,Oracle:m.Dialect.Oracle};const p=m.parse(sql,d[source]);if(!p.success)return fail("parse-error",`Could not parse SQL: ${p.error??"unknown parser error"}. Original preserved; migrate manually.`,p.errorLine,p.errorColumn);
 const pag=target==="Oracle"?page(sql,source):null;
 let out="";
 if(target==="Oracle"&&mode==="legacy"&&pag){const searchable=maskSql(sql);if(!/^\s*SELECT\b/i.test(searchable)||/\bWITH\b|\bUNION\b|\bROWNUM\b/i.test(searchable)||unsafeOrderBy(searchable))return fail("legacy-pagination-unsafe","Unsafe query shape for ROWNUM; original preserved. Use Modern FETCH or migrate manually.");const inner=m.transpile(sql.replace(pag.rx,""),d[source],m.Dialect.Oracle,{unsupportedLevel:"raise"});if(!inner.success||!inner.sql?.[0])return fail("legacy-pagination-unsafe","Could not prove ROWNUM wrapper safe; original preserved.");out=`SELECT * FROM (SELECT qb_inner.*, ROWNUM qb_rn FROM (${inner.sql[0].replace(/;\s*$/,"")}) qb_inner WHERE ROWNUM <= ${pag.offset+pag.count}) WHERE qb_rn > ${pag.offset}`;}
 else{const r=m.transpile(sql,d[source],d[target],{unsupportedLevel:"raise"});if(!r.success)return fail("unsupported",`Unsupported SQL: ${r.error??"no safe transpilation"}. Original preserved; manual migration may be required.`);out=r.sql?.join(";\n")??"";}
 if(!out)return fail("unsupported","No safe target SQL; original preserved for manual migration.");const check=m.parse(out,d[target]);if(!check.success)return fail("generated-sql-invalid","Generated SQL did not parse in target dialect; original preserved.",check.errorLine,check.errorColumn,out);
 return{status:"converted",sql:out,originalSql:sql,warnings:[{severity:"warning",code:"semantic-review",message:"Review database semantics, functions, data types, and execution plans; syntax conversion does not guarantee equivalence."}]};}catch(e){return fail("engine-error",`Engine error: ${e instanceof Error?e.message:"unknown"}. Original preserved; manual migration may be required.`);}}
function page(sql:string,d:Dialect):{rx:RegExp;offset:number;count:number}|null{const searchable=maskSql(sql);let m:RegExpExecArray|null;if(d==="MySQL"&&(m=/\bLIMIT\s+(\d+)\s*,\s*(\d+)\s*;?\s*$/i.exec(searchable)))return{rx:/\bLIMIT\s+\d+\s*,\s*\d+\s*;?\s*$/i,offset:+m[1],count:+m[2]};if(d==="MySQL"&&(m=/\bLIMIT\s+(\d+)\s*;?\s*$/i.exec(searchable)))return{rx:/\bLIMIT\s+\d+\s*;?\s*$/i,offset:0,count:+m[1]};if(d==="PostgreSQL"&&(m=/\bLIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?\s*;?\s*$/i.exec(searchable)))return{rx:/\bLIMIT\s+\d+(?:\s+OFFSET\s+\d+)?\s*;?\s*$/i,offset:+(m[2]??0),count:+m[1]};return null;}
function unsafeOrderBy(searchable:string):boolean{const match=/\bORDER\s+BY\b([\s\S]*?)(?:\bLIMIT\b|$)/i.exec(searchable);if(!match)return false;return /\bCASE\b|\bOVER\s*\(|\b[A-Z_][A-Z0-9_$]*\s*\(/i.test(match[1]);}
function maskSql(sql:string):string{let out="",i=0;while(i<sql.length){if(sql[i]==="'"||sql[i]==='"'||sql[i]==="`"){const quote=sql[i++];out+=quote;while(i<sql.length){out+=" ";if(sql[i]===quote){out+=quote;i++;break}if(sql[i]==="\\") {i+=2;out+="  ";}else i++;}continue}if(sql[i]==="-"&&sql[i+1]==="-"){while(i<sql.length&&sql[i]!=="\n"){out+=" ";i++;}continue}if(sql[i]==="/"&&sql[i+1]==="*"){out+="  ";i+=2;while(i<sql.length&&!(sql[i]==="*"&&sql[i+1]==="/")){out+=" ";i++;}if(i<sql.length){out+="  ";i+=2}continue}out+=sql[i++]}return out;}
