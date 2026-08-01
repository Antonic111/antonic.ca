"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { FourthwallProduct } from "@/lib/fourthwall";

export default function FourthwallMerch({ settings = {} }: { settings?: any }) {
  const [data, setData] = useState<{
    enabled: boolean;
    storeUrl?: string;
    products?: FourthwallProduct[];
  } | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile(); // Check immediately on mount
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function fetchMerch() {
      try {
        const res = await fetch("/api/merch");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchMerch();
  }, []);

  if (loading) {
    return (
      <div className="w-full mx-auto py-12 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-zinc-600 mb-4" size={40} />
        <p className="text-zinc-500">Loading merch...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full mx-auto py-12 text-center">
        <ShoppingBag className="mx-auto text-zinc-600 mb-4" size={48} />
        <h3 className="text-xl font-medium text-white mb-2">Merch temporarily unavailable</h3>
        <p className="text-zinc-400">We're having trouble loading the latest products right now. Please check back later!</p>
      </div>
    );
  }

  if (!data.enabled) {
    return null; // Don't render anything if not enabled
  }

  const products = data.products || [];

  if (products.length === 0) {
    return (
      <div className="w-full mx-auto py-12 text-center">
        <ShoppingBag className="mx-auto text-zinc-600 mb-4" size={48} />
        <h3 className="text-xl font-medium text-white mb-2">New merch coming soon.</h3>
        <p className="text-zinc-400">Check back later for the latest drops!</p>
        
        {data.storeUrl && (
          <Link 
            href={data.storeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
          >
            Visit Store
          </Link>
        )}
      </div>
    );
  }

  const ITEMS_PER_PAGE = isMobile ? 1 : 3;
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  // Ensure current page is within valid range after resizing
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  
  const currentProducts = products.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE);

  const colClass = "grid-cols-1 sm:grid-cols-3";

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6 sm:gap-4">
        <div className="flex items-center gap-4 text-left">
          <img src="/fourthwall.svg" alt="Fourthwall" className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-full bg-[#0a0a0a] border-4 border-zinc-900/50" style={{ filter: settings.cardTextColor && settings.cardTextColor !== '#ffffff' ? 'brightness(0) saturate(100%)' : undefined }} />
          <div>
            <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-none" style={{ color: settings.cardTextColor || "#ffffff" }}>Official Merch</h2>
            <p className="mt-1.5 text-[15px] sm:text-[16px]" style={{ color: settings.cardTextColor ? `${settings.cardTextColor}B3` : "#a1a1aa" }}>Shop the latest Antonic merchandise.</p>
          </div>
        </div>
        
        {data.storeUrl && (
          <Link 
            href={data.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-all hover:scale-105 shrink-0"
          >
            View All Merch <ArrowRight size={16} />
          </Link>
        )}
      </div>

      <div key={safeCurrentPage} className={`grid gap-4 sm:gap-6 ${colClass} animate-fade-in-up`}>
        {currentProducts.map((product) => {
          const mainImage = product.images[0]?.url;
          return (
            <Link 
              key={product.id}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                fetch("/api/analytics/click", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ linkId: `merch-${product.id}`, destination: product.url })
                }).catch(console.error);
              }}
              className="group flex flex-col border border-zinc-800/80 rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white/20"
              style={{ backgroundColor: settings.cardBgColor || "rgba(24, 24, 27, 0.5)" }}
            >
              <div className="aspect-square bg-black/20 overflow-hidden relative border-b border-zinc-800/80 p-4">
                {mainImage ? (
                  <img 
                    src={mainImage} 
                    alt={product.name} 
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                    <ShoppingBag size={32} />
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1 items-center text-center">
                <h3 className="font-medium text-[16px] line-clamp-2 leading-snug mb-3 flex-1 transition-opacity group-hover:opacity-80" style={{ color: settings.cardTextColor || "#ffffff" }}>
                  {product.name}
                </h3>
                <div className="flex items-center justify-center mt-auto">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="font-bold text-[17px]" style={{ color: settings.cardTextColor || "#ffffff" }}>
                      {product.price.currency === "USD" ? "$" : product.price.currency}{product.price.value}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice.value !== product.price.value && (
                      <span className="text-[13px] line-through font-medium" style={{ color: settings.cardTextColor ? `${settings.cardTextColor}80` : "#71717a" }}>
                        ${product.compareAtPrice.value}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="p-2.5 rounded-full bg-zinc-900 border hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            style={{ 
              color: settings.cardTextColor || "#a1a1aa", 
              borderColor: settings.cardTextColor ? `${settings.cardTextColor}33` : "#27272a" 
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <span className="text-[15px] font-medium px-2" style={{ color: settings.cardTextColor ? `${settings.cardTextColor}b3` : "#a1a1aa" }}>
            Page {safeCurrentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            className="p-2.5 rounded-full bg-zinc-900 border hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            style={{ 
              color: settings.cardTextColor || "#a1a1aa", 
              borderColor: settings.cardTextColor ? `${settings.cardTextColor}33` : "#27272a" 
            }}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}

    </div>
  );
}
