import Image from "next/image"
import Link from "next/link"

import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { marketingPath } from "@/lib/urls"
import { AuthBrandPanel } from "@/modules/auth/ui/components/auth-brand-panel"
import "../styles/auth.css"

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="auth-page light lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <main className="auth-form-side flex min-h-svh flex-col">
        <header className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-10 sm:pt-7">
          <Link
            aria-label="Osonflow home"
            className="auth-logo"
            href={marketingPath("/")}
          >
            <Image
              alt=""
              height={40}
              priority
              src="/landing/assets/logo-mark.svg"
              width={70}
            />
            <span>Osonflow</span>
          </Link>
          <LanguageSwitcher className="auth-lang-switch" compact />
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          <div className="auth-form-shell w-full max-w-[25.5rem]">
            {children}
          </div>
        </div>

        <footer className="auth-legal flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 pb-5 text-xs sm:px-10 sm:pb-7">
          <span>© {new Date().getFullYear()} Osonflow</span>
          <nav aria-label="Legal" className="flex items-center gap-5">
            <a href={marketingPath("/privacy")}>Privacy</a>
            <a href={marketingPath("/terms")}>Terms</a>
          </nav>
        </footer>
      </main>

      <AuthBrandPanel />
    </div>
  )
}
