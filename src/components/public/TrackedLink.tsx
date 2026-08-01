"use client";

import React, { ReactNode } from "react";
import Link from "next/link";

interface TrackedLinkProps {
  href: string;
  target?: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
  blockId: string;
}

export function TrackedLink({ href, target, className, style, children, blockId }: TrackedLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Only track actual links, ignore empty or hash links
    if (href && href !== "#") {
      fetch("/api/analytics/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: blockId, destination: href })
      }).catch(console.error); // Silently catch errors so it doesn't interrupt user flow
    }
  };

  return (
    <Link href={href || "#"} target={target} className={className} style={style} onClick={handleClick}>
      {children}
    </Link>
  );
}
