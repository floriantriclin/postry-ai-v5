import type { Metadata } from "next";
import { Inter, Chivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const chivo = Chivo({
  subsets: ["latin"],
  variable: "--font-chivo",
  display: "swap",
  weight: ["800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Postry AI | Trouvez votre Voix",
  description: "Découvrez votre Archétype d'écriture LinkedIn en 2 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${chivo.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-white text-zinc-950 antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
