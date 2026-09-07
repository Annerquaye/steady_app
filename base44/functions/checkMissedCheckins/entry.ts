import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Alerts are evaluated in the owner's timezone (America/New_York)
const TIMEZONE = 'America/New_York';
const dateStr = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(d);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only: only admins or scheduled automations may trigger this
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    let payload = {};
    try { payload = await req.json(); } catch (_e) {}
    const dryRun = payload?.dry_run === true;

    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      send_missed_checkin_alert: true,
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ message: 'No profiles with missed check-in alerts enabled.' });
    }

    const today = dateStr(new Date());
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    let sent = 0;
    const alerts = [];

    for (const profile of profiles) {
      const recipients = [
        ...(profile.accountability_partner_email ? [{ name: profile.accountability_partner_name || 'Accountability Partner', email: profile.accountability_partner_email }] : []),
        ...((profile.partners || []).filter(p => p?.email)),
      ].filter((r, i, arr) => arr.findIndex(x => x.email.toLowerCase() === r.email.toLowerCase()) === i);
      if (recipients.length === 0) continue;

      // Grace period: don't alert for brand-new profiles
      if (profile.created_date && new Date(profile.created_date).getTime() > oneDayAgo) continue;

      const journals = await base44.asServiceRole.entities.JournalEntry.filter(
        { created_by_id: profile.created_by_id }
      );
      const checkedInToday = journals.some(j => dateStr(new Date(j.created_date)) === today);
      if (checkedInToday) continue;

      if (dryRun) {
        alerts.push({ profile_id: profile.id, recipients: recipients.map(r => r.email) });
        continue;
      }

      const buildBody = (partnerName) => `
<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2a3a2a;">
  <div style="background: linear-gradient(135deg, #e8f5e9, #f1f8e9); padding: 32px 28px; border-radius: 16px 16px 0 0; text-align: center;">
    <div style="font-size: 40px; margin-bottom: 8px;">🌿</div>
    <h1 style="font-size: 22px; margin: 0; color: #2e7d52;">A Gentle Nudge</h1>
    <p style="font-size: 14px; color: #555; margin-top: 6px;">A note for ${partnerName}</p>
  </div>

  <div style="background: #fff; padding: 28px; border: 1px solid #d8ead8; border-top: none; border-radius: 0 0 16px 16px;">
    <p style="font-size: 15px; line-height: 1.6; color: #333;">
      Hi ${partnerName},<br><br>
      Your person hasn't logged their daily check-in yet today.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #555; background: #fffde7; border-radius: 8px; padding: 14px 18px;">
      💛 <em>Nothing is wrong — this is a light-touch nudge. A quick, friendly check-in message from you might be just the encouragement they need to stay on track today.</em>
    </p>
    <p style="font-size: 13px; color: #888; margin-top: 24px; text-align: center;">
      This summary is sent automatically from their recovery companion app.<br>
      Your support makes a real difference. Thank you.
    </p>
  </div>
</div>
      `.trim();

      for (const r of recipients) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: r.email,
          subject: 'A gentle nudge 🌿',
          body: buildBody(r.name),
        });
        sent++;
      }
    }

    return Response.json(dryRun ? { dry_run: true, alerts } : { message: `Sent ${sent} missed check-in alert(s).` });
  } catch (error) {
    console.error('checkMissedCheckins failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});