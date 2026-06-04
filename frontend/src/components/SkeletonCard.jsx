import React from "react";
export default function SkeletonCard() {
  return (
    <div className="min-h-[360px] animate-pulse rounded-xl border border-surface-strong bg-white p-4 shadow-soft">
      <div className="aspect-[4/3] rounded-lg bg-surface" />
      <div className="mt-4 h-4 w-2/3 rounded bg-surface" />
      <div className="mt-3 h-3 w-1/2 rounded bg-surface" />
      <div className="mt-4 flex gap-2">
        <div className="h-7 w-20 rounded-full bg-surface" />
        <div className="h-7 w-24 rounded-full bg-surface" />
      </div>
    </div>
  );
}
