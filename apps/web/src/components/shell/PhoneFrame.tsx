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
    <div className={`mx-auto w-full max-w-[292px] xs:max-w-[316px] sm:max-w-[332px] lg:max-w-[344px] xl:max-w-[366px] ${className}`}>
      {/* Outer Smartphone Hardware Chassis */}
      <div className="relative mx-auto rounded-[38px] border-[7px] border-[#1C131E] bg-[#1C131E] p-[3px] shadow-[0_20px_50px_-12px_rgba(225,29,99,0.18),0_12px_28px_-6px_rgba(43,27,46,0.14)] ring-1 ring-white/10 transition-all duration-300 sm:rounded-[44px] sm:border-[9px] sm:p-1 lg:rounded-[46px] lg:border-[10px]">
        {/* Hardware Side Buttons: Volume Rockers (Left) */}
        <div
          className="pointer-events-none absolute -left-[9px] top-[72px] h-7 w-[2.5px] rounded-l-sm bg-[#2E2032] sm:-left-[11px] sm:top-[84px] sm:h-8 sm:w-[3px] lg:-left-[12px] lg:top-[88px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-[9px] top-[108px] h-7 w-[2.5px] rounded-l-sm bg-[#2E2032] sm:-left-[11px] sm:top-[124px] sm:h-8 sm:w-[3px] lg:-left-[12px] lg:top-[130px]"
          aria-hidden="true"
        />
        {/* Hardware Side Button: Power / Lock (Right) */}
        <div
          className="pointer-events-none absolute -right-[9px] top-[86px] h-9 w-[2.5px] rounded-r-sm bg-[#2E2032] sm:-right-[11px] sm:top-[100px] sm:h-11 sm:w-[3px] lg:-right-[12px] lg:top-[104px]"
          aria-hidden="true"
        />

        {/* Inner Screen Viewport with Dedicated Safe-Area Clearance (Prevents Dynamic Island / Home Bar Overlap) */}
        <div className="relative flex h-[min(455px,64dvh)] min-h-[390px] w-full flex-col overflow-hidden rounded-[30px] bg-white transform-gpu sm:h-[min(540px,70dvh)] sm:min-h-[450px] sm:rounded-[34px] lg:h-[min(580px,calc(100dvh-250px))] lg:min-h-[470px] lg:rounded-[35px] xl:h-[min(620px,calc(100dvh-240px))]">
          {/* Dedicated Top Status Safe-Area Strip */}
          <div className="relative flex h-6 w-full shrink-0 items-center justify-center bg-[#FAF8F5]/95 sm:h-7" aria-hidden="true">
            <div className="flex h-[15px] w-[62px] items-center justify-between rounded-full bg-black px-1.5 shadow-sm sm:h-[18px] sm:w-[76px] sm:px-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#18181b] ring-1 ring-white/10 sm:h-2 sm:w-2" />
              <div className="h-1 w-1 rounded-full bg-[#09090b] sm:h-1.5 sm:w-1.5" />
            </div>
          </div>

          <div className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-clip overscroll-contain scrollbar-none">
            {children}
          </div>

          {/* Dedicated Bottom Home Indicator Clearance */}
          <div className="flex h-3.5 w-full shrink-0 items-center justify-center bg-white/95 sm:h-4" aria-hidden="true">
            <div className="h-1 w-20 rounded-full bg-black/20 sm:w-24" />
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
