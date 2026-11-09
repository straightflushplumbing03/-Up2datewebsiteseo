import { insert, query, logActivity } from "./db";

/**
 * Email notifications (spec §16).
 *
 * The spec asks for "optional email notifications through a supported email
 * integration if configured". Nothing is configured in this environment, so the
 * default path is `console`: the message is written to the notifications table
 * and to the activity log, and no network call is attempted.
 *
 * The module is provider-agnostic on purpose. Adding a provider means adding one
 * entry to CHANNELS — no other file changes. Every send is recorded with its
 * real outcome; a channel whose provider is not configured is stored as
 * `skipped`, never as `sent`.
 */

export type Channel = "console" | "resend" | "sendgrid" | "smtp";

export interface SendResult {
  channel: Channel;
  status: "sent" | "skipped" | "failed";
  detail: string;
}

export interface NotificationInput {
  kind: string;
  subject: string;
  body: string;
  to?: string;
}

/**
 * Provider registry. Each entry says which environment variables it needs and
 * how to deliver. `configured()` must answer from the environment alone, so the
 * status shown in Settings is the same answer the sender will get.
 */
const CHANNELS: Record<Channel, { label: string; env: string[]; configured: () => boolean; send?: (n: NotificationInput, to: string) => Promise<string> }> = {
  console: {
    label: "In-app log (always available)",
    env: [],
    configured: () => true,
  },
  resend: {
    label: "Resend",
    env: ["RESEND_API_KEY"],
    configured: () => Boolean(process.env.RESEND_API_KEY),
    send: async (n, to) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.GEO_LAB_MAIL_FROM || "geo-lab@localhost", to: [to], subject: n.subject, text: n.body }),
      });
      if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return `Resend accepted the message (HTTP ${res.status}).`;
    },
  },
  sendgrid: {
    label: "SendGrid",
    env: ["SENDGRID_API_KEY"],
    configured: () => Boolean(process.env.SENDGRID_API_KEY),
    send: async (n, to) => {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: process.env.GEO_LAB_MAIL_FROM || "geo-lab@localhost" },
          subject: n.subject,
          content: [{ type: "text/plain", value: n.body }],
        }),
      });
      if (!res.ok) throw new Error(`SendGrid HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return `SendGrid accepted the message (HTTP ${res.status}).`;
    },
  },
  smtp: {
    label: "SMTP (not wired — needs a mail library)",
    env: ["SMTP_URL"],
    configured: () => false,
  },
};

/** The owner's address, used as the default recipient when one is not given. */
export function defaultRecipient(): string | undefined {
  return process.env.GEO_LAB_NOTIFY_TO || process.env.GEO_LAB_OWNER_EMAIL || undefined;
}

/** The channel to use: explicit env choice, else the first configured provider, else console. */
export function activeChannel(): Channel {
  const chosen = (process.env.GEO_LAB_NOTIFY_CHANNEL || "").toLowerCase() as Channel;
  if (chosen && CHANNELS[chosen]?.configured()) return chosen;
  const first = (Object.keys(CHANNELS) as Channel[]).find((c) => c !== "console" && CHANNELS[c].configured());
  return first ?? "console";
}

/** What Settings shows. A provider without its variables is reported as unavailable. */
export function notificationStatus(): { channel: Channel; label: string; available: boolean; requiredEnv: string[] }[] {
  return (Object.keys(CHANNELS) as Channel[]).map((c) => ({
    channel: c,
    label: CHANNELS[c].label,
    available: CHANNELS[c].configured(),
    requiredEnv: CHANNELS[c].env,
  }));
}

/**
 * Deliver one notification and record the real outcome. Never throws: a failed
 * notification must not take down the run that produced it.
 */
export async function notify(input: NotificationInput): Promise<SendResult> {
  const channel = activeChannel();
  const to = input.to ?? defaultRecipient();
  let status: SendResult["status"] = "skipped";
  let detail: string;

  if (channel === "console") {
    status = "sent";
    detail = "Recorded in the notifications log and the activity feed; no email provider is configured.";
  } else if (!to) {
    detail = `Channel ${channel} is configured but no recipient is set. Set GEO_LAB_NOTIFY_TO.`;
  } else {
    try {
      detail = (await CHANNELS[channel].send!(input, to)) ?? `Delivered via ${channel}.`;
      status = "sent";
    } catch (e) {
      status = "failed";
      detail = e instanceof Error ? e.message : String(e);
    }
  }

  insert("notifications", {
    kind: input.kind,
    subject: input.subject,
    body: input.body,
    channel,
    status,
    detail,
  });
  logActivity("Analytics Agent", `Notification "${input.subject}" — ${status} (${channel}).`, {
    level: status === "failed" ? "warning" : "info",
    evidence: `notifications:${channel}:${status}`,
  });

  return { channel, status, detail };
}

/** A notification for a completed scheduled run (spec §16, daily). */
export async function notifyRunComplete(args: {
  trigger: string;
  ok: boolean;
  summary: string;
  failures: string[];
  reportTitle?: string;
}): Promise<SendResult> {
  const lines = [
    `Run trigger: ${args.trigger}`,
    `Result: ${args.summary}`,
    args.reportTitle ? `Report: ${args.reportTitle}` : "",
    args.failures.length ? `Failures:\n${args.failures.map((f) => `  - ${f}`).join("\n")}` : "Failures: none",
  ].filter(Boolean);
  return notify({
    kind: args.ok ? "run-complete" : "run-failed",
    subject: `GEO Lab ${args.trigger} run — ${args.summary}`,
    body: lines.join("\n"),
  });
}

export function listNotifications(limit = 50) {
  return query<Record<string, unknown>>("SELECT * FROM notifications ORDER BY id DESC LIMIT ?", limit);
}
