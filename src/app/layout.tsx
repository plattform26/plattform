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
  title: "Plattform | Crea. Vende. Escala.",
  description: "Infraestructura SaaS para que profesores expertos creen, vendan y escalen su conocimiento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${poppins.variable} ${spaceGrotesk.variable}`}>
      <body className="font-poppins bg-[#070d1a] text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
