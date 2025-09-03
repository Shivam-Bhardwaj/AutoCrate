#!/usr/bin/env node

/**
 * Mobile UX Transformation Agent for AutoCrate
 * Analyzes and transforms the app for optimal mobile experience
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class MobileUXAgent {
  constructor() {
    this.issues = [];
    this.improvements = [];
    this.transformations = [];
    this.stats = {
      filesAnalyzed: 0,
      issuesFound: 0,
      improvementsApplied: 0,
    };
  }

  // Analyze current mobile UX issues
  analyzeMobileUX(content, filePath) {
    const issues = [];

    // Check for mobile-unfriendly patterns
    const antiPatterns = [
      {
        pattern: /onMouseEnter|onMouseLeave/g,
        issue: "Hover interactions don't work on mobile",
        fix: 'Use onClick or onTouchStart for mobile interactions',
      },
      {
        pattern: /position:\s*fixed.*width:\s*\d+px/g,
        issue: 'Fixed width elements may break on mobile',
        fix: 'Use responsive units (%, vw, vh) or max-width',
      },
      {
        pattern: /fontSize:\s*['"]\d+px['"]/g,
        issue: "Fixed font sizes don't scale well",
        fix: 'Use rem or em units for better scaling',
      },
      {
        pattern: /::-webkit-scrollbar/g,
        issue: "Custom scrollbars don't work on mobile",
        fix: 'Use native scrolling or touch-friendly alternatives',
      },
      {
        pattern: /overflow:\s*hidden.*body/g,
        issue: 'Hidden overflow on body can prevent scrolling',
        fix: 'Use overflow-x: hidden only, preserve vertical scroll',
      },
    ];

    antiPatterns.forEach(({ pattern, issue, fix }) => {
      if (pattern.test(content)) {
        issues.push({ file: filePath, issue, fix });
        this.stats.issuesFound++;
      }
    });

    return issues;
  }

  // Generate mobile-first component wrapper
  createMobileWrapper() {
    return `
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileWrapper({ children }) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isPullToRefresh, setIsPullToRefresh] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
    
    // Pull to refresh logic
    if (touchStart - e.targetTouches[0].clientY < -100 && window.scrollY === 0) {
      setIsPullToRefresh(true);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;
    
    if (isPullToRefresh) {
      window.location.reload();
      setIsPullToRefresh(false);
    }
  };

  useEffect(() => {
    // Prevent bounce scrolling on iOS
    document.body.style.overscrollBehavior = 'contain';
    
    // Add viewport meta tags for better mobile experience
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
      document.head.appendChild(meta);
    }
    
    // Add mobile-specific styles
    const style = document.createElement('style');
    style.textContent = \`
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
      }
      
      /* Better tap highlights */
      * {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
      }
      
      /* Prevent text selection on UI elements */
      button, a, label {
        -webkit-user-select: none;
        user-select: none;
      }
      
      /* Safe area insets for notched devices */
      .safe-top {
        padding-top: env(safe-area-inset-top);
      }
      
      .safe-bottom {
        padding-bottom: env(safe-area-inset-bottom);
      }
    \`;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="min-h-screen touch-pan-y"
    >
      <AnimatePresence>
        {isPullToRefresh && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 p-4 bg-blue-500 text-white text-center"
          >
            Release to refresh...
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
`;
  }

  // Create bottom navigation component
  createBottomNavigation() {
    return `
'use client';

import { motion } from 'framer-motion';
import { Home, Settings, Eye, FileOutput, Menu } from 'lucide-react';

export function BottomNavigation({ activeTab, onTabChange }) {
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
            className={\`flex flex-col items-center justify-center flex-1 h-full relative \${
              activeTab === id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }\`}
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
`;
  }

  // Create swipeable cards component
  createSwipeableCards() {
    return `
'use client';

import { motion, useAnimation } from 'framer-motion';
import { useState } from 'react';

export function SwipeableCard({ children, onSwipeLeft, onSwipeRight }) {
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -100, right: 100 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, { offset, velocity }) => {
        const swipe = swipePower(offset.x, velocity.x);
        
        if (swipe < -swipeConfidenceThreshold) {
          onSwipeLeft?.();
          controls.start({ x: -500, opacity: 0 });
        } else if (swipe > swipeConfidenceThreshold) {
          onSwipeRight?.();
          controls.start({ x: 500, opacity: 0 });
        } else {
          controls.start({ x: 0, opacity: 1 });
        }
        setIsDragging(false);
      }}
      animate={controls}
      whileTap={{ scale: isDragging ? 1.05 : 1 }}
      className="relative touch-none"
    >
      {children}
    </motion.div>
  );
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};
`;
  }

  // Create mobile-optimized styles
  createMobileStyles() {
    return `
/* Mobile-First Responsive Design */
@layer components {
  /* Smooth scrolling containers */
  .scroll-container {
    @apply overflow-y-auto overflow-x-hidden;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    scrollbar-width: none;
  }
  
  .scroll-container::-webkit-scrollbar {
    display: none;
  }
  
  /* Touch-friendly buttons */
  .touch-button {
    @apply min-h-[44px] min-w-[44px] flex items-center justify-center;
    @apply transition-all duration-150 active:scale-95;
    @apply rounded-lg px-4 py-2;
    -webkit-tap-highlight-color: transparent;
  }
  
  /* Mobile cards */
  .mobile-card {
    @apply bg-white dark:bg-gray-800 rounded-2xl shadow-lg;
    @apply p-4 mb-4 mx-4;
    @apply transform transition-all duration-200;
    @apply active:scale-[0.98];
  }
  
  /* Floating action button */
  .fab {
    @apply fixed bottom-20 right-4 z-30;
    @apply w-14 h-14 rounded-full shadow-lg;
    @apply flex items-center justify-center;
    @apply bg-blue-600 text-white;
    @apply transition-all duration-200 active:scale-90;
  }
  
  /* Mobile modal */
  .mobile-modal {
    @apply fixed inset-x-0 bottom-0 z-50;
    @apply bg-white dark:bg-gray-900 rounded-t-3xl;
    @apply shadow-2xl transform transition-transform duration-300;
    @apply max-h-[90vh] overflow-y-auto;
  }
  
  /* iOS-style toggle */
  .ios-toggle {
    @apply relative inline-flex h-7 w-12 items-center rounded-full;
    @apply transition-colors duration-200;
  }
  
  .ios-toggle-thumb {
    @apply inline-block h-5 w-5 transform rounded-full bg-white;
    @apply transition-transform duration-200 shadow-md;
  }
  
  /* Pull to refresh indicator */
  .pull-indicator {
    @apply absolute top-0 left-0 right-0 flex justify-center;
    @apply transition-all duration-300 ease-out;
  }
  
  /* Mobile list items */
  .mobile-list-item {
    @apply flex items-center justify-between p-4;
    @apply border-b border-gray-100 dark:border-gray-700;
    @apply transition-colors duration-150;
    @apply active:bg-gray-50 dark:active:bg-gray-800;
  }
}

/* Animations */
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

/* Mobile-specific utilities */
@media (max-width: 640px) {
  /* Prevent horizontal scroll */
  html, body {
    overflow-x: hidden;
    max-width: 100vw;
  }
  
  /* Larger touch targets */
  button, a, input, select, textarea {
    min-height: 44px;
  }
  
  /* Better spacing on mobile */
  .mobile-spacing {
    @apply px-4 py-3;
  }
  
  /* Full-width buttons on mobile */
  .mobile-full-button {
    @apply w-full;
  }
  
  /* Stack layouts on mobile */
  .mobile-stack {
    @apply flex flex-col space-y-3;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .mobile-card {
    @apply bg-gray-800 border border-gray-700;
  }
  
  .mobile-modal {
    @apply bg-gray-900 border-t border-gray-700;
  }
}

/* Landscape mode adjustments */
@media (orientation: landscape) and (max-height: 500px) {
  .bottom-navigation {
    @apply h-12;
  }
  
  .mobile-modal {
    @apply max-h-[80vh];
  }
}
`;
  }

  // Transform existing components for mobile
  transformComponents() {
    const transformations = [];

    // Input forms transformation
    transformations.push({
      file: 'InputForms',
      changes: [
        'Add touch-friendly input fields with proper sizing',
        'Implement floating labels for better space usage',
        'Add input validation with haptic feedback',
        'Create collapsible sections for complex forms',
      ],
    });

    // 3D viewer transformation
    transformations.push({
      file: 'CrateViewer3D',
      changes: [
        'Add pinch-to-zoom gesture support',
        'Implement touch-based rotation controls',
        'Add fullscreen mode for better viewing',
        'Optimize performance for mobile GPUs',
      ],
    });

    // Output section transformation
    transformations.push({
      file: 'OutputSection',
      changes: [
        'Create swipeable tabs for different outputs',
        'Add share functionality for mobile',
        'Implement copy-to-clipboard with visual feedback',
        'Add export options optimized for mobile',
      ],
    });

    return transformations;
  }

  // Generate mobile-optimized layout
  generateMobileLayout() {
    return `
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
          className={\`sticky top-0 z-30 transition-all duration-200 \${
            isScrolled
              ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md'
              : 'bg-white dark:bg-gray-900'
          }\`}
        >
          <div className="safe-top">
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  AutoCrate
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Professional Crate Design
                </p>
              </div>
              <button className="touch-button bg-blue-600 text-white">
                New
              </button>
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
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </motion.button>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </MobileWrapper>
  );
}
`;
  }

  // Run the transformation
  run() {
    console.log('\n📱 Mobile UX Transformation Agent');
    console.log('=====================================\n');

    // Analyze current state
    console.log('🔍 Analyzing current mobile UX...');
    const files = glob.sync('src/**/*.{jsx,tsx,css}', {
      ignore: ['**/node_modules/**'],
    });

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      this.stats.filesAnalyzed++;
      const issues = this.analyzeMobileUX(content, file);
      this.issues.push(...issues);
    });

    // Report findings
    console.log(`\n📊 Analysis Complete:`);
    console.log(`   Files analyzed: ${this.stats.filesAnalyzed}`);
    console.log(`   Issues found: ${this.stats.issuesFound}`);

    if (this.issues.length > 0) {
      console.log('\n⚠️  Mobile UX Issues Found:');
      this.issues.forEach((issue) => {
        console.log(`\n   📁 ${issue.file}`);
        console.log(`      Issue: ${issue.issue}`);
        console.log(`      Fix: ${issue.fix}`);
      });
    }

    // Generate transformation plan
    console.log('\n🔄 Transformation Plan:');
    const transformations = this.transformComponents();
    transformations.forEach((t) => {
      console.log(`\n   📦 ${t.file}:`);
      t.changes.forEach((change) => {
        console.log(`      ✓ ${change}`);
      });
    });

    // Create mobile components
    console.log('\n🛠  Creating Mobile Components...');

    const mobileDir = path.join(process.cwd(), 'src', 'components', 'mobile');
    if (!fs.existsSync(mobileDir)) {
      fs.mkdirSync(mobileDir, { recursive: true });
    }

    // Write mobile wrapper
    fs.writeFileSync(path.join(mobileDir, 'MobileWrapper.tsx'), this.createMobileWrapper());
    console.log('   ✓ Created MobileWrapper component');

    // Write bottom navigation
    fs.writeFileSync(path.join(mobileDir, 'BottomNavigation.tsx'), this.createBottomNavigation());
    console.log('   ✓ Created BottomNavigation component');

    // Write swipeable cards
    fs.writeFileSync(path.join(mobileDir, 'SwipeableCard.tsx'), this.createSwipeableCards());
    console.log('   ✓ Created SwipeableCard component');

    // Write mobile styles
    fs.writeFileSync(
      path.join(process.cwd(), 'src', 'styles', 'mobile.css'),
      this.createMobileStyles()
    );
    console.log('   ✓ Created mobile styles');

    // Write mobile layout
    fs.writeFileSync(
      path.join(process.cwd(), 'src', 'app', 'mobile-layout.tsx'),
      this.generateMobileLayout()
    );
    console.log('   ✓ Created mobile layout');

    // Summary
    console.log('\n✅ Mobile UX Transformation Complete!');
    console.log('\n📱 Next Steps:');
    console.log('   1. Install framer-motion: npm install framer-motion');
    console.log('   2. Test on real mobile devices');
    console.log('   3. Optimize bundle size for mobile');
    console.log('   4. Add PWA support for app-like experience');
    console.log('   5. Implement offline functionality\n');
  }
}

// Run if called directly
if (require.main === module) {
  const agent = new MobileUXAgent();
  agent.run();
}

module.exports = MobileUXAgent;
