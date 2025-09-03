'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileWrapper } from '@/components/mobile/MobileWrapper';
import { BottomNavigation } from '@/components/mobile/BottomNavigation';
import { SwipeableCard } from '@/components/mobile/SwipeableCard';
import dynamic from 'next/dynamic';

// Dynamic imports for better code splitting
const InputForms = dynamic(() => import('@/components/InputForms'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32" />,
});

const CrateViewer3D = dynamic(() => import('@/components/CrateViewer3D'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-64" />,
});

const OutputSection = dynamic(() => import('@/components/OutputSection'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32" />,
});

export default function MobileLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <MobileWrapper>
      <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
        {/* Sticky Header with blur effect */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`sticky top-0 z-30 transition-all duration-200 ${
            isScrolled
              ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md'
              : 'bg-white dark:bg-gray-900'
          }`}
        >
          <div className="safe-top">
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AutoCrate</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Professional Crate Design
                </p>
              </div>
              <button className="touch-button bg-blue-600 text-white">New</button>
            </div>
          </div>
        </motion.header>

        {/* Content Area with animations */}
        <AnimatePresence mode="wait">
          <motion.main
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="scroll-container"
          >
            {activeTab === 'home' && (
              <div className="p-4 space-y-4">
                <SwipeableCard>
                  <div className="mobile-card">
                    <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="touch-button bg-gray-100 dark:bg-gray-700">
                        Load Template
                      </button>
                      <button className="touch-button bg-gray-100 dark:bg-gray-700">
                        Recent Projects
                      </button>
                    </div>
                  </div>
                </SwipeableCard>

                <div className="mobile-card">
                  <h2 className="text-lg font-semibold mb-3">Statistics</h2>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-xs text-gray-500">Projects</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">48</div>
                      <div className="text-xs text-gray-500">Exports</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">3.2k</div>
                      <div className="text-xs text-gray-500">Materials</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'config' && (
              <div className="p-4">
                <div className="mobile-card">
                  <InputForms />
                </div>
              </div>
            )}

            {activeTab === 'viewer' && (
              <div className="p-4">
                <div className="mobile-card p-0 overflow-hidden">
                  <div className="h-[60vh]">
                    <CrateViewer3D />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'output' && (
              <div className="p-4">
                <div className="mobile-card">
                  <OutputSection />
                </div>
              </div>
            )}
          </motion.main>
        </AnimatePresence>

        {/* Floating Action Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="fab"
          onClick={() => console.log('FAB clicked')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </MobileWrapper>
  );
}
