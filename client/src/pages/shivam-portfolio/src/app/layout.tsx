import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Clean, modern editorial font
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Shivam Sharma | Software Engineer & GenAI Builder',
  description:
    'B.Tech CS Student at Bennett University. Building hybrid RAG systems, local LLMs, and real-time collaborative web applications.',
  keywords: [
    'Shivam Sharma',
    'Full Stack Developer',
    'GenAI Engineer',
    'CliniQ-RAG',
    'Bennett University',
    'React',
    'FastAPI',
    'Next.js',
  ],
  authors: [{ name: 'Shivam Sharma', url: 'https://github.com/your-username' }],
  openGraph: {
    title: 'Shivam Sharma | Software Engineer & GenAI Builder',
    description:
      'Building hybrid RAG architectures, local LLMs, and real-time distributed web systems.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Shivam Sharma Portfolio',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#FAFAF9] text-[#1C1917] font-sans antialiased selection:bg-[#FDE68A] selection:text-[#92400E]">
        {/* Subtle top ambient glow for depth */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-amber-100/40 via-transparent to-transparent pointer-events-none -z-10" />

        {/* Global Sticky Minimalist Header */}
        <Navbar />

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
          {children}
        </main>

        {/* Global Warm Editorial Footer */}
        <Footer />
      </body>
    </html>
  );
}