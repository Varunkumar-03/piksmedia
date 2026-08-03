'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useMascotStore from '../store/useMascotStore';
import useCartStore from '../store/useCartStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Sparkles, ShoppingBag, Lightbulb, ChevronDown, Footprints } from 'lucide-react';

export default function MascotCompanion() {
  const {
    expression,
    message,
    isBubbleVisible,
    isMinimized,
    actionType,
    triggerMood,
    hideBubble,
    toggleMinimize,
    triggerRandomTip,
  } = useMascotStore();

  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.itemCount());
  const [mounted, setMounted] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Walking State
  const [walkX, setWalkX] = useState(0); // in pixels from right: 0 is right edge, positive moves left
  const [direction, setDirection] = useState<'left' | 'right'>('left'); // 'left' = walking towards left side of screen
  const [isWalking, setIsWalking] = useState(true);
  const [screenWidth, setScreenWidth] = useState(1200);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const walkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    const updateWidth = () => setScreenWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Context-aware Page Welcome Mood & Expression
  useEffect(() => {
    if (!mounted) return;

    const timer = setTimeout(() => {
      if (pathname === '/cart') {
        if (itemCount > 0) {
          triggerMood(3, `Awesome choices! 🛍️ You've got ${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart. Ready to proceed?`, 6000, 'cart-welcome');
        } else {
          triggerMood(13, "Your cart is empty! 🛒 Let's explore our handcrafted frame collection!", 6000, 'cart-empty');
        }
      } else if (pathname === '/checkout') {
        triggerMood(7, "You're almost there! 💳 Enter your shipping details and we'll start crafting!", 6000, 'checkout-welcome');
      } else if (pathname === '/track-order') {
        triggerMood(12, "Tracking an order? 🚚 Enter your Order ID to check real-time status!", 6000, 'track-welcome');
      } else if (pathname === '/') {
        triggerMood(1, "Hi there! I'm Pandu, your frame companion! 🖼️", 5000, 'welcome');
      } else if (pathname?.startsWith('/shop')) {
        triggerMood(8, "Found a frame you love? 🌟 Click any design to preview your custom photo!", 5000, 'shop-welcome');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname, itemCount, mounted, triggerMood]);

  const isMobile = screenWidth < 768;

  // Calculate max walking distance (Screen Width minus mascot width & margins)
  const maxWalkX = isMobile ? 0 : Math.max(200, screenWidth - 160);

  // Walking Loop Effect
  useEffect(() => {
    if (!mounted || isMinimized || isMobile) {
      setIsWalking(false);
      return;
    }

    // Pause walking if hovered OR if an active event speech bubble is showing (and not just idle)
    const shouldPause = isHovered || (isBubbleVisible && actionType !== 'idle');
    if (shouldPause) {
      setIsWalking(false);
      return;
    }

    setIsWalking(true);
  }, [mounted, isMinimized, isMobile, isHovered, isBubbleVisible, actionType]);

  const handleAnimationComplete = () => {
    if (!isWalking) return;
    setDirection(prev => (prev === 'left' ? 'right' : 'left'));
  };

  // Idle Inactivity Detector (Inactivity for 25s triggers Yawning Zzz cartoon 10.png)
  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      idleTimerRef.current = setTimeout(() => {
        const currentState = useMascotStore.getState();
        if (currentState.actionType === 'idle') {
          triggerMood(10, "Zzz... Taking a quick cat nap! Click me for frame tips! 😴", 10000, 'yawn');
        }
      }, 25000);
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('scroll', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);

    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('scroll', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
    };
  }, [triggerMood]);

  if (!mounted) return null;

  const handleMascotClick = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 500);

    if (isMinimized) {
      toggleMinimize();
      triggerMood(3, "I'm back! How can I help you frame your memories today? 👍", 6000);
    } else {
      triggerRandomTip();
    }
  };

  return (
    <div className="fixed bottom-1 right-5 z-50 pointer-events-none select-none">
      <AnimatePresence>
        {/* Minimized Floating Badge */}
        {isMinimized && (
          <motion.button
            key="minimized-badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMascotClick}
            className="pointer-events-auto flex items-center gap-2 bg-stone-900 text-white px-3.5 py-2.5 rounded-full shadow-2xl border border-amber-400/40 hover:bg-stone-800 transition-all cursor-pointer group"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center border border-amber-300">
              <img
                src={`/cartoons/${expression}.png`}
                alt="Pandu Mascot"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <span className="text-xs font-semibold tracking-wide pr-1">Pandu</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
          </motion.button>
        )}

        {/* Full Walking Mascot & Speech Bubble */}
        {!isMinimized && (
          <motion.div
            animate={{ x: isWalking ? (direction === 'left' ? -maxWalkX : 0) : undefined }}
            transition={{ type: "tween", ease: "linear", duration: isWalking ? 25 : 0 }}
            onAnimationComplete={handleAnimationComplete}
            className="relative flex flex-col items-end max-w-[320px] sm:max-w-[360px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Speech Bubble (Follows Pandu along bottom) */}
            <AnimatePresence>
              {isBubbleVisible && message && (
                <motion.div
                  key="speech-bubble"
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="pointer-events-auto mb-3 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-stone-200 text-stone-900 text-xs sm:text-sm font-medium leading-relaxed relative mr-2 sm:mr-4 max-w-[280px] sm:max-w-[320px]"
                >
                  {/* Close bubble button */}
                  <button
                    onClick={hideBubble}
                    className="absolute top-2 right-2 text-stone-400 hover:text-stone-700 transition-colors p-1"
                    title="Dismiss message"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="pr-4">
                    <p className="text-stone-800 font-serif text-[13px] sm:text-[14px]">
                      {message}
                    </p>

                    {/* Quick interactive actions in speech bubble */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100">
                      <button
                        onClick={triggerRandomTip}
                        className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-full hover:bg-amber-100 transition-colors"
                      >
                        <Lightbulb className="w-3 h-3 text-amber-600" />
                        Frame Tip
                      </button>

                      {itemCount > 0 && (
                        <Link
                          href="/cart"
                          className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-stone-900 text-white px-2.5 py-1 rounded-full hover:bg-stone-800 transition-colors"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          Cart ({itemCount})
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Speech bubble arrow pointer */}
                  <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white/95 border-b border-r border-stone-200 rotate-45 transform"></div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mascot Character Figure */}
            <div className="relative pointer-events-auto flex items-end justify-end group">
              {/* Floating controls overlay - Always visible on mobile, hover-triggered on desktop */}
              <div className="absolute -top-7 right-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 z-20 bg-white/95 backdrop-blur-md p-1 rounded-full border border-stone-200 shadow-lg">
                <button
                  onClick={toggleMinimize}
                  className="p-1 text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
                  title="Close Pandu"
                >
                  <X className="w-3.5 h-3.5 text-stone-700" />
                </button>
                <button
                  onClick={() => triggerMood(7, "Sending love! Hope you enjoy decorating your home with PIKS! ❤️", 6000)}
                  className="p-1 text-rose-500 hover:text-rose-700 rounded-full hover:bg-rose-50 transition-colors"
                  title="Love"
                >
                  ❤️
                </button>
              </div>

              {/* Character Image Container: Jumps when steady, smooth sliding when moving */}
              <motion.div
                animate={
                  isBouncing
                    ? { y: [0, -22, 0, -12, 0] }
                    : !isWalking
                    ? { y: [0, -16, 0, -8, 0] }
                    : { y: 0 }
                }
                transition={
                  isBouncing
                    ? { duration: 0.5 }
                    : !isWalking
                    ? { repeat: Infinity, duration: 1.6, ease: "easeInOut" }
                    : { duration: 0.2 }
                }
                onClick={handleMascotClick}
                className="cursor-pointer relative w-18 h-28 sm:w-22 sm:h-32 transition-transform filter drop-shadow-lg hover:drop-shadow-xl"
                title="Click Pandu for frame tips!"
              >
                <img
                  src={`/cartoons/${expression}.png`}
                  alt={`Pandu Mascot Expression ${expression}`}
                  className="w-full h-full object-contain"
                />

                {/* Subtle shadow under mascot feet */}
                <motion.div
                  animate={!isWalking ? { scale: [1, 0.7, 1, 0.85, 1] } : { scale: 1 }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-2 bg-black/15 rounded-full blur-sm -z-10"
                ></motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
