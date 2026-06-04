import React, { useEffect, useRef, useState } from "react";
import AdminPageHeader from "../../components/AdminPageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useClaims } from "../../hooks/useClaims";
import { useGsapMotion } from "../../hooks/useGsapMotion";
import { supabase } from "../../lib/supabase";

export default function AdminClaims() {
  const motionRef = useRef(null);
  useGsapMotion(motionRef);
  const { claims, loading, error, reviewClaim } = useClaims(true);
  const [tab, setTab] = useState("item-claims");
  const [itemClaims, setItemClaims] = useState([]);
  const [itemClaimsLoading, setItemClaimsLoading] = useState(true);
  const [itemClaimsError, setItemClaimsError] = useState("");
  const [proofUrls, setProofUrls] = useState({});
  const [notes, setNotes] = useState({});
  const pending = claims.filter((claim) => claim.status === "pending").length;
  const approved = claims.filter((claim) => claim.status === "approved").length;

  async function loadItemClaims() {
    if (!supabase.rpc) {
      setItemClaimsError("Supabase is not configured for item claim review.");
      setItemClaimsLoading(false);
      return;
    }
    setItemClaimsLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc("admin_pending_claim_items");
      if (rpcError) throw rpcError;
      setItemClaims(data || []);
      setItemClaimsError("");
    } catch (err) {
      setItemClaimsError(err.message || "Could not load pending item claims.");
    } finally {
      setItemClaimsLoading(false);
    }
  }

  useEffect(() => {
    loadItemClaims();
  }, []);

  async function viewProof(item) {
    try {
      const { data, error: signedUrlError } = await supabase.storage
        .from("claim-photos")
        .createSignedUrl(item.claim_photo_url, 60);
      if (signedUrlError) throw signedUrlError;
      setProofUrls((current) => ({ ...current, [item.id]: data.signedUrl }));
    } catch (err) {
      setItemClaimsError(err.message || "Could not open proof photo.");
    }
  }

  async function reviewItemClaim(itemId, decision) {
    const reason = notes[itemId] || "";
    if (decision === "reject" && reason.trim().length < 10) {
      setItemClaimsError("Add a rejection reason with at least 10 characters.");
      return;
    }
    try {
      const rpcName = decision === "approve" ? "admin_approve_claim" : "admin_reject_claim";
      const args = decision === "approve" ? { p_item_id: itemId } : { p_item_id: itemId, p_reason: reason };
      const { error: rpcError } = await supabase.rpc(rpcName, args);
      if (rpcError) throw rpcError;
      setItemClaims((rows) => rows.filter((item) => item.id !== itemId));
      setItemClaimsError("");
    } catch (err) {
      setItemClaimsError(err.message || "Could not review item claim.");
    }
  }

  return (
    <section ref={motionRef} className="space-y-5">
      <AdminPageHeader
        title="Claim Queue"
        description="Review ownership proof, confidence signals, and staff notes before approving or rejecting handoffs."
        actions={<button className="rounded-md bg-navy px-4 py-2 text-sm font-black text-white">Export queue</button>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="admin-panel motion-reveal rounded-md p-4" data-tilt><div className="text-2xl font-black text-slate-100">{claims.length + itemClaims.length}</div><p className="text-sm font-bold text-slate-400">Total claims</p></div>
        <div className="admin-panel motion-reveal rounded-md p-4" data-tilt><div className="text-2xl font-black text-orange-deep">{pending + itemClaims.length}</div><p className="text-sm font-bold text-slate-400">Need decision</p></div>
        <div className="admin-panel motion-reveal rounded-md p-4" data-tilt><div className="text-2xl font-black text-green-700">{approved}</div><p className="text-sm font-bold text-slate-400">Approved</p></div>
      </div>
      <div className="motion-reveal flex gap-2 overflow-x-auto rounded-md bg-slate-900 p-2 shadow-soft">
        <button className={`rounded-md px-4 py-2 text-sm font-black ${tab === "item-claims" ? "bg-navy text-white" : "text-slate-100 hover:bg-slate-800"}`} onClick={() => setTab("item-claims")}>Photo proof review</button>
        <button className={`rounded-md px-4 py-2 text-sm font-black ${tab === "legacy-claims" ? "bg-navy text-white" : "text-slate-100 hover:bg-slate-800"}`} onClick={() => setTab("legacy-claims")}>Challenge claims</button>
      </div>
      {tab === "item-claims" && (
        <div className="motion-reveal overflow-hidden rounded-md border border-slate-800 bg-slate-900 shadow-soft">
          {itemClaimsLoading && <p className="p-4 text-slate-400">Loading photo proof claims...</p>}
          {itemClaimsError && <p className="p-4 text-red-300">{itemClaimsError}</p>}
          {!itemClaimsLoading && !itemClaims.length && <p className="p-4 text-slate-400">No photo proof claims need review.</p>}
          {!!itemClaims.length && (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-800 text-left text-xs uppercase text-slate-400">
                <tr><th className="p-4">Item</th><th className="p-4">Claimant</th><th className="p-4">Proof</th><th className="p-4">Review note</th><th className="p-4 text-right">Decision</th></tr>
              </thead>
              <tbody>
                {itemClaims.map((item) => (
                  <tr key={item.id} className="border-t border-slate-800 align-top">
                    <td className="p-4">
                      <b className="text-slate-100">{item.title}</b>
                      <p className="mt-1 text-xs font-bold text-slate-400">{item.category} · {item.location_zone || item.location || "Unknown zone"}</p>
                    </td>
                    <td className="p-4 text-slate-400">
                      <b className="text-slate-200">{item.claimant_name || "Unknown claimant"}</b>
                      <p className="text-xs">{item.claimant_email || item.claimed_by}</p>
                    </td>
                    <td className="max-w-sm p-4 text-slate-400">
                      <p>{item.claim_note || "No note submitted."}</p>
                      <button className="mt-3 rounded-md bg-slate-800 px-3 py-2 text-xs font-black text-slate-100" onClick={() => viewProof(item)}>Generate 60s proof link</button>
                      {proofUrls[item.id] && <img className="mt-3 h-32 w-32 rounded-md object-cover" src={proofUrls[item.id]} alt={`Proof for ${item.title}`} />}
                    </td>
                    <td className="p-4">
                      <input className="admin-input w-full min-w-44" value={notes[item.id] || ""} onChange={(event) => setNotes({ ...notes, [item.id]: event.target.value })} placeholder="Required if rejecting" />
                    </td>
                    <td className="space-x-2 p-4 text-right">
                      <button className="rounded-md bg-green-600 px-3 py-2 text-xs font-black text-white" onClick={() => reviewItemClaim(item.id, "approve")}>Approve</button>
                      <button className="rounded-md bg-red-600 px-3 py-2 text-xs font-black text-white" onClick={() => reviewItemClaim(item.id, "reject")}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {tab === "legacy-claims" && (
      <div className="motion-reveal overflow-hidden rounded-md border border-slate-800 bg-slate-900 shadow-soft">
        {loading && <p className="p-4 text-slate-400">Loading claims...</p>}
        {error && <p className="p-4 text-red-300">{error}</p>}
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-left text-xs uppercase text-slate-400">
            <tr><th className="p-4">Claim</th><th className="p-4">Proof note</th><th className="p-4">Status</th><th className="p-4">Staff note</th><th className="p-4 text-right">Decision</th></tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className="border-t border-slate-800 align-top">
                <td className="p-4">
                  <b className="text-slate-100">{claim.items?.title}</b>
                  <p className="mt-1 text-xs font-bold text-slate-400">{claim.claimant?.full_name || "Unknown claimant"}</p>
                </td>
                <td className="max-w-sm p-4 text-slate-400">{claim.proof_description || "No proof submitted."}</td>
                <td className="p-4"><StatusBadge status={claim.status} /></td>
                <td className="p-4">
                  <input className="admin-input w-full min-w-44" value={notes[claim.id] || ""} onChange={(event) => setNotes({ ...notes, [claim.id]: event.target.value })} placeholder="Internal review note" />
                </td>
                <td className="space-x-2 p-4 text-right">
                  <button className="rounded-md bg-green-600 px-3 py-2 text-xs font-black text-white" onClick={() => reviewClaim(claim.id, "approved", notes[claim.id])}>Approve</button>
                  <button className="rounded-md bg-red-600 px-3 py-2 text-xs font-black text-white" onClick={() => reviewClaim(claim.id, "rejected", notes[claim.id])}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </section>
  );
}

