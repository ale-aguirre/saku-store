import type { Metadata } from "next";
import { Inter, Marcellus } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { ConsentBanner } from "@/components/consent-banner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const marcellus = Marcellus({
  variable: "--font-marcellus",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sakú Lencería",
  description: "Lencería íntima de calidad premium para la mujer moderna",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
        <MetaPixel />
      </head>
      <body
        className={`${inter.variable} ${marcellus.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
