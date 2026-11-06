import path from "node:path";
import fs from "node:fs";

/**
 * geo-lab is expected to run with its own directory as the working directory
 * (Next dev/start, `tsx scripts/*.ts`). All paths are derived from that.
 */
export const GEO_LAB_DIR = process.cwd();
export const REPO_ROOT = path.resolve(GEO_LAB_DIR, "..");
export const DATA_DIR = path.join(GEO_LAB_DIR, "data");
export const DB_PATH = process.env.GEO_LAB_DB || path.join(DATA_DIR, "geo-lab.db");
export const SNAPSHOT_DIR = path.join(DATA_DIR, "snapshots");

/** Existing growth-engine knowledge base + raw observation logs. */
export const GROWTH_ENGINE_DIR = path.join(REPO_ROOT, "growth-engine");
export const GE_DATA_DIR = path.join(GROWTH_ENGINE_DIR, "data");
export const SITE_DIR = REPO_ROOT;

export function ensureDirs(): void {
  for (const d of [DATA_DIR, SNAPSHOT_DIR]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }
}

export function geDataFile(name: string): string {
  return path.join(GE_DATA_DIR, name);
}

export function relToRepo(p: string): string {
  return path.relative(REPO_ROOT, p);
}
