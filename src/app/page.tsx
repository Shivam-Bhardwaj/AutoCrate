'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DashboardShell from '@/components/layout/DashboardShell';
import Topbar from '@/components/layout/Topbar';
import MainContent from '@/components/layout/MainContent';
import RightPanel from '@/components/layout/RightPanel';
import InputForms from '@/components/InputForms.clean';

// Dynamic imports for better performance
const MobileV2 = dynamic(() => import('./mobile-v2'), {
  ssr: false,
});

export default function AutoCratePage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [_isMobile, setIsMobile] = useState(false);
  const [isHydrated, setHydrated] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Force hydration after a timeout if it doesn't happen naturally
  useEffect(() => {
    if (!isHydrated) {
      const id = setTimeout(() => {
        try {
          setHydrated(true);
        } catch {
          /* noop */
        }
      }, 50);
      return () => clearTimeout(id);
    }
  }, [isHydrated]);

  // In test builds (E2E) always force desktop layout so selectors are stable.
  const _IS_TEST_BUILD = process.env.NODE_ENV === 'test';
  // Use responsive design - mobile layout for very small screens only
  if (_isMobile && window.innerWidth < 480 && !_IS_TEST_BUILD) {
    return <MobileV2 />;
  }

  // Render the professional dashboard layout
  return (
    <DashboardShell
      topbar={<Topbar showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />}
      sidebar={<InputForms />}
      main={<MainContent />}
      rightPanel={<RightPanel />}
    />
  );
}