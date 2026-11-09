import { getDb, queryOne, query } from "../src/lib/db";
import { DB_PATH } from "../src/lib/paths";

/**
 * Apply the schema and report what is in the database. Safe to run repeatedly:
 * getDb() creates any missing table/index and never drops data.
 */
getDb();
console.log(`GEO Lab — schema at ${DB_PATH}`);

const tables = query<{ name: string }>(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
);

for (const { name } of tables) {
  const n = queryOne<{ c: number }>(`SELECT COUNT(*) c FROM "${name}"`)?.c ?? 0;
  console.log(`  ${name.padEnd(26)} ${n}`);
}
console.log(`${tables.length} tables. done.`);
