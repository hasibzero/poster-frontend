import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Political Poster Generator - বাংলাদেশীয় রাজনৈতিক পোস্টার জেনারেটর',
  description: 'Create professional political posters for victory day, condolence, campaign, and more occasions',
  keywords: ['political poster', 'Bangladesh', 'victory day', 'campaign poster', 'AI poster generator'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`${inter.variable} font-sans`}>
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}