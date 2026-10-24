import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./stage.css";
import "./editorial.css";
import "./apple.css";
import "./explore.css";
import "./travel.css";
import { TravelProvider } from "@/components/travel-assistant";
export const metadata: Metadata = {
  title: "Japan, Your Way — A trip that fits you",
  description:
    "Plan a Japan trip through a conversation around your interests, dates, food needs, pace and budget. Explore all Japan, your way.",
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
      <body>
        <TravelProvider>{children}</TravelProvider>
      </body>
    </html>
  );
}
