import React from 'react';
import { Phone, MessageSquare, Globe, Siren, HeartHandshake } from 'lucide-react';

const CRISIS_LINES = [
  {
    icon: Phone,
    name: '988 Suicide & Crisis Lifeline',
    detail: 'Call or text 988 (US)',
    href: 'tel:988',
  },
  {
    icon: Phone,
    name: 'SAMHSA National Helpline',
    detail: '1-800-662-4357 — free, confidential, 24/7',
    href: 'tel:1-800-662-4357',
  },
  {
    icon: MessageSquare,
    name: 'Crisis Text Line',
    detail: 'Text HOME to 741741',
    href: 'sms:741741',
  },
  {
    icon: Globe,
    name: 'Outside the US',
    detail: 'Find a helpline in your country',
    href: 'https://findahelpline.com',
  },
];

export default function CrisisSection() {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Siren className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-heading font-bold text-foreground">If you're in crisis right now</h2>
      </div>

      <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-5 space-y-4">
        <p className="text-sm text-foreground leading-relaxed font-medium">
          If you are thinking about harming yourself or someone else, please stop and reach out to a real person right now. Recorva can wait. You matter more than any streak.
        </p>

        <div className="space-y-2.5">
          {CRISIS_LINES.map(({ icon: Icon, name, detail, href }) => (
            <a
              key={name}
              href={href}
              className="flex items-center gap-4 bg-card border border-accent/20 rounded-xl p-4 hover:border-accent/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </div>
            </a>
          ))}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          If you are in immediate danger, call your local emergency number (911 in the US) or go to the nearest emergency room.
        </p>
      </div>

      <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-2xl p-4">
        <HeartHandshake className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Recorva is a self-help companion, not a substitute for professional help. A streak, a relapse, or any number in this app says nothing about your worth.
        </p>
      </div>
    </section>
  );
}