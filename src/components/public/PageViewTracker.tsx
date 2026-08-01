"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageViewTracker() {
  const pathname = usePathname();
  const trackedRef = useRef(false);

  useEffect(() => {
    // Only track once per mount to avoid strict-mode double firing
    if (!trackedRef.current) {
      trackedRef.current = true;
      fetch("/api/analytics/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname || "/" }),
      }).catch(console.error);
    }
  }, [pathname]);

  return null;
}
