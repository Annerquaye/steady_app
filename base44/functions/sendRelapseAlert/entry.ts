import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Runs as the logged-in user completing a relapse reflection
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profiles = await base44.entities.UserProfile.list();
    const profile = profiles[0];
    if (!profile) {
      return Response.json({ error: 'No profile found' }, { status: 404 });
    }

    // Recipients: legacy single partner + Elite multi-partner list, deduped by email
    const recipients = [
      ...(profile.accountability_partner_email ? [{ name: profile.accountability_partner_name || 'Accountability Partner', email: profile.accountability_partner_email }] : []),
      ...((profile.partners || []).filter(p => p?.email)),
    ].filter((r, i, arr) => arr.findIndex(x => x.email.toLowerCase() === r.email.toLowerCase()) === i);

    if (recipients.length === 0) {
      return Response.json({ message: 'No accountability partner configured.' });
    }

    // Length of the streak that just ended (before the reset)
    const streakStart = profile.streak_start_date ? new Date(profile.streak_start_date) : new Date();
    const streakDays = Math.max(0, Math.floor((Date.now() - streakStart.getTime()) / (1000 * 60 * 60 * 24)));

    const buildBody = (partnerName) => `
<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2a3a2a;">
  <div style="background: linear-gradient(135deg, #e8f5e9, #f1f8e9); padding: 32px 28px; border-radius: 16px 16px 0 0; text-align: center;">
    <div style="font-size: 40px; margin-bottom: 8px;">🌿</div>
    <h1 style="font-size: 22px; margin: 0; color: #2e7d52;">A Moment for Support</h1>
    <p style="font-size: 14px; color: #555; margin-top: 6px;">A note for ${partnerName}</p>
  </div>

  <div style="background: #fff; padding: 28px; border: 1px solid #d8ead8; border-top: none; border-radius: 0 0 16px 16px;">
    <p style="font-size: 15px; line-height: 1.6; color: #333;">
      Hi ${partnerName},<br><br>
      Your person chose to share a difficult moment with you: they experienced a setback today on their recovery journey.
    </p>
    ${streakDays > 0 ? `
    <p style="font-size: 14px; line-height: 1.6; color: #555;">
      Before this, they had built a <strong>${streakDays}-day</strong> streak — real proof of their commitment and capability.
    </p>` : ''}
    <p style="font-size: 14px; line-height: 1.6; color: #555; background: #fffde7; border-radius: 8px; padding: 14px 18px;">
      💛 <em>Setbacks are part of change, not the end of it. They are already reflecting on what happened. A kind, judgment-free message from you right now can make a real difference.</em>
    </p>
    <p style="font-size: 13px; color: #888; margin-top: 24px; text-align: center;">
      This message was sent at their request from their recovery companion app.<br>
      Thank you for standing by them.
    </p>
  </div>
</div>
    `.trim();

    for (const r of recipients) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: r.email,
        subject: 'They could use your support today 🌿',
        body: buildBody(r.name),
      });
    }

    return Response.json({ message: `Sent ${recipients.length} relapse alert(s).` });
  } catch (error) {
    console.error('sendRelapseAlert failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});