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
  title: "Plattform | The Elite Learning Experience",
  description: "La infraestructura definitiva para el aprendizaje de alto rendimiento. Cursos de élite creados por expertos para profesionales del futuro.",
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
  openGraph: {
    title: "Plattform | Tu próximo nivel profesional comienza aquí",
    description: "Explora cursos de alta gama y adquiere habilidades de élite con expertos reales.",
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Plattform | Elite SaaS",
    description: "Transformación profesional impulsada por IA y expertos de clase mundial.",
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

