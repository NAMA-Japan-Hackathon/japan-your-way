import type { Metadata } from "next";
import "./globals.css";
import "./stage.css";
import "./editorial.css";
export const metadata: Metadata = {
  title: "Japan, Your Way — A trip that fits you",
  description:
    "Plan a Japan trip around your dates, food needs, pace, and budget. Explore sample routes and see what needs checking.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
