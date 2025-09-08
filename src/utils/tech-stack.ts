// Dynamically import tech stack versions from package.json
import packageJson from '../../package.json';

export interface TechStackInfo {
  name: string;
  version: string;
  key: string;
}

// Map package names to display names
const TECH_STACK_MAPPING: Record<string, string> = {
  next: 'Next.js',
  react: 'React',
  typescript: 'TypeScript',
  three: 'Three.js',
  tailwindcss: 'Tailwind CSS',
  zustand: 'Zustand',
  '@react-three/fiber': 'React Three Fiber',
  '@react-three/drei': 'React Three Drei',
};

export function getTechStack(): TechStackInfo[] {
  const techStack: TechStackInfo[] = [];
  const deps: Record<string, string> = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  } as Record<string, string>;

  for (const [key, displayName] of Object.entries(TECH_STACK_MAPPING)) {
    if (deps[key]) {
      // Remove ^ or ~ from version
      const version = deps[key].replace(/^[\^~]/, '');
      techStack.push({
        name: displayName,
        version,
        key,
      });
    }
  }

  return techStack;
}

export function getTechStackString(detailed = false): string {
  const stack = getTechStack();

  if (detailed) {
    return stack.map((item) => `${item.name} ${item.version}`).join(', ');
  }

  // For space-constrained displays, show only names
  return stack
    .slice(0, 4)
    .map((item) => item.name)
    .join(', ');
}

export function getProjectVersion(): string {
  return packageJson.version;
}
