"use client";

import React, { useState } from "react";
import { BuilderProvider, useBuilder, DraftSection } from "./BuilderProvider";
import { SectionRenderer } from "../public/PageRenderer";
import { blockTypes } from "@/lib/zod";
import { Modal } from "../ui/Modal";
import { Save, Globe, Smartphone, Monitor, ChevronUp, ChevronDown, Trash2, Plus, GripVertical, UserCircle, Link as LinkIcon, AlignLeft, Settings, LayoutTemplate, Minus, Image as ImageIcon } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TEMPLATES = [
  {
    name: "Hero Profile",
    icon: <UserCircle size={16} />,
    section: {
      type: "PROFILE",
      visible: true,
      settingsJson: { paddingTop: 32, paddingBottom: 32 },
      blocks: [
        { type: "IMAGE", visible: true, contentJson: { url: "https://github.com/shadcn.png", alt: "Profile Picture" }, styleJson: { width: 96, height: 96, borderRadius: 50 } },
        { type: "HEADING", visible: true, contentJson: { text: "Your Name" }, styleJson: { level: "h1", textAlign: "center" } },
        { type: "TEXT", visible: true, contentJson: { text: "Short bio about yourself." }, styleJson: { textAlign: "center", color: "#888" } },
      ]
    }
  },
  {
    name: "Link Cards",
    icon: <LinkIcon size={16} />,
    section: {
      type: "LINKS",
      visible: true,
      settingsJson: { paddingTop: 16, paddingBottom: 16 },
      blocks: [
        { type: "LINK_CARD", visible: true, contentJson: { text: "Twitter", url: "https://twitter.com" }, styleJson: { icon: "Twitter" } },
        { type: "LINK_CARD", visible: true, contentJson: { text: "YouTube", url: "https://youtube.com" }, styleJson: { icon: "Youtube" } },
        { type: "LINK_CARD", visible: true, contentJson: { text: "Instagram", url: "https://instagram.com" }, styleJson: { icon: "Instagram" } },
      ]
    }
  },
  {
    name: "Social Icon Row",
    icon: <Globe size={16} />,
    section: {
      type: "SOCIAL_ICON_ROW",
      visible: true,
      settingsJson: { paddingTop: 16, paddingBottom: 16 },
      blocks: [
        { type: "SOCIAL_LINK", visible: true, contentJson: { icon: "Twitter", url: "https://twitter.com" }, styleJson: {} },
        { type: "SOCIAL_LINK", visible: true, contentJson: { icon: "Instagram", url: "https://instagram.com" }, styleJson: {} },
        { type: "SOCIAL_LINK", visible: true, contentJson: { icon: "Mail", url: "mailto:hello@example.com" }, styleJson: {} },
      ]
    }
  },
  {
    name: "Fourthwall Merch",
    icon: <Globe size={16} />,
    section: {
      type: "FOURTHWALL_MERCH",
      visible: true,
      settingsJson: { paddingTop: 32, paddingBottom: 32 },
      blocks: []
    }
  },
  {
    name: "Standard Section",
    icon: <AlignLeft size={16} />,
    section: {
      type: "STANDARD",
      visible: true,
      settingsJson: { paddingTop: 24, paddingBottom: 24 },
      blocks: [
        { type: "HEADING", visible: true, contentJson: { text: "Section Title" }, styleJson: { level: "h2" } },
        { type: "TEXT", visible: true, contentJson: { text: "Add some content here." }, styleJson: {} },
      ]
    }
  },
  {
    name: "Line Divider",
    icon: <Minus size={16} />,
    section: {
      type: "STANDARD",
      visible: true,
      settingsJson: { paddingTop: 32, paddingBottom: 32 },
      blocks: [
        { type: "DIVIDER", visible: true, contentJson: {}, styleJson: {} },
      ]
    }
  },
  {
    name: "Banner Image",
    icon: <ImageIcon size={16} />,
    section: {
      type: "STANDARD",
      visible: true,
      settingsJson: { paddingTop: 0, paddingBottom: 0, fullWidth: true },
      blocks: [
        { type: "IMAGE", visible: true, contentJson: { url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80", altText: "Banner" }, styleJson: { width: "100%", borderRadius: 16 } },
      ]
    }
  }
];

function PalettePane() {
  const { addSectionTemplate, addSection } = useBuilder();
  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="font-semibold text-zinc-200">Components</h2>
      </div>
      <div className="p-4 flex flex-col gap-6">
        
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Templates</span>
          {TEMPLATES.map(t => (
            <button 
              key={t.name} 
              onClick={() => addSectionTemplate(t.section as any)}
              className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 hover:bg-zinc-800 transition text-left text-sm text-zinc-300"
            >
              <div className="p-1.5 bg-zinc-800 rounded-md text-zinc-400">
                {t.icon}
              </div>
              <span className="flex-1">{t.name}</span>
              <Plus size={14} className="text-zinc-500" />
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

function ScrubbableNumberInput({ 
  value, 
  onChange, 
  icon: Icon,
  min = 0,
  max = 256
}: { 
  value: number, 
  onChange: (v: number) => void, 
  icon: any,
  min?: number,
  max?: number
}) {
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startValue = value || 0;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newValue = startValue + Math.floor(deltaX / 2); // 2px per unit
      if (newValue < min) newValue = min;
      if (newValue > max) newValue = max;
      onChange(newValue);
    };

    const handlePointerUp = () => {
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    document.body.style.cursor = 'ew-resize';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 focus-within:border-blue-500 transition-colors">
      <div 
        onPointerDown={handlePointerDown}
        className="cursor-ew-resize text-zinc-500 hover:text-white transition-colors p-1 -ml-1 rounded flex items-center justify-center"
        title="Drag horizontally to adjust"
      >
        <Icon size={12} />
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={e => {
          const val = parseInt(e.target.value);
          if (!isNaN(val)) onChange(Math.max(min, Math.min(max, val)));
        }} 
        className="w-10 bg-transparent text-white outline-none text-right font-medium" 
      />
      <span className="text-zinc-600">px</span>
    </div>
  );
}

function ColorPickerInput({ value, onChange, placeholder }: { value: string, onChange: (v: string) => void, placeholder?: string }) {
  let hexValue = "#000000";
  if (value && value.startsWith('#')) {
    hexValue = value.slice(0, 7);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8 rounded border border-zinc-700 shadow-inner overflow-hidden shrink-0">
        <input 
          type="color" 
          value={hexValue} 
          onChange={e => onChange(e.target.value)}
          className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" 
          title="Choose color"
        />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: value || "transparent" }}></div>
      </div>
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value || ""} 
        onChange={e => onChange(e.target.value)} 
        className="flex-1 bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none transition min-w-0" 
      />
    </div>
  );
}

function SortableSectionItem({ section, previewDevice }: { section: DraftSection, previewDevice: "mobile" | "desktop" }) {
  const { activeSectionId, setActiveSection, removeSection, pageSettings } = useBuilder();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id! });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...attributes} 
      {...listeners}
      className={`relative group cursor-grab active:cursor-grabbing border-2 transition-colors ${activeSectionId === section.id ? "border-blue-500" : "border-transparent hover:border-blue-500/50"}`}
      onClick={(e) => { 
        e.stopPropagation(); 
        setActiveSection(section.id!); 
      }}
    >
      {activeSectionId === section.id && (
          <div className="absolute top-0 right-0 z-50 bg-blue-500 text-white flex items-center text-xs shadow-lg rounded-bl-lg overflow-hidden">
            <button 
              onPointerDown={(e) => { e.stopPropagation(); }}
              onClick={(e) => { e.stopPropagation(); removeSection(section.id!); }} 
              className="p-2 hover:bg-red-500"
            >
              <Trash2 size={14}/>
            </button>
          </div>
      )}
      <div className="pointer-events-none">
        <SectionRenderer section={section} pageSettings={pageSettings} previewDevice={previewDevice} />
      </div>
      
      {activeSectionId === section.id && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg pointer-events-none">
            Selected
          </div>
        </div>
      )}
    </div>
  );
}

