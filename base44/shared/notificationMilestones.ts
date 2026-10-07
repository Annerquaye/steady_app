const streakMilestones = [
  [1, 'streak_1', 'First day complete', 'You took the hardest step. Keep going.'],
  [3, 'streak_3', 'Three days strong', 'Momentum is building, one choice at a time.'],
  [7, 'streak_7', 'One week strong', 'A full week of choosing your recovery.'],
  [14, 'streak_14', 'Two weeks strong', 'Your consistency is creating real change.'],
  [30, 'streak_30', 'One month strong', 'A month of progress is worth celebrating.'],
  [60, 'streak_60', 'Two months strong', 'Your recovery is becoming a way of life.'],
  [90, 'streak_90', 'Ninety days strong', 'An extraordinary milestone. Be proud of your work.'],
  [180, 'streak_180', 'Six months strong', 'Half a year of meaningful progress.'],
  [365, 'streak_365', 'One year strong', 'One year of recovery. A remarkable achievement.']
];

const urgeMilestones = [
  [1, 'urge_1', 'First urge resisted', 'You proved that an urge can pass without taking over.'],
  [5, 'urge_5', 'Five urges resisted', 'Each win strengthens your recovery skills.'],
  [10, 'urge_10', 'Ten urges resisted', 'Your resilience is showing.'],
  [25, 'urge_25', 'Twenty-five urges resisted', 'You are building a powerful pattern of strength.'],
  [50, 'urge_50', 'Fifty urges resisted', 'That is real, practiced resilience.'],
  [100, 'urge_100', 'One hundred urges resisted', 'An incredible display of commitment.']
];

export async function createEarnedMilestones(base44, profile, userId) {
  if (profile.milestone_notifications_enabled === false) return { created: 0 };
  const journals = await base44.asServiceRole.entities.JournalEntry.filter({ created_by_id: userId });
  const resisted = journals.filter((entry) => entry.outcome === 'resisted').length;
  const streakDays = profile.streak_start_date ? Math.floor((Date.now() - new Date(profile.streak_start_date).getTime()) / 86400000) : 0;
  const allMilestones = [
    ...streakMilestones.filter(([days]) => streakDays >= days),
    ...urgeMilestones.filter(([count]) => resisted >= count)
  ];
  const existing = await base44.asServiceRole.entities.Notification.filter({ recipient_user_id: userId, type: 'milestone' });
  const existingIds = new Set(existing.map((item) => item.milestone_id));
  const earned = allMilestones.filter(([, id]) => !existingIds.has(id));
  await Promise.all(earned.map(([, milestoneId, title, message]) => base44.asServiceRole.entities.Notification.create({
    recipient_user_id: userId, type: 'milestone', title, message, milestone_id: milestoneId, is_read: false
  })));
  if (profile.push_notifications_enabled !== false) {
    await Promise.all(earned.map(async ([, , title, message]) => {
      try {
        await base44.asServiceRole.integrations.Core.SendPushNotification({ user_id: userId, title, content: message, action_url: '/' });
      } catch (_error) {
        // In-app delivery still succeeds when a native build or push permission is unavailable.
      }
    }));
  }
  return { created: earned.length };
}