import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { isClerkConfigured } from "@/lib/auth/clerk-config";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Fábrica de Contenido",
  description:
    "Plataforma SaaS para generación y publicación autónoma de contenido social con IA.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f2" },
    { media: "(prefers-color-scheme: dark)", color: "#08060e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Only mount Clerk when configured so the public marketing page renders even
  // without auth credentials. Protected routes are still gated by the proxy.
  const clerkEnabled = isClerkConfigured();

  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} h-full bg-background antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {clerkEnabled ? (
          <ClerkProvider
            localization={esES}
            appearance={{
              cssLayerName: "clerk",
            }}
          >
            {children}
          </ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
