/**
 * API key management for the Headquarters integration.
 *
 *   npm run apikey -- create --name "AI Headquarters" [--scopes read:health,read:visibility] [--expires 2027-01-01]
 *   npm run apikey -- list
 *   npm run apikey -- revoke --id 3
 *
 * The secret is printed once and never stored, so it cannot be shown again.
 * This runs server-side only; it is never exposed over HTTP.
 */
import { createApiKey, listApiKeys, revokeApiKey, READ_ONLY_SCOPES, ALL_SCOPES, type Scope } from "../src/lib/api-keys";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const cmd = process.argv[2];

if (cmd === "create") {
  const name = arg("name") ?? "AI Headquarters";
  const scopesArg = arg("scopes");
  const scopes = scopesArg
    ? (scopesArg.split(",").map((s) => s.trim()).filter(Boolean) as Scope[])
    : READ_ONLY_SCOPES;
  const invalid = scopes.filter((s) => !(ALL_SCOPES as readonly string[]).includes(s));
  if (invalid.length) {
    console.error(`Unknown scope(s): ${invalid.join(", ")}`);
    console.error(`Valid scopes: ${ALL_SCOPES.join(", ")}`);
    process.exit(1);
  }
  const created = createApiKey(name, scopes, arg("expires"));
  console.log(JSON.stringify(created, null, 2));
  console.log("\nStore the secret in Headquarters as GEO_LAB_API_KEY. It will not be shown again.");
} else if (cmd === "list") {
  console.log(JSON.stringify(listApiKeys(), null, 2));
} else if (cmd === "revoke") {
  const id = Number(arg("id"));
  if (!id) {
    console.error("--id is required");
    process.exit(1);
  }
  console.log(revokeApiKey(id) ? `Revoked key #${id}` : `No active key with id ${id}`);
} else {
  console.log("Usage: apikey <create|list|revoke> [--name N] [--scopes a,b] [--expires YYYY-MM-DD] [--id N]");
  process.exit(1);
}
