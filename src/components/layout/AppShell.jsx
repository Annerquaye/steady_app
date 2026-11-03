import React, { useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookHeart, Shield, MessageCircle, Settings, Flame, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';
import SubscriptionBanner from '@/components/subscription/SubscriptionBanner';
import NotificationBell from '@/components/notifications/NotificationBell';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/journal', icon: BookHeart, label: 'Journal' },
  { path: '/coach', icon: MessageCircle, label: 'Coach' },
  { path: '/blocking', icon: Shield, label: 'Protect' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

// Full-height screens manage their own scrolling
const FULL_HEIGHT = ['/coach'];

// Each tab remembers the last scroll position independently
const scrollPositions = {};

function BrandMark({ className }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2 select-none', className)} aria-label="Recorva home">
      <span className="w-8 h-8 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-soft">
        <Sprout className="w-[18px] h-[18px]" />
      </span>
      <span className="font-heading font-bold text-[17px] tracking-tight">Recorva</span>
    </Link>
  );
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const showBell = location.pathname !== '/notifications';
  const fullHeight = FULL_HEIGHT.includes(location.pathname);

  const handleTabPress = (path) => {
    if (mainRef.current) {
      scrollPositions[location.pathname] = mainRef.current.scrollTop;
    }
    navigate(path);
    requestAnimationFrame(() => {
      if (mainRef.current) {
        mainRef.current.scrollTop = scrollPositions[path] ?? 0;
      }
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border bg-card/60 backdrop-blur px-4 py-6 z-40">
        <BrandMark className="px-2" />
        <nav className="mt-8 flex flex-col gap-1" aria-label="Main">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => handleTabPress(path)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className={cn('w-[18px] h-[18px]', isActive && 'stroke-[2.4]')} />
                {label}
              </button>
            );
          })}
        </nav>
        <Link
          to="/urge"
          className="mt-auto flex items-center gap-3 rounded-2xl bg-destructive text-destructive-foreground px-4 py-3.5 shadow-lg hover:brightness-105 transition"
        >
          <span className="w-9 h-9 rounded-full bg-white/15 grid place-items-center"><Flame className="w-5 h-5" /></span>
          <span className="leading-tight">
            <span className="block text-sm font-bold">Urge right now?</span>
            <span className="block text-xs opacity-90">Get help in 60 seconds</span>
          </span>
        </Link>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <SubscriptionBanner />

        {/* Top app bar */}
        <header
          className="sticky top-0 z-30 bg-background/85 backdrop-blur-lg border-b border-border/60"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="max-w-lg lg:max-w-3xl mx-auto w-full h-14 px-4 flex items-center justify-between">
            <BrandMark className="lg:invisible" />
            <div className="flex items-center gap-1.5">
              <Link
                to="/urge"
                className="lg:hidden flex items-center gap-1.5 h-9 pl-2.5 pr-3.5 rounded-full bg-destructive text-destructive-foreground text-sm font-bold shadow-md active:scale-95 transition-transform select-none"
              >
                <Flame className="w-4 h-4" />
                Urge
              </Link>
              {showBell && <NotificationBell />}
            </div>
          </div>
        </header>

        {/* Bottom padding clears the bottom navigation */}
        <main
          ref={mainRef}
          className={cn(
            'flex-1 max-w-lg lg:max-w-3xl mx-auto w-full',
            fullHeight ? 'overflow-hidden' : 'overflow-y-auto pb-32 lg:pb-16'
          )}
        >
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation (mobile) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Main"
      >
        <div className="max-w-lg mx-auto flex items-center justify-around py-1.5 px-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => handleTabPress(path)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-3 py-1.5 min-w-[60px] select-none transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className={cn('px-4 py-1 rounded-full transition-colors', isActive && 'bg-primary/10')}>
                  <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.4]')} />
                </span>
                <span className={cn('text-[11px]', isActive ? 'font-semibold' : 'font-medium')}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
