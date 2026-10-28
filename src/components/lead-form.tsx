"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/ru";

/** `fields` are the translated study fields for the dropdown; "Other" is added after them. */
export function LeadForm({ t, fields }: { t: Dictionary["leadForm"]; fields: string[] }) {
  const [sent, setSent] = useState(false);
  const [field, setField] = useState("");

  // TODO: send the request somewhere (Telegram bot / email / CRM). For now it only shows the thank-you card.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
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
    <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-[24px] bg-white p-5 shadow-card sm:p-7">
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

      <button
        type="submit"
        className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-brand text-base font-semibold text-white shadow-[0_10px_24px_#0360eb40] transition hover:bg-brand-dark active:scale-[0.98]"
      >
        {t.submit}
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </form>
  );
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
