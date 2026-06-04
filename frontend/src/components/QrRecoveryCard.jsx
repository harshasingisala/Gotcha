import React from "react";
import { getQrPayload } from "../lib/itemSignals";

export default function QrRecoveryCard({ item }) {
  const payload = getQrPayload(item || { id: "student-kit", title: "Recovery Kit" });
  return (
    <div className="rounded-xl border border-surface-strong bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div><h2 className="font-bold text-navy">Campus Found Recovery QR</h2><p className="mt-1 text-sm text-muted">Use this during handoff so the item can be closed cleanly.</p></div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Owner protected</span>
      </div>
      <div className="mt-4 grid place-items-center rounded-xl bg-surface p-5">
        <div className="grid h-36 w-36 grid-cols-5 gap-1 rounded-lg bg-white p-3 shadow-soft">
          {Array.from({ length: 25 }).map((_, i) => <span key={i} className={`${(i * 7 + payload.length) % 3 ? "bg-navy" : "bg-orange"} rounded-sm`} />)}
        </div>
      </div>
      <p className="mt-3 rounded-lg bg-orange/10 p-3 text-xs font-bold text-orange-deep">Scan result: handoff verified, finder protected, listing ready to close.</p>
    </div>
  );
}
