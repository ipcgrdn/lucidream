import type { Metadata } from "next";
import { Bowlby_One_SC, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/Authcontext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BowlbyOneSC = Bowlby_One_SC({
  variable: "--font-bowlby-one-sc",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Lucidream",
  description: "Lucidream",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${BowlbyOneSC.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
