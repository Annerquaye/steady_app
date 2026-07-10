import { subDays, subHours, subMinutes } from 'date-fns';

const now = new Date();

// Profile: 32-day streak, fully onboarded
export const dummyProfile = {
  streak_start_date: subDays(now, 32).toISOString(),
  total_urges_resisted: 14,
  total_relapses: 1,
  onboarding_complete: true,
  reason_for_quitting: 'I want to be the best version of myself.',
  triggers: ['Stress', 'Boredom', 'Loneliness'],
  vulnerable_times: ['Late evening (10 PM – 12 AM)'],
  goals: ['90-day reset', 'Better focus', 'Healthier relationships'],
  privacy_level: 'moderate',
  hard_mode_enabled: true,
};

// 14 resisted + 2 relapsed urges over last 30 days
export const dummyUrges = [
  { id: 'u1', outcome: 'resisted', intensity: 7, trigger: 'Stress', created_date: subHours(now, 3).toISOString(), feeling: 'Anxious', intervention_used: 'Breathing exercise', duration_minutes: 8, time_of_day: 'Morning', notes: '' },
  { id: 'u2', outcome: 'resisted', intensity: 5, trigger: 'Boredom', created_date: subHours(now, 20).toISOString(), feeling: 'Restless', intervention_used: 'Walk outside', duration_minutes: 12, time_of_day: 'Afternoon', notes: '' },
  { id: 'u3', outcome: 'resisted', intensity: 8, trigger: 'Loneliness', created_date: subDays(now, 2).toISOString(), feeling: 'Isolated', intervention_used: 'Called accountability partner', duration_minutes: 15, time_of_day: 'Evening', notes: '' },
  { id: 'u4', outcome: 'resisted', intensity: 4, trigger: 'Stress', created_date: subDays(now, 3).toISOString(), feeling: 'Overwhelmed', intervention_used: 'Meditation', duration_minutes: 10, time_of_day: 'Morning', notes: '' },
  { id: 'u5', outcome: 'relapsed', intensity: 9, trigger: 'Boredom', created_date: subDays(now, 4).toISOString(), feeling: 'Empty', intervention_used: 'None', duration_minutes: 25, time_of_day: 'Late night', notes: '' },
  { id: 'u6', outcome: 'resisted', intensity: 6, trigger: 'Stress', created_date: subDays(now, 5).toISOString(), feeling: 'Tense', intervention_used: 'Cold shower', duration_minutes: 5, time_of_day: 'Afternoon', notes: '' },
  { id: 'u7', outcome: 'resisted', intensity: 5, trigger: 'Loneliness', created_date: subDays(now, 6).toISOString(), feeling: 'Sad', intervention_used: 'Journaling', duration_minutes: 15, time_of_day: 'Evening', notes: '' },
  { id: 'u8', outcome: 'resisted', intensity: 7, trigger: 'Boredom', created_date: subDays(now, 8).toISOString(), feeling: 'Restless', intervention_used: 'Exercise', duration_minutes: 30, time_of_day: 'Afternoon', notes: '' },
  { id: 'u9', outcome: 'resisted', intensity: 3, trigger: 'Stress', created_date: subDays(now, 10).toISOString(), feeling: 'Frustrated', intervention_used: 'Deep breathing', duration_minutes: 7, time_of_day: 'Morning', notes: '' },
  { id: 'u10', outcome: 'resisted', intensity: 6, trigger: 'Loneliness', created_date: subDays(now, 12).toISOString(), feeling: 'Disconnected', intervention_used: 'Reached out to friend', duration_minutes: 20, time_of_day: 'Evening', notes: '' },
  { id: 'u11', outcome: 'resisted', intensity: 8, trigger: 'Stress', created_date: subDays(now, 14).toISOString(), feeling: 'Anxious', intervention_used: 'Meditation', duration_minutes: 12, time_of_day: 'Morning', notes: '' },
  { id: 'u12', outcome: 'resisted', intensity: 4, trigger: 'Boredom', created_date: subDays(now, 16).toISOString(), feeling: 'Restless', intervention_used: 'Read a book', duration_minutes: 25, time_of_day: 'Afternoon', notes: '' },
  { id: 'u13', outcome: 'resisted', intensity: 7, trigger: 'Stress', created_date: subDays(now, 18).toISOString(), feeling: 'Overwhelmed', intervention_used: 'Walk', duration_minutes: 18, time_of_day: 'Evening', notes: '' },
  { id: 'u14', outcome: 'resisted', intensity: 5, trigger: 'Loneliness', created_date: subDays(now, 20).toISOString(), feeling: 'Isolated', intervention_used: 'Called friend', duration_minutes: 15, time_of_day: 'Evening', notes: '' },
  { id: 'u15', outcome: 'relapsed', intensity: 9, trigger: 'Stress', created_date: subDays(now, 24).toISOString(), feeling: 'Exhausted', intervention_used: 'None', duration_minutes: 30, time_of_day: 'Late night', notes: '' },
  { id: 'u16', outcome: 'resisted', intensity: 6, trigger: 'Boredom', created_date: subDays(now, 27).toISOString(), feeling: 'Restless', intervention_used: 'Exercise', duration_minutes: 20, time_of_day: 'Afternoon', notes: '' },
];

