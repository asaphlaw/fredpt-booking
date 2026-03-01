'use client';

import { Suspense } from 'react';
import BookPageContent from './BookPageContent';

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookPageContent />
    </Suspense>
  );
}
