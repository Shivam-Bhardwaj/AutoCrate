'use client';

import { motion, useAnimation } from 'framer-motion';
import { useState, ReactNode } from 'react';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function SwipeableCard({ children, onSwipeLeft, onSwipeRight }: SwipeableCardProps) {
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
const swipePower = (offset: number, velocity: number): number => {
  return Math.abs(offset) * velocity;
};
