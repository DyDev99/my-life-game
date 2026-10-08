import type { Metadata, Viewport } from "next";
import { Kantumruy_Pro, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const kantumruy = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ជីវិតខ្ញុំ (My Life) — Modern Cambodian Life Simulator",
  description:
    "A cozy modern Cambodian life simulation game where you live, work, and build relationships in Kampong Cham, Cambodia.",
  keywords: ["Cambodia", "Life Simulation", "Khmer Game", "ជីវិតខ្ញុំ", "My Life", "Kampong Cham"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="km"
      className={`${kantumruy.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden bg-slate-950 font-sans text-slate-100 touch-none">
        {children}
      </body>
    </html>
  );
}
