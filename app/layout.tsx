import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
}

export const metadata: Metadata = {
  title: {
    default: 'Notion Expert AI - Your AI-Powered Notion Assistant',
    template: '%s | Notion Expert AI'
  },
  description: 'Your AI-powered assistant for Notion expertise, workspace design, and productivity systems. Get personalized help with templates, databases, and workflow optimization.',
  keywords: ['Notion', 'AI Assistant', 'Productivity', 'Workspace Design', 'Templates', 'Database Design'],
  authors: [{ name: 'Notion Expert AI' }],
  creator: 'Notion Expert AI',
  openGraph: {
    type: 'website',
    siteName: 'Notion Expert AI',
    title: 'Notion Expert AI - Your AI-Powered Notion Assistant',
    description: 'Your AI-powered assistant for Notion expertise, workspace design, and productivity systems. Get personalized help with templates, databases, and workflow optimization.',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Notion Expert AI'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notion Expert AI - Your AI-Powered Notion Assistant',
    description: 'Your AI-powered assistant for Notion expertise, workspace design, and productivity systems.',
    images: ['/api/og']
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
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-F55ZF7T4EX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-F55ZF7T4EX');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
