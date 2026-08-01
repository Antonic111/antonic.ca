"use client";

import { useState } from "react";
import { Search, Copy, Check } from "lucide-react";

type Command = {
  id: string;
  name: string;
  trigger: string;
  description: string;
  usage?: string;
  aliases?: string;
  platforms?: string;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
};

export default function CommandsClient({ commands, categories }: { commands: Command[], categories: Category[] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCommands = commands.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase()) || 
                          c.trigger.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? c.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (trigger: string, id: string) => {
    navigator.clipboard.writeText(trigger);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Stream Commands</h1>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input
            type="text"
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl border ${!selectedCategory ? 'bg-foreground text-background font-semibold' : 'bg-card border-border text-muted hover:bg-zinc-800'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl border ${selectedCategory === cat.id ? 'bg-foreground text-background font-semibold' : 'bg-card border-border text-muted hover:bg-zinc-800'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Commands Grid */}
      {filteredCommands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCommands.map((cmd) => (
            <div key={cmd.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col transition-all hover:border-zinc-600">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl">{cmd.name}</h3>
                <button
                  onClick={() => handleCopy(cmd.trigger, cmd.id)}
                  className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-muted hover:text-foreground"
                  title="Copy command"
                >
                  {copiedId === cmd.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
              <div className="font-mono text-brand mb-3">{cmd.trigger}</div>
              <p className="text-muted text-sm flex-grow">{cmd.description}</p>
              
              {(cmd.usage || cmd.aliases || cmd.platforms) && (
                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2 text-xs text-muted">
                  {cmd.usage && <div><span className="font-semibold text-foreground">Usage:</span> {cmd.usage}</div>}
                  {cmd.aliases && <div><span className="font-semibold text-foreground">Aliases:</span> {cmd.aliases}</div>}
                  {cmd.platforms && <div><span className="font-semibold text-foreground">Platforms:</span> {cmd.platforms}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted">
          No commands found matching your criteria.
        </div>
      )}
    </div>
  );
}
