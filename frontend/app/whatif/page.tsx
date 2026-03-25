"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";

const WhatIfPage = dynamic(() => import("@/page-components/WhatIfPage"), { ssr: false });

export default function WhatIfRoutePage() {
  return (
    <DashboardLayout>
      <WhatIfPage />
    </DashboardLayout>
  );
}
