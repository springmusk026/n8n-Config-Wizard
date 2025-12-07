import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "n8n Config Wizard | Generate Docker Compose, .env & Environment Variables",
  description:
    "Free n8n configuration generator. Create Docker Compose files, .env configurations, and deployment commands for self-hosted n8n instances. Supports PostgreSQL, Redis queue mode, S3 storage, and enterprise setups.",
  keywords: [
    "n8n",
    "n8n configuration",
    "n8n docker compose",
    "n8n environment variables",
    "n8n self-hosted",
    "workflow automation",
    "n8n setup",
    "n8n deployment",
    "n8n production",
    "n8n enterprise",
  ],
  authors: [{ name: "n8n Config Wizard" }],
  creator: "n8n Config Wizard",
  publisher: "n8n Config Wizard",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "n8n Config Wizard",
    title: "n8n Config Wizard | Generate Docker Compose & Environment Variables",
    description:
      "Free configuration generator for self-hosted n8n instances. Create production-ready Docker Compose files, .env configurations, and deployment commands in seconds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "n8n Config Wizard | Configuration Generator",
    description:
      "Generate Docker Compose files, .env configurations, and deployment commands for self-hosted n8n workflow automation.",
  },
  alternates: {
    canonical: "/",
  },
  category: "Technology",
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "n8n Config Wizard",
              description: "Configuration generator for self-hosted n8n workflow automation instances",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Docker Compose generation",
                "Environment variable configuration",
                "PostgreSQL setup",
                "Redis queue mode",
                "S3 storage configuration",
                "Enterprise deployment templates",
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