// Journal entries across last 30 days with varying moods
export const dummyJournals = [
  { id: 'j1', mood: 'good', energy_level: 'medium', trigger: 'Stress', context: 'Work', outcome: 'resisted', notes: 'Felt strong today. The breathing exercises really helped.', created_date: subHours(now, 5).toISOString() },
  { id: 'j2', mood: 'neutral', energy_level: 'low', trigger: 'Boredom', context: 'Home', outcome: 'resisted', notes: 'A bit restless but kept busy.', created_date: subDays(now, 1).toISOString() },
  { id: 'j3', mood: 'great', energy_level: 'high', trigger: '', context: 'Gym', outcome: 'no_urge', notes: 'Best day in a while. Focused and energized.', created_date: subDays(now, 2).toISOString() },
  { id: 'j4', mood: 'low', energy_level: 'low', trigger: 'Loneliness', context: 'Home', outcome: 'resisted', notes: 'Tough evening but I reached out to a friend.', created_date: subDays(now, 4).toISOString() },
  { id: 'j5', mood: 'good', energy_level: 'medium', trigger: 'Stress', context: 'Work', outcome: 'resisted', notes: 'Managed stress with a walk at lunch.', created_date: subDays(now, 6).toISOString() },
  { id: 'j6', mood: 'neutral', energy_level: 'medium', trigger: '', context: 'Home', outcome: 'no_urge', notes: 'Quiet day. No major urges.', created_date: subDays(now, 8).toISOString() },
  { id: 'j7', mood: 'terrible', energy_level: 'low', trigger: 'Boredom', context: 'Home', outcome: 'relapsed', notes: 'Struggled today. Need to adjust my evening routine.', created_date: subDays(now, 10).toISOString() },
  { id: 'j8', mood: 'good', energy_level: 'high', trigger: '', context: 'Outdoors', outcome: 'no_urge', notes: 'Great hike. Feeling refreshed.', created_date: subDays(now, 13).toISOString() },
  { id: 'j9', mood: 'neutral', energy_level: 'medium', trigger: 'Stress', context: 'Work', outcome: 'resisted', notes: 'Busy day but stayed calm.', created_date: subDays(now, 16).toISOString() },
  { id: 'j10', mood: 'great', energy_level: 'high', trigger: '', context: 'Family', outcome: 'no_urge', notes: 'Wonderful weekend with family.', created_date: subDays(now, 19).toISOString() },
  { id: 'j11', mood: 'low', energy_level: 'low', trigger: 'Loneliness', context: 'Home', outcome: 'resisted', notes: 'Felt alone but journaled through it.', created_date: subDays(now, 22).toISOString() },
  { id: 'j12', mood: 'good', energy_level: 'medium', trigger: 'Stress', context: 'Work', outcome: 'resisted', notes: 'Productive day, urges were manageable.', created_date: subDays(now, 25).toISOString() },
  { id: 'j13', mood: 'neutral', energy_level: 'medium', trigger: '', context: 'Home', outcome: 'no_urge', notes: 'Steady day. Grateful for progress.', created_date: subDays(now, 28).toISOString() },
];