import type { Metadata, Viewport } from "next";
import { Familjen_Grotesk, Inter_Tight } from "next/font/google";
import { LangProvider } from "@/components/LangProvider";
import { introGateScript } from "@/components/shop/introGate";
import { getLang } from "@/lib/lang";
import "./globals.css";

const inter = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"] });
const familjen = Familjen_Grotesk({ variable: "--font-familjen", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Mahlgrad | Specialty Coffee in Köln", template: "%s | Mahlgrad" },
  description: "Specialty Coffee am Brüsseler Platz. Vorbestellen, ohne Warten abholen, Stempel sammeln.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ecede8" },
    { media: "(prefers-color-scheme: dark)", color: "#101114" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${inter.variable} ${familjen.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introGateScript }} />
      </head>
      <body className="min-h-dvh">
        <LangProvider lang={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
