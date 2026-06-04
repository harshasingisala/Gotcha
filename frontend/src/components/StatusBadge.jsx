import React from "react";
const styles = {
  active: "bg-orange/10 text-orange-deep",
  claimed: "bg-green-100 text-green-700",
  returned: "bg-gray-100 text-gray-700",
  closed: "bg-gray-100 text-gray-700",
  lost: "bg-orange/10 text-orange-deep",
  found: "bg-blue-100 text-blue-700",
  pending: "bg-orange/10 text-orange-deep",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  reported: "bg-blue-100 text-blue-700",
  matched: "bg-purple-100 text-purple-700",
  verified: "bg-emerald-100 text-emerald-700",
  expired: "bg-red-100 text-red-700"
};

export default function StatusBadge({ status, label }) {
  return <span className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold capitalize ${styles[status] || styles.active}`}>{label || status}</span>;
}
