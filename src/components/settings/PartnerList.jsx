import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

const MAX_PARTNERS = 5;

export default function PartnerList({ profile, updateProfile }) {
  const initial = (profile.partners && profile.partners.length)
    ? profile.partners
    : profile.accountability_partner_email
      ? [{ name: profile.accountability_partner_name || '', email: profile.accountability_partner_email }]
      : [];
  const [partners, setPartners] = useState(initial.map(p => ({ name: p.name || '', email: p.email || '' })));

  const persist = (list) => {
    updateProfile({ partners: list.filter(p => (p.email || '').trim() || (p.name || '').trim()) });
  };

  const update = (i, field, value) => {
    setPartners(prev => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  };

  const add = () => {
    setPartners(prev => [...prev, { name: '', email: '' }]);
  };

  const remove = (i) => {
    const next = partners.filter((_, idx) => idx !== i);
    setPartners(next);
    persist(next);
  };

  return (
    <div className="space-y-3">
      {partners.map((p, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1 space-y-2">
            <Input
              value={p.name}
              onChange={(e) => update(i, 'name', e.target.value)}
              onBlur={() => persist(partners)}
              placeholder="Partner's name"
              className="h-10"
            />
            <Input
              type="email"
              value={p.email}
              onChange={(e) => update(i, 'email', e.target.value)}
              onBlur={() => persist(partners)}
              placeholder="partner@email.com"
              className="h-10"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => remove(i)}
            className="text-muted-foreground hover:text-destructive flex-shrink-0"
            aria-label="Remove partner"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      {partners.length < MAX_PARTNERS && (
        <Button variant="outline" onClick={add} className="w-full gap-2">
          <Plus className="w-4 h-4" /> Add partner
        </Button>
      )}
      <p className="text-xs text-muted-foreground">
        Up to {MAX_PARTNERS} partners. Weekly summaries and alerts go to everyone on this list.
      </p>
    </div>
  );
}