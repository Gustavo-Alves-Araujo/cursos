import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { FirstLoginRedirect } from "@/components/FirstLoginRedirect";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plataforma de Cursos",
  description: "Frontend-only Next.js App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-black text-white antialiased`}
      >
        <AuthProvider>
          <FirstLoginRedirect />
          <div className="min-h-screen">
            {children}
          </div>
        </AuthProvider>
        <Script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js" />
      </body>
    </html>
  );
}
