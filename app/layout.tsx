import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KYCPlayground - Mock KYC Testing Platform',
  description: 'A mock SaaS platform for testing Know Your Customer (KYC) processes using simulated AI-driven identity verification.',
  keywords: ['KYC', 'identity verification', 'fintech', 'testing', 'mock', 'SaaS'],
  authors: [{ name: 'KYCPlayground Team' }],
  creator: 'KYCPlayground',
  publisher: 'KYCPlayground',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kycplayground.com'),
  openGraph: {
    title: 'KYCPlayground - Mock KYC Testing Platform',
    description: 'Test your KYC workflows with our mock identity verification platform',
    url: 'https://kycplayground.com',
    siteName: 'KYCPlayground',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KYCPlayground',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KYCPlayground - Mock KYC Testing Platform',
    description: 'Test your KYC workflows with our mock identity verification platform',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </body>
    </html>
  )
} 