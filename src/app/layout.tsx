import type { Metadata } from "next";
import { Poppins, Space_Grotesk } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins'
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk'
});

export const metadata: Metadata = {
  title: 'Plattform - Academia Digital Premium',
  description: 'Plataforma SaaS para crear y vender cursos online con IA. Crea, vende y gestiona tus cursos con herramientas profesionales.',
  
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  keywords: ["IA para educación", "Cursos de élite", "Educación profesional", "Plattform", "LMS SaaS", "Aprendizaje acelerado"],

  // Geo targeting
  alternates: {
    canonical: 'https://plattform.mx',
    languages: {
      'es-MX': 'https://plattform.mx',
      'es': 'https://plattform.mx',
      'en': 'https://plattform.mx/en'
    }
  },
  
  // Indicar país/región
  other: {
    'geo.position': '19.4326;-99.1332',
    'ICBM': '19.4326, -99.1332',
    'geo.region': 'MX',
    'geo.placename': 'Mexico City'
  },

  openGraph: {
    title: 'Plattform - Academia Digital Premium',
    description: 'Plataforma SaaS para crear y vender cursos online con IA',
    url: 'https://plattform.mx',
    siteName: 'Plattform',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: 'https://plattform.mx/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Plattform - Academia Digital'
      }
    ]
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Plattform - Academia Digital Premium',
    description: 'Crea y vende cursos online con IA',
    images: ['https://plattform.mx/og-image.png']
  },
  
  verification: {
    google: 'zVRsIT8ttMkk844V1M6ObfXc7PLJd-tPTvVlZj'
  }
};

import StructuredData from "@/components/StructuredData";
import SessionManager from "@/components/auth/SessionManager";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${poppins.variable} ${spaceGrotesk.variable} scroll-smooth`}>
      <body className="font-poppins bg-[#070d1a] text-white antialiased min-h-screen">
        <StructuredData />
        <SessionManager />
        {children}
      </body>
    </html>
  );
}

