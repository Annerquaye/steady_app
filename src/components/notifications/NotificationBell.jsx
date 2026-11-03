import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function NotificationBell() {
  const { data = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 50),
    initialData: [],
  });
  const unread = data.filter((notification) => !notification.is_read).length;
  return <Link to="/notifications" aria-label="Open notifications" className="relative w-10 h-10 grid place-items-center rounded-full text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors">
    <Bell className="w-5 h-5" />
    {unread > 0 && <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive ring-2 ring-background text-[11px] leading-[18px] text-destructive-foreground font-bold text-center tabular">{unread > 9 ? '9+' : unread}</span>}
  </Link>;
}