import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["node:sqlite"],
  // The lab reads the plumbing site's committed .html files, sitemap and the
  // growth-engine data files, which live one level above this app. Tracing is
  // rooted at the repository so those files are bundled for deployment.
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
