import { base44 } from '@/api/base44Client';
import { notifyNewPartners } from '@/lib/partnerNotifications';
import { queryClientInstance } from '@/lib/query-client';

const KEY = 'recorva_guest_onboarding';

export function saveGuestOnboarding(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    // storage unavailable — guest answers simply won't carry over
  }
}

export function getGuestOnboarding() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function hasGuestOnboarding() {
  return !!getGuestOnboarding();
}

export function clearGuestOnboarding() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {}
}

const HABIT_LABELS = {
  porn: 'Porn',
  social_media: 'Social media scrolling',
  gambling: 'Gambling',
  alcohol: 'Alcohol',
  smoking: 'Smoking / vaping',
  other: 'Another habit',
};

const MOTIVATION_LABELS = {
  relationships: 'Save my relationships',
  focus: 'Regain focus & clarity',
  self_respect: 'Respect myself again',
  energy: 'Get my energy back',
  control: 'Take back my life',
  mental_health: 'Heal my mental health',
  intimacy: 'Fix intimacy problems',
  confidence: 'Build real confidence',
};

/**
 * Called right after a guest signs up / logs in.
 * Creates their profile from the onboarding answers they completed
 * as a guest, then clears the stored answers. Returns the profile
 * (existing one if the user already onboarded), or null.
 */
export async function claimGuestOnboarding() {
  const data = getGuestOnboarding();
  clearGuestOnboarding();
  if (!data) return null;

  const existing = await base44.entities.UserProfile.list();
  if (existing && existing.length > 0) return existing[0];

  const motIds = Array.isArray(data.motivation) ? data.motivation : [data.motivation];
  const motLabel = motIds.map(id => MOTIVATION_LABELS[id] || id).join(', ');

  const created = await base44.entities.UserProfile.create({
    target_habit: HABIT_LABELS[data.target_habit] || data.target_habit || '',
    reason_for_quitting: motLabel,
    triggers: data.triggers || [],
    vulnerable_times: data.vulnerable_times || [],
    goals: data.goals || [],
    accountability_partner_email: data.accountability_partner_email || '',
    accountability_partner_name: data.accountability_partner_name || '',
    onboarding_complete: true,
    streak_start_date: new Date().toISOString(),
    total_urges_resisted: 0,
    total_relapses: 0,
    blocked_websites: [],
    blocked_keywords: [],
    high_risk_apps: [],
    lockdown_windows: [],
    hard_mode_enabled: false,
    privacy_level: 'minimal',
    send_weekly_email: false,
    send_relapse_alert: false,
    send_missed_checkin_alert: false,
  });

  queryClientInstance.setQueryData(['userProfile'], (old) => [
    created,
    ...(Array.isArray(old) ? old.filter(p => p.id !== created.id) : []),
  ]);

  if (data.accountability_partner_email) {
    notifyNewPartners([{
      name: data.accountability_partner_name,
      email: data.accountability_partner_email,
    }]);
  }
  return created;
}