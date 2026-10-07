import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const datePart = (date, timezone) => new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(date);
const timePart = (date, timezone) => new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(date);

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    let created = 0;
    for (const profile of profiles) {
      if (profile.daily_reminder_enabled === false) continue;
      const timezone = profile.notification_timezone || 'America/New_York';
      const now = new Date();
      if (timePart(now, timezone) !== (profile.daily_reminder_time || '20:00')) continue;
      const today = datePart(now, timezone);
      const journals = await base44.asServiceRole.entities.JournalEntry.filter({ created_by_id: profile.created_by_id });
      if (journals.some((entry) => datePart(new Date(entry.created_date), timezone) === today)) continue;
      const existing = await base44.asServiceRole.entities.Notification.filter({ recipient_user_id: profile.created_by_id, type: 'daily_reminder', notification_date: today });
      if (existing.length) continue;
      const title = 'Time for your check-in';
      const message = 'Take 30 seconds to reflect on your day and keep your recovery on track.';
      await base44.asServiceRole.entities.Notification.create({ recipient_user_id: profile.created_by_id, type: 'daily_reminder', title, message, notification_date: today, is_read: false });
      if (profile.push_notifications_enabled !== false) {
        try {
          await base44.asServiceRole.integrations.Core.SendPushNotification({ user_id: profile.created_by_id, title, content: message, action_url: '/' });
        } catch (_error) {
          // The in-app reminder is retained when native push is unavailable.
        }
      }
      created++;
    }
    return Response.json({ created });
  } catch (error) {
    console.error('sendDailyReminders failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}