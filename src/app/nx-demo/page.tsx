'use client';

import React from 'react';
import NXInterface from '@/components/layout/NXInterface';
import { Metadata } from 'next';

export default function NXDemoPage() {
  return (
    <div className="h-screen overflow-hidden">
      <NXInterface />
    </div>
  );
}

// For now, we'll handle metadata at the layout level
// export const metadata: Metadata = {
//   title: 'AutoCrate - NX Professional Interface',
//   description: 'Professional CAD-style interface for shipping crate design',
// };