import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const messages = [
  "You're not trying to win one heroic battle. You're redesigning the conditions that keep pulling you back.",
  "Recovery isn't about perfection. It's about showing up for yourself again and again.",
  "The urge is temporary. The person you're becoming is permanent.",
  "Every time you choose differently, you're proving to yourself that you can.",
  "You don't have to be strong all the time. You just have to be honest.",
  "Small wins compound. Trust the process.",
  "Your brain is literally rewiring itself right now. Keep going.",
  "The goal isn't to never feel an urge. It's to feel one and choose yourself anyway.",
  "Discomfort is the currency of growth. You're investing in yourself.",
  "You're not just quitting something. You're becoming someone.",
  "Progress isn't always visible, but it's always happening.",
  "The version of you that decided to change is already winning.",
  "Freedom isn't the absence of desire. It's the power to choose.",
  "You've survived 100% of your hardest days. This one is no different.",
];

export default function DailyMessage() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setMessage(messages[dayOfYear % messages.length]);
  }, []);

  return (
    <div className="bg-card rounded-2xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Daily reflection</span>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90 italic font-light">
        "{message}"
      </p>
    </div>
  );
}