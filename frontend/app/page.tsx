"use client";

import dynamic from "next/dynamic";

const Landing = dynamic(() => import("@/page-components/Landing"), { ssr: false });

export default function HomePage() {
  return <Landing />;
}
