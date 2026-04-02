import type { Metadata } from "next";
import "./globals.css";
import ThemeWrapper from "./ThemeWrapper";

export const metadata: Metadata = { title: "Ocean Rescue Quest" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><ThemeWrapper>{children}</ThemeWrapper></body></html>;
}
