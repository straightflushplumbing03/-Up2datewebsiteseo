import { getDb, logActivity } from "../src/lib/db";
import { runOrchestrator, providerEnvFromProcess } from "../src/lib/agents/orchestrator";
import { saveReport } from "../src/lib/reporting";
import { seedIntegrations } from "../src/lib/integrations";

/**
 * Headless daily run. Same orchestrator the HTTP route and the dashboard
 * buttons use, so behaviour is identical — but with no server and no HTTP
 * hop. This is what a scheduler that already has the repository checked out
 * should call (GitHub Actions, a systemd timer, cron), and it is the reason
 * the lab does not need a long-lived web process to stay autonomous.
 *
 *   npm run job                 # daily operations, no live visibility calls
 *   npm run job -- --visibility # also run the live visibility sweep
 *   npm run job -- --report weekly
 *
 * The database path comes from GEO_LAB_DB (see src/lib/paths.ts), so point it
 * at persistent storage.
 */
function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? "") : undefined;
}

async function main() {
  getDb();
  const env = providerEnvFromProcess();
  seedIntegrations(env);

  const visibility = process.argv.includes("--visibility");
  const liveEntity = !process.argv.includes("--no-live-entity");
  const report = (arg("report") ?? "daily") as "daily" | "weekly" | "monthly";

  console.log(`GEO Lab — headless run (report=${report}, visibility=${visibility}, liveEntity=${liveEntity})`);
  logActivity("Chief Intelligence Orchestrator", "Headless run started.", { evidence: `report=${report}` });

  const result = await runOrchestrator({
    trigger: "cli",
    env,
    visibility,
    visibilityLimit: Number(arg("limit") ?? 20),
    liveEntity,
  });

  for (const step of result.steps) {
    console.log(`  [${step.status}] ${step.agent}: ${step.summary}`);
  }

  const reportId = saveReport(report);
  console.log(`  report saved: ${report} (#${reportId})`);
  console.log(`  run ${result.ok ? "completed" : "completed with failures"} at ${result.finishedAt}`);
  if (!result.ok) process.exitCode = 1;
}

main().catch((err) => {
  console.error("run failed:", err);
  process.exitCode = 1;
});
