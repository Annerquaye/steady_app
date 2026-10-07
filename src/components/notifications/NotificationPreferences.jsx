import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

export default function NotificationPreferences({ profile, updateProfile }) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
    <div><h3 className="text-sm font-semibold">Notifications</h3><p className="text-xs text-muted-foreground">Choose how Recorva supports your routine.</p></div>
    <Row label="Daily check-in reminder" description="A reminder at your chosen time" checked={profile.daily_reminder_enabled !== false} onChange={(value) => updateProfile({ daily_reminder_enabled: value, notification_timezone: timezone })} />
    {profile.daily_reminder_enabled !== false && <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Reminder time</label><Input type="time" value={profile.daily_reminder_time || '20:00'} onChange={(event) => updateProfile({ daily_reminder_time: event.target.value, notification_timezone: timezone })} /></div>}
    <Row label="Milestone celebrations" description="Celebrate streak and urge-resistance progress" checked={profile.milestone_notifications_enabled !== false} onChange={(value) => updateProfile({ milestone_notifications_enabled: value })} />
    <Row label="Device notifications" description="Requires notification permission on your device" checked={profile.push_notifications_enabled !== false} onChange={(value) => updateProfile({ push_notifications_enabled: value })} />
  </div>;
}
function Row({ label, description, checked, onChange }) { return <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{description}</p></div><Switch checked={checked} onCheckedChange={onChange} /></div>; }