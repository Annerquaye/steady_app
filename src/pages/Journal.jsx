import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MobileSelect } from '@/components/ui/MobileSelect';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Plus, BookHeart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const moodEmojis = { great: '😊', good: '🙂', neutral: '😐', low: '😔', terrible: '😞' };
const moodLabels = { great: 'Great', good: 'Good', neutral: 'Neutral', low: 'Low', terrible: 'Terrible' };

const TRIGGERS = [
  'Boredom', 'Stress', 'Loneliness', 'Anxiety', 'Tiredness',
  'Social media', 'Being alone', 'Alcohol', 'Late night', 'None'
];

export default function Journal() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [entry, setEntry] = useState({
    mood: '', trigger: '', context: '', outcome: 'no_urge', notes: '', energy_level: 'medium'
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date', 30),
    initialData: [],
  });

  const EMPTY_ENTRY = { mood: '', trigger: '', context: '', outcome: 'no_urge', notes: '', energy_level: 'medium' };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.JournalEntry.create(data),
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: ['journals'] });
      const previous = queryClient.getQueryData(['journals']);
      const optimistic = { ...newEntry, id: `temp-${Date.now()}`, created_date: new Date().toISOString() };
      queryClient.setQueryData(['journals'], (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['journals'], ctx.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      setShowForm(false);
      setEntry(EMPTY_ENTRY);
    },
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Journal</h1>
          <p className="text-sm text-muted-foreground">Track patterns, build awareness.</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="gap-1.5 rounded-full"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Log'}
        </Button>
      </div>

      {/* New Entry Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              {/* Mood */}
              <div>
                <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
                <div className="flex gap-2">
                  {Object.entries(moodEmojis).map(([key, emoji]) => (
                    <button
                      key={key}
                      onClick={() => setEntry({ ...entry, mood: key })}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all text-center",
                        entry.mood === key
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary hover:bg-secondary/80"
                      )}
                    >
                      <span className="text-xl">{emoji}</span>
                      <span className="text-[10px] font-medium">{moodLabels[key]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger */}
              <div>
                <label className="text-sm font-medium mb-2 block">Any trigger?</label>
                <div className="flex flex-wrap gap-1.5">
                  {TRIGGERS.map(t => (
                    <button
                      key={t}
                      onClick={() => setEntry({ ...entry, trigger: t })}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        entry.trigger === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Context</label>
                <Input
                  placeholder="Where are you? What's happening?"
                  value={entry.context}
                  onChange={(e) => setEntry({ ...entry, context: e.target.value })}
                />
              </div>

              {/* Outcome */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Outcome</label>
                <MobileSelect
                  value={entry.outcome}
                  onValueChange={(v) => setEntry({ ...entry, outcome: v })}
                  placeholder="Select outcome"
                  options={[
                    { value: 'no_urge', label: 'No urge' },
                    { value: 'resisted', label: 'Resisted urge' },
                    { value: 'relapsed', label: 'Relapsed' },
                  ]}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Notes</label>
                <Textarea
                  placeholder="Anything on your mind..."
                  value={entry.notes}
                  onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <Button
                onClick={() => createMutation.mutate(entry)}
                disabled={!entry.mood || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Saving...' : 'Save entry'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries List */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading entries...</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <BookHeart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No entries yet. Start tracking your journey.</p>
          </div>
        ) : (
          entries.map(e => (
            <div key={e.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{moodEmojis[e.mood]}</span>
                  <span className="text-sm font-medium capitalize">{e.mood}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(e.created_date), 'MMM d, h:mm a')}
                </span>
              </div>
              {e.trigger && (
                <span className="inline-block px-2 py-0.5 bg-secondary rounded-full text-xs text-secondary-foreground mb-2">
                  {e.trigger}
                </span>
              )}
              {e.outcome !== 'no_urge' && (
                <span className={cn(
                  "inline-block px-2 py-0.5 rounded-full text-xs ml-1 mb-2",
                  e.outcome === 'resisted' ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                )}>
                  {e.outcome === 'resisted' ? 'Resisted' : 'Relapsed'}
                </span>
              )}
              {e.notes && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{e.notes}</p>}
              {e.context && <p className="text-[10px] text-muted-foreground/60 mt-1">📍 {e.context}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}