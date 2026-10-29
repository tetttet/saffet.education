"use client";

import { useState, useTransition } from "react";
import type { Dictionary } from "@/i18n/dictionaries/ru";
import { saveLead } from "@/lib/leads";
import { whatsappLink } from "@/lib/site";

type Props = {
  interest: string;
  t: Dictionary["apply"]["form"];
  levels: string[];
  defaultLevel: string;
  /** Universities grouped by city, for the "programme or university" dropdown. */
  unis: { city: string; names: string[] }[];
};

export function ApplyForm({ interest, t, levels, defaultLevel, unis }: Props) {
  // After sending: whether the request reached the sheet, and a WhatsApp link with the same text either way.
  const [sent, setSent] = useState<null | { ok: boolean; whatsapp: string }>(null);
  const [pending, startTransition] = useTransition();

  // Saved as a row on the "Заявки с сайта" sheet of the Google Sheet (src/lib/leads.ts).
  // If that fails, the request goes out as a WhatsApp message instead, so no lead is lost.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    const text = [
      t.msgHeader,
      `${t.name}: ${get("name")}`,
      `${t.phone}: ${get("phone")}`,
      `${t.level}: ${get("degree")}`,
      get("interest") && `${t.msgInterest}: ${get("interest")}`,
      get("message") && `${t.message}: ${get("message")}`,
    ].filter(Boolean).join("\n");
    startTransition(async () => {
      const { ok } = await saveLead("site", {
        name: get("name"),
        phone: get("phone"),
        level: get("degree"),
        interest: get("interest"),
        message: get("message"),
        locale: document.documentElement.lang,
        website: get("website"),
      });
      setSent({ ok, whatsapp: whatsappLink(text) });
    });
  }

  if (sent) {
    return (
      <div className="rounded-[20px] bg-[#f3f5f9] p-8 text-center sm:p-12">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#e9f8f1] text-success">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12 5 5L20 7" />
          </svg>
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold">{sent.ok ? t.sentTitle : t.errorTitle}</h2>
        <p className="mt-2 text-muted">{sent.ok ? t.sentText : t.errorText}</p>
        <a href={sent.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-12 items-center rounded-[9px] bg-[#1da851] px-7 font-semibold text-white transition hover:bg-[#178f45]">
          {sent.ok ? t.sentButton : t.errorButton}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4 rounded-[20px] bg-[#f3f5f9] p-5 sm:p-8">
      <div className="pb-2">
        <h2 className="font-display text-lg font-bold text-ink sm:text-2xl">{t.title}</h2>
        <p className="mt-1.5 text-sm text-muted">{t.note}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label={t.name} required autoComplete="name" />
        <Input name="phone" label={t.phone} required type="tel" autoComplete="tel" placeholder="+7 7__ ___ __ __" />
        <label className="block space-y-1.5">
          <span className="text-[13px] font-semibold text-ink">{t.level}</span>
          <select name="degree" className="field" defaultValue={defaultLevel}>
            {levels.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-[13px] font-semibold text-ink">{t.interest}</span>
          <select name="interest" className="field" defaultValue={interest}>
            <option value="">{t.interestNone}</option>
            {/* A programme picked on its page arrives as text; keep it as the first real option */}
            {interest && !unis.some((g) => g.names.includes(interest)) && <option value={interest}>{interest}</option>}
            {unis.map((g) => (
              <optgroup key={g.city} label={g.city}>
                {g.names.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-[13px] font-semibold text-ink">{t.message}</span>
        <textarea name="message" rows={4} className="field h-auto py-3" placeholder={t.messagePlaceholder} />
      </label>
      <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-sm text-ink-600">
        <input type="checkbox" required className="mt-0.5 size-[18px] shrink-0 accent-brand" />
        {t.consent}
      </label>
      {/* Honeypot: hidden from people, bots fill it in and their requests are dropped */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" />
      <button
        type="submit"
        disabled={pending}
        className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-[9px] bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70"
      >
        {t.submit}
        {pending && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
      </button>
    </form>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      <input className="field" {...props} />
    </label>
  );
}
