"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

export function DiscordMemberCount({ 
  inviteCode, 
  size = 12,
  color = "#d4d4d8", // zinc-300
  bgColor = "rgba(0, 0, 0, 0.4)" // black/40
}: { 
  inviteCode: string;
  size?: number;
  color?: string;
  bgColor?: string;
}) {
  const [memberCount, setMemberCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchDiscordData() {
      try {
        const res = await fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.approximate_member_count !== undefined) {
          setMemberCount(data.approximate_member_count);
        }
      } catch (err) {
        console.error("Failed to fetch Discord member count", err);
      }
    }
    fetchDiscordData();
  }, [inviteCode]);

  if (memberCount === null) return null;

  return (
    <div 
      className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium"
      style={{ backgroundColor: bgColor, color: color, fontSize: `${size}px` }}
    >
      <div className="flex items-center justify-center shrink-0">
        <Users className="w-[1.15em] h-[1.15em] sm:w-[1.25em] sm:h-[1.25em]" />
      </div>
      <span className="text-[0.85em] sm:text-[1em] whitespace-nowrap">
        {memberCount.toLocaleString()} <span className="hidden min-[400px]:inline">Members</span>
      </span>
    </div>
  );
}
