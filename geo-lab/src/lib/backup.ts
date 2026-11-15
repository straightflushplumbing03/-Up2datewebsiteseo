import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { getDb } from "./db";
import { DB_PATH } from "./paths";

/**
 * Consistent SQLite backup via VACUUM INTO, which copies a committed snapshot
 * even while the lab is open. Restore refuses to overwrite the live database
 * file: point GEO_LAB_DB at the restored copy and restart.
 */

export function backupDatabase(dest: string): { path: string; bytes: number } {
  const target = path.resolve(dest);
  if (fs.existsSync(target)) throw new Error(`Backup target already exists: ${target}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const escaped = target.replaceAll("'", "''");
  getDb().exec(`VACUUM INTO '${escaped}'`);
  return { path: target, bytes: fs.statSync(target).size };
}

export function restoreDatabase(backupPath: string, destPath: string): { path: string; integrity: string } {
  const src = path.resolve(backupPath);
  const dest = path.resolve(destPath);
  if (!fs.existsSync(src)) throw new Error(`Backup not found: ${src}`);
  if (dest === path.resolve(DB_PATH)) {
    throw new Error(
      "Refusing to overwrite the live database. Restore onto a new file, then point GEO_LAB_DB at it and restart.",
    );
  }
  const check = new DatabaseSync(src, { readOnly: true });
  const row = check.prepare("PRAGMA integrity_check").get() as { integrity_check: string } | undefined;
  check.close();
  if (!row || row.integrity_check !== "ok") {
    throw new Error(`Backup failed integrity check: ${row?.integrity_check ?? "no result"}`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return { path: dest, integrity: "ok" };
}
