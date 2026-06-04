import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { compressImage } from "../utils/compressImage";

export default function ClaimModal({ itemId, itemTitle, onClose, onSuccess }) {
  const user = useAuthStore((state) => state.user);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function pickFile(nextFile) {
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/") || nextFile.size > 5242880) {
      setError("Choose an image file under 5MB.");
      return;
    }
    try {
      const compressed = await compressImage(nextFile);
      if (preview) URL.revokeObjectURL(preview);
      setFile(compressed);
      setPreview(URL.createObjectURL(compressed));
      setError("");
    } catch {
      setError("Could not prepare that image. Try another photo.");
    }
  }

  async function submitClaim(event) {
    event.preventDefault();
    if (!user?.id) {
      setError("Sign in before submitting a claim.");
      return;
    }
    if (!file) {
      setError("Upload a proof photo before submitting.");
      return;
    }
    if (note.length > 500) {
      setError("Keep the proof note under 500 characters.");
      return;
    }
    if (!supabase.storage || !supabase.rpc) {
      setError("Supabase is not configured for claim proof uploads.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const path = `${user.id}/${itemId}-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("claim-photos")
        .upload(path, file, {
          contentType: file.type || "image/webp",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { error: claimError } = await supabase.rpc("claim_item", {
        p_item_id: itemId,
        p_claim_photo_url: path,
        p_claim_note: note.trim(),
      });

      if (claimError) throw claimError;

      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Could not submit this claim.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/60 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="claim-modal-title">
      <form className="w-full max-w-lg rounded-xl bg-white p-5 text-text shadow-2xl" onSubmit={submitClaim}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-orange">Claim verification</p>
            <h2 id="claim-modal-title" className="mt-1 text-2xl font-black text-navy">Prove this is yours</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Upload a photo that shows you own this item, such as a receipt, a photo with it, or something that identifies it.
            </p>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-lg bg-surface text-navy" onClick={onClose} aria-label="Close claim modal">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="mt-5 rounded-lg border border-surface-strong bg-surface p-3">
          <p className="text-sm font-black text-navy">{itemTitle}</p>
          <p className="mt-1 text-xs text-muted">Only campus admins can view the proof photo after submission.</p>
        </div>

        <label className="mt-5 grid min-h-40 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-outline bg-surface/70 p-4 text-center transition hover:border-navy">
          <input className="hidden" type="file" accept="image/*" onChange={(event) => pickFile(event.target.files?.[0])} />
          {preview ? (
            <img className="h-40 w-full rounded-lg object-cover" src={preview} alt="Claim proof preview" />
          ) : (
            <span>
              <span className="material-symbols-outlined mb-2 block text-4xl text-navy">add_photo_alternate</span>
              <span className="block font-black text-navy">Upload proof photo</span>
              <span className="mt-1 block text-sm text-muted">Image files only, compressed before upload</span>
            </span>
          )}
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-black text-navy">Proof note</span>
          <textarea
            className="mt-2 w-full rounded-lg border border-outline bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-navy/15"
            maxLength="500"
            rows="4"
            placeholder="Describe what the admin should look for in your proof photo."
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <div className="mt-1 text-right text-xs font-bold text-muted">{note.length}/500</div>

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="min-h-11 rounded-lg border border-outline px-4 text-sm font-black text-muted" onClick={onClose}>Cancel</button>
          <button type="submit" className="min-h-11 rounded-lg bg-orange px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={submitting || !file}>
            {submitting ? "Submitting..." : "Submit claim"}
          </button>
        </div>
      </form>
    </div>
  );
}
