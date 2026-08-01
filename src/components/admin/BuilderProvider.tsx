"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { saveDraft, publishRevision } from "@/server/actions/builder";
import { PageSection, PageBlock } from "@prisma/client";
import { arrayMove } from "@dnd-kit/sortable";

// Define our working types which match the Prisma schema but can be easily manipulated
export type DraftBlock = Omit<PageBlock, "id" | "sectionId" | "createdAt" | "updatedAt"> & { id?: string };
export type DraftSection = Omit<PageSection, "id" | "revisionId" | "createdAt" | "updatedAt"> & { 
  id?: string;
  blocks: DraftBlock[];
};

interface BuilderState {
  pageId: string;
  pageSettings: any;
  sections: DraftSection[];
  activeSectionId: string | null;
  activeBlockId: string | null;
  isSaving: boolean;
  isPublishing: boolean;
}

interface BuilderActions {
  updatePageSettings: (settings: any) => void;
  addSection: (type: string) => void;
  addSectionTemplate: (template: DraftSection) => void;
  removeSection: (sectionId: string) => void;
  updateSectionSettings: (sectionId: string, settings: any) => void;
  moveSection: (sectionId: string, direction: "up" | "down") => void;
  reorderSections: (oldIndex: number, newIndex: number) => void;
  
  addBlock: (sectionId: string, type: string) => void;
  removeBlock: (sectionId: string, blockId: string) => void;
  updateBlockContent: (sectionId: string, blockId: string, content: any) => void;
  updateBlockStyle: (sectionId: string, blockId: string, style: any) => void;
  moveBlock: (sectionId: string, blockId: string, direction: "up" | "down") => void;
  reorderBlocks: (sectionId: string, oldIndex: number, newIndex: number) => void;

  setActiveSection: (id: string | null) => void;
  setActiveBlock: (id: string | null) => void;
  
  save: () => Promise<boolean>;
  publish: () => Promise<boolean>;
}

const BuilderContext = createContext<(BuilderState & BuilderActions) | null>(null);

export function BuilderProvider({ 
  children, 
  initialPageId, 
  initialSections = [],
  initialPageSettings = {}
}: { 
  children: React.ReactNode, 
  initialPageId: string, 
  initialSections?: DraftSection[],
  initialPageSettings?: any
}) {
  const [sections, setSections] = useState<DraftSection[]>(initialSections);
  const [pageSettings, setPageSettings] = useState<any>(initialPageSettings);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Helper to safely reorder array
  const reorder = (list: any[], index: number, dir: "up" | "down") => {
    const result = Array.from(list);
    if (dir === "up" && index > 0) {
      const [removed] = result.splice(index, 1);
      result.splice(index - 1, 0, removed);
    } else if (dir === "down" && index < result.length - 1) {
      const [removed] = result.splice(index, 1);
      result.splice(index + 1, 0, removed);
    }
    // Update order properties
    return result.map((item, i) => ({ ...item, order: i }));
  };

  const actions: BuilderActions = {
    updatePageSettings: (settings) => {
      setPageSettings({ ...pageSettings, ...settings });
    },
    addSection: (type) => {
      const newSection: DraftSection = {
        id: uuidv4(), // temporary ID
        type,
        order: sections.length,
        visible: true,
        settingsJson: {} as any,
        blocks: [],
      };
      setSections([...sections, newSection]);
      setActiveSectionId(newSection.id!);
      setActiveBlockId(null);
    },
    addSectionTemplate: (template) => {
      // Ensure all IDs are fresh so templates can be added multiple times
      const freshSection: DraftSection = {
        ...template,
        id: uuidv4(),
        order: sections.length,
        blocks: template.blocks.map((b, i) => ({
          ...b,
          id: uuidv4(),
          order: i,
        }))
      };
      setSections([...sections, freshSection]);
      setActiveSectionId(freshSection.id!);
      setActiveBlockId(null);
    },
    removeSection: (id) => {
      setSections(sections.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i })));
      if (activeSectionId === id) setActiveSectionId(null);
    },
    updateSectionSettings: (id, settings) => {
      setSections(sections.map(s => s.id === id ? { ...s, settingsJson: { ...(s.settingsJson as any), ...settings } } : s));
    },
    moveSection: (id, dir) => {
      const index = sections.findIndex(s => s.id === id);
      if (index !== -1) setSections(reorder(sections, index, dir));
    },
    reorderSections: (oldIndex, newIndex) => {
      setSections((prev) => {
        const result = arrayMove(prev, oldIndex, newIndex);
        return result.map((item, i) => ({ ...item, order: i }));
      });
    },
    addBlock: (sectionId, type) => {
      setSections(sections.map(s => {
        if (s.id === sectionId) {
          const newBlock: DraftBlock = {
            id: uuidv4(),
            type,
            order: s.blocks.length,
            visible: true,
            contentJson: {} as any,
            styleJson: {} as any,
          };
          setActiveBlockId(newBlock.id!);
          return { ...s, blocks: [...s.blocks, newBlock] };
        }
        return s;
      }));
    },
    removeBlock: (sectionId, blockId) => {
      setSections(sections.map(s => {
        if (s.id === sectionId) {
          const newBlocks = s.blocks.filter(b => b.id !== blockId).map((b, i) => ({ ...b, order: i }));
          return { ...s, blocks: newBlocks };
        }
        return s;
      }));
      if (activeBlockId === blockId) setActiveBlockId(null);
    },
    updateBlockContent: (sectionId, blockId, content) => {
      setSections(sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            blocks: s.blocks.map(b => b.id === blockId ? { ...b, contentJson: { ...(b.contentJson as any), ...content } } : b)
          };
        }
        return s;
      }));
    },
    updateBlockStyle: (sectionId, blockId, style) => {
      setSections(sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            blocks: s.blocks.map(b => b.id === blockId ? { ...b, styleJson: { ...(b.styleJson as any), ...style } } : b)
          };
        }
        return s;
      }));
    },
    moveBlock: (sectionId, blockId, dir) => {
      setSections(sections.map(s => {
        if (s.id === sectionId) {
          const index = s.blocks.findIndex(b => b.id === blockId);
          if (index !== -1) return { ...s, blocks: reorder(s.blocks, index, dir) };
        }
        return s;
      }));
    },
    reorderBlocks: (sectionId, oldIndex, newIndex) => {
      setSections((prev) => prev.map(s => {
        if (s.id === sectionId) {
          const result = arrayMove(s.blocks, oldIndex, newIndex);
          return { ...s, blocks: result.map((b, i) => ({ ...b, order: i })) };
        }
        return s;
      }));
    },
    setActiveSection: (id) => {
      setActiveSectionId(id);
      if (id) setActiveBlockId(null);
    },
    setActiveBlock: (id) => setActiveBlockId(id),
    
    save: async () => {
      setIsSaving(true);
      try {
        await saveDraft({ pageId: initialPageId, sections, settingsJson: pageSettings });
        return true;
      } catch (e) {
        console.error(e);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    publish: async () => {
      setIsPublishing(true);
      try {
        const { revisionId } = await saveDraft({ pageId: initialPageId, sections, settingsJson: pageSettings });
        await publishRevision(revisionId);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      } finally {
        setIsPublishing(false);
      }
    }
  };

  return (
    <BuilderContext.Provider value={{ pageId: initialPageId, pageSettings, sections, activeSectionId, activeBlockId, isSaving, isPublishing, ...actions }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used within a BuilderProvider");
  return ctx;
}
