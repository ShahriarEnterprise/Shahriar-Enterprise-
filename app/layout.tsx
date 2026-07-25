import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Hind_Siliguri } from 'next/font/google'
import { StoreProvider } from '@/lib/store'
import './globals.css'

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Shahriar Enterprise — ব্যবসার ডিজিটাল খাতা',
  description:
    'পাইকারি ও ডিলারশিপ ব্যবসার সম্পূর্ণ হিসাব — স্টক, পার্টি খাতা, বিক্রি-কেনা, খরচ ও লাভ-ক্ষতির রিপোর্ট এক অ্যাপেই।',
  generator: 'v0.app',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1a7a5e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} bg-muted`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans antialiased">
        <StoreProvider>{children}</StoreProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
