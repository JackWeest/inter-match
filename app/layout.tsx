import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Match Med 🏥",
  description: "Triagem da Festa - UFC Sobral",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-screen bg-orange-50 antialiased flex flex-col relative">
        
        {/* O conteúdo principal do app */}
        <main className="flex-1 pb-32"> 
          {children}
        </main>
        
        {/* A barra fixa que vai ficar sempre no "chão" do celular */}
        <Navbar />
        
      </body>
    </html>
  );
}