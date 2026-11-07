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

/**
 * The website under analysis. In this repository that is REPO_ROOT, because
 * geo-lab/ sits inside the website's repository. A standalone deployment (an
 * Oracle VM, for instance) must set GEO_LAB_SITE_DIR to a checkout of the
 * website, otherwise the crawler would walk the lab's own parent directory.
 */
export const SITE_DIR = process.env.GEO_LAB_SITE_DIR
  ? path.resolve(process.env.GEO_LAB_SITE_DIR)
  : REPO_ROOT;

/** Existing growth-engine knowledge base + raw observation logs. */
export const GROWTH_ENGINE_DIR = path.join(REPO_ROOT, "growth-engine");
export const GE_DATA_DIR = path.join(GROWTH_ENGINE_DIR, "data");

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
