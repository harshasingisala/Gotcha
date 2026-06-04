import React from "react";

export default function NewItemsToast({ count, onRefresh }) {
  if (!count) return null;

  const label = count === 1 ? "1 new item — tap to refresh" : `${count} new items — tap to refresh`;

  return (
    <button
      className="new-items-toast sticky top-3 z-20 mx-auto flex min-h-11 w-full max-w-full items-center justify-center gap-2 rounded-full bg-orange px-4 text-sm font-medium text-white shadow-lift md:max-w-xs"
      onClick={onRefresh}
      type="button"
    >
      <span aria-hidden="true">↑</span>
      <span>{label}</span>
      <style>
        {`
          .new-items-toast {
            animation: new-items-toast-slide 250ms ease-out;
          }

          @keyframes new-items-toast-slide {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          @media (prefers-reduced-motion: reduce) {
            .new-items-toast {
              animation: none;
            }
          }
        `}
      </style>
    </button>
  );
}
