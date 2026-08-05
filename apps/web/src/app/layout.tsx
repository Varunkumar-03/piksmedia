import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Toaster } from 'react-hot-toast';
import Footer from '../components/Footer';
import AxiosSetup from '../components/AxiosSetup';
import MascotWrapper from '../components/MascotWrapper';

export const metadata: Metadata = {
  title: "Piks Media | Premium Handcrafted Frames & Fine Art Prints",
  description: "Transform your memories into museum-grade framed prints, custom photo canvases, and handcrafted frames.",
  keywords: ["framed prints", "custom frames", "canvas printing", "photo framing", "fine art prints", "premium frames", "Piks Media"],
  metadataBase: new URL('https://piksmedia.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Piks Media | Premium Handcrafted Frames & Fine Art Prints",
    description: "Transform your memories into museum-grade framed prints, custom photo canvases, and handcrafted frames.",
    url: "https://piksmedia.com",
    siteName: "Piks Media",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Piks Media Logo",
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Piks Media | Premium Handcrafted Frames & Fine Art Prints",
    description: "Transform your memories into museum-grade framed prints, custom photo canvases, and handcrafted frames.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' }
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden max-w-full`}
    >
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1c1c1c" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Piks Media",
              "url": "https://piksmedia.com",
              "logo": "https://piksmedia.com/logo.png",
              "description": "Premium handcrafted frames and custom museum-grade fine art prints.",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-9999999999",
                "contactType": "customer service"
              }
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden max-w-full relative">
        <main className="flex-1">{children}</main>
        <Footer />
        <AxiosSetup />
        <MascotWrapper />
        <Toaster position="bottom-right" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('ServiceWorker registration successful with scope: ', reg.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
