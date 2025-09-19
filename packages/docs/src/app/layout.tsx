import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { StarProvider } from '@/contexts/StarContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Qortex - Minimal, Performant Data Fetching Library',
    template: '%s | Qortex'
  },
  description: 'A minimal, performant data fetching library with React integration. Built for simplicity, efficiency, and developer happiness!',
  keywords: ['Qortex', 'qortex', 'qortex-core', 'qortex-react', 'data fetching', 'react', 'typescript', 'cache', 'query', 'performance'],
  authors: [{ name: 'Darshan Naik' }],
  creator: 'Darshan Naik',
  publisher: 'Darshan Naik',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.svg', type: 'image/svg+xml' }
    ]
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://qortex.dev'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://qortex.dev',
    title: 'Qortex - Minimal, Performant Data Fetching Library',
    description: 'A minimal, performant data fetching library with React integration. Built for simplicity, efficiency, and developer happiness!',
    siteName: 'Qortex',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Qortex - Data Fetching Library',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qortex - Minimal, Performant Data Fetching Library',
    description: 'A minimal, performant data fetching library with React integration. Built for simplicity, efficiency, and developer happiness!',
    images: ['/og-image.png'],
    creator: '@darshannaik',
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
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <StarProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </StarProvider>
      </body>
    </html>
  )
}