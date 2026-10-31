/** Search landing pages at /study/<slug>: one catalogue filter with its own title, text and address. */
export type LandingKey = "field" | "city" | "degree";
export type Landing = { slug: string; key: LandingKey; value: string };

const entries = (key: LandingKey, list: Record<string, string>): Landing[] =>
  Object.entries(list).map(([slug, value]) => ({ slug, key, value }));

export const landings: Landing[] = [
  ...entries("field", {
    medicine: "Medicine & Health",
    business: "Business & Management",
    engineering: "Engineering",
    "computer-science": "Computer Science & IT",
    "social-sciences": "Social Sciences",
    "arts-design": "Arts & Design",
    design: "Design",
    architecture: "Architecture",
    education: "Education",
    law: "Law",
    languages: "Languages & Literature",
    "natural-sciences": "Natural Sciences",
    humanities: "Arts & Humanities",
    agriculture: "Agriculture & Environment",
    sports: "Sports & Physical Education",
  }),
  ...entries("city", { istanbul: "Istanbul", ankara: "Ankara", izmir: "Izmir", antalya: "Antalya", trabzon: "Trabzon" }),
  ...entries("degree", {
    bachelor: "Bachelor's Degree",
    master: "Master's Degree",
    phd: "PhD / Doctorate",
    associate: "Associate Degree",
  }),
];

export const getLanding = (slug: string) => landings.find((l) => l.slug === slug);

export const landingFor = (key: string, value: string) => landings.find((l) => l.key === key && l.value === value);

/** The landing page of a filter value, or the filtered catalogue when it has none. */
export function catalogueLink(key: LandingKey, value: string) {
  const landing = landingFor(key, value);
  return landing ? `/study/${landing.slug}` : `/programs?${new URLSearchParams({ [key]: value })}`;
}
