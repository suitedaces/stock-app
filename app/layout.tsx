import type { Metadata } from "next";
import "./globals.css";
import { Providers } from './providers';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: "Fintool - Track Your Stocks",
  description: "Track your favorite stocks and market indices in real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          <Navbar />
          <div className="pt-4">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
