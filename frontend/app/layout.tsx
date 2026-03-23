import type { Metadata } from "next";
import "@/index.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "ET Edge",
  description: "Event-driven AI intelligence for Indian markets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
