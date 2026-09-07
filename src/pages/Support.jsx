import React from 'react';
import SupportHero from '@/components/support/SupportHero';
import ContactSection from '@/components/support/ContactSection';
import FaqSection from '@/components/support/FaqSection';
import CrisisSection from '@/components/support/CrisisSection';

export default function Support() {
  return (
    <div
      className="min-h-screen bg-background"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="max-w-2xl mx-auto px-5 py-10 space-y-10">
        <SupportHero />
        <CrisisSection />
        <FaqSection />
        <ContactSection />
        <p className="text-center text-xs text-muted-foreground pt-2">
          Recorva — build the life you deserve.
          <br />© 2026 Black Inheritance. All rights reserved.
        </p>
      </div>
    </div>
  );
}