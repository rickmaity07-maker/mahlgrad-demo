import type { Metadata, Viewport } from "next";
import { Familjen_Grotesk, Inter_Tight } from "next/font/google";
import { BRAND } from "@/brand.config";
import { LangProvider } from "@/components/LangProvider";
import { MotionToggle } from "@/components/MotionToggle";
import { getLang } from "@/lib/lang";
import "./globals.css";

const inter = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"] });
const familjen = Familjen_Grotesk({ variable: "--font-familjen", subsets: ["latin"] });

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${BRAND.name} | ${BRAND.seo.title.de}`, template: `%s | ${BRAND.name}` },
  description: BRAND.seo.description.de,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    locale: "de_DE",
    title: `${BRAND.name} | ${BRAND.seo.title.de}`,
    description: BRAND.seo.description.de,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#13100e",
  colorScheme: "dark",
};

/** brand colours from brand.config.ts override the defaults in globals.css */
const brandVars = {
  "--brand-accent": BRAND.colors.accent,
  "--brand-accent-ink": BRAND.colors.accentInk,
  "--brand-accent-light": BRAND.colors.accentLight,
  "--brand-accent-light-ink": BRAND.colors.accentLightInk,
} as React.CSSProperties;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  return (
    <html
      lang={lang}
      className={`${inter.variable} ${familjen.variable} antialiased`}
      style={brandVars}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-dvh">
        <LangProvider lang={lang}>
          {children}
          <MotionToggle />
        </LangProvider>
      </body>
    </html>
  );
}
