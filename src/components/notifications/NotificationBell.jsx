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
  return <Link to="/notifications" aria-label="Open notifications" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
    <Bell className="w-5 h-5" />
    {unread > 0 && <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-accent text-[9px] leading-4 text-accent-foreground font-bold text-center">{unread > 9 ? '9+' : unread}</span>}
  </Link>;
}