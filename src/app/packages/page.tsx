'use client';

import { Suspense } from 'react';
import PackagesPageContent from './PackagesPageContent';

export default function PackagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PackagesPageContent />
    </Suspense>
  );
}
