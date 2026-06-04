import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookHeart, Shield, MessageCircle, Settings, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import SubscriptionBanner from '@/components/subscription/SubscriptionBanner';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/journal', icon: BookHeart, label: 'Journal' },
  { path: '/coach', icon: MessageCircle, label: 'Coach' },
  { path: '/blocking', icon: Shield, label: 'Protect' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppShell() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SubscriptionBanner />
      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      {/* Floating Urge Button */}
      <Link
        to="/urge"
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-destructive text-destructive-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Flame className="w-6 h-6" />
      </Link>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-40 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}