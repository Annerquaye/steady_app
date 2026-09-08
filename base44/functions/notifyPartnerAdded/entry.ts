import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // Runs as the logged-in user who just added the partner(s)
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { partners = [] } = await req.json().catch(() => ({}));

    const seen = new Set();
    const recipients = (partners || [])
      .filter(p => p?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(p.email).trim()))
      .filter(p => {
        const key = String(p.email).trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    if (recipients.length === 0) {
      return Response.json({ message: 'No valid partner emails to notify.' });
    }

    const userName = user.full_name || user.email || 'Someone';

    const buildBody = (partnerName: string) => `
<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2a3a2a;">
  <div style="background: linear-gradient(135deg, #e8f5e9, #f1f8e9); padding: 32px 28px; border-radius: 16px 16px 0 0; text-align: center;">
    <div style="font-size: 40px; margin-bottom: 8px;">🤝</div>
    <h1 style="font-size: 22px; margin: 0; color: #2e7d52;">You're Their Person</h1>
  </div>

  <div style="background: #fff; padding: 28px; border: 1px solid #d8ead8; border-top: none; border-radius: 0 0 16px 16px;">
    <p style="font-size: 15px; line-height: 1.6; color: #333;">
      ${partnerName ? `Hi ${partnerName},` : 'Hi,'}<br><br>
      <strong>${userName}</strong> has added you as an accountability partner in Recorva, their private recovery companion app.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #555;">
      What that means: they may choose to share occasional updates with you — a weekly progress summary, or a note when they're having a hard moment and could use your support.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #555; background: #fffde7; border-radius: 8px; padding: 14px 18px;">
      💛 <em>You don't need to do anything to accept. A kind check-in now and then, and judgment-free listening, is exactly what they're hoping for.</em>
    </p>
    <p style="font-size: 13px; color: #888; margin-top: 24px; text-align: center;">
      They control exactly what gets shared and can remove you at any time.<br>
      This message was sent at their request from Recorva.
    </p>
  </div>
</div>
    `.trim();

    let sent = 0;
    for (const r of recipients) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: String(r.email).trim(),
          subject: "You've been added as an accountability partner 🌿",
          body: buildBody(String(r.name || '').trim()),
        });
        sent++;
      } catch (e) {
        console.error('notifyPartnerAdded: send failed for', r.email, e?.message);
      }
    }

    return Response.json({ message: `Sent ${sent} welcome email(s).`, total: recipients.length });
  } catch (error) {
    console.error('notifyPartnerAdded failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}