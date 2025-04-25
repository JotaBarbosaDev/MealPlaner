import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";

// Fontes locais para melhor desempenho
const geistSans = localFont({
  src: [
    {
      path: "./fonts/GeistVF.woff",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: [
    {
      path: "./fonts/GeistMonoVF.woff",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "MealPlaner - Plano de Nutrição e Treino",
  description: "Aplicação para gerenciar dieta e treinos",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
