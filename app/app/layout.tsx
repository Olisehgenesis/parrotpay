import type { Metadata } from 'next'
import { Providers } from './providers'
import 'parrotpay-sdk/dist/index.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Parrot Pay — Add payments to any site in one line',
  description: 'Drop in our checkout widget. No backend required. Built for Tempo Testnet.',
  icons: {
    icon: '/parrot-pay-logo.svg',
  },
  openGraph: {
    title: 'Parrot Pay — Add payments to any site in one line',
    description: 'Drop in our checkout widget. No backend required.',
    images: ['/parrot-pay-logo.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
