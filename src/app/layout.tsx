import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./stage.css";
import "./editorial.css";
import "./apple.css";
import "./explore.css";
export const metadata: Metadata = {
  title: "Japan, Your Way — A trip that fits you",
  description:
    "Plan a Japan trip around your dates, food needs, pace, and budget. Explore sample routes and see what needs checking.",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  colorScheme: "dark",
  themeColor: "#070a0c",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
