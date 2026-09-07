import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Is my data private?',
    a: 'Yes. Everything you log in Recorva — streaks, urges, journal entries, relapse reflections — is private to your account and never shown to anyone else. If you add an accountability partner, they only receive the summary you explicitly choose to share, based on your privacy level setting.',
  },
  {
    q: 'Does Recorva replace therapy or professional treatment?',
    a: 'No. Recorva is a self-help and tracking tool designed to support your recovery journey, but it is not medical advice, diagnosis, or treatment. If you are working with a therapist, counselor, or doctor, Recorva works best alongside their guidance — not instead of it.',
  },
  {
    q: 'What happens if I relapse?',
    a: 'Nothing bad happens in the app. Relapse is a part of many recovery stories, and Recorva is built to respond with compassion, not judgment. Your streak resets so you can start fresh, and the guided reflection helps you learn from the moment and tighten what needs tightening.',
  },
  {
    q: 'How does the AI coach work?',
    a: 'The coach is an AI companion trained to offer encouragement, perspective, and practical techniques for urges and tough moments. It draws on your recent activity to personalize its responses. It is supportive company — not a licensed professional.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'Open the app, go to Settings, and tap Manage Subscription. You can cancel anytime — you keep access until the end of your current billing period, and your recovery data stays intact either way.',
  },
  {
    q: 'Can I delete my account and data?',
    a: 'Yes, completely. Go to Settings and use the Delete Account action. This permanently removes your profile, logs, and history from our servers. There is no archived copy.',
  },
];

export default function FaqSection() {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-heading font-bold text-foreground">Frequently asked questions</h2>
      </div>
      <Accordion type="single" collapsible className="bg-card border border-border rounded-2xl px-5 divide-y divide-border">
        {FAQS.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-0">
            <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-4">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}