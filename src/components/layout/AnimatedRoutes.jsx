import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-pages slide in from the right; tab pages cross-fade
const SUB_PAGES = ['/urge', '/relapse', '/review', '/pricing', '/checkout', '/onboarding'];

function isSubPage(pathname) {
  return SUB_PAGES.some(p => pathname.startsWith(p));
}

const slideVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-30%', opacity: 0 },
};

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function AnimatedRoutes({ children }) {
  const location = useLocation();
  const sub = isSubPage(location.pathname);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={sub ? slideVariants : fadeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: sub ? 0.28 : 0.18, ease: [0.32, 0.72, 0, 1] }}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}