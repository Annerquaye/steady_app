import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { createEarnedMilestones } from '../../shared/notificationMilestones.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const profiles = await base44.entities.UserProfile.list();
    const profile = profiles[0];
    if (!profile) return Response.json({ created: 0 });
    return Response.json(await createEarnedMilestones(base44, profile, user.id));
  } catch (error) {
    console.error('createMilestoneNotifications failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}