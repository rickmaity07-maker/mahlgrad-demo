import type { Lang } from "@/lib/types";

export type LegalBusiness = {
  name: string;
  owner: string;
  street: string;
  city: string;
  email: string;
  phone: string;
  /** What the order form collects, in plain words, per language. */
  data: Record<Lang, string>;
  /** Extra processing specific to this business (e.g. stamp card). */
  extra?: Record<Lang, { title: string; body: string }>;
};

const DEMO = {
  de: "Dies ist eine Demo-Website. Der Betrieb, die Personen und alle Kontaktdaten sind erfunden.",
  en: "This is a demo website. The business, the people and all contact details are fictional.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted">{children}</div>
    </section>
  );
}

function Address({ b }: { b: LegalBusiness }) {
  return (
    <p>
      {b.name}
      <br />
      {b.owner}
      <br />
      {b.street}
      <br />
      {b.city}
    </p>
  );
}

export function Imprint({ b, lang }: { b: LegalBusiness; lang: Lang }) {
  const de = lang === "de";
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-10 sm:px-6">
      <h1 className="display text-[clamp(2.6rem,6vw,4rem)]">{de ? "Impressum" : "Imprint"}</h1>
      <p className="mt-6 rounded-[var(--radius-m)] bg-card p-4 font-medium">{DEMO[lang]}</p>
      <Section title={de ? "Angaben gemäß § 5 DDG" : "Information under § 5 DDG (German Digital Services Act)"}>
        <Address b={b} />
      </Section>
      <Section title={de ? "Kontakt" : "Contact"}>
        <p>
          {de ? "Telefon" : "Phone"}: {b.phone}
          <br />
          E-Mail: {b.email}
        </p>
      </Section>
      <Section title={de ? "Verbraucherstreitbeilegung" : "Consumer dispute resolution"}>
        <p>
          {de
            ? "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
            : "We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board."}
        </p>
      </Section>
    </div>
  );
}

export function Privacy({ b, lang }: { b: LegalBusiness; lang: Lang }) {
  const de = lang === "de";
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-10 sm:px-6">
      <h1 className="display text-[clamp(2.6rem,6vw,4rem)]">{de ? "Datenschutz" : "Privacy"}</h1>
      <p className="mt-6 rounded-[var(--radius-m)] bg-card p-4 font-medium">{DEMO[lang]}</p>

      <Section title={de ? "Verantwortlich" : "Controller"}>
        <Address b={b} />
        <p>E-Mail: {b.email}</p>
      </Section>

      <Section title={de ? "Bestellungen" : "Orders"}>
        <p>{b.data[lang]}</p>
        <p>
          {de
            ? "Wir verwenden diese Daten nur, um deine Bestellung zuzubereiten, dich bei Rückfragen anzurufen und die Bestellung zu übergeben (Art. 6 Abs. 1 lit. b DSGVO). Bestelldaten bewahren wir so lange auf, wie es Steuer- und Handelsrecht verlangen."
            : "We use this data only to prepare your order, call you with questions and hand the order over (Art. 6(1)(b) GDPR). Order records are kept as long as tax and commercial law require."}
        </p>
      </Section>

      {b.extra ? (
        <Section title={b.extra[lang].title}>
          <p>{b.extra[lang].body}</p>
        </Section>
      ) : null}

      <Section title={de ? "Schutz vor Missbrauch" : "Abuse protection"}>
        <p>
          {de
            ? "Um massenhafte Fake-Bestellungen und das Erraten von Passwörtern zu verhindern, speichern wir eine verschlüsselte Kurzform deiner IP-Adresse (keinen Klartext) zusammen mit dem Zeitpunkt. Daraus lässt sich die IP-Adresse nicht zurückrechnen (Art. 6 Abs. 1 lit. f DSGVO)."
            : "To stop mass fake orders and password guessing we store a keyed hash of your IP address (never the plain address) with a timestamp. The IP address cannot be recovered from it (Art. 6(1)(f) GDPR)."}
        </p>
      </Section>

      <Section title={de ? "Cookies und lokaler Speicher" : "Cookies and local storage"}>
        <p>
          {de
            ? "Wir setzen keine Tracking- oder Werbe-Cookies. Ein Cookie merkt sich deine Sprache, der Warenkorb liegt nur in deinem Browser (localStorage). Das Team-Login nutzt ein Sitzungs-Cookie."
            : "We use no tracking or advertising cookies. One cookie remembers your language; the cart lives only in your browser (localStorage). The team login uses a session cookie."}
        </p>
      </Section>

      <Section title={de ? "Hosting" : "Hosting"}>
        <p>
          {de
            ? "Die Website läuft bei Vercel Inc., die Datenbank bei Neon (Rechenzentrum Frankfurt am Main). Mit beiden bestehen Verträge zur Auftragsverarbeitung."
            : "The website runs on Vercel Inc.; the database on Neon (Frankfurt am Main data centre). Data processing agreements are in place with both."}
        </p>
      </Section>

      <Section title={de ? "Deine Rechte" : "Your rights"}>
        <p>
          {de
            ? "Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Schreib uns dafür eine E-Mail. Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren."
            : "You have the right to access, rectification, erasure, restriction, data portability and objection. Just email us. You can also complain to a data protection authority."}
        </p>
      </Section>
    </div>
  );
}
