import React from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import StudentPageHeader from "../components/StudentPageHeader";
import { useClaims } from "../hooks/useClaims";

export default function MyClaims() {
  const navigate = useNavigate();
  const { claims, loading, error } = useClaims(false);
  if (loading) return <p className="text-muted">Loading claims...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section className="space-y-5">
      <StudentPageHeader icon="compare_arrows" title="My Claims" description="Track ownership requests, see review status, and continue handoff conversations when a claim is approved." actionLabel="Browse found items" actionTo="/app/found-items" />
      <div className="grid gap-4 lg:grid-cols-3">
        {claims.map((claim) => (
          <div key={claim.id} className="premium-card rounded-xl p-5" data-tilt>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-orange-deep">Claim request</p>
                <h2 className="mt-2 text-xl font-black text-navy">{claim.items?.title}</h2>
              </div>
              <StatusBadge status={claim.status} />
            </div>
            <p className="mt-4 min-h-16 text-sm leading-6 text-muted">{claim.proof_description || "No proof description submitted."}</p>
            <div className="mt-4 rounded-lg bg-surface p-3 text-xs font-bold text-muted">
              {claim.status === "approved" ? "Approved. Coordinate pickup in messages." : claim.status === "rejected" ? "Rejected. You can resubmit stronger proof." : "Under review by campus staff."}
            </div>
            {claim.status === "approved" && <button className="mt-4 rounded-lg bg-navy px-4 py-2 text-sm font-black text-white" onClick={() => navigate("/app/messages")}>Message Owner</button>}
            {claim.status === "rejected" && <button className="mt-4 rounded-lg border border-outline bg-white px-4 py-2 text-sm font-black text-navy" onClick={() => navigate(`/app/items/${claim.item_id}`)}>Re-submit</button>}
          </div>
        ))}
      </div>
      {!claims.length && <EmptyState message="No claims yet." ctaLabel="Browse found items" ctaPath="/app/found-items" />}
    </section>
  );
}
