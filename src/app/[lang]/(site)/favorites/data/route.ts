import { NextResponse } from "next/server";
import { hasLocale } from "@/i18n/config";
import { i18nFor } from "@/i18n/server";
import { getProgram } from "@/lib/data";
import { date, intakes, label, years } from "@/lib/format";
import { uniImage } from "@/lib/images";
import { programName } from "@/lib/program-names";

const MAX_IDS = 200;

/** The saved programs of a visitor. Their ids live in the browser, so the favorites page asks for the details here. */
export async function GET(request: Request, { params }: RouteContext<"/[lang]/favorites/data">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return NextResponse.json([], { status: 404 });
  const { t } = i18nFor(lang);
  const ids = (new URL(request.url).searchParams.get("ids") ?? "").split(",").slice(0, MAX_IDS);
  const items = ids.flatMap((id) => {
    const p = getProgram(id);
    if (!p) return [];
    return [{
      id: p.id,
      name: programName(p.name, lang),
      uni: p.uniName,
      uniSlug: p.uni,
      city: label(t.labels.city, p.city),
      degree: label(t.labels.degree, p.degree),
      field: label(t.labels.field, p.field),
      language: label(t.labels.language, p.language),
      duration: years(p.years, t.years),
      years: p.years,
      fee: p.fee,
      feeOfficial: p.feeOfficial,
      discount: p.discount,
      open: p.open,
      deadline: date(p.deadline, lang),
      intakes: intakes(p.intakes, lang),
      image: uniImage(p.uni) ?? null,
    }];
  });
  return NextResponse.json(items);
}
