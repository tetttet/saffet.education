import { SearchPanel } from "./search-panel";
import { getI18n } from "@/i18n/server";
import { facet, totals, universities } from "@/lib/data";
import { label, num } from "@/lib/format";

const toOptions = (map: Record<string, string>) => Object.entries(map).map(([value, label]) => ({ value, label }));

export async function HeroSearch() {
  const { t, href, locale } = await getI18n();
  const s = t.search;
  const options = {
    cities: toOptions(t.labels.city),
    levels: toOptions(t.labels.degree),
    languages: toOptions(t.labels.language),
    types: toOptions(t.labels.type),
    fields: facet("field")
      .map((f) => ({ value: f.value, label: label(t.labels.field, f.value) }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    universities: [...universities].sort((a, b) => a.name.localeCompare(b.name)).map((u) => ({ value: u.name, label: u.name })),
    trending: [
      { label: s.trendMedicine, href: href("/programs?field=Medicine+%26+Health") },
      { label: s.trendIt, href: href("/programs?field=Computer+Science+%26+IT") },
      { label: "MBA", href: href("/programs?q=Business+Administration&degree=Master%27s+Degree") },
      { label: s.trendPsychology, href: href("/programs?q=Psychology") },
      { label: s.trendDentistry, href: href("/programs?q=Dentistry") },
    ],
  };

  return (
    <SearchPanel
      programsAction={href("/programs")}
      universitiesAction={href("/universities")}
      advancedHref={href("/programs")}
      counts={{ programs: num(totals.programs, locale), universities: num(totals.universities, locale) }}
      labels={{
        tabPrograms: t.home.tabPrograms,
        tabUniversities: t.home.tabUniversities,
        faculty: t.program.faculty,
        university: t.programs.university,
        city: t.programs.city,
        level: t.programs.level,
        language: t.programs.language,
        type: t.university.type,
        anyFaculty: s.query,
        anyUniversity: t.home.uniQuery,
        anyCity: s.anyCity,
        anyLevel: s.anyLevel,
        anyLanguage: s.anyLanguage,
        anyType: t.universities.anyType,
        submit: s.submit,
        trending: s.trending,
        advanced: t.home.advanced,
      }}
      {...options}
    />
  );
}
