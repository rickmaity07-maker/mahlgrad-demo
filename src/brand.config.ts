/**
 * One file to rebrand the template for another café: names, address, contact,
 * colours and SEO text. Everything else reads from here.
 */
export const BRAND = {
  /** display name (titles, share cards) */
  name: "Mahlgrad",
  /** lowercase wordmark used in the header, footer and stamp card */
  wordmark: "mahlgrad",
  legalName: "Mahlgrad Kaffeebar (Demo)",
  owner: "Ilka Brenneisen",
  ownerTitle: { de: "Inhaberin", en: "Owner" },
  street: "Brüsseler Platz 9",
  postcode: "50672",
  city: { de: "Köln", en: "Cologne" },
  /** where the café is, used in the hero line */
  area: { de: "am Brüsseler Platz", en: "on Brüsseler Platz" },
  /** ".example" is a reserved, never-real domain */
  email: "hallo@mahlgrad.example",
  phone: "0221 0000000",
  /** USt-IdNr. for the Impressum, or null if the business has none */
  vatId: null as string | null,
  /** state data protection authority for the Datenschutz page (depends on the Bundesland) */
  dataAuthority: {
    name: "Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen",
    url: "https://www.ldi.nrw.de",
  },
  colors: {
    /** the one accent on the dark espresso ground. Keep at least 4.5:1 with accentInk (WCAG AA). */
    accent: "#8095ff",
    accentInk: "#0d0f1c",
    /** the same accent on light "crema" sections */
    accentLight: "#2342b8",
    accentLightInk: "#f7f5f0",
  },
  seo: {
    title: { de: "Specialty Coffee in Köln", en: "Specialty coffee in Cologne" },
    description: {
      de: "Specialty Coffee am Brüsseler Platz. Vorbestellen, ohne Warten abholen, Stempel sammeln.",
      en: "Specialty coffee on Brüsseler Platz. Order ahead, skip the queue, collect stamps.",
    },
  },
} as const;

export const brandAddress = (lang: "de" | "en") => `${BRAND.street}, ${BRAND.postcode} ${BRAND.city[lang]}`;
