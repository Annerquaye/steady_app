import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, ChevronLeft, CheckCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery({ queryKey: ['notifications'], queryFn: () => base44.entities.Notification.filter({ recipient_user_id: undefined }, '-created_date', 50), initialData: [] });
  const markRead = async (notification) => { if (!notification.is_read) { await base44.entities.Notification.update(notification.id, { is_read: true }); queryClient.invalidateQueries({ queryKey: ['notifications'] }); } };
  const markAllRead = async () => { await Promise.all(notifications.filter((item) => !item.is_read).map((item) => base44.entities.Notification.update(item.id, { is_read: true }))); queryClient.invalidateQueries({ queryKey: ['notifications'] }); };
  return <div className="p-6 space-y-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Link to="/"><ChevronLeft className="w-5 h-5" /></Link><div><h1 className="text-2xl font-heading font-bold">Notifications</h1><p className="text-sm text-muted-foreground">Your recovery reminders and wins.</p></div></div>{notifications.some((item) => !item.is_read) && <Button variant="ghost" size="sm" onClick={markAllRead}><CheckCheck className="w-4 h-4" /> Read all</Button>}</div>{isLoading ? <p className="text-sm text-muted-foreground text-center py-12">Loading notifications...</p> : notifications.length === 0 ? <div className="bg-card border border-border rounded-2xl p-10 text-center"><Bell className="w-9 h-9 text-muted-foreground/40 mx-auto mb-3" /><p className="text-sm font-medium">Nothing new yet</p><p className="text-xs text-muted-foreground mt-1">Your reminders and milestones will appear here.</p></div> : <div className="space-y-2">{notifications.map((item) => <button key={item.id} onClick={() => markRead(item)} className={`w-full text-left rounded-2xl border p-4 transition-colors ${item.is_read ? 'bg-card border-border' : 'bg-primary/5 border-primary/20'}`}><div className="flex gap-3"><span className={`mt-1.5 w-2 h-2 rounded-full ${item.is_read ? 'bg-transparent' : 'bg-primary'}`} /><div className="flex-1"><p className="text-sm font-semibold">{item.title}</p><p className="text-sm text-muted-foreground mt-1">{item.message}</p><p className="text-[11px] text-muted-foreground mt-2">{format(new Date(item.created_date), 'MMM d, h:mm a')}</p></div></div></button>)}</div>}</div>;
}