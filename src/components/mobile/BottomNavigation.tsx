'use client';

import { motion } from 'framer-motion';
import { Home, Settings, Eye, FileOutput, Menu } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'config', icon: Settings, label: 'Config' },
    { id: 'viewer', icon: Eye, label: '3D View' },
    { id: 'output', icon: FileOutput, label: 'Output' },
    { id: 'more', icon: Menu, label: 'More' },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-bottom"
    >
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ id, icon: Icon, label }) => (
          <motion.button
            key={id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center flex-1 h-full relative ${
              activeTab === id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{label}</span>
            {activeTab === id && (
              <motion.div
                layoutId="activeTab"
                className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
}
