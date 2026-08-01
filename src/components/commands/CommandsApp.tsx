"use client";

import { useState, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import { commandSections } from '@/data/commands';
import { CommandSection } from './CommandSection';

export function CommandsApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
    // Disable browser scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Filter commands based on search query and category
  const filteredSections = useMemo(() => {
    return commandSections
      .filter((section: any) => {
        // Filter by category
        if (selectedCategory !== 'all' && section.category !== selectedCategory) {
          return false;
        }
        
        // Filter by search query
        if (searchQuery.trim() === '') {
          return true;
        }
        
        const query = searchQuery.toLowerCase();
        
        // Check if section title matches
        if (section.title.toLowerCase().includes(query)) {
          return true;
        }
        
        // Check if any command matches
        const hasMatchingCommand = section.commands.some((command: any) => {
          // Check aliases
          const aliasMatch = command.aliases.some((alias: string) => 
            alias.toLowerCase().includes(query)
          );
          
          // Check description
          const descMatch = command.description.toLowerCase().includes(query);
          
          // Check platform
          const platformMatch = command.platform && 
            command.platform.some((p: string) => p.toLowerCase().includes(query));
          
          return aliasMatch || descMatch || platformMatch;
        });
        
        return hasMatchingCommand;
      })
      .map((section: any) => {
        // Filter commands within matching sections
        if (searchQuery.trim() === '') {
          return section;
        }
        
        const query = searchQuery.toLowerCase();
        const filteredCommands = section.commands.filter((command: any) => {
          const aliasMatch = command.aliases.some((alias: string) => 
            alias.toLowerCase().includes(query)
          );
          const descMatch = command.description.toLowerCase().includes(query);
          const platformMatch = command.platform && 
            command.platform.some((p: string) => p.toLowerCase().includes(query));
          
          return aliasMatch || descMatch || platformMatch;
        });
        
        return { ...section, commands: filteredCommands };
      })
      .filter((section: any) => section.commands.length > 0); // Remove sections with no matching commands
  }, [searchQuery, selectedCategory]);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'social', name: 'Social' },
    { id: 'fun', name: 'Fun' },
    { id: 'economy', name: 'Economy' },
  ];

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 relative bg-[#121212]">
      <div 
        className="max-w-7xl mx-auto rounded-2xl shadow-2xl border-2 border-[#444444] p-6 md:p-10 lg:p-12 fade-in-up" 
        style={{ 
          minHeight: 'calc(100vh - 6rem)',
          background: 'linear-gradient(180deg, #1a1a1a 0%, #1a1a1a calc(50vh - 3rem), #121212 100%)',
          backgroundAttachment: 'local'
        }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-3 fade-in-up-delay-1">
          <span className="text-[#E0E0E0]">Antonic's Stream Commands</span>
        </h1>
        <p className="text-center text-[#B0B0B0] mb-8 text-lg md:text-xl uppercase tracking-widest font-semibold fade-in-up-delay-1">
          YouTube/Twitch Chat Commands List
        </p>

        {/* Search Bar */}
        <div className="mb-6 flex justify-center fade-in-up-delay-2">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-10 rounded-lg bg-[#141414] border border-[#444444] text-[#E0E0E0] placeholder-[#888888] focus:outline-none focus:border-[#888888] transition-colors"
              style={{
                fontFamily: "'Courier New', 'Roboto Mono', 'Fira Code', monospace"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#888888] hover:text-[#E0E0E0] transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center fade-in-up-delay-3">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-[#888888] text-[#E0E0E0]'
                  : 'bg-[#141414] text-[#B0B0B0] border border-[#444444] hover:border-[#888888]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Filtered Sections */}
        {filteredSections.length > 0 ? (
          filteredSections.map((section: any, index: number) => (
            <CommandSection key={index} section={section} searchQuery={searchQuery} />
          ))
        ) : (
          <div className="text-center py-12 fade-in-up-delay-4">
            <p className="text-[#B0B0B0] text-lg">No commands found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
