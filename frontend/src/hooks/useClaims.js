import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { addDemoNotification, getDemoClaims, getDemoItems, getStoredDemoAuth, saveDemoClaims, upsertDemoConversation, upsertDemoItem } from "../lib/demoData";
import { getClaimConfidence } from "../lib/itemSignals";

export function useClaims(admin = false) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    setLoading(true);
    try {
      const res = await api.get(admin ? "/admin/claims" : "/claims/mine");
      if (!Array.isArray(res.data?.claims)) throw new Error("Invalid claims response.");
      setClaims(res.data.claims);
      setError("");
    } catch (err) {
      if (getStoredDemoAuth()) {
        setClaims(getDemoClaims());
        setError("");
      } else {
        setError(err.response?.data?.error || "Could not load claims.");
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [admin]);
  async function submitClaim(itemId, form) {
    const fd = new FormData();
    fd.append("item_id", itemId);
    fd.append("proof_description", form.proof_description);
    fd.append("student_id", form.student_id || "");
    fd.append("otp", form.otp || "");
    fd.append("verification_answer", form.verification_answer || "");
    fd.append("challenge_answers", JSON.stringify(form.challenge_answers || {}));
    if (form.proof_image) fd.append("proof_image", form.proof_image);
    try {
      const res = await api.post("/claims", fd);
      if (!res.data?.claim) throw new Error("Invalid claim response.");
      return res;
    } catch (err) {
      if (!getStoredDemoAuth()) throw err;
      const item = getDemoItems().find((row) => row.id === itemId);
      const user = getStoredDemoAuth().user;
      const claim = {
        id: `demo-claim-${Date.now()}`,
        item_id: itemId,
        items: item ? { title: item.title, category: item.category, location: item.location } : { title: "Demo item" },
        claimant: { id: user.id, full_name: user.full_name, email: user.email },
        proof_description: form.proof_description,
        student_id: form.student_id,
        confidence: item ? getClaimConfidence(item, form.proof_description) : 78,
        status: "pending",
        created_at: new Date().toISOString()
      };
      saveDemoClaims([claim, ...getDemoClaims()]);
      if (item) upsertDemoItem({ ...item, lifecycle_state: "claimed" });
      setClaims((rows) => [claim, ...rows]);
      addDemoNotification({
        title: "Claim submitted",
        body: `Your claim for ${claim.items.title} is now in the admin review queue.`
      });
      return { data: { claim } };
    }
  }
  async function reviewClaim(id, status, admin_note) {
    try {
      const res = await api.patch(`/claims/${id}`, { status, admin_note });
      if (!res.data?.claim) throw new Error("Invalid claim review response.");
      setClaims((rows) => rows.map((c) => c.id === id ? { ...c, ...res.data.claim } : c));
    } catch (err) {
      if (!getStoredDemoAuth()) throw err;
      const current = getDemoClaims().find((claim) => claim.id === id);
      const next = getDemoClaims().map((c) => c.id === id ? { ...c, status, admin_note, reviewed_at: new Date().toISOString() } : c);
      saveDemoClaims(next);
      setClaims(next);
      if (current?.item_id) {
        const item = getDemoItems().find((row) => row.id === current.item_id);
        if (item && status === "approved") {
          upsertDemoItem({ ...item, status: "claimed", lifecycle_state: "verified" });
          upsertDemoConversation({
            item,
            otherUser: { id: "demo-admin", full_name: "Campus Admin" },
            message: {
              sender_id: "demo-admin",
              receiver_id: current.claimant?.id || "demo-student",
              content: `Your claim for ${item.title} was approved. Reply here to coordinate pickup.`
            }
          });
        }
      }
      addDemoNotification({
        title: `Claim ${status}`,
        body: `${current?.items?.title || "Your item claim"} was ${status}${admin_note ? `: ${admin_note}` : "."}`
      });
      return;
    }
  }
  return { claims, loading, error, load, submitClaim, reviewClaim };
}
