import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Massy Motors Smart — Panel de Ventas IA",
  description: "Agente de ventas inteligente para Massy Motors Smart Cali",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${syne.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
