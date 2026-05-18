import type { Metadata } from "next";
import { Geist, Geist_Mono, Permanent_Marker, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/appComponents/ThemeProvider";

const spaceGroteskHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Marker-style face used for handwritten date/time stamps on prints.
const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marker",
});

export const metadata: Metadata = {
  title: "PhotoBooth",
  description: "A place where you can make memories",
  keywords: ["photobooth", "memories", "photos", "pictures", "frames"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        spaceGroteskHeading.variable,
        permanentMarker.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          enableColorScheme={false}
          disableTransitionOnChange
        >
          <ClerkProvider>{children}</ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
