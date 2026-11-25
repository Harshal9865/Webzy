import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  caption?: string;
  className?: string;
  onOpenFullscreen?: () => void;
}

export function PhoneFrame({
  children,
  caption,
  className = '',
  onOpenFullscreen,
}: PhoneFrameProps) {
  return (
    <div className={`mx-auto w-full max-w-[344px] xl:max-w-[366px] ${className}`}>
      {/* Outer Smartphone Hardware Chassis */}
      <div className="relative mx-auto rounded-[46px] border-[10px] border-[#1C131E] bg-[#1C131E] p-1 shadow-[0_20px_50px_-12px_rgba(225,29,99,0.18),0_12px_28px_-6px_rgba(43,27,46,0.14)] ring-1 ring-white/10 transition-all duration-300">
        {/* Hardware Side Buttons: Volume Rockers (Left) */}
        <div
          className="pointer-events-none absolute -left-[12px] top-[88px] h-8 w-[3px] rounded-l-sm bg-[#2E2032]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-[12px] top-[130px] h-8 w-[3px] rounded-l-sm bg-[#2E2032]"
          aria-hidden="true"
        />
        {/* Hardware Side Button: Power / Lock (Right) */}
        <div
          className="pointer-events-none absolute -right-[12px] top-[104px] h-11 w-[3px] rounded-r-sm bg-[#2E2032]"
          aria-hidden="true"
        />

        {/* Inner Screen Viewport with Dedicated Safe-Area Clearance (Prevents Dynamic Island / Home Bar Overlap) */}
        <div className="relative flex h-[min(580px,calc(100dvh-250px))] min-h-[470px] w-full flex-col overflow-hidden rounded-[35px] bg-white transform-gpu xl:h-[min(620px,calc(100dvh-240px))]">
          {/* Dedicated Top Status Safe-Area Strip */}
          <div className="relative flex h-7 w-full shrink-0 items-center justify-center bg-[#FAF8F5]/95" aria-hidden="true">
            <div className="flex h-[18px] w-[76px] items-center justify-between rounded-full bg-black px-2 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-[#18181b] ring-1 ring-white/10" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#09090b]" />
            </div>
          </div>

          <div className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-clip overscroll-contain scrollbar-none">
            {children}
          </div>

          {/* Dedicated Bottom Home Indicator Clearance */}
          <div className="flex h-4 w-full shrink-0 items-center justify-center bg-white/95" aria-hidden="true">
            <div className="h-1 w-24 rounded-full bg-black/20" />
          </div>
        </div>
      </div>

      {caption ? (
        <p className="mt-3 text-center text-xs font-semibold tracking-tight text-webzy-ink/65">
          {caption}
        </p>
      ) : null}

      {onOpenFullscreen ? (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={onOpenFullscreen}
            className="btn-spring inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 text-xs font-bold text-webzy-ink shadow-sm transition hover:border-[#C9A243] hover:bg-stone-50"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <span>Full Screen Preview</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
