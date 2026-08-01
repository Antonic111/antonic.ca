import { CommandGroup } from './CommandGroup';

export function CommandSection({ section, searchQuery }: { section: any; searchQuery: string }) {
  const categoryColors: Record<string, string> = {
    social: '#7a8a9a',      // Subtle blue-gray for social
    fun: '#0891b2',          // Dark cyan for fun
    avatar: '#9d5bd4',       // Bright purple for avatar
    economy: '#2EBA4A',      // Green for economy
  };

  return (
    <div className="mb-16 fade-in-up-delay-4">
      <h2 className="text-2xl md:text-3xl lg:text-4xl text-[#E0E0E0] font-bold mb-8 pb-4 border-b-2 border-[#444444]">
        {section.title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {section.commands.map((command: any, index: number) => (
          <CommandGroup 
            key={index} 
            command={command} 
            categoryColor={categoryColors[section.category]}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}
