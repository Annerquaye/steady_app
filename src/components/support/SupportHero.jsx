import React from 'react';
import { LifeBuoy } from 'lucide-react';

export default function SupportHero() {
  return (
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 border border-primary/15 mb-5">
        <LifeBuoy className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-heading font-extrabold text-foreground">Recorva Support</h1>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
        Questions, concerns, or just need a hand? You're not alone in this — and you're never alone in using the app either.
      </p>
    </div>
  );
}