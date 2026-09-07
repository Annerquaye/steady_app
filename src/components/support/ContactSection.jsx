import React from 'react';
import { Mail, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContactSection() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-heading font-bold text-foreground">Get in touch</h2>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <a
          href="mailto:support@recorva.app"
          className="flex items-center gap-4 p-5 hover:bg-secondary/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">Email us</p>
            <p className="text-sm text-muted-foreground truncate">support@recorva.app</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </a>
        <div className="border-t border-border flex items-center gap-4 p-5">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Response time</p>
            <p className="text-sm text-muted-foreground">We reply within 1–2 business days.</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground px-1">
        For anything about your data or billing, see our{' '}
        <Link to="/privacy" className="text-primary underline underline-offset-2">Privacy Policy</Link>{' '}
        and{' '}
        <Link to="/terms" className="text-primary underline underline-offset-2">Terms of Service</Link>.
      </p>
    </section>
  );
}