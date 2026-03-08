import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Qortex - Minimal, Performant Data Fetching Library",
    template: "%s | Qortex",
  },
  description:
    "A minimal, performant data fetching library with React integration. Built for simplicity, efficiency, and developer happiness!",
  keywords: [
    "Qortex",
    "qortex",
    "@qortex/query",
    "@qortex/query-react",
    "data fetching",
    "react",
    "typescript",
    "cache",
    "query",
    "performance",
  ],
  authors: [{ name: "Darshan Naik" }],
  creator: "Darshan Naik",
  publisher: "Darshan Naik",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://qortex.darshannaik.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://qortex.darshannaik.com",
    title: "Qortex - Minimal, Performant Data Fetching Library",
    description:
      "A minimal, performant data fetching library with React integration. Built for simplicity, efficiency, and developer happiness!",
    siteName: "Qortex",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Qortex - Minimal, Performant Data Fetching Library",
        type: "image/svg+xml",
      },
      {
        url: "/og-image-square.png",
        width: 1200,
        height: 1200,
        alt: "Qortex - Minimal, Performant Data Fetching Library",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qortex - Minimal, Performant Data Fetching Library",
    description:
      "A minimal, performant data fetching library with React integration. Built for simplicity, efficiency, and developer happiness!",
    images: ["/og-image.png"],
    creator: "@darshannaik",
  },
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Qortex",
    description:
      "A minimal, performant data fetching library with React integration. Built for simplicity, efficiency, and developer happiness!",
    url: "https://qortex.darshannaik.com",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Darshan Naik",
    },
    keywords:
      "data fetching, react, typescript, cache, query, performance, qortex",
    programmingLanguage: ["TypeScript", "JavaScript"],
    runtimePlatform: "Node.js",
    softwareVersion: "0.3.6",
    license: "https://opensource.org/licenses/LGPL-3.0",
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
