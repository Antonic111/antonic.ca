"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

interface InteractiveButtonProps {
  content: any;
  style?: React.CSSProperties;
}

export function InteractiveButton({ content, style }: InteractiveButtonProps) {
  const [revealed, setRevealed] = useState(false);
  const isEmailReveal = content.buttonType === "email";

  if (isEmailReveal) {
    if (revealed) {
      return (
        <a 
          href={`mailto:${(content.email || "").trim()}`} 
          style={style} 
          className="inline-flex items-center justify-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition"
        >
          <Mail size={18} />
          {content.email || "No email set"}
        </a>
      );
    }
    return (
      <button 
        onClick={() => setRevealed(true)}
        style={style} 
        className="inline-flex items-center justify-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition cursor-pointer"
      >
        <Mail size={18} />
        {content.text || "Reveal Email"}
      </button>
    );
  }

  return (
    <Link 
      href={content.url || "#"} 
      target={content.target === "_blank" ? "_blank" : undefined} 
      style={style}
      className="inline-flex items-center justify-center bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition"
    >
      {content.text || "Button"}
    </Link>
  );
}
