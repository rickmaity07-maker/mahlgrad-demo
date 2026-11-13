import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { BRAND } from "@/brand.config";
import { getDict } from "@/lib/lang";

export default async function NotFound() {
  const { t } = await getDict();
  return (
    <main className="grain relative isolate grid min-h-dvh place-items-center overflow-hidden px-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image src="/img/c5.jpg" alt="" fill sizes="100vw" className="kenburns object-cover opacity-40" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(70% 60% at 50% 45%, rgb(19 16 14 / 0.55), rgb(19 16 14 / 0.94))" }}
        />
      </div>
      <div className="max-w-2xl text-center">
        <Link href="/" className="display text-4xl text-cobalt">
          {BRAND.wordmark}
        </Link>
        <p className="display mt-10 text-[clamp(5rem,18vw,11rem)] leading-none text-ink/15" aria-hidden="true">
          404
        </p>
        <h1 className="display -mt-6 text-[clamp(2.4rem,6vw,4.4rem)]">{t.notFound.title}</h1>
        <p className="mx-auto mt-5 max-w-[40ch] text-lg text-ink/85">{t.notFound.body}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/menu" className="btn btn-primary">
            {t.notFound.menu}
            <ArrowRight size={18} aria-hidden />
          </Link>
          <Link href="/" className="btn btn-ghost">
            {t.notFound.home}
          </Link>
        </div>
      </div>
    </main>
  );
}
