'use client';

import { useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileWrapperProps {
  children: ReactNode;
}

export function MobileWrapper({ children }: MobileWrapperProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isPullToRefresh, setIsPullToRefresh] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);

    // Pull to refresh logic
    if (
      touchStart !== null &&
      touchStart - e.targetTouches[0].clientY < -100 &&
      window.scrollY === 0
    ) {
      setIsPullToRefresh(true);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

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
      meta.content =
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
      document.head.appendChild(meta);
    }

    // Add mobile-specific styles
    const style = document.createElement('style');
    style.textContent = `
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
    `;
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
