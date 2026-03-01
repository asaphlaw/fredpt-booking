'use client';

import { Suspense } from 'react';
import DashboardPageContent from './DashboardPageContent';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}
