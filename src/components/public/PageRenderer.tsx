import React from "react";
import Link from "next/link";
import { DraftSection, DraftBlock } from "../admin/BuilderProvider";
import { Mail, MapPin, Globe, ArrowRight, Video, Tv, Share2, Image as ImageIcon } from "lucide-react";
import { InteractiveButton } from "./InteractiveButton";
import { TrackedLink } from "./TrackedLink";
import FourthwallMerch from "./FourthwallMerch";
import { DiscordMemberCount } from "./DiscordMemberCount";

const getIcon = (name: string) => {
  const icons: Record<string, any> = { Mail, MapPin, Youtube: Video, Twitch: Tv, Facebook: Share2, Instagram: ImageIcon, Globe, ArrowRight };
  return icons[name] || Globe;
};

function BlockRenderer({ block, sectionSettings = {} }: { block: DraftBlock, sectionSettings?: any }) {
  if (!block.visible) return null;
  const content = (block.contentJson as any) || {};
  const style = (block.styleJson as any) || {};

  const baseStyle: React.CSSProperties = {
    paddingTop: style.paddingY ? `${style.paddingY}px` : (style.paddingTop ? `${style.paddingTop}px` : undefined),
    paddingBottom: style.paddingY ? `${style.paddingY}px` : (style.paddingBottom ? `${style.paddingBottom}px` : undefined),
    paddingLeft: style.paddingX ? `${style.paddingX}px` : undefined,
    paddingRight: style.paddingX ? `${style.paddingX}px` : undefined,
    marginTop: style.marginTop ? `${style.marginTop}px` : undefined,
    marginBottom: style.marginBottom ? `${style.marginBottom}px` : undefined,
    textAlign: style.textAlign || undefined,
    color: style.color || undefined,
    backgroundColor: style.backgroundColor || undefined,
    borderWidth: style.borderWidth !== undefined ? `${style.borderWidth}px` : undefined,
    borderColor: style.borderColor || undefined,
    borderStyle: style.borderWidth !== undefined ? "solid" : undefined,
    borderRadius: style.borderRadius ? (typeof style.borderRadius === "number" || !isNaN(Number(style.borderRadius)) ? `${style.borderRadius}px` : style.borderRadius) : undefined,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style.fontWeight || undefined,
    width: style.width ? (typeof style.width === "number" || !isNaN(Number(style.width)) ? `${style.width}px` : style.width) : undefined,
    height: style.height ? (typeof style.height === "number" || !isNaN(Number(style.height)) ? `${style.height}px` : style.height) : undefined,
    objectPosition: style.objectPosition || undefined,
  };

  switch (block.type) {
    case "TEXT":
      return <p style={baseStyle} className="whitespace-pre-wrap leading-relaxed">{content.text}</p>;
    case "HEADING": {
      const Tag = `h${content.level || 2}` as any;
      return <Tag style={baseStyle} className="tracking-tight">{content.text}</Tag>;
    }
    case "IMAGE": {
      const hasCrop = (style.cropTop || style.cropBottom || style.cropLeft || style.cropRight);
      const hasBlur = (style.edgeBlurTop || style.edgeBlurBottom || style.edgeBlurLeft || style.edgeBlurRight);
      
      let maskImage = undefined;
      let maskComposite = undefined;
      if (hasBlur) {
        maskImage = `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) ${style.edgeBlurTop || 0}%, rgba(0,0,0,1) ${100 - (style.edgeBlurBottom || 0)}%, rgba(0,0,0,0) 100%), linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) ${style.edgeBlurLeft || 0}%, rgba(0,0,0,1) ${100 - (style.edgeBlurRight || 0)}%, rgba(0,0,0,0) 100%)`;
        maskComposite = 'intersect';
      }

      const imageStyle: any = {
        ...baseStyle,
        WebkitMaskImage: maskImage,
        WebkitMaskComposite: hasBlur ? 'source-in' : undefined,
        maskImage: maskImage,
        maskComposite: maskComposite,
        width: style.backgroundOverlap ? (style.backgroundContain ? undefined : "100%") : baseStyle.width,
        height: style.backgroundOverlap ? (style.backgroundContain ? undefined : "100%") : baseStyle.height,
        objectFit: style.backgroundContain ? "contain" : "cover",
      };
      
      const fitClass = style.backgroundContain ? "object-contain" : "object-cover";
      const cropClass = hasCrop ? `img-crop-${block.id}` : "";
      const imgContent = (
        <>
          {hasCrop && (
            <style dangerouslySetInnerHTML={{ __html: `
              .${cropClass} {
                object-view-box: inset(${style.cropTop || 0}% ${style.cropRight || 0}% ${style.cropBottom || 0}% ${style.cropLeft || 0}%);
              }
            ` }} />
          )}
          <img src={content.url} alt={content.altText || ""} style={imageStyle} className={`max-w-full ${style.backgroundContain ? "max-h-full object-contain" : "object-cover"} ${cropClass} ${style.backgroundOverlap && !style.backgroundContain ? "w-full h-full" : ""}`} />
        </>
      );
      if (content.linkUrl) {
        return (
          <TrackedLink blockId={block.id || ""} href={content.linkUrl} target={content.target === "_blank" ? "_blank" : undefined} className="block transition-transform hover:scale-105 duration-300">
            {imgContent}
          </TrackedLink>
        );
      }
      return imgContent;
    }
    case "LOCATION":
      return (
        <div style={baseStyle} className="flex items-center justify-center gap-2 text-zinc-400 text-sm w-full">
          <MapPin size={(style as any)?.fontSize || 18} />
          <span className="font-medium">{content.text || "Location"}</span>
        </div>
      );
    case "BUTTON":
      return <InteractiveButton content={content} style={baseStyle} />;
    case "SOCIAL_LINK": {
      const IconComp = getIcon(content.icon || "Globe");
      return (
        <TrackedLink blockId={block.id || ""} href={content.url || "#"} target="_blank" className="p-3 rounded-full hover:opacity-80 transition inline-flex items-center justify-center overflow-hidden shadow-md" style={{ backgroundColor: (style as any)?.backgroundColor || "#27272a", color: (style as any)?.color || undefined }}>
          {content.iconUrl ? (
            <img src={content.iconUrl} alt="Social Icon" className="w-5 h-5 object-contain" />
          ) : (
            {React.createElement(IconComp, { size: 20 } as any)}
          )}
        </TrackedLink>
      );
    }
    case "LINK_CARD": {
      let discordInviteCode = null;
      if (content.url && (content.url.includes("discord.gg/") || content.url.includes("discord.com/invite/"))) {
        const match = content.url.match(/(?:discord\.gg\/|discord\.com\/invite\/)([a-zA-Z0-9-]+)/);
        if (match) {
          discordInviteCode = match[1];
        }
      }

      return (
        <TrackedLink blockId={block.id || ""} href={content.url || "#"} target={content.target === "_blank" ? "_blank" : undefined} className="block group w-full h-full">
          <div style={baseStyle} className={`h-full ${content.iconUrl ? 'min-h-[60px]' : ''} relative bg-zinc-900 rounded-xl py-3 shadow-md hover:shadow-xl transition-all hover:bg-zinc-800/80 flex items-center justify-between ${content.iconUrl ? 'pr-4 pl-3 sm:pl-0' : 'px-4'}`}>
            <div className={`flex items-center gap-3 ${content.iconUrl ? '' : 'w-full'}`}>
              {content.iconUrl && (
                <div 
                  className="relative shrink-0 ml-0 sm:-ml-5 transition-transform duration-300 group-hover:-translate-y-1"
                  style={{
                    width: style.iconSize ? `${style.iconSize}px` : "40px",
                    height: style.iconSize ? `${style.iconSize}px` : "40px",
                  }}
                >
                  {(style as any)?.imagePulse && (
                    <div 
                      className="absolute inset-0 animate-pulse-tight"
                      style={{ 
                        backgroundColor: (style as any)?.pulseColor || "#3b82f6",
                        borderRadius: style.iconRadius !== undefined ? `${style.iconRadius}px` : "6px",
                        pointerEvents: "none"
                      }} 
                    />
                  )}
                  <img 
                    src={content.iconUrl} 
                    alt={content.text || ""} 
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: style.iconRadius !== undefined ? `${style.iconRadius}px` : "6px",
                    }}
                    className="object-cover relative z-10 shadow-md" 
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{content.text}</h3>
                {content.subtitle && <p className="text-zinc-400 text-sm mt-1">{content.subtitle}</p>}
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0 transition-transform duration-300 group-hover:-translate-y-1">
              {discordInviteCode && (
                <DiscordMemberCount 
                  inviteCode={discordInviteCode} 
                  size={sectionSettings.discordBadgeSize}
                  color={sectionSettings.discordBadgeColor}
                  bgColor={sectionSettings.discordBadgeBgColor}
                />
              )}
              <div className="text-zinc-500 group-hover:text-white transition-colors duration-300 shrink-0">
                <ArrowRight 
                  size={sectionSettings.arrowSize || 20} 
                  strokeWidth={sectionSettings.arrowThickness || 2} 
                />
              </div>
            </div>
          </div>
        </TrackedLink>
      );
    }
    case "DIVIDER":
      return <hr style={{ ...baseStyle, border: "none", backgroundColor: style.color || "#3f3f46", height: "1px" }} className="w-full" />;
    case "SPACER":
      return <div style={{ height: `${style.paddingTop || 32}px` }} />;
    default:
      return <div className="p-4 border border-dashed border-red-500 text-red-500">Unknown block: {block.type}</div>;
  }
}

export function SectionRenderer({ section, pageSettings = {}, previewDevice }: { section: DraftSection, pageSettings?: any, previewDevice?: "mobile" | "desktop" }) {
  if (!section.visible) return null;
  const settings = (section.settingsJson as any) || {};

  const sectionStyle: React.CSSProperties = {
    marginTop: settings.marginTop ? `${settings.marginTop}px` : undefined,
    marginBottom: settings.marginBottom ? `${settings.marginBottom}px` : undefined,
  };

  const innerStyle: React.CSSProperties = {
    backgroundColor: settings.backgroundColor || undefined,
    borderRadius: settings.borderRadius ? (typeof settings.borderRadius === "number" || !isNaN(Number(settings.borderRadius)) ? `${settings.borderRadius}px` : settings.borderRadius) : undefined,
    maxWidth: settings.fullWidth ? "100%" : `${pageSettings.globalMaxWidth || 800}px`,
  };

  const paddingStyle: React.CSSProperties = {
    paddingTop: settings.paddingTop ? `${settings.paddingTop}px` : undefined,
    paddingBottom: settings.paddingBottom ? `${settings.paddingBottom}px` : undefined,
    paddingLeft: settings.paddingLeft ? `${settings.paddingLeft}px` : undefined,
    paddingRight: settings.paddingRight ? `${settings.paddingRight}px` : undefined,
  };

  const contentClass = "w-full mx-auto";
  const cols = settings.columns || 1;
  const gridColsMap: Record<number, string> = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" };
  let gridClass = cols > 1 ? `grid grid-cols-1 ${gridColsMap[cols] || "md:grid-cols-2"} gap-y-4 gap-x-12 w-full` : "flex flex-col gap-4 w-full";

  if (previewDevice === "mobile" && cols > 1) {
    gridClass = "grid grid-cols-1 gap-y-4 gap-x-12 w-full";
  } else if (previewDevice === "desktop" && cols > 1) {
    const desktopColsMap: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };
    gridClass = `grid ${desktopColsMap[cols] || "grid-cols-2"} gap-y-4 gap-x-12 w-full`;
  }

  const getColSpanClass = (fullWidth: boolean) => {
    if (!fullWidth) return "";
    if (previewDevice === "mobile") return "col-span-1";
    if (previewDevice === "desktop") return "col-span-full";
    return "md:col-span-full";
  };

  return (
    <section style={sectionStyle} className={`relative w-full ${settings.fullWidth ? "" : "px-4 sm:px-6 md:px-8"}`}>
      <div className={`${contentClass} relative fade-in-up`} style={innerStyle}>
        {section.type === "FOURTHWALL_MERCH" ? (
          <div className="relative z-10 w-full h-full flex flex-col justify-center fade-in-up" style={{ ...paddingStyle, animationDelay: '0.1s' }}>
            {/* Server components injected dynamically */}
            <React.Suspense fallback={<div className="h-48 flex items-center justify-center">Loading merch...</div>}>
              {/* @ts-ignore */}
              <FourthwallMerch settings={settings} />
            </React.Suspense>
          </div>
        ) : (
          <div className="grid w-full" style={{ gridTemplateAreas: "'overlap'" }}>
          
          {/* Render Background Blocks First */}
          {section.blocks.filter(b => (b.styleJson as any)?.backgroundOverlap).map((b, index) => (
            <div key={b.id} className="w-full h-full z-0 pointer-events-none flex fade-in-up" style={{ 
              animationDelay: `${index * 0.1}s`,
              gridArea: 'overlap', 
              borderRadius: innerStyle.borderRadius, 
              overflow: 'hidden',
              alignItems: (b.styleJson as any)?.objectPosition === 'top' ? 'flex-start' : (b.styleJson as any)?.objectPosition === 'bottom' ? 'flex-end' : 'center',
              justifyContent: (b.styleJson as any)?.objectPosition === 'left' ? 'flex-start' : (b.styleJson as any)?.objectPosition === 'right' ? 'flex-end' : 'center',
            }}>
              <BlockRenderer block={b} sectionSettings={settings} />
            </div>
          ))}
          
          {/* Render Regular Blocks */}
          <div className="relative z-10 w-full h-full flex flex-col justify-center" style={{ gridArea: 'overlap', ...paddingStyle }}>
            {section.type === "SOCIAL_ICON_ROW" ? (
              <div className="flex flex-wrap items-center justify-center gap-4">
                 {section.blocks.filter(b => !(b.styleJson as any)?.backgroundOverlap).map((b, index) => (
                   <div key={b.id} className="fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                     <BlockRenderer block={b} sectionSettings={settings} />
                   </div>
                 ))}
              </div>
            ) : (
              <div className={`${gridClass}`} style={{ alignItems: settings.alignItems || "center" }}>
                {(() => {
                  const regularBlocks = section.blocks.filter(b => !(b.styleJson as any)?.backgroundOverlap);
                  const groupedBlocks: any[] = [];
                  let currentGroup: any[] = [];
                  
                  regularBlocks.forEach(b => {
                    if (b.type === "SOCIAL_LINK") {
                      currentGroup.push(b);
                    } else {
                      if (currentGroup.length > 0) {
                        groupedBlocks.push({ isGroup: true, type: 'SOCIAL_GROUP', blocks: currentGroup, id: `group-${currentGroup[0].id}` });
                        currentGroup = [];
                      }
                      groupedBlocks.push(b);
                    }
                  });
                  if (currentGroup.length > 0) {
                    groupedBlocks.push({ isGroup: true, type: 'SOCIAL_GROUP', blocks: currentGroup, id: `group-${currentGroup[0].id}` });
                  }
                  
                  return groupedBlocks.map((item, index) => {
                    const delay = `${index * 0.1}s`;
                    if (item.isGroup) {
                      return (
                        <div key={item.id} className={`${getColSpanClass(false)} w-full flex flex-wrap justify-center gap-4 fade-in-up`} style={{ animationDelay: delay }}>
                          {item.blocks.map((b: any) => <BlockRenderer key={b.id} block={b} sectionSettings={settings} />)}
                        </div>
                      );
                    }
                    return (
                      <div key={item.id} className={`${getColSpanClass((item.styleJson as any)?.fullWidth)} w-full flex justify-center fade-in-up`} style={{ animationDelay: delay }}>
                        <BlockRenderer block={item} sectionSettings={settings} />
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}

export function PageRenderer({ sections, pageSettings = {} }: { sections: DraftSection[], pageSettings?: any }) {
  if (!sections || sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <h1 className="text-2xl font-medium tracking-tight">Site coming soon.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans w-full overflow-x-clip transition-colors" style={{ backgroundColor: pageSettings.globalBackgroundColor || "#09090b" }}>
      {sections.map(section => (
        <SectionRenderer key={section.id} section={section} pageSettings={pageSettings} />
      ))}
    </div>
  );
}
