'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  delayMs?: number;
  rootRef?: { readonly current: Element | null };
}

function isElementInView(el: Element, rootEl?: Element | null): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;

  if (rootEl) {
    const rootRect = rootEl.getBoundingClientRect();
    return rect.top < rootRect.bottom - 12 && rect.bottom > rootRect.top + 12;
  }

  const vh = window.innerHeight || document.documentElement.clientHeight || 800;
  return rect.top < vh * 0.96 && rect.bottom > 12;
}

export function RevealSection({
  children,
  className = '',
  disabled = false,
  delayMs = 0,
  rootRef,
}: RevealSectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState<boolean>(disabled);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (disabled) {
      setVisible(true);
      return;
    }

    if (typeof window === 'undefined') {
      setVisible(true);
      return;
    }

    const prefersReduced = Boolean(
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    );
    if (prefersReduced) {
      setReducedMotion(true);
      setVisible(true);
      return;
    }

    const node = containerRef.current;
    if (!node) {
      setVisible(true);
      return;
    }

    const rootEl = rootRef?.current ?? null;
    let revealed = false;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setVisible(true);
    };

    // Immediate & post-paint mount check so elements already in view never stall at opacity 0
    const checkNow = () => {
      if (isElementInView(node, rootEl)) {
        reveal();
      }
    };

    const rafId = window.requestAnimationFrame(checkNow);
    const settleTimer = window.setTimeout(checkNow, 260);

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      try {
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting || entry.intersectionRatio >= 0.12) {
                reveal();
                observer?.disconnect();
                break;
              }
            }
          },
          {
            root: rootEl,
            threshold: 0.12,
          }
        );
        observer.observe(node);
      } catch {
        reveal();
      }
    } else {
      reveal();
    }

    // Passive scroll fallback for tall sections or nested scroll containers
    const scrollTarget: EventTarget = rootEl ?? window;
    const handleScroll = () => {
      if (revealed) return;
      checkNow();
    };
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(settleTimer);
      observer?.disconnect();
      scrollTarget.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [disabled, rootRef]);

  const isShown = disabled || reducedMotion || visible;

  return (
    <div
      ref={containerRef}
      className={`${
        reducedMotion || disabled
          ? ''
          : 'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform]'
      } ${isShown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} ${className}`}
      style={
        !reducedMotion && !disabled && delayMs > 0
          ? { transitionDelay: `${delayMs}ms` }
          : undefined
      }
    >
      {children}
    </div>
  );
}
