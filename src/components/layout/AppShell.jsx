import React, { useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
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

// Each tab remembers the last scroll position independently
const scrollPositions = {};

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);

  const handleTabPress = (path) => {
    // Save current scroll before leaving
    if (mainRef.current) {
      scrollPositions[location.pathname] = mainRef.current.scrollTop;
    }
    navigate(path);
    // Restore scroll for destination tab on next frame
    requestAnimationFrame(() => {
      if (mainRef.current) {
        mainRef.current.scrollTop = scrollPositions[path] ?? 0;
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SubscriptionBanner />

      {/* Tab pages get safe-area top padding here; sub-pages handle it via PageHeader */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto pb-20 max-w-lg mx-auto w-full"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <Outlet />
      </main>

      {/* Floating Urge Button — sits above safe-area-adjusted nav */}
      <Link
        to="/urge"
        className="fixed right-4 z-50 flex flex-col items-center gap-1 select-none group"
        style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="relative w-14 h-14 rounded-full bg-destructive text-destructive-foreground shadow-xl flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-transform">
          <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-30 pointer-events-none" style={{ transform: 'none' }} />
          <Flame className="w-6 h-6 relative z-10" />
        </div>
        <span className="text-[10px] font-semibold text-destructive bg-background/80 px-1.5 py-0.5 rounded-full shadow-sm">URGE</span>
      </Link>

      {/* Bottom Navigation — padded for home indicator (iPhone X+) */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => handleTabPress(path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px] select-none",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}