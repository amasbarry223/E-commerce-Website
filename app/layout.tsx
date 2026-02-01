import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ToastProvider } from '@/components/ToastProvider'
import { CartProvider } from '@/context/cart-context'
import { AuthProvider } from '@/context/auth-context'
import { PageTransition } from '@/components/page-transition'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'Tonomi | Modern Fashion E-commerce',
  description: 'Discover quality fashion that reflects your style and makes everyday enjoyable. Shop the latest trends in men, women and children clothing.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <PageTransition>
              {children}
            </PageTransition>
          </CartProvider>
        </AuthProvider>
        <ToastProvider />
        <Analytics />
      </body>
    </html>
  )
}
