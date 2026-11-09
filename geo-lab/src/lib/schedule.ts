/**
 * The persistent schedule the lab expects to run on (spec §13). This is
 * declarative documentation of intent; execution is driven by an external
 * scheduler (OpenHands automation + GitHub Actions cron) calling /api/run, so
 * the lab never depends on an open browser or terminal.
 */
export const AUTONOMOUS_SCHEDULE: { cadence: string; time: string; operations: string[] }[] = [
  {
    cadence: "Daily",
    time: "06:00",
    operations: [
      "priority AI-visibility tests",
      "search performance review",
      "competitor monitoring",
      "crawl priority pages",
      "technical health check",
      "identify opportunities",
      "execute permitted optimizations",
      "publish routine improvements",
      "validate deployments",
      "record activity + history",
      "daily report",
    ],
  },
  {
    cadence: "Throughout the day",
    time: "queued",
    operations: ["process queued tasks", "retry recoverable failures", "prevent overlapping runs"],
  },
  {
    cadence: "Weekly",
    time: "Mon 06:15",
    operations: ["complete competitor research", "analyse visibility trends", "evaluate experiments", "review geographic coverage", "weekly report"],
  },
  {
    cadence: "Monthly",
    time: "1st 06:30",
    operations: ["reassess GEO strategy", "review all five layers", "review costs", "recommend strategic improvements", "monthly report"],
  },
];
