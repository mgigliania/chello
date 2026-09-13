import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pancho — learn a language by talking",
  description:
    "A calm voice tutor for Spanish, Portuguese, Italian and French. Speak, get gentle corrections, and practise the words you actually used.",
  applicationName: "Pancho",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Pancho", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
  width: "device-width",
  initialScale: 1,
  // The orb sits close to the edges; let the page paint under the notch.
  viewportFit: "cover",
  // Pinch-zoom stays available; only the double-tap jump is suppressed by
  // the layout itself, never by disabling user scaling.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
