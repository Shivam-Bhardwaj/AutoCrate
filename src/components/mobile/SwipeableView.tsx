'use client';

import { useState, useRef, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface SwipeableViewProps {
  views: {
    id: string;
    title: string;
    icon?: ReactNode;
    content: ReactNode;
  }[];
  onViewChange?: (index: number) => void;
}

export function SwipeableView({ views, onViewChange }: SwipeableViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const constraintsRef = useRef(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    
    if (info.offset.x > swipeThreshold && currentIndex > 0) {
      // Swipe right - go to previous
      setCurrentIndex(currentIndex - 1);
      onViewChange?.(currentIndex - 1);
    } else if (info.offset.x < -swipeThreshold && currentIndex < views.length - 1) {
      // Swipe left - go to next
      setCurrentIndex(currentIndex + 1);
      onViewChange?.(currentIndex + 1);
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Tab indicators */}
      <div className="flex justify-center gap-2 py-2">
        {views.map((view, index) => (
          <button
            key={view.id}
            onClick={() => {
              setCurrentIndex(index);
              onViewChange?.(index);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-8 bg-primary' 
                : 'w-2 bg-gray-300 dark:bg-gray-600'
            }`}
            aria-label={`View ${view.title}`}
          />
        ))}
      </div>

      {/* Swipeable content */}
      <div className="flex-1 relative overflow-hidden" ref={constraintsRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {views[currentIndex].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}