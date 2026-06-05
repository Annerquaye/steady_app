import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Steady — Premium Splash Screen
 *
 * Design rationale:
 * - Radial gradient backdrop creates depth and warmth without clutter (à la Headspace/Calm)
 * - Logo animates in with a gentle spring — feels alive, not mechanical
 * - Wordmark staggers in 120ms after icon, reinforcing brand hierarchy
 * - Tagline fades last, giving the eye a natural reading path
 * - Single hairline progress bar replaces noisy dots — minimal & elegant (Notion/Stripe pattern)
 * - Exit is a pure opacity fade so the first app screen dissolves in seamlessly
 * - All safe-area insets respected for notch/island/chin devices
 * - Works equally in light + dark via CSS variables
 */

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            background: 'hsl(var(--background))',
          }}
        >
          {/* ── Ambient radial glow — adapts to light/dark via primary colour ── */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 72% 55% at 50% 42%, hsl(var(--primary)/0.13) 0%, transparent 70%)',
            }}
          />

          {/* ── Secondary soft glow — bottom warmth ── */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 60% 35% at 50% 92%, hsl(var(--accent)/0.08) 0%, transparent 70%)',
            }}
          />

          {/* ── Brand stack ── */}
          <div className="relative flex flex-col items-center">

            {/* Logo icon — spring entrance */}
            <motion.div
              initial={{ opacity: 0, scale: 0.72, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],   // custom spring curve
                opacity: { duration: 0.45 },
              }}
            >
              {/* Steady logo image */}
              <div
                className="relative"
                style={{
                  filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.22)) drop-shadow(0 4px 12px rgba(0,0,0,0.14))',
                }}
              >
                <img
                  src="https://media.base44.com/images/public/6a20baed8fdb785fe59d2daa/ddec82ebf_Steady.jpeg"
                  alt="Steady"
                  className="w-[100px] h-[100px] rounded-[28px] object-cover"
                />
              </div>
            </motion.div>

            {/* Wordmark — staggered 120 ms after icon */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-center"
            >
              <h1
                className="font-heading font-bold tracking-[-0.02em] text-foreground"
                style={{ fontSize: '28px', lineHeight: 1 }}
              >
                Steady
              </h1>
            </motion.div>

            {/* Tagline — fades in last */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.58, duration: 0.55 }}
              className="mt-2 text-[13px] font-body font-medium tracking-wide"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Build the life you deserve.
            </motion.p>
          </div>

          {/* ── Progress bar — minimal, single line (Stripe/Notion pattern) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-10"
            style={{ bottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div
              className="w-16 h-[2px] rounded-full overflow-hidden"
              style={{ background: 'hsl(var(--border))' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'hsl(var(--primary))' }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.75, duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}