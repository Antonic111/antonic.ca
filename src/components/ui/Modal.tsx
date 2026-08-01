import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white tracking-wide">{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 text-zinc-300 text-sm">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
