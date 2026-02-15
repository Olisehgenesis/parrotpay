import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Reference — Parrot Pay',
  description: 'Create payment links, get status, and list payments programmatically.',
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
