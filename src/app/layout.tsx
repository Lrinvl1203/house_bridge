import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google"; // Added Manrope
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Real Estate Bridge | Premium Wealth Management",
  description: "Real Estate Transfer Simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark"> {/* Force dark mode for now or allow class strategy */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} antialiased bg-background-dark text-white`}
      >
        {children}
      </body>
    </html>
  );
}
