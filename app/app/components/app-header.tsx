'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
        <Button variant="ghost" size="sm" className="h-auto px-0 hover:bg-transparent" asChild>
          <Link href="/" className="flex items-center gap-2 no-underline transition-opacity hover:opacity-80">
            <img src="/parrot-pay-logo.svg" alt="Parrot Pay" width={32} height={32} className="shrink-0 object-contain" />
            <span className="text-lg font-semibold text-[#32325d]">Parrot Pay</span>
          </Link>
        </Button>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-[#6b7c93] hover:text-[#32325d] hidden sm:inline-flex" asChild>
            <Link href="/docs">API Docs</Link>
          </Button>
          {authenticated && showNavLinks && (
            <>
              <Button variant="ghost" size="sm" className="text-[#6b7c93] hover:text-[#32325d] hidden sm:inline-flex" asChild>
                <Link href="/create">Create link</Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-[#6b7c93] hover:text-[#32325d] hidden sm:inline-flex" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </>
          )}
          <WalletHeaderButton authenticated={authenticated} onLogin={onLogin ?? (() => {})} />
        </nav>
      </div>
    </header>
  )
}
