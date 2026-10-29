"use client";

import { useState, useTransition } from "react";
import type { Dictionary } from "@/i18n/dictionaries/ru";
import { saveLead } from "@/lib/leads";
import { whatsappLink } from "@/lib/site";

/** `fields` are the translated study fields for the dropdown; "Other" is added after them. */
export function LeadForm({ t, fields }: { t: Dictionary["leadForm"]; fields: string[] }) {
  const [sent, setSent] = useState(false);
  // WhatsApp link with the filled-in answers, shown when the request could not be saved.
  const [failed, setFailed] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [field, setField] = useState("");

  // Saved as a row on the "Анкеты (реклама)" sheet of the Google Sheet (src/lib/leads.ts).
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    const lead = {
      role: get("role"),
      name: get("name"),
      phone: get("phone"),
      field: field === t.fieldOther ? get("fieldOther") || t.fieldOther : field,
      budget: get("budget"),
      locale: document.documentElement.lang,
      website: get("website"),
    };
    setFailed(null);
    startTransition(async () => {
      const { ok } = await saveLead("form", lead);
      if (ok) return setSent(true);
      const text = [`${t.who} ${lead.role}`, `${t.name}: ${lead.name}`, `${t.phone}: ${lead.phone}`, lead.field && `${t.field}: ${lead.field}`, lead.budget && `${t.budget}: ${lead.budget}`]
        .filter(Boolean)
        .join("\n");
      setFailed(whatsappLink(text));
    });
  }

  if (sent) {
    return (
      <div className="mt-8 rounded-[24px] bg-white p-8 text-center shadow-card">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#e9f8f1] text-success">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12 5 5L20 7" />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold">{t.sentTitle}</h1>
        <p className="mt-2 text-muted">{t.sentText}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative mt-8 space-y-5 rounded-[24px] bg-white p-5 shadow-card sm:p-7">
      <fieldset>
        <legend className="mb-2 text-[13px] font-semibold text-ink">{t.who}</legend>
        <div className="grid grid-cols-2 gap-2.5">
          <Choice name="role" value={t.parent} required defaultChecked />
          <Choice name="role" value={t.student} required />
        </div>
      </fieldset>

      <Input name="name" label={t.name} placeholder={t.namePlaceholder} required autoComplete="name" />
      <Input name="phone" label={t.phone} placeholder="+7 777 777 77 77" required type="tel" inputMode="tel" autoComplete="tel" />
      <label className="block space-y-1.5">
        <span className="text-[13px] font-semibold text-ink">{t.field}</span>
        <select name="field" value={field} onChange={(e) => setField(e.target.value)} className={`field text-base ${field ? "" : "text-ink-400"}`}>
          <option value="">{t.fieldPick}</option>
          {[...fields, t.fieldOther].map((f) => (
            <option key={f} value={f} className="text-ink">
              {f}
            </option>
          ))}
        </select>
      </label>
      {field === t.fieldOther && (
        <input name="fieldOther" aria-label={t.fieldOther} placeholder={t.fieldOtherPlaceholder} autoFocus className="field -mt-3 text-base" />
      )}

      <fieldset>
        <legend className="mb-2 text-[13px] font-semibold text-ink">{t.budget}</legend>
        <div className="grid grid-cols-2 gap-2.5">
          {t.budgets.map((b) => (
            <Choice key={b} name="budget" value={b} />
          ))}
        </div>
      </fieldset>

      {/* Honeypot: hidden from people, bots fill it in and their requests are dropped */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" />

      {failed && (
        <p className="rounded-[12px] bg-[#fdecec] px-4 py-3 text-sm text-[#a12a2a]">
          {t.error}{" "}
          <a href={failed} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
            WhatsApp
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-brand text-base font-semibold text-white shadow-[0_10px_24px_color-mix(in_srgb,var(--color-brand)_25%,transparent)] transition hover:bg-brand-dark active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
      >
        {t.submit}
        {pending ? <Spinner /> : (
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        )}
      </button>
    </form>
  );
}

function Spinner() {
  return <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />;
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      <input className="field text-base" {...props} />
    </label>
  );
}

/** Radio styled as a big tappable tile. */
function Choice({ value, ...props }: { value: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="cursor-pointer">
      <input type="radio" value={value} className="peer sr-only" {...props} />
      <span className="flex min-h-12 items-center justify-center rounded-[12px] border border-[#e3e6ea] px-3 py-2.5 text-center text-[15px] font-medium text-ink-600 transition peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:text-brand peer-focus-visible:ring-3 peer-focus-visible:ring-brand-soft">
        {value}
      </span>
    </label>
  );
}
