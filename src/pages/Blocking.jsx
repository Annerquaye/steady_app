import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Shield, Plus, X, Globe, Search, Smartphone, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Blocking() {
  const queryClient = useQueryClient();
  const [newSite, setNewSite] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newApp, setNewApp] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list(),
    initialData: [],
  });

  const profile = profiles[0];

  const updateProfile = async (updates) => {
    if (!profile || saving) return;
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, updates);
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    setSaving(false);
  };

  const addToList = (field, value, setter) => {
    if (!value.trim() || !profile || saving) return;
    const current = profile[field] || [];
    updateProfile({ [field]: [...current, value.trim()] });
    setter('');
  };

  const removeFromList = (field, index) => {
    if (!profile) return;
    const current = [...(profile[field] || [])];
    current.splice(index, 1);
    updateProfile({ [field]: current });
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
        <h1 className="text-2xl font-heading font-bold">Protection</h1>
        <p className="text-sm text-muted-foreground">Build your digital defenses.</p>
      </div>

      {/* Hard Mode Toggle */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Hard Mode</h3>
              <p className="text-xs text-muted-foreground">Maximum protection during vulnerable hours</p>
            </div>
          </div>
          <Switch
            checked={profile.hard_mode_enabled || false}
            onCheckedChange={(checked) => updateProfile({ hard_mode_enabled: checked })}
          />
        </div>
      </div>

      {/* Blocked Websites */}
      <Section
        icon={Globe}
        title="Blocked websites"
        description="Domains to block"
      >
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="example.com"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addToList('blocked_websites', newSite, setNewSite)}
          />
          <Button size="icon" variant="outline" onClick={() => addToList('blocked_websites', newSite, setNewSite)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <TagList items={profile.blocked_websites || []} onRemove={(i) => removeFromList('blocked_websites', i)} />
      </Section>

      {/* Blocked Keywords */}
      <Section
        icon={Search}
        title="Blocked keywords"
        description="Search terms to block"
      >
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="keyword"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addToList('blocked_keywords', newKeyword, setNewKeyword)}
          />
          <Button size="icon" variant="outline" onClick={() => addToList('blocked_keywords', newKeyword, setNewKeyword)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <TagList items={profile.blocked_keywords || []} onRemove={(i) => removeFromList('blocked_keywords', i)} />
      </Section>

      {/* High Risk Apps */}
      <Section
        icon={Smartphone}
        title="High-risk apps"
        description="Apps to be mindful about"
      >
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="App name"
            value={newApp}
            onChange={(e) => setNewApp(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addToList('high_risk_apps', newApp, setNewApp)}
          />
          <Button size="icon" variant="outline" onClick={() => addToList('high_risk_apps', newApp, setNewApp)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <TagList items={profile.high_risk_apps || []} onRemove={(i) => removeFromList('high_risk_apps', i)} />
      </Section>

      {/* Info */}
      <div className="bg-secondary/50 rounded-xl p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <Shield className="w-3 h-3 inline mr-1" />
          These lists help you stay aware of your digital environment. For full device-level blocking, 
          we recommend pairing this app with a DNS-level blocker or browser extension.
        </p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function TagList({ items, onRemove }) {
  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground">None added yet.</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium"
        >
          {item}
          <button onClick={() => onRemove(i)} className="hover:text-destructive transition-colors">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}