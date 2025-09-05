'use client';

import { getTechStack } from '@/utils/tech-stack';

const TECH_LOGOS: Record<string, string> = {
  'Next.js': '⚡',
  React: '⚛️',
  TypeScript: '📘',
  'Three.js': '🎮',
  'Tailwind CSS': '🎨',
  Zustand: '🐻',
  'React Three Fiber': '🔧',
  'React Three Drei': '🛠️',
};

export function TechStackDisplay() {
  const techStack = getTechStack();

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {techStack.slice(0, 6).map((tech) => (
        <div key={tech.key} className="group relative">
          <div
            className="flex items-center gap-1 px-2 py-1 bg-gray-100/50 hover:bg-gray-200/50 
                        dark:bg-gray-800/50 dark:hover:bg-gray-700/50 
                        rounded-md transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <span className="text-sm">{TECH_LOGOS[tech.name] || '⚙️'}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {tech.name}
            </span>
          </div>

          {/* Tooltip on hover */}
          <div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        pointer-events-none z-10"
          >
            <div className="bg-black/80 backdrop-blur-sm text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              {tech.name} v{tech.version}
            </div>
            <div
              className="absolute top-full left-1/2 transform -translate-x-1/2
                          border-4 border-transparent border-t-black/80"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
