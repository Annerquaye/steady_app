import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Users, Shield, Trash2, LogOut, ChevronRight, Eye, CreditCard, Zap } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const PLAN_NAMES = { starter: 'Starter', recovery_pro: 'Recovery Pro', elite: 'Elite Recovery' };

export default function Settings() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 1),
    initialData: [],
  });

  const sub = subscriptions?.[0];

  const handleManageBilling = async () => {
    if (!sub?.stripe_subscription_id) return;
    setPortalLoading(true);
    const res = await base44.functions.invoke('manageSubscription', {
      action: 'portal',
      subscription_id: sub.stripe_subscription_id,
    });
    if (res.data?.url) window.location.href = res.data.url;
    else setPortalLoading(false);
  };

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list(),
    initialData: [],
  });

  const profile = profiles[0];

  const updateProfile = async (updates) => {
    if (!profile) return;
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, updates);
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    setSaving(false);
  };

  const handleDeleteData = async () => {
    if (!profile) return;
    // Delete all user data
    const [urges, journals, relapses, chats, subs] = await Promise.all([
      base44.entities.UrgeLog.list(),
      base44.entities.JournalEntry.list(),
      base44.entities.RelapseLog.list(),
      base44.entities.ChatMessage.list(),
      base44.entities.Subscription.list(),
    ]);

    await Promise.all([
      ...urges.map(u => base44.entities.UrgeLog.delete(u.id)),
      ...journals.map(j => base44.entities.JournalEntry.delete(j.id)),
      ...relapses.map(r => base44.entities.RelapseLog.delete(r.id)),
      ...chats.map(c => base44.entities.ChatMessage.delete(c.id)),
      ...subs.map(s => base44.entities.Subscription.delete(s.id)),
    ]);
    await base44.entities.UserProfile.delete(profile.id);

    base44.auth.logout();
  };

  if (!profile) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-sm text-muted-foreground">Complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Your privacy, your control.</p>
      </div>

      {/* Subscription */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Subscription</h3>
        </div>
        {sub ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold">{PLAN_NAMES[sub.plan] || sub.plan}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-semibold capitalize ${sub.status === 'trialing' ? 'text-accent' : sub.status === 'active' ? 'text-primary' : 'text-destructive'}`}>
                {sub.status === 'trialing' ? `Trial (${differenceInDays(new Date(sub.trial_end), new Date())} days left)` : sub.status}
              </span>
            </div>
            {sub.current_period_end && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{sub.cancel_at_period_end ? 'Access until' : 'Next billing'}</span>
                <span className="font-medium">{format(new Date(sub.current_period_end), 'MMM d, yyyy')}</span>
              </div>
            )}
            {sub.cancel_at_period_end && (
              <div className="text-xs text-destructive bg-destructive/10 rounded-lg p-2.5">
                Your subscription will end on {format(new Date(sub.current_period_end), 'MMM d, yyyy')}.
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={handleManageBilling} disabled={portalLoading}>
              <CreditCard className="w-4 h-4" /> {portalLoading ? 'Loading...' : 'Manage Billing & Invoices'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">No active subscription. Upgrade to unlock all features.</p>
            <Button className="w-full gap-2" onClick={() => navigate('/pricing')}>
              <Zap className="w-4 h-4" /> View Plans
            </Button>
          </div>
        )}
      </div>

      {/* Accountability Partner */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Accountability Partner</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
            <Input
              value={profile.accountability_partner_name || ''}
              onChange={(e) => updateProfile({ accountability_partner_name: e.target.value })}
              placeholder="Partner's name"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
            <Input
              type="email"
              value={profile.accountability_partner_email || ''}
              onChange={(e) => updateProfile({ accountability_partner_email: e.target.value })}
              placeholder="partner@email.com"
            />
          </div>
          <div className="space-y-3 pt-2">
            <ToggleRow
              label="Weekly progress email"
              description="Send a weekly summary to your partner"
              checked={profile.send_weekly_email || false}
              onChange={(v) => updateProfile({ send_weekly_email: v })}
            />
            <ToggleRow
              label="Relapse alert"
              description="Notify partner if you relapse"
              checked={profile.send_relapse_alert || false}
              onChange={(v) => updateProfile({ send_relapse_alert: v })}
            />
            <ToggleRow
              label="Missed check-in alert"
              description="Alert if you miss a daily check-in"
              checked={profile.send_missed_checkin_alert || false}
              onChange={(v) => updateProfile({ send_missed_checkin_alert: v })}
            />
          </div>
        </div>
      </div>

      {/* Privacy Level */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Eye className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Privacy Level</h3>
        </div>
        <Select
          value={profile.privacy_level || 'minimal'}
          onValueChange={(v) => updateProfile({ privacy_level: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minimal">Minimal — streak & check-in status only</SelectItem>
            <SelectItem value="moderate">Moderate — includes urge counts</SelectItem>
            <SelectItem value="full">Full — includes triggers & mood data</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Controls what your accountability partner can see.</p>
      </div>

      {/* Privacy & Security */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Privacy & Security</h3>
        </div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>• Your data is private and encrypted</p>
          <p>• No public profiles or social features</p>
          <p>• Only you control what's shared</p>
          <p>• You can delete all data at any time</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => base44.auth.logout()}
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Log out
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full justify-between text-destructive hover:text-destructive">
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete all my data
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete all data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your profile, journal entries, urge logs, and all other data. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}