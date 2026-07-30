'use client';

import React from 'react';

type ToastType = 'success' | 'error' | 'info';

const toastConfig: Record<
  ToastType,
  {
    border: string;
    bg: string;
    glow: string;
    text: string;
    icon: React.ReactNode;
  }
> = {
  success: {
    border: 'border-emerald-500/30',
    bg: 'bg-[#0f1d1e]/90',
    glow: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    text: 'text-emerald-200',
    icon: (
      <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
  },
  error: {
    border: 'border-rose-500/30',
    bg: 'bg-[#1e0f13]/90',
    glow: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
    text: 'text-rose-200',
    icon: (
      <svg className="h-4 w-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  info: {
    border: 'border-sky-500/30',
    bg: 'bg-[#0f1823]/90',
    glow: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
    text: 'text-sky-200',
    icon: (
      <svg className="h-4 w-4 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
};

export default function Toast({
  type = 'info',
  message,
}: {
  type: ToastType;
  message: string | null;
}) {
  const currentConfig = toastConfig[type] || toastConfig.info;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-80 flex justify-center transition-all duration-300 ${
        message ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-[13px] font-medium shadow-2xl backdrop-blur-md transition-colors ${currentConfig.border} ${currentConfig.bg} ${currentConfig.text}`}
      >
        {/* Glowing Indicator Dot */}
        <span className={`h-1.5 w-1.5 rounded-full ${currentConfig.glow}`} />

        {/* SVG Type Icon */}
        {currentConfig.icon}

        {/* Toast Message */}
        <span className="truncate max-w-sm">{message}</span>
      </div>
    </div>
  );
}