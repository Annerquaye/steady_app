import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// One-time setup: prepares the Apple review account (recorvaadmin@gmail.com) with
// a completed profile, an active Elite subscription, and sample recovery data.
// Idempotent: safe to re-run; skips anything the reviewer already has.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const REVIEWER_EMAIL = 'recorvaadmin@gmail.com';
    const svc = base44.asServiceRole;

    // 1. Find the reviewer account
    const users = await svc.entities.User.filter({ email: REVIEWER_EMAIL });
    const reviewer = users[0];
    if (!reviewer) return Response.json({ error: `No user found for ${REVIEWER_EMAIL}. Invite the account first.` }, { status: 404 });

    const now = Date.now();
    const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

    // 2. Profile (skip if one already exists for the reviewer)
    const existingProfiles = await svc.entities.UserProfile.filter({ created_by_id: reviewer.id });
    let profileId = existingProfiles[0]?.id;
    if (!profileId) {
      const profile = await svc.entities.UserProfile.create({
        created_by_id: reviewer.id,
        reason_for_quitting: 'I want to be present for my family, rebuild my confidence, and take back control of my time and attention.',
        triggers: ['Boredom', 'Stress', 'Late-night scrolling'],
        vulnerable_times: ['Late night (11pm–1am)', 'Weekend afternoons'],
        goals: ['Reach 90 days', 'Better sleep', 'More focused work'],
        onboarding_complete: true,
        streak_start_date: daysAgo(26),
        total_urges_resisted: 8,
        total_relapses: 0,
        privacy_level: 'minimal',
        send_weekly_email: false,
        send_relapse_alert: false,
        send_missed_checkin_alert: false,
      });
      profileId = profile.id;
    }

    // 3. Active Elite subscription (skip if one already exists)
    const existingSubs = await svc.entities.Subscription.filter({ created_by_id: reviewer.id });
    let subId = existingSubs[0]?.id;
    if (!subId) {
      const sub = await svc.entities.Subscription.create({
        created_by_id: reviewer.id,
        plan: 'elite',
        status: 'active',
        billing_interval: 'year',
        email: REVIEWER_EMAIL,
        current_period_start: daysAgo(0),
        current_period_end: daysAgo(-365),
        cancel_at_period_end: false,
      });
      subId = sub.id;
    }

    // 4. Sample urge logs (skip if the reviewer already has any)
    const existingUrges = await svc.entities.UrgeLog.filter({ created_by_id: reviewer.id });
    let urgeIds = [];
    if (existingUrges.length === 0) {
      const urgeSeeds = [
        { days: 25, trigger: 'Boredom', intensity: 4, time_of_day: '21:40', intervention_used: 'Went for a walk', duration_minutes: 6 },
        { days: 22, trigger: 'Stress', intensity: 7, time_of_day: '23:15', intervention_used: 'Urge Emergency Mode', duration_minutes: 11 },
        { days: 18, trigger: 'Late-night scrolling', intensity: 5, time_of_day: '00:30', intervention_used: 'Phone out of bedroom', duration_minutes: 8 },
        { days: 15, trigger: 'Boredom', intensity: 3, time_of_day: '15:20', intervention_used: 'Read a book', duration_minutes: 4 },
        { days: 12, trigger: 'Stress', intensity: 6, time_of_day: '22:50', intervention_used: 'Cold shower', duration_minutes: 9 },
        { days: 8, trigger: 'Loneliness', intensity: 5, time_of_day: '21:05', intervention_used: 'Called a friend', duration_minutes: 7 },
        { days: 4, trigger: 'Late-night scrolling', intensity: 2, time_of_day: '23:55', intervention_used: 'Went to bed early', duration_minutes: 3 },
        { days: 1, trigger: 'Boredom', intensity: 3, time_of_day: '20:10', intervention_used: 'Exercise', duration_minutes: 5 },
      ];
      const created = await svc.entities.UrgeLog.bulkCreate(
        urgeSeeds.map((s) => ({
          created_by_id: reviewer.id,
          outcome: 'resisted',
          feeling: 'Restless',
          trigger: s.trigger,
          intensity: s.intensity,
          time_of_day: s.time_of_day,
          intervention_used: s.intervention_used,
          duration_minutes: s.duration_minutes,
        }))
      );
      urgeIds = created.map((u) => u.id);
    }

    // 5. Sample journal entries (skip if the reviewer already has any)
    const existingJournals = await svc.entities.JournalEntry.filter({ created_by_id: reviewer.id });
    let journalIds = [];
    if (existingJournals.length === 0) {
      const journalSeeds = [
        { days: 24, mood: 'good', outcome: 'no_urge', energy_level: 'high', notes: 'Had a productive day. Went to the gym and felt great.' },
        { days: 19, mood: 'low', outcome: 'resisted', energy_level: 'low', trigger: 'Stress', context: 'Home, evening', notes: 'Rough day at work. Used the breathing exercise and the urge passed.' },
        { days: 13, mood: 'good', outcome: 'no_urge', energy_level: 'medium', notes: 'Spent the day with family. Feeling more present.' },
        { days: 7, mood: 'great', outcome: 'no_urge', energy_level: 'high', notes: 'Best day in a while. Slept 8 hours and got outside early.' },
        { days: 2, mood: 'neutral', outcome: 'resisted', energy_level: 'medium', trigger: 'Late-night scrolling', notes: 'Caught myself reaching for the phone out of habit. Put it on the charger in the kitchen.' },
      ];
      const created = await svc.entities.JournalEntry.bulkCreate(
        journalSeeds.map((s) => ({
          created_by_id: reviewer.id,
          mood: s.mood,
          outcome: s.outcome,
          energy_level: s.energy_level,
          trigger: s.trigger || null,
          context: s.context || null,
          notes: s.notes,
        }))
      );
      journalIds = created.map((j) => j.id);
    }

    return Response.json({
      ok: true,
      reviewer: { id: reviewer.id, email: reviewer.email },
      profileId,
      subscriptionId: subId,
      urgesCreated: urgeIds.length,
      journalsCreated: journalIds.length,
    });
  } catch (error) {
    console.error('seedReviewerAccount error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}