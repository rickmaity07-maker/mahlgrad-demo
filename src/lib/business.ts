import type { LegalBusiness } from "@/components/shop/Legal";

/** Fictional business details for the demo (".example" is a reserved, never-real domain). */
export const BUSINESS: LegalBusiness = {
  name: "Mahlgrad Kaffeebar (Demo)",
  owner: "Inhaberin: Ilka Brenneisen",
  street: "Brüsseler Platz 9",
  city: "50672 Köln",
  email: "hallo@mahlgrad.example",
  phone: "0221 0000000",
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
