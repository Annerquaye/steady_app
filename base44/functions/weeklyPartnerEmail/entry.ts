import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only: only admins or scheduled automations may trigger this
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all user profiles that have an accountability partner + weekly email enabled
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      send_weekly_email: true,
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ message: 'No profiles with weekly email enabled.' });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let sent = 0;

    for (const profile of profiles) {
      // Recipients: legacy single partner + Elite multi-partner list, deduped by email
      const recipients = [
        ...(profile.accountability_partner_email ? [{ name: profile.accountability_partner_name || 'Accountability Partner', email: profile.accountability_partner_email }] : []),
        ...((profile.partners || []).filter(p => p?.email)),
      ].filter((r, i, arr) => arr.findIndex(x => x.email.toLowerCase() === r.email.toLowerCase()) === i);
      if (recipients.length === 0) continue;

      // Fetch this user's urge logs from the last 7 days
      const allUrges = await base44.asServiceRole.entities.UrgeLog.filter(
        { created_by_id: profile.created_by_id }
      );
      const recentUrges = allUrges.filter(u => new Date(u.created_date) >= oneWeekAgo);

      const resisted = recentUrges.filter(u => u.outcome === 'resisted').length;
      const relapsed = recentUrges.filter(u => u.outcome === 'relapsed').length;
      const total = recentUrges.length;
      const successRate = total > 0 ? Math.round((resisted / total) * 100) : null;

      // Fetch journal entries
      const allJournals = await base44.asServiceRole.entities.JournalEntry.filter(
        { created_by_id: profile.created_by_id }
      );
      const recentJournals = allJournals.filter(j => new Date(j.created_date) >= oneWeekAgo);
      const checkInCount = recentJournals.length;

      // Calculate streak
      const streakDays = profile.streak_start_date
        ? Math.floor((Date.now() - new Date(profile.streak_start_date)) / (1000 * 60 * 60 * 24))
        : 0;

      // Build email based on privacy level
      const privacyLevel = profile.privacy_level || 'minimal';
      const buildEmailBody = (partnerName) => {

      let summaryLines = [];

      if (privacyLevel === 'minimal') {
        summaryLines = [
          `• Current streak: <strong>${streakDays} day${streakDays !== 1 ? 's' : ''}</strong>`,
          `• Weekly check-ins completed: <strong>${checkInCount}</strong>`,
        ];
      } else if (privacyLevel === 'moderate') {
        summaryLines = [
          `• Current streak: <strong>${streakDays} day${streakDays !== 1 ? 's' : ''}</strong>`,
          `• Weekly check-ins completed: <strong>${checkInCount}</strong>`,
          `• Urges this week: <strong>${total}</strong>`,
          successRate !== null ? `• Success rate: <strong>${successRate}%</strong>` : null,
        ].filter(Boolean);
      } else {
        // full
        summaryLines = [
          `• Current streak: <strong>${streakDays} day${streakDays !== 1 ? 's' : ''}</strong>`,
          `• Weekly check-ins completed: <strong>${checkInCount}</strong>`,
          `• Urges this week: <strong>${total}</strong> (${resisted} resisted, ${relapsed} relapsed)`,
          successRate !== null ? `• Urge success rate: <strong>${successRate}%</strong>` : null,
          `• Total urges resisted (all time): <strong>${profile.total_urges_resisted || 0}</strong>`,
        ].filter(Boolean);
      }

      const encouragement = streakDays >= 30
        ? "They're achieving something truly remarkable. Over a month of sustained effort!"
        : streakDays >= 7
        ? "They've made it through a full week — real progress is happening."
        : streakDays >= 1
        ? "They're taking it one day at a time and showing up consistently."
        : "Every journey has tough moments. Your support means a great deal right now.";

      return `
<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2a3a2a;">
  <div style="background: linear-gradient(135deg, #e8f5e9, #f1f8e9); padding: 32px 28px; border-radius: 16px 16px 0 0; text-align: center;">
    <div style="font-size: 40px; margin-bottom: 8px;">🌿</div>
    <h1 style="font-size: 22px; margin: 0; color: #2e7d52;">Weekly Recovery Update</h1>
    <p style="font-size: 14px; color: #555; margin-top: 6px;">A note for ${partnerName}</p>
  </div>

  <div style="background: #fff; padding: 28px; border: 1px solid #d8ead8; border-top: none; border-radius: 0 0 16px 16px;">
    <p style="font-size: 15px; line-height: 1.6; color: #333;">
      Hi ${partnerName},<br><br>
      Here's a brief update on your person's recovery journey this past week.
    </p>

    <div style="background: #f7faf7; border-left: 4px solid #4caf7d; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
      <p style="font-weight: bold; margin: 0 0 10px; color: #2e7d52; font-size: 14px;">📊 This Week's Summary</p>
      ${summaryLines.map(l => `<p style="margin: 6px 0; font-size: 14px; color: #333;">${l}</p>`).join('')}
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #555; background: #fffde7; border-radius: 8px; padding: 14px 18px;">
      💛 <em>${encouragement}</em>
    </p>

    <p style="font-size: 13px; color: #888; margin-top: 24px; text-align: center;">
      This summary is sent automatically from their recovery companion app.<br>
      Your support makes a real difference. Thank you.
    </p>
  </div>
</div>
      `.trim();
      };

      for (const r of recipients) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: r.email,
          subject: `Weekly Recovery Update — Day ${streakDays} 🌿`,
          body: buildEmailBody(r.name),
        });

        sent++;
      }
    }

    return Response.json({ message: `Sent ${sent} weekly email(s).` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});