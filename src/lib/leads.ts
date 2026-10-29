"use server";

/**
 * Saves a request from one of the site's forms as a row in the Google Sheet
 * (Apps Script web app from google-sheets/leads.gs). SHEETS_WEBHOOK_URL and SHEETS_TOKEN come from the environment.
 *
 *   "form" → the ad landing page (/form), sheet "Анкеты (реклама)"
 *   "site" → the consultation form (/apply), sheet "Заявки с сайта"
 */

const FIELDS = {
  form: ["role", "name", "phone", "field", "budget", "locale"],
  site: ["name", "phone", "level", "interest", "message", "locale"],
} as const;

export type LeadKind = keyof typeof FIELDS;

export async function saveLead(kind: LeadKind, input: Record<string, string>): Promise<{ ok: boolean }> {
  if (!(kind in FIELDS)) return { ok: false };
  // Hidden "website" field: people never see it, bots fill it in. Pretend it went through.
  if (input.website) return { ok: true };

  const data = Object.fromEntries(FIELDS[kind].map((k) => [k, String(input[k] ?? "").trim().slice(0, k === "message" ? 2000 : 300)]));
  if (!data.name || !/\d{6,}/.test(data.phone.replace(/\D/g, ""))) return { ok: false };

  const url = process.env.SHEETS_WEBHOOK_URL;
  const token = process.env.SHEETS_TOKEN;
  if (!url || !token) {
    console.error("saveLead: SHEETS_WEBHOOK_URL / SHEETS_TOKEN are not set, request not saved", kind, data);
    return { ok: false };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token, kind, data }),
      signal: AbortSignal.timeout(15000),
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!json?.ok) console.error("saveLead: sheet refused the request", res.status, json);
    return { ok: Boolean(json?.ok) };
  } catch (err) {
    console.error("saveLead: could not reach the sheet", err);
    return { ok: false };
  }
}
