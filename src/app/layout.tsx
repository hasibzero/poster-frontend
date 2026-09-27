import type { Metadata } from 'next';
import { Inter, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-bangla',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'পোস্টার জেনারেটর — AI রাজনৈতিক পোস্টার তৈরি',
  description: 'বাংলাদেশের জন্য AI-ভিত্তিক রাজনৈতিক পোস্টার জেনারেটর',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`${inter.variable} ${notoBengali.variable}`}>
      <body className="min-h-screen bg-[#FAFAF8] font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-center" 
            toastOptions={{ 
              duration: 4000, 
              style: { 
                background: '#fff', 
                color: '#1f2937', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
                border: '1px solid rgba(229, 231, 235, 0.6)',
                borderRadius: '16px', 
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                padding: '12px 24px',
              } 
            }} 
          />
        </AuthProvider>
      </body>
    </html>
  );
}