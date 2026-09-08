import { base44 } from '@/api/base44Client';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sends a welcome email to newly added accountability partners via the
// notifyPartnerAdded backend function. Fire-and-forget: a failed email
// should never block saving the profile.
export function notifyNewPartners(partners) {
  const valid = (partners || [])
    .map(p => ({ name: (p?.name || '').trim(), email: (p?.email || '').trim() }))
    .filter(p => p.email && EMAIL_RE.test(p.email));
  if (!valid.length) return;
  base44.functions.invoke('notifyPartnerAdded', { partners: valid }).catch(() => {});
}