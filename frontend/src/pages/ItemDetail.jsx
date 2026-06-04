import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClaimModal from "../components/ClaimModal";
import EmptyState from "../components/EmptyState";
import SkeletonCard from "../components/SkeletonCard";
import StatusBadge from "../components/StatusBadge";
import { api } from "../lib/api";
import { addDemoNotification, getDemoItems, getStoredDemoAuth, upsertDemoItem } from "../lib/demoData";
import { getClaimConfidence, getQrPayload } from "../lib/itemSignals";
import { useAuthStore } from "../store/authStore";
import { useNotifStore } from "../store/notifStore";
import SmartMatchPanel from "../components/SmartMatchPanel";
import QrRecoveryCard from "../components/QrRecoveryCard";
import { lifecycleLabels } from "../lib/taxonomy";

const lifecycleSteps = ["reported", "matched", "claimed", "verified", "closed"];

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotifStore((s) => s.addNotification);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimOpen, setClaimOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messageResult, setMessageResult] = useState("");

  useEffect(() => {
    api.get(`/items/${id}`).then((res) => {
      if (!res.data?.item) throw new Error("Invalid item response.");
      setItem(res.data.item);
    }).catch((err) => {
      if (getStoredDemoAuth()) {
        const found = getDemoItems().find((row) => row.id === id);
        if (found) setItem(found);
        else setError("Could not load item.");
      } else {
        setError(err.response?.data?.error || "Could not load item.");
      }
    }).finally(() => setLoading(false));
  }, [id]);

  async function status(statusValue) {
    try {
      const res = await api.patch(`/items/${id}/status`, { status: statusValue });
      if (!res.data?.item) throw new Error("Invalid status response.");
      setItem(res.data.item);
    } catch (err) {
      if (!getStoredDemoAuth()) throw err;
      const next = { ...item, status: statusValue, lifecycle_state: statusValue === "returned" || statusValue === "closed" ? "closed" : statusValue === "claimed" ? "verified" : "reported" };
      upsertDemoItem(next);
      if (["returned", "claimed"].includes(statusValue)) {
        const notification = addDemoNotification({
          type: "item_found",
          title: statusValue === "returned" ? "Item found" : "Item claim approved",
          body: statusValue === "returned" ? `${item.title} has been marked as found and returned.` : `${item.title} has moved into the claimed recovery stage.`
        });
        addNotification(notification);
      }
      setItem(next);
      return;
    }
  }

  async function submitReport() {
    setReportMessage("");
    try {
      await api.post(`/items/${id}/report`, { reason: reportReason });
      setReportMessage("Report sent to the campus team.");
      setReportReason("");
      setReportOpen(false);
    } catch (err) {
      setReportMessage(err.response?.data?.error || "Could not send the report.");
    }
  }

  async function sendFirstMessage() {
    setMessageResult("");
    try {
      await api.post("/messages", {
        receiver_id: item.user_id,
        item_id: item.id,
        content: messageContent
      });
      setMessageResult("Message sent inside Campus Found.");
      setMessageContent("");
      setMessageOpen(false);
    } catch (err) {
      setMessageResult(err.response?.data?.error || "Could not send the message.");
    }
  }

  if (loading) return <div className="grid gap-4 md:grid-cols-2"><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <EmptyState title="Could not load this item" message={error} ctaLabel="Back to found items" ctaPath="/app/found-items" />;

  const owner = item.user_id === user?.id;
  const confidence = getClaimConfidence(item);
  const lifecycle = item.lifecycle_state || (item.status === "returned" || item.status === "closed" ? "closed" : item.status === "claimed" ? "verified" : "reported");
  const activeStep = Math.max(0, lifecycleSteps.indexOf(lifecycle));

  return (
    <section>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-surface shadow-soft">
          {item.image_url ? <img className="h-full w-full object-cover" src={item.image_url} alt={item.title} /> : (
            <div className="grid h-full place-items-center text-center text-muted">
              <span><span className="material-symbols-outlined block text-7xl text-navy/30">image</span>No image uploaded</span>
            </div>
          )}
          <div className="absolute left-4 top-4"><StatusBadge status={lifecycle} label={lifecycleLabels[lifecycle] || lifecycle} /></div>
        </div>
        <div className="rounded-xl border border-surface-strong bg-white p-6 shadow-soft">
          <h1 className="text-3xl font-bold text-navy">{item.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2"><StatusBadge status={item.type} /><StatusBadge status={lifecycle} label={lifecycleLabels[lifecycle] || lifecycle} /></div>
          <p className="mt-5 text-muted">{item.description}</p>
          <div className="mt-5 rounded-xl border border-surface-strong bg-white p-4">
            <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-black uppercase text-muted">
              {lifecycleSteps.map((step, index) => (
                <span key={step} className={index <= activeStep ? "text-navy" : ""}>{lifecycleLabels[step]}</span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {lifecycleSteps.map((step, index) => <span key={step} className={`h-2 rounded-full ${index <= activeStep ? "bg-orange" : "bg-surface-strong"}`} />)}
            </div>
          </div>
          <div className="mt-5 grid gap-3 rounded-xl bg-surface p-4 text-sm text-muted">
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">location_on</span>{item.location_zone || item.location || "Unknown zone"}</div>
            {item.location && <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">near_me</span>{item.location}</div>}
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">category</span>{item.category}</div>
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">qr_code</span>{getQrPayload(item)}</div>
          </div>
          <div className="mt-5 rounded-xl bg-orange/10 p-4">
            <div className="flex items-center justify-between"><span className="font-bold text-orange-deep">Claim Confidence</span><span className="text-2xl font-black text-navy">{confidence}%</span></div>
            <div className="mt-2 h-2 rounded-full bg-white"><div className="h-2 rounded-full bg-orange" style={{ width: `${confidence}%` }} /></div>
            <p className="mt-2 text-xs text-muted">Based on secret proof, college email verification, upload history, and category match.</p>
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm">
            <span className="font-bold text-text">{item.users?.full_name || "Verified Student"}</span>
            <span className="rounded-full bg-green-100 px-2 py-1 font-semibold text-green-700">Verified Student</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {!owner && item.status === "active" && (
              <>
                {item.type === "found" && lifecycle === "matched" && <button className="min-h-12 rounded-lg bg-navy px-4 font-bold text-white" onClick={() => setClaimOpen(true)}>Submit Claim</button>}
                {item.type === "found" && lifecycle !== "matched" && lifecycle !== "claimed" && <button className="min-h-12 rounded-lg bg-surface px-4 font-bold text-muted" disabled>Claim opens after a match</button>}
                <button className="min-h-12 rounded-lg border border-outline px-4 font-bold text-navy" onClick={() => setMessageOpen(!messageOpen)}>{item.type === "found" ? "Message Finder" : "Message Reporter"}</button>
              </>
            )}
            {owner && ["active", "claimed"].includes(item.status) && (
              <>
                <button className="min-h-12 rounded-lg bg-green-600 px-4 font-bold text-white" onClick={() => status("returned")}>Confirm Returned</button>
                <button className="min-h-12 rounded-lg bg-gray-200 px-4 font-bold text-text" onClick={() => status("closed")}>Close Listing</button>
              </>
            )}
            {!["active", "claimed"].includes(item.status) && <button className="min-h-12 rounded-lg bg-navy px-4 font-bold text-white" onClick={() => status("active")}>Reopen Listing</button>}
            {!owner && <button className="min-h-12 rounded-lg border border-red-200 bg-red-50 px-4 font-bold text-red-700" onClick={() => setReportOpen(!reportOpen)}>Report issue</button>}
          </div>
          {reportOpen && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
              <textarea className="w-full rounded-lg border border-red-100 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-red-200" rows="3" placeholder="What looks unsafe, fake, or wrong?" value={reportReason} onChange={(event) => setReportReason(event.target.value)} />
              <button className="mt-3 min-h-11 rounded-lg bg-red-600 px-4 text-sm font-black text-white disabled:opacity-50" disabled={reportReason.trim().length < 10} onClick={submitReport}>Send report</button>
            </div>
          )}
          {reportMessage && <p className="mt-3 rounded-lg bg-surface p-3 text-sm font-bold text-muted">{reportMessage}</p>}
          {messageOpen && (
            <div className="mt-4 rounded-xl border border-surface-strong bg-surface p-4">
              <p className="text-sm font-black text-navy">Anonymous item message</p>
              <textarea className="mt-2 w-full rounded-lg border border-outline bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-navy/15" rows="3" placeholder="Ask a safe handoff question without sharing phone numbers or links." value={messageContent} onChange={(event) => setMessageContent(event.target.value)} />
              <div className="mt-3 flex gap-2">
                <button className="min-h-11 rounded-lg bg-navy px-4 text-sm font-black text-white disabled:opacity-50" disabled={messageContent.trim().length < 3} onClick={sendFirstMessage}>Send</button>
                <button className="min-h-11 rounded-lg bg-white px-4 text-sm font-black text-muted" onClick={() => navigate("/app/messages")}>Open inbox</button>
              </div>
            </div>
          )}
          {messageResult && <p className="mt-3 rounded-lg bg-surface p-3 text-sm font-bold text-muted">{messageResult}</p>}
        </div>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_2fr]">
        <QrRecoveryCard item={item} />
        <SmartMatchPanel item={item} />
      </div>
      {claimOpen && (
        <ClaimModal
          itemId={item.id}
          itemTitle={item.title}
          onClose={() => setClaimOpen(false)}
          onSuccess={() => setItem({ ...item, lifecycle_state: "claimed" })}
        />
      )}
    </section>
  );
}
