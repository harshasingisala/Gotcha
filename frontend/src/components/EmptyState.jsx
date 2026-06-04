import React from "react";
import { Link } from "react-router-dom";

function RecoveryIllustration() {
  return (
    <svg className="h-28 w-28" viewBox="0 0 160 160" role="img" aria-label="Recovered item illustration">
      <rect x="18" y="32" width="124" height="94" rx="18" fill="#F0F3FF" />
      <path d="M42 64h76M42 84h48M42 104h64" stroke="#002452" strokeWidth="7" strokeLinecap="round" opacity="0.25" />
      <circle cx="112" cy="54" r="24" fill="#FD761A" />
      <path d="M101 54l8 8 16-18" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="52" y="112" width="56" height="14" rx="7" fill="#002452" opacity="0.16" />
    </svg>
  );
}

export default function EmptyState({ title = "Nothing here yet", message, ctaLabel, ctaPath }) {
  return (
    <div className="grid place-items-center rounded-xl border border-surface-strong bg-white p-8 text-center shadow-soft md:p-10">
      <RecoveryIllustration />
      <h2 className="mt-4 text-xl font-black text-navy">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{message}</p>
      {ctaLabel && ctaPath && <Link className="mt-5 inline-flex min-h-12 items-center rounded-lg bg-navy px-5 font-black text-white" to={ctaPath}>{ctaLabel}</Link>}
    </div>
  );
}
