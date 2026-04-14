import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppQueryProvider } from "@/components/providers/query-provider";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carfinder Catalog",
  description: "JWT-protected car catalog powered by CarSensor data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-text-primary">
        <AppQueryProvider>
          <div className="flex min-h-full flex-col">
            <SiteHeader />
            <main className="min-w-0 flex-1 px-4 py-6 md:px-6">{children}</main>
          </div>
        </AppQueryProvider>
      </body>
    </html>
  );
}