function CanvasPane() {
  const { sections, reorderSections, pageSettings, updatePageSettings, setActiveSection } = useBuilder();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      reorderSections(oldIndex, newIndex);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900 relative">
      <div className="h-12 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[10px] mr-2">Content Width (px)</span>
            <ScrubbableNumberInput 
              icon={Monitor} 
              value={pageSettings?.globalMaxWidth || 800} 
              onChange={(val) => updatePageSettings({ globalMaxWidth: val })} 
              max={4000}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 border-l border-zinc-800 pl-4 ml-2">
            <span className="font-semibold uppercase tracking-wider text-[10px] mr-2">Background</span>
            <div className="w-32">
              <ColorPickerInput 
                value={pageSettings?.globalBackgroundColor || ""} 
                onChange={(color) => updatePageSettings({ globalBackgroundColor: color })}
                placeholder="#09090b"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDevice("desktop")} className={`p-1.5 rounded ${device === "desktop" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"}`}>
            <Monitor size={16} />
          </button>
          <button onClick={() => setDevice("mobile")} className={`p-1.5 rounded ${device === "mobile" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"}`}>
            <Smartphone size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex justify-center items-start" onClick={() => setActiveSection(null)}>
        <div 
          className={`transition-all duration-300 ${device === "desktop" ? "w-full max-w-6xl" : "w-[390px]"} min-h-[500px] border border-zinc-800 rounded-xl shadow-2xl relative flex flex-col overflow-hidden`}
          style={{ backgroundColor: pageSettings?.globalBackgroundColor || "#09090b" }}
        >
          
          {sections.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
              <div className="p-4 bg-zinc-900 rounded-full mb-4">
                <LayoutTemplate size={32} className="text-zinc-700" />
              </div>
              <p className="font-medium text-zinc-300">Your page is empty</p>
              <p className="text-sm mt-1">Add a template from the left sidebar to get started.</p>
            </div>
          ) : (
            <DndContext id="canvas-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map(s => s.id!)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col w-full h-full relative">
                  {sections.map((section) => (
                    <SortableSectionItem key={section.id} section={section} previewDevice={device} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}

function SortableBlockItem({ block, sectionId, sectionSettings }: { block: any, sectionId: string, sectionSettings: any }) {
  const { updateBlockContent, updateBlockStyle, removeBlock } = useBuilder();
  const [isOpen, setIsOpen] = useState(false);
  const content = (block.contentJson as any) || {};

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id! });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-800 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 p-1">
            <GripVertical size={14} />
          </div>
          <span className="font-semibold text-xs text-blue-400 uppercase tracking-wider">{block.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); removeBlock(sectionId, block.id!); }} className="text-zinc-600 hover:text-red-400 p-1"><Trash2 size={14}/></button>
          <div className={`transform transition-transform text-zinc-500 ${isOpen ? "rotate-180" : ""}`}><ChevronDown size={14}/></div>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 space-y-3">
          {block.type === "TEXT" || block.type === "HEADING" ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Text</label>
                <textarea 
                  value={content.text || ""} 
                  onChange={e => updateBlockContent(sectionId, block.id!, { text: e.target.value })} 
                  className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-zinc-200 focus:border-blue-500 focus:outline-none transition min-h-[80px]" 
                  placeholder="Enter text..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Text Color</label>
                  <ColorPickerInput 
                    value={(block.styleJson as any)?.color || ""} 
                    onChange={(color) => updateBlockStyle(sectionId, block.id!, { color })}
                    placeholder="e.g. #ffffff"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Size (px)</label>
                  <input 
                    type="number" 
                    value={(block.styleJson as any)?.fontSize || ""} 
                    onChange={e => updateBlockStyle(sectionId, block.id!, { fontSize: parseInt(e.target.value) || undefined })} 
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none" 
                    placeholder="Auto"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Weight</label>
                  <select 
                    value={(block.styleJson as any)?.fontWeight || ""} 
                    onChange={e => updateBlockStyle(sectionId, block.id!, { fontWeight: e.target.value || undefined })}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Default</option>
                    <option value="normal">Normal (400)</option>
                    <option value="medium">Medium (500)</option>
                    <option value="semibold">Semi-Bold (600)</option>
                    <option value="bold">Bold (700)</option>
                    <option value="extrabold">Extra Bold (800)</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Alignment</label>
                  <select 
                    value={(block.styleJson as any)?.textAlign || ""} 
                    onChange={e => updateBlockStyle(sectionId, block.id!, { textAlign: e.target.value || undefined })}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Inherit</option>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
          ) : null}

          {block.type === "LOCATION" ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Location Text</label>
                <input type="text" value={content.text || ""} onChange={e => updateBlockContent(sectionId, block.id!, { text: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-zinc-200 focus:border-blue-500 focus:outline-none transition" placeholder="e.g. Ontario, Canada" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Color</label>
                  <ColorPickerInput 
                    value={(block.styleJson as any)?.color || ""} 
                    onChange={(color) => updateBlockStyle(sectionId, block.id!, { color })}
                    placeholder="e.g. #a3a3a3"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Size (px)</label>
                  <input 
                    type="number" 
                    value={(block.styleJson as any)?.fontSize || ""} 
                    onChange={e => updateBlockStyle(sectionId, block.id!, { fontSize: parseInt(e.target.value) || undefined })} 
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none" 
                    placeholder="Auto"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {block.type === "LINK_CARD" || block.type === "BUTTON" ? (
            <>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Label</label>
                <input type="text" value={content.text || ""} onChange={e => updateBlockContent(sectionId, block.id!, { text: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-zinc-200 focus:border-blue-500 focus:outline-none transition" placeholder="Link label" />
              </div>
              
              {block.type === "BUTTON" && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Button Action</label>
                  <select 
                    value={content.buttonType || "link"} 
                    onChange={e => updateBlockContent(sectionId, block.id!, { buttonType: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="link">Navigate to URL</option>
                    <option value="email">Click to Reveal Email</option>
                  </select>
                </div>
              )}

              {(block.type === "LINK_CARD" || content.buttonType !== "email") && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">URL</label>
                  <input type="text" value={content.url || ""} onChange={e => updateBlockContent(sectionId, block.id!, { url: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-zinc-200 focus:border-blue-500 focus:outline-none transition" placeholder="https://..." />
                </div>
              )}

              {block.type === "BUTTON" && content.buttonType === "email" && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Email Address</label>
                  <input type="email" value={content.email || ""} onChange={e => updateBlockContent(sectionId, block.id!, { email: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-zinc-200 focus:border-blue-500 focus:outline-none transition" placeholder="hello@example.com" />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Background Color</label>
                <ColorPickerInput 
                  value={(block.styleJson as any)?.backgroundColor || ""} 
                  onChange={(color) => updateBlockStyle(sectionId, block.id!, { backgroundColor: color })}
                  placeholder="e.g. #09090b"
                />
              </div>

              {block.type === "BUTTON" && (
                <>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Text Color</label>
                      <ColorPickerInput 
                        value={(block.styleJson as any)?.color || ""} 
                        onChange={(color) => updateBlockStyle(sectionId, block.id!, { color })}
                        placeholder="e.g. #000000"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Text Size (px)</label>
                      <input 
                        type="number" 
                        value={(block.styleJson as any)?.fontSize || ""} 
                        onChange={e => updateBlockStyle(sectionId, block.id!, { fontSize: parseInt(e.target.value) || undefined })} 
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none" 
                        placeholder="Auto"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Width Padding</label>
                      <input 
                        type="number" 
                        value={(block.styleJson as any)?.paddingX || ""} 
                        onChange={e => updateBlockStyle(sectionId, block.id!, { paddingX: parseInt(e.target.value) || undefined })} 
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none" 
                        placeholder="Auto (e.g. 24)"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Height Padding</label>
                      <input 
                        type="number" 
                        value={(block.styleJson as any)?.paddingY || ""} 
                        onChange={e => updateBlockStyle(sectionId, block.id!, { paddingY: parseInt(e.target.value) || undefined })} 
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none" 
                        placeholder="Auto (e.g. 12)"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4 border-t border-zinc-800 pt-3">
                    <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Stroke / Border</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase text-zinc-600">Thickness (px)</label>
                        <input 
                          type="number" 
                          value={(block.styleJson as any)?.borderWidth || ""} 
                          onChange={e => updateBlockStyle(sectionId, block.id!, { borderWidth: parseInt(e.target.value) || undefined })} 
                          className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none" 
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase text-zinc-600">Color</label>
                        <ColorPickerInput 
                          value={(block.styleJson as any)?.borderColor || ""} 
                          onChange={(color) => updateBlockStyle(sectionId, block.id!, { borderColor: color })}
                          placeholder="e.g. #ffffff"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Link Image (Optional)</label>
                  {content.iconUrl && (
                    <button onClick={() => updateBlockContent(sectionId, block.id!, { iconUrl: undefined })} className="text-[10px] text-red-500 hover:text-red-400 uppercase font-semibold">Remove</button>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    try {
                      const res = await fetch('/api/upload', { method: 'POST', body: formData });
                      const data = await res.json();
                      if (data.asset?.url) {
                        updateBlockContent(sectionId, block.id!, { iconUrl: data.asset.url });
                      } else if (data.error) {
                        alert(`Upload failed: ${data.error}`);
                      }
                    } catch (err) {
                      console.error("Upload failed", err);
                      alert("Upload failed. Make sure you are logged in.");
                    }
                  }}
                  className="w-full text-xs text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Img Size</label>
                  <input type="number" placeholder="40" value={(block.styleJson as any)?.iconSize || ""} onChange={e => updateBlockStyle(sectionId, block.id!, { iconSize: parseInt(e.target.value) || undefined })} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-zinc-200 focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Rounding</label>
                  <input type="number" placeholder="6" value={(block.styleJson as any)?.iconRadius ?? ""} onChange={e => updateBlockStyle(sectionId, block.id!, { iconRadius: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-zinc-200 focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              {content.iconUrl && (
                <div className="space-y-2 mt-2 p-2 border border-zinc-800 bg-zinc-900/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id={`imagePulse-${block.id}`} checked={(block.styleJson as any)?.imagePulse || false} onChange={e => updateBlockStyle(sectionId, block.id!, { imagePulse: e.target.checked })} className="accent-blue-500" />
                    <label htmlFor={`imagePulse-${block.id}`} className="text-xs text-zinc-300 font-medium">Animated Pulse Effect</label>
                  </div>
                  {(block.styleJson as any)?.imagePulse && (
                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Pulse Color</label>
                      <ColorPickerInput 
                        value={(block.styleJson as any)?.pulseColor || ""} 
                        onChange={(color) => updateBlockStyle(sectionId, block.id!, { pulseColor: color })}
                        placeholder="e.g. #3b82f6"
                      />
                    </div>
                  )}
                </div>
              )}
              {sectionSettings.columns > 1 && (
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id={`fullWidth-${block.id}`} checked={(block.styleJson as any)?.fullWidth || false} onChange={e => updateBlockStyle(sectionId, block.id!, { fullWidth: e.target.checked })} className="accent-blue-500" />
                  <label htmlFor={`fullWidth-${block.id}`} className="text-xs text-zinc-400">Span Full Row</label>
                </div>
              )}
            </>
          ) : null}

          {block.type === "SOCIAL_LINK" ? (
            <>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Custom Icon (Optional)</label>
                  {content.iconUrl && (
                    <button onClick={() => updateBlockContent(sectionId, block.id!, { iconUrl: undefined })} className="text-[10px] text-red-500 hover:text-red-400 uppercase font-semibold">Remove</button>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    try {
                      const res = await fetch('/api/upload', { method: 'POST', body: formData });
                      const data = await res.json();
                      if (data.asset?.url) {
                        updateBlockContent(sectionId, block.id!, { iconUrl: data.asset.url });
                      } else if (data.error) {
                        alert(`Upload failed: ${data.error}`);
                      }
                    } catch (err) {
                      console.error("Upload failed", err);
                      alert("Upload failed. Make sure you are logged in.");
                    }
                  }}
                  className="w-full text-xs text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              {!content.iconUrl && (
                <div className="space-y-1 mt-2">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Fallback Icon</label>
                  <select 
                    value={content.icon || "Globe"} 
                    onChange={e => updateBlockContent(sectionId, block.id!, { icon: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Globe">Globe</option>
                    <option value="Twitter">Twitter (X)</option>
                    <option value="Youtube">YouTube</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitch">Twitch</option>
                    <option value="Discord">Discord</option>
                    <option value="Github">GitHub</option>
                    <option value="Linkedin">LinkedIn</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Mail">Email</option>
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">URL</label>
                <input type="text" value={content.url || ""} onChange={e => updateBlockContent(sectionId, block.id!, { url: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-zinc-200 focus:border-blue-500 focus:outline-none transition" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Icon Color</label>
                  <ColorPickerInput 
                    value={(block.styleJson as any)?.color || ""} 
                    onChange={(color) => updateBlockStyle(sectionId, block.id!, { color })}
                    placeholder="Inherit"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Background</label>
                  <ColorPickerInput 
                    value={(block.styleJson as any)?.backgroundColor || ""} 
                    onChange={(color) => updateBlockStyle(sectionId, block.id!, { backgroundColor: color })}
                    placeholder="#27272a"
                  />
                </div>
              </div>
            </>
          ) : null}

          {block.type === "DIVIDER" ? (
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Line Color</label>
              <ColorPickerInput 
                value={(block.styleJson as any)?.color || ""} 
                onChange={(color) => updateBlockStyle(sectionId, block.id!, { color })}
                placeholder="e.g. #3f3f46"
              />
            </div>
          ) : null}

          {block.type === "IMAGE" ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Upload Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    try {
                      const res = await fetch('/api/upload', { method: 'POST', body: formData });
                      const data = await res.json();
                      if (data.asset?.url) {
                        updateBlockContent(sectionId, block.id!, { url: data.asset.url });
                      } else if (data.error) {
                        alert(`Upload failed: ${data.error}`);
                      }
                    } catch (err) {
                      console.error("Upload failed", err);
                      alert("Upload failed. Make sure you are logged in.");
                    }
                  }}
                  className="w-full text-xs text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <hr className="flex-1 border-zinc-800" />
                <span className="text-[10px] uppercase text-zinc-600 font-semibold tracking-wider">OR ENTER URL</span>
                <hr className="flex-1 border-zinc-800" />
              </div>

              <input type="text" value={content.url || ""} onChange={e => updateBlockContent(sectionId, block.id!, { url: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-zinc-200 focus:border-blue-500 focus:outline-none transition" placeholder="https://..." />
              
              {content.url && (
                <>
                  <div className="mt-2 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950 flex justify-center p-2">
                     <img src={content.url} alt="Preview" className="max-h-32 object-contain rounded" />
                  </div>
                  <div className="flex flex-col gap-3 pt-3 pb-2 border-b border-zinc-800/50 mb-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`bgOverlap-${block.id}`} 
                        checked={(block.styleJson as any)?.backgroundOverlap || false} 
                        onChange={e => updateBlockStyle(sectionId, block.id!, { backgroundOverlap: e.target.checked || undefined })} 
                        className="accent-blue-500 w-4 h-4" 
                      />
                      <label htmlFor={`bgOverlap-${block.id}`} className="text-xs text-zinc-300 font-medium">Background Image (Full Overlap)</label>
                    </div>
                    
                    {(block.styleJson as any)?.backgroundOverlap && (
                      <div className="flex items-center gap-2 pl-6">
                        <input 
                          type="checkbox" 
                          id={`bgContain-${block.id}`} 
                          checked={(block.styleJson as any)?.backgroundContain || false} 
                          onChange={e => updateBlockStyle(sectionId, block.id!, { backgroundContain: e.target.checked || undefined })} 
                          className="accent-blue-500 w-3.5 h-3.5" 
                        />
                        <label htmlFor={`bgContain-${block.id}`} className="text-[11px] text-zinc-400 font-medium">Enable Width Locking (Don't zoom to fill)</label>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Link to Website (Optional)</label>
                      <input type="text" placeholder="https://..." value={content.linkUrl || ""} onChange={e => updateBlockContent(sectionId, block.id!, { linkUrl: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-zinc-200 focus:border-blue-500 focus:outline-none transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Width (px)</label>
                      <input type="number" placeholder="Auto" value={(block.styleJson as any)?.width || ""} onChange={e => updateBlockStyle(sectionId, block.id!, { width: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-zinc-200 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Height (px)</label>
                      <input type="number" placeholder="Auto" value={(block.styleJson as any)?.height || ""} onChange={e => updateBlockStyle(sectionId, block.id!, { height: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-zinc-200 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Shape</label>
                      <select 
                        value={(block.styleJson as any)?.borderRadius || ""} 
                        onChange={e => updateBlockStyle(sectionId, block.id!, { borderRadius: e.target.value || undefined })}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Square (No Curves)</option>
                        <option value="16">Rounded Corners</option>
                        <option value="50%">Circle (Avatar)</option>
                      </select>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Image Alignment (When Cropped)</label>
                      <select 
                        value={(block.styleJson as any)?.objectPosition || ""} 
                        onChange={e => updateBlockStyle(sectionId, block.id!, { objectPosition: e.target.value || undefined })}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Center (Default)</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div className="space-y-3 col-span-2 mt-2 pt-2 border-t border-zinc-800">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Crop</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1 text-[10px] text-zinc-400">
                          <div className="flex justify-between"><span>Top</span><span>{(block.styleJson as any)?.cropTop || 0}%</span></div>
                          <input type="range" className="accent-blue-500" min="0" max="50" value={(block.styleJson as any)?.cropTop || 0} onChange={(e) => updateBlockStyle(sectionId, block.id!, { cropTop: parseInt(e.target.value) || undefined })} />
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] text-zinc-400">
                          <div className="flex justify-between"><span>Bottom</span><span>{(block.styleJson as any)?.cropBottom || 0}%</span></div>
                          <input type="range" className="accent-blue-500" min="0" max="50" value={(block.styleJson as any)?.cropBottom || 0} onChange={(e) => updateBlockStyle(sectionId, block.id!, { cropBottom: parseInt(e.target.value) || undefined })} />
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] text-zinc-400">
                          <div className="flex justify-between"><span>Left</span><span>{(block.styleJson as any)?.cropLeft || 0}%</span></div>
                          <input type="range" className="accent-blue-500" min="0" max="50" value={(block.styleJson as any)?.cropLeft || 0} onChange={(e) => updateBlockStyle(sectionId, block.id!, { cropLeft: parseInt(e.target.value) || undefined })} />
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] text-zinc-400">
                          <div className="flex justify-between"><span>Right</span><span>{(block.styleJson as any)?.cropRight || 0}%</span></div>
                          <input type="range" className="accent-blue-500" min="0" max="50" value={(block.styleJson as any)?.cropRight || 0} onChange={(e) => updateBlockStyle(sectionId, block.id!, { cropRight: parseInt(e.target.value) || undefined })} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 col-span-2 mt-2 pt-2 border-t border-zinc-800">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Edge Fade / Blur</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1 text-[10px] text-zinc-400">
                          <div className="flex justify-between"><span>Top</span><span>{(block.styleJson as any)?.edgeBlurTop || 0}%</span></div>
                          <input type="range" className="accent-blue-500" min="0" max="50" value={(block.styleJson as any)?.edgeBlurTop || 0} onChange={(e) => updateBlockStyle(sectionId, block.id!, { edgeBlurTop: parseInt(e.target.value) || undefined })} />
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] text-zinc-400">
                          <div className="flex justify-between"><span>Bottom</span><span>{(block.styleJson as any)?.edgeBlurBottom || 0}%</span></div>
                          <input type="range" className="accent-blue-500" min="0" max="50" value={(block.styleJson as any)?.edgeBlurBottom || 0} onChange={(e) => updateBlockStyle(sectionId, block.id!, { edgeBlurBottom: parseInt(e.target.value) || undefined })} />
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] text-zinc-400">
                          <div className="flex justify-between"><span>Left</span><span>{(block.styleJson as any)?.edgeBlurLeft || 0}%</span></div>
                          <input type="range" className="accent-blue-500" min="0" max="50" value={(block.styleJson as any)?.edgeBlurLeft || 0} onChange={(e) => updateBlockStyle(sectionId, block.id!, { edgeBlurLeft: parseInt(e.target.value) || undefined })} />
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] text-zinc-400">
                          <div className="flex justify-between"><span>Right</span><span>{(block.styleJson as any)?.edgeBlurRight || 0}%</span></div>
                          <input type="range" className="accent-blue-500" min="0" max="50" value={(block.styleJson as any)?.edgeBlurRight || 0} onChange={(e) => updateBlockStyle(sectionId, block.id!, { edgeBlurRight: parseInt(e.target.value) || undefined })} />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function InspectorPane() {
  const { sections, activeSectionId, updateSectionSettings, addBlock, reorderBlocks } = useBuilder();
  const [tab, setTab] = useState<"content" | "design">("content");
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!activeSectionId) {
    return (
      <div className="w-80 bg-zinc-950 border-l border-zinc-800 flex flex-col items-center justify-center text-zinc-500 text-sm p-8 text-center">
        <Settings size={32} className="mb-4 text-zinc-700" />
        <p>Select a section on the canvas to inspect and edit its properties.</p>
      </div>
    );
  }

  const section = sections.find(s => s.id === activeSectionId)!;
  const settings = (section.settingsJson as any) || {};

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = section.blocks.findIndex((b) => b.id === active.id);
      const newIndex = section.blocks.findIndex((b) => b.id === over.id);
      reorderBlocks(section.id!, oldIndex, newIndex);
    }
  };

  return (
    <div className="w-80 bg-zinc-950 border-l border-zinc-800 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
        <h2 className="font-semibold text-zinc-200 flex items-center justify-between">
          <span>{section.type.replace(/_/g, " ")}</span>
          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">SECTION</span>
        </h2>
        
        <div className="flex bg-zinc-900 p-1 rounded-lg mt-4 gap-1">
          <button 
            onClick={() => setTab("content")} 
            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition ${tab === "content" ? "bg-zinc-800 text-white shadow" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Content
          </button>
          <button 
            onClick={() => setTab("design")} 
            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition ${tab === "design" ? "bg-zinc-800 text-white shadow" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Design
          </button>
        </div>
      </div>
      
      <div className="p-4 flex flex-col gap-4">
        {tab === "design" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Spacing</h3>
                <div className="flex items-center gap-1.5">
                  <input type="checkbox" id="uniformPadding" className="accent-blue-500" checked={settings.uniformPadding || false} onChange={(e) => updateSectionSettings(section.id!, { uniformPadding: e.target.checked })} />
                  <label htmlFor="uniformPadding" className="text-[10px] text-zinc-400 uppercase tracking-wider">Uniform</label>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center text-xs text-zinc-400">
                    <label>Padding Top</label>
                    <span>{settings.paddingTop || 0}px</span>
                 </div>
                 <input type="range" className="accent-blue-500" min="0" max="128" value={settings.paddingTop || 0} onChange={(e) => {
                   const val = parseInt(e.target.value);
                   if (settings.uniformPadding) updateSectionSettings(section.id!, { paddingTop: val, paddingBottom: val, paddingLeft: val, paddingRight: val });
                   else updateSectionSettings(section.id!, { paddingTop: val });
                 }} />
              </div>
              <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center text-xs text-zinc-400">
                    <label>Padding Bottom</label>
                    <span>{settings.paddingBottom || 0}px</span>
                 </div>
                 <input type="range" className="accent-blue-500" min="0" max="128" value={settings.paddingBottom || 0} onChange={(e) => {
                   const val = parseInt(e.target.value);
                   if (settings.uniformPadding) updateSectionSettings(section.id!, { paddingTop: val, paddingBottom: val, paddingLeft: val, paddingRight: val });
                   else updateSectionSettings(section.id!, { paddingBottom: val });
                 }} />
              </div>
              <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center text-xs text-zinc-400">
                    <label>Padding Left</label>
                    <span>{settings.paddingLeft || 0}px</span>
                 </div>
                 <input type="range" className="accent-blue-500" min="0" max="128" value={settings.paddingLeft || 0} onChange={(e) => {
                   const val = parseInt(e.target.value);
                   if (settings.uniformPadding) updateSectionSettings(section.id!, { paddingTop: val, paddingBottom: val, paddingLeft: val, paddingRight: val });
                   else updateSectionSettings(section.id!, { paddingLeft: val });
                 }} />
              </div>
              <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center text-xs text-zinc-400">
                    <label>Padding Right</label>
                    <span>{settings.paddingRight || 0}px</span>
                 </div>
                 <input type="range" className="accent-blue-500" min="0" max="128" value={settings.paddingRight || 0} onChange={(e) => {
                   const val = parseInt(e.target.value);
                   if (settings.uniformPadding) updateSectionSettings(section.id!, { paddingTop: val, paddingBottom: val, paddingLeft: val, paddingRight: val });
                   else updateSectionSettings(section.id!, { paddingRight: val });
                 }} />
              </div>
            </div>

            <hr className="border-zinc-800" />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Layout</h3>
              <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center text-xs text-zinc-400">
                    <label>Columns</label>
                    <span>{settings.columns || 1}</span>
                 </div>
                 <input type="range" className="accent-blue-500" min="1" max="4" value={settings.columns || 1} onChange={(e) => updateSectionSettings(section.id!, { columns: parseInt(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2 pt-2">
                 <input type="checkbox" id="sectionFullWidth" checked={settings.fullWidth || false} onChange={e => updateSectionSettings(section.id!, { fullWidth: e.target.checked })} className="accent-blue-500" />
                 <label htmlFor="sectionFullWidth" className="text-xs text-zinc-400">Bypass Content Width (Full Bleed)</label>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                 <div className="flex justify-between items-center text-xs text-zinc-400">
                    <label>Overlap Next Section</label>
                    <span>{settings.marginBottom ? Math.abs(settings.marginBottom) : 0}px</span>
                 </div>
                 <input type="range" className="accent-blue-500" min="0" max="250" step="10" value={settings.marginBottom ? Math.abs(settings.marginBottom) : 0} onChange={(e) => {
                   const val = parseInt(e.target.value);
                   updateSectionSettings(section.id!, { marginBottom: val > 0 ? -val : undefined });
                 }} />
              </div>
            </div>

            <hr className="border-zinc-800" />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Appearance</h3>
              <div className="flex flex-col gap-2">
                 <label className="text-xs text-zinc-400">Background Color</label>
                 <ColorPickerInput 
                   value={settings.backgroundColor || ""} 
                   onChange={(color) => updateSectionSettings(section.id!, { backgroundColor: color })}
                   placeholder="e.g. #000000 or transparent"
                 />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Corner Radius</label>
                 <select 
                   value={settings.borderRadius || ""} 
                   onChange={e => updateSectionSettings(section.id!, { borderRadius: e.target.value || undefined })}
                   className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:border-blue-500 focus:outline-none"
                 >
                   <option value="">Square (0px)</option>
                   <option value="12">Rounded (12px)</option>
                   <option value="24">Extra Rounded (24px)</option>
                   <option value="36">Pill (36px)</option>
                 </select>
              </div>
              
              {section.blocks.some(b => b.type === "LINK_CARD") && (
                <>
                  <hr className="border-zinc-800" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Link Cards</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs text-zinc-400">
                        <label>Arrow Size</label>
                        <span>{settings.arrowSize || 20}px</span>
                    </div>
                    <input type="range" className="accent-blue-500" min="10" max="64" value={settings.arrowSize || 20} onChange={(e) => updateSectionSettings(section.id!, { arrowSize: parseInt(e.target.value) })} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs text-zinc-400">
                        <label>Arrow Thickness</label>
                        <span>{settings.arrowThickness || 2}</span>
                    </div>
                    <input type="range" className="accent-blue-500" min="1" max="5" step="0.5" value={settings.arrowThickness || 2} onChange={(e) => updateSectionSettings(section.id!, { arrowThickness: parseFloat(e.target.value) })} />
                  </div>
                  
                  <hr className="border-zinc-800" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Discord Badge</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs text-zinc-400">
                        <label>Badge Text Size</label>
                        <span>{settings.discordBadgeSize || 12}px</span>
                    </div>
                    <input type="range" className="accent-blue-500" min="10" max="24" value={settings.discordBadgeSize || 12} onChange={(e) => updateSectionSettings(section.id!, { discordBadgeSize: parseInt(e.target.value) })} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-zinc-400">Badge Color</label>
                    <ColorPickerInput 
                      value={settings.discordBadgeColor || ""} 
                      onChange={(color) => updateSectionSettings(section.id!, { discordBadgeColor: color })}
                      placeholder="e.g. #d4d4d8"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-zinc-400">Background Color</label>
                    <ColorPickerInput 
                      value={settings.discordBadgeBgColor || ""} 
                      onChange={(color) => updateSectionSettings(section.id!, { discordBadgeBgColor: color })}
                      placeholder="e.g. rgba(0, 0, 0, 0.4)"
                    />
                  </div>
                </>
              )}

              {section.type === "FOURTHWALL_MERCH" && (
                <>
                  <hr className="border-zinc-800" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Merch Display</h3>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-zinc-400">Card Background</label>
                    <ColorPickerInput 
                      value={settings.cardBgColor || ""} 
                      onChange={(color) => updateSectionSettings(section.id!, { cardBgColor: color })}
                      placeholder="e.g. rgba(24, 24, 27, 0.5) or #18181b"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-zinc-400">Text Color</label>
                    <ColorPickerInput 
                      value={settings.cardTextColor || ""} 
                      onChange={(color) => updateSectionSettings(section.id!, { cardTextColor: color })}
                      placeholder="e.g. #ffffff"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "content" && (
          <div className="space-y-4">
            
            <DndContext id="inspector-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={section.blocks.map(b => b.id!)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {section.blocks.length === 0 && (
                    <div className="text-center p-4 border border-dashed border-zinc-800 rounded-lg text-zinc-500 text-xs">
                      No blocks in this section.
                    </div>
                  )}
                  {section.blocks.map((block) => (
                    <SortableBlockItem key={block.id} block={block} sectionId={section.id!} sectionSettings={settings} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {section.type === "SOCIAL_ICON_ROW" ? (
              <div className="pt-2 border-t border-zinc-800">
                <button 
                  onClick={() => addBlock(section.id!, "SOCIAL_LINK")}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold py-2.5 rounded-lg text-white transition flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Add Social Link
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-zinc-800">
                <select 
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs p-2.5 rounded-lg text-zinc-300 focus:border-blue-500 focus:outline-none transition" 
                  onChange={(e) => { if(e.target.value) { addBlock(section.id!, e.target.value); e.target.value = ""; } }}
                  value=""
                >
                  <option value="" disabled>+ Add Block</option>
                  {blockTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BuilderShell() {
  const { save, publish, isSaving, isPublishing } = useBuilder();
  const [modalAction, setModalAction] = useState<"none" | "save" | "publish" | "save_success" | "publish_success" | "error">("none");

  const handleConfirm = async () => {
    let success = false;
    if (modalAction === "save") {
      success = await save();
      setModalAction(success ? "save_success" : "error");
    } else if (modalAction === "publish") {
      success = await publish();
      setModalAction(success ? "publish_success" : "error");
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white font-sans overflow-hidden">
      <Modal 
        isOpen={modalAction !== "none"} 
        onClose={() => setModalAction("none")}
        title={
          modalAction === "save" ? "Save Draft" : 
          modalAction === "publish" ? "Publish Site" : 
          modalAction === "save_success" ? "Draft Saved" : 
          modalAction === "publish_success" ? "Site Published" : 
          "Error"
        }
        footer={
          modalAction === "save_success" || modalAction === "publish_success" || modalAction === "error" ? (
            <button 
              onClick={() => setModalAction("none")}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition shadow-lg"
            >
              Done
            </button>
          ) : (
            <>
              <button 
                onClick={() => setModalAction("none")} 
                className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white transition"
                disabled={isSaving || isPublishing}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                disabled={isSaving || isPublishing}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition shadow-lg ${modalAction === "publish" ? "bg-white text-black hover:bg-gray-200" : "bg-blue-600 text-white hover:bg-blue-500"}`}
              >
                {isSaving || isPublishing ? "Processing..." : "Confirm"}
              </button>
            </>
          )
        }
      >
        <p>
          {modalAction === "save" 
            ? "Are you sure you want to save this draft? Your changes will be saved but not pushed live." 
            : modalAction === "publish"
            ? "Are you sure you want to publish these changes? This will push your current draft to the live public site."
            : modalAction === "save_success"
            ? "Your draft has been saved successfully!"
            : modalAction === "publish_success"
            ? "Your site has been published successfully and is now live!"
            : "There was an error processing your request. Please try again."}
        </p>
      </Modal>

      {/* Topbar */}
      <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          <span className="font-semibold text-sm tracking-wide">Antonic Builder</span>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setModalAction("save")} 
            disabled={isSaving || isPublishing}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 rounded-lg transition disabled:opacity-50"
          >
            <Save size={14} />
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button 
            onClick={() => setModalAction("publish")}
            disabled={isSaving || isPublishing}
            className="flex items-center gap-2 px-4 py-1.5 text-xs bg-white text-black hover:bg-gray-200 font-semibold rounded-lg transition disabled:opacity-50 shadow-[0_0_12px_rgba(255,255,255,0.2)]"
          >
            <Globe size={14} />
            {isPublishing ? "Publishing..." : "Publish Site"}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <PalettePane />
        <CanvasPane />
        <InspectorPane />
      </div>
    </div>
  );
}

export function BuilderClient({ initialPageId, initialSections, initialPageSettings }: { initialPageId: string, initialSections: any[], initialPageSettings?: any }) {
  return (
    <BuilderProvider initialPageId={initialPageId} initialSections={initialSections} initialPageSettings={initialPageSettings}>
      <BuilderShell />
    </BuilderProvider>
  );
}
