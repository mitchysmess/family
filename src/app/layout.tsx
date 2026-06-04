import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://family-hoekstra.vercel.app"),
  title: {
    default: "Familie Hoekstra",
    template: "%s | Familie Hoekstra",
  },
  description: "Gezinstaken, afspraken en voortgang op een rustige plek.",
  applicationName: "Familie Hoekstra",
  icons: {
    icon: [
      { url: "/favicon.ico?v=familie", sizes: "any" },
    ],
    shortcut: "/favicon.ico?v=familie",
    apple: "/apple-icon?v=familie",
  },
  openGraph: {
    title: "Familie Hoekstra",
    description: "Gezinstaken, afspraken en voortgang op een rustige plek.",
    url: "https://family-hoekstra.vercel.app",
    siteName: "Familie Hoekstra",
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Familie Hoekstra",
    description: "Gezinstaken, afspraken en voortgang op een rustige plek.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <link rel="icon" href="/favicon.ico?v=familie" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico?v=familie" />
        <link rel="apple-touch-icon" href="/apple-icon?v=familie" />
      </head>
      <body className="min-h-screen bg-stone-50 text-neutral-950 antialiased">
        {children}
      </body>
    </html>
  );
}
