import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  caption?: string;
}

export function PhoneFrame({ children, caption }: PhoneFrameProps) {
  return (
    <div className="mx-auto w-full max-w-[340px]">
      <div className="rounded-[38px] border-[8px] border-webzy-ink bg-webzy-ink p-1 shadow-xl">
        <div className="mx-auto mb-1.5 mt-1 h-1.5 w-16 rounded-full bg-white/25" aria-hidden="true" />
        <div className="overflow-hidden rounded-[28px] bg-white">{children}</div>
      </div>
      {caption ? (
        <p className="mt-3 text-center text-xs font-medium text-webzy-ink/65">{caption}</p>
      ) : null}
    </div>
  );
}
