'use client'

import Link from 'next/link'
import { WalletHeaderButton } from './wallet-header-button'

type AppHeaderProps = {
  authenticated?: boolean
  onLogin?: () => void
  /** Show Create + Dashboard nav links when authenticated */
  showNavLinks?: boolean
}

export function AppHeader({ authenticated, onLogin, showNavLinks = true }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e6e9ec] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline transition-opacity hover:opacity-80"
        >
          <img src="/parrot-pay-logo.svg" alt="Tempo" width={32} height={32} className="shrink-0 object-contain" />
          <span className="text-lg font-semibold text-[#32325d]">Tempo</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/docs"
            className="text-sm font-medium text-[#6b7c93] no-underline transition-colors hover:text-[#32325d] hidden sm:inline"
          >
            API Docs
          </Link>
          {authenticated && showNavLinks && (
            <>
              <Link
                href="/create"
                className="text-sm font-medium text-[#6b7c93] no-underline transition-colors hover:text-[#32325d] hidden sm:inline"
              >
                Create link
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-[#6b7c93] no-underline transition-colors hover:text-[#32325d] hidden sm:inline"
              >
                Dashboard
              </Link>
            </>
          )}
          <WalletHeaderButton authenticated={authenticated} onLogin={onLogin ?? (() => {})} />
        </nav>
      </div>
    </header>
  )
}
