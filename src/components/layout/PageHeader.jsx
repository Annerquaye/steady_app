import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// Sub-pages that should show a back button
const SUB_PAGES = ['/urge', '/relapse', '/review', '/pricing', '/checkout', '/onboarding'];

const PAGE_TITLES = {
  '/urge': 'Urge Mode',
  '/relapse': 'Relapse Reflection',
  '/review': 'Weekly Review',
  '/pricing': 'Choose a Plan',
  '/checkout': 'Checkout',
};

export default function PageHeader({ title, onBack, className }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isSubPage = SUB_PAGES.some(p => location.pathname.startsWith(p));
  const resolvedTitle = title || PAGE_TITLES[location.pathname] || '';

  if (!isSubPage) return null;

  const handleBack = onBack || (() => navigate(-1));

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30",
        className
      )}
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
    >
      <button
        onClick={handleBack}
        className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-secondary transition-colors select-none"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      {resolvedTitle && (
        <h1 className="text-base font-semibold font-heading flex-1">{resolvedTitle}</h1>
      )}
    </div>
  );
}