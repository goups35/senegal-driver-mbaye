import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TripProvider } from "@/context/trip-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Transport Sénégal - Mbaye votre chauffeur',
    default: 'Transport Sénégal - Mbaye votre chauffeur privé au Sénégal',
  },
  description: 'Découvrez le Sénégal avec Mbaye, votre chauffeur privé expérimenté. Transport sécurisé, itinéraires personnalisés, conseils locaux authentiques. Réservez votre voyage sur mesure.',
  keywords: [
    'transport Sénégal',
    'chauffeur privé Sénégal',
    'voyage Sénégal',
    'Dakar transport',
    'Saint-Louis Sénégal',
    'Saly transport',
    'Cap Skirring',
    'tourisme Sénégal',
    'guide local Sénégal',
    'Mbaye chauffeur'
  ],
  authors: [{ name: 'Mbaye', url: 'https://transport-senegal.com' }],
  creator: 'Mbaye - Chauffeur privé Sénégal',
  publisher: 'Transport Sénégal',
  metadataBase: new URL('https://transport-senegal.com'),
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': '/fr',
      'fr-SN': '/fr-sn',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://transport-senegal.com',
    siteName: 'Transport Sénégal - Mbaye',
    title: 'Transport Sénégal - Mbaye votre chauffeur privé',
    description: 'Découvrez le Sénégal avec Mbaye, votre chauffeur privé expérimenté. Transport sécurisé, itinéraires personnalisés, conseils locaux authentiques.',
    images: [
      {
        url: '/images/senegal-transport-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Transport Sénégal - Mbaye chauffeur privé',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transport Sénégal - Mbaye votre chauffeur privé',
    description: 'Découvrez le Sénégal avec Mbaye, votre chauffeur privé expérimenté.',
    images: ['/images/senegal-transport-og.jpg'],
    creator: '@TransportSenegal',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
    // yandex: 'your-yandex-verification',
    // yahoo: 'your-yahoo-verification',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TripProvider>
          {children}
        </TripProvider>
      </body>
    </html>
  );
}
