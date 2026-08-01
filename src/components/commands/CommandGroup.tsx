"use client";

import { useState } from 'react';

// Helper function to render text with links and search highlighting
function renderDescription(text: string, searchQuery: string) {
  if (typeof text !== 'string') {
    return text;
  }

  // First, parse markdown-style links [text](url)
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: { type: string, content?: string, text?: string, url?: string, index: number }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index);
      parts.push({ type: 'text', content: textBefore, index: lastIndex });
    }
    // Add the link
    parts.push({ 
      type: 'link', 
      text: match[1], 
      url: match[2],
      index: match.index 
    });
    lastIndex = match.index + match[0].length;
  }
  // Add remaining text after last link
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex), index: lastIndex });
  }

  // If no links found, treat entire text as text
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text, index: 0 });
  }

  // Now process each part with search highlighting
  return parts.map((part, index) => {
    if (part.type === 'link') {
      return (
        <a
          key={index}
          href={part.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#888888] hover:text-[#E0E0E0] underline transition-colors"
        >
          {highlightText(part.text!, searchQuery)}
        </a>
      );
    } else {
      return <span key={index}>{highlightText(part.content!, searchQuery)}</span>;
    }
  });
}

// Helper function to highlight search matches
function highlightText(text: string, searchQuery: string) {
  if (!searchQuery || searchQuery.trim() === '' || typeof text !== 'string') {
    return text;
  }

  const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return parts.map((part, partIndex) => {
    if (part.toLowerCase() === searchQuery.toLowerCase()) {
      return (
        <mark
          key={partIndex}
          style={{
            backgroundColor: '#888888',
            color: '#E0E0E0',
            padding: '0 2px',
            borderRadius: '2px',
          }}
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function CommandGroup({ command, categoryColor, searchQuery = '' }: {
  command: any;
  categoryColor: string;
  searchQuery?: string;
}) {
  const [copiedAlias, setCopiedAlias] = useState<string | null>(null);

  const handleCopy = async (alias: string) => {
    try {
      await navigator.clipboard.writeText(alias);
      setCopiedAlias(alias);
      setTimeout(() => {
        setCopiedAlias(null);
      }, 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Platform brand colors
  const platformColors = {
    discord: '#5865F2',      // Discord Blurple
    twitch: '#9146FF',       // Twitch Purple
    youtube: '#FF0000',      // YouTube Red
    kick: '#53FC18',         // Kick Green
    tiktok: 'linear-gradient(45deg, #ff0050 0%, #2a2a2a 50%, #00f2ea 100%)', // TikTok gradient (Pink to Dark Grey to Aqua)
    instagram: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', // Instagram gradient
    facebook: '#1877F2',     // Facebook Blue
    linktree: '#2EBA4A',     // Darker Linktree Green for better contrast
    googlesheets: '#0F9D58', // Google Sheets Green
    soloto: '#3673FC',       // solo.to Blue
    streamelements: '#0000EE', // StreamElements Blue
  };

  // Function to get brand color/background for a specific command alias
  const getBrandStyle = (alias: string) => {
    const lowerAlias = alias.toLowerCase();
    
    if (lowerAlias.includes('discord') || lowerAlias.includes('disc') || lowerAlias === '!dc') {
      return { backgroundColor: platformColors.discord };
    }
    if (lowerAlias.includes('twitch')) {
      return { backgroundColor: platformColors.twitch };
    }
    if (lowerAlias.includes('youtube') || lowerAlias === '!yt') {
      return { backgroundColor: platformColors.youtube };
    }
    if (lowerAlias.includes('kick')) {
      return { backgroundColor: platformColors.kick, color: '#0a0a0a' }; // Dark text on bright green
    }
    if (lowerAlias.includes('tiktok') || lowerAlias === '!tt') {
      return { 
        background: platformColors.tiktok,
        color: '#FFFFFF' // White text on gradient background
      };
    }
    if (lowerAlias.includes('facebook') || lowerAlias === '!fb') {
      return { backgroundColor: platformColors.facebook };
    }
    if (lowerAlias.includes('instagram') || lowerAlias.includes('insta') || lowerAlias === '!ig') {
      return { background: platformColors.instagram };
    }
    if (lowerAlias.includes('linktree') || lowerAlias.includes('linktr') || lowerAlias === '!lt') {
      return { backgroundColor: platformColors.linktree };
    }
    if (lowerAlias.includes('social') || lowerAlias.includes('socials') || lowerAlias.includes('solo')) {
      return { backgroundColor: platformColors.soloto };
    }
    if (lowerAlias.includes('donation') || lowerAlias.includes('donate')) {
      return { backgroundColor: platformColors.streamelements };
    }
    if (lowerAlias.includes('livingdex') || lowerAlias.includes('shinydex') || lowerAlias === '!ld' || lowerAlias === '!sd' || lowerAlias.includes('collection')) {
      return { backgroundColor: platformColors.googlesheets };
    }
    
    return null; // No brand color found, use category color
  };

  // Map platform key -> PNG path from /public
  const platformIcons: Record<string, string> = {
    kick: '/Kick.png',
    twitch: '/Twitch.png',
    youtube: '/YouTube.png',
  };

  const platformIsArray = Array.isArray(command.platform);
  const platformIconPadding = platformIsArray
    ? command.platform.length * 32 + 60  // icons + gap + "Only" text + container padding
    : command.platform
    ? 80
    : 0;

  return (
    <div 
      className="bg-[#141414] rounded-lg border-l-4 flex flex-col h-full relative" 
      style={{ 
        borderLeftColor: categoryColor || '#888888',
        boxShadow: '0 4px 6px -2px rgba(0, 0, 0, 0.8), 0 2px 4px -1px rgba(0, 0, 0, 0.6)',
        padding: command.platform ? '2.25rem 1.5rem 1.75rem 1.5rem' : '1.75rem 1.5rem'
      }}
    >
      {platformIsArray ? (
        <div
          className="absolute top-3 right-3 flex items-center z-10"
          style={{
            gap: 6,
            backgroundColor: '#1e1e1e',
            border: '2px solid #444444',
            borderRadius: 8,
            padding: '4px 8px',
          }}
        >
          {command.platform.map((p: string) =>
            platformIcons[p] ? (
              <img
                key={p}
                src={platformIcons[p]}
                alt={p}
                title={p.charAt(0).toUpperCase() + p.slice(1)}
                style={{
                  width: 18,
                  height: 18,
                  objectFit: 'contain',
                  borderRadius: 3,
                }}
              />
            ) : null
          )}
          <span style={{ color: '#B0B0B0', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', marginLeft: 2 }}>
            Only
          </span>
        </div>
      ) : command.platform ? (
        <span 
          className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold border-2 z-10"
          style={{
            borderColor: '#888888',
            color: '#E0E0E0',
            backgroundColor: '#141414',
          }}
        >
          {command.platform}
        </span>
      ) : null}
      <div className="flex flex-wrap gap-2 mb-4" style={{ paddingRight: platformIconPadding > 0 ? `${platformIconPadding}px` : '0' }}>
        {command.aliases.map((alias: string, index: number) => {
          const brandStyle = getBrandStyle(alias);
          return (
            <span
              key={index}
              onClick={() => handleCopy(alias)}
              className={`command-button px-3 py-2 rounded-lg font-bold text-sm md:text-base cursor-pointer ${copiedAlias === alias ? 'copied' : ''}`}
              style={{ 
                ...(brandStyle || { backgroundColor: categoryColor || '#888888', color: '#E0E0E0' }),
                fontFamily: "'Courier New', 'Roboto Mono', 'Fira Code', monospace",
                color: (brandStyle as any)?.color || '#E0E0E0',
              }}
            >
              <span className="transition-all duration-200" style={{ display: 'inline-block' }}>
                {copiedAlias === alias ? 'Copied!' : highlightText(alias, searchQuery)}
              </span>
            </span>
          );
        })}
      </div>
      <p className="text-[#B0B0B0] leading-relaxed text-sm md:text-base mt-auto">
        {renderDescription(command.description, searchQuery)}
      </p>
    </div>
  );
}
