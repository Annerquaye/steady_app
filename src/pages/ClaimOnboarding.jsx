import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { claimGuestOnboarding } from '@/lib/guestOnboarding';

export default function ClaimOnboarding() {
  const navigate = useNavigate();

  useEffect(() => {
    claimGuestOnboarding()
      .catch(() => {})
      .finally(() => navigate('/', { replace: true }));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Setting up your recovery profile…</p>
    </div>
  );
}