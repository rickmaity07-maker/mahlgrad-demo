import { BRAND } from "@/brand.config";
import type { LegalBusiness } from "@/components/shop/Legal";

/** Fictional business details for the demo (".example" is a reserved, never-real domain). */
export const BUSINESS: LegalBusiness = {
  name: BRAND.legalName,
  owner: `${BRAND.ownerTitle.de}: ${BRAND.owner}`,
  street: BRAND.street,
  city: `${BRAND.postcode} ${BRAND.city.de}`,
  email: BRAND.email,
  phone: BRAND.phone,
  vatId: BRAND.vatId ?? undefined,
  authority: BRAND.dataAuthority,
  retention:
    process.env.DEMO_MODE === "1"
      ? {
          de: "In dieser Demo werden Testbestellungen und neu angelegte Stempelkarten nach spätestens 30 Stunden automatisch gelöscht.",
          en: "In this demo, test orders and newly created stamp cards are deleted automatically within 30 hours.",
        }
      : {
          de: "Bestelldaten bewahren wir so lange auf, wie es Steuer- und Handelsrecht verlangen (in der Regel bis zu zehn Jahre für Buchungsbelege), danach werden sie gelöscht. Die Stempelkarte löschen wir, wenn du es verlangst oder sie zwei Jahre nicht genutzt wurde.",
          en: "Order records are kept as long as tax and commercial law require (usually up to ten years for accounting records) and are then deleted. We delete your stamp card when you ask us to or after two years without use.",
        },
  data: {
    de: "Für eine Vorbestellung speichern wir deinen Namen, deine Telefonnummer, die gewünschte Abholzeit, deine Anmerkung und was du bestellt hast.",
    en: "For a pre-order we store your name, phone number, the pickup time you chose, your note and what you ordered.",
  },
  extra: {
    de: {
      title: "Stempelkarte",
      body: "Für die Stempelkarte speichern wir deine Telefonnummer (nur Ziffern), deinen Namen und die Zahl deiner Stempel und eingelösten Gratis-Getränke. Die Karte entsteht mit deiner ersten abgeholten Bestellung. Bei der Abfrage auf der Website zeigen wir nur die Stempel, nie deinen Namen. Du kannst die Löschung jederzeit per E-Mail verlangen.",
    },
    en: {
      title: "Stamp card",
      body: "For the stamp card we store your phone number (digits only), your name and how many stamps and free drinks you have. The card is created with your first collected order. The lookup on the website only shows stamps, never your name. You can ask us to delete it by email at any time.",
    },
  },
};
