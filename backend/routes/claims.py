from hashlib import sha256
import json
import re
from flask import Blueprint, g, jsonify, request
from middleware.auth_guard import admin_required, auth_required
from routes.items import notify_item_status, upload_image
from utils.notify import notify_user
from utils.supabase_client import supabase

bp = Blueprint("claims", __name__, url_prefix="/api/claims")
STUDENT_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9/-]{3,31}$")


def _hash_answer(value):
    normalized = (value or "").strip().lower()
    if not normalized:
        return None
    return sha256(normalized.encode("utf-8")).hexdigest()


def _challenge_answers():
    raw = request.form.get("challenge_answers")
    if raw:
        try:
            value = json.loads(raw)
            return value if isinstance(value, dict) else {}
        except json.JSONDecodeError:
            return {}
    return {"owner_clue": request.form.get("verification_answer") or ""}


def _challenge_score(item, answers, proof_url, proof_description, student_id_verified):
    score = 0
    answer_hash = item.get("verification_answer_hash")
    owner_answer = answers.get("owner_clue") or answers.get("verification_answer") or ""
    answer_match = bool(answer_hash and _hash_answer(owner_answer) == answer_hash)
    if answer_match:
        score += 45
    category_answer = (answers.get("category_check") or "").lower()
    if item.get("category") and item["category"].lower() in category_answer:
        score += 15
    zone_answer = (answers.get("zone_check") or "").lower()
    if item.get("location_zone") and item["location_zone"].lower() in zone_answer:
        score += 15
    if student_id_verified:
        score += 15
    if proof_url or len(proof_description) >= 80:
        score += 10
    return min(100, score), answer_match


def audit(action, actor_id, target_id, target_label, risk="low"):
    try:
        supabase.table("audit_events").insert({
            "actor_id": actor_id,
            "action": action,
            "target_type": "claim",
            "target_id": target_id,
            "target_label": target_label,
            "risk": risk,
        }).execute()
    except Exception:
        pass


@bp.post("")
@auth_required
def create_claim():
    item_id = request.form.get("item_id")
    proof_description = (request.form.get("proof_description") or "").strip()
    student_id = (request.form.get("student_id") or "").strip()
    otp = (request.form.get("otp") or "").strip()
    item = supabase.table("items").select("*").eq("id", item_id).maybe_single().execute().data
    if not item:
        return jsonify({"error": "Item not found."}), 404
    if item["status"] != "active":
        return jsonify({"error": "This item is no longer active."}), 400
    if item["type"] != "found":
        return jsonify({"error": "Claims are only available for found-item reports. Use messages for lost-item leads."}), 400
    if item["user_id"] == g.user["id"]:
        return jsonify({"error": "You cannot claim your own listing."}), 400
    if len(proof_description) < 40:
        return jsonify({"error": "Add at least 40 characters of identifying evidence before submitting a claim."}), 400
    if not STUDENT_ID_RE.match(student_id):
        return jsonify({"error": "Enter a valid student ID before submitting a claim."}), 400
    duplicate = supabase.table("claims").select("id").eq("item_id", item_id).eq("claimant_id", g.user["id"]).execute()
    if duplicate.data:
        return jsonify({"error": "You already submitted a claim for this item."}), 409
    proof_url = upload_image(request.files.get("proof_image"), g.user["id"])
    student_id_verified = bool(STUDENT_ID_RE.match(student_id) and re.match(r"^\d{6}$", otp))
    answers = _challenge_answers()
    challenge_score, answer_match = _challenge_score(item, answers, proof_url, proof_description, student_id_verified)
    if item.get("verification_answer_hash") and not answer_match:
        return jsonify({"error": "The owner-only verification answer did not match this item."}), 400
    claim = supabase.table("claims").insert({
        "item_id": item_id,
        "claimant_id": g.user["id"],
        "proof_description": proof_description,
        "proof_image_url": proof_url,
        "student_id": student_id,
        "student_id_verified": student_id_verified,
        "verification_answer_match": answer_match,
        "challenge_answers": answers,
        "challenge_score": challenge_score,
        "handoff_status": "review",
    }).execute().data[0]
    supabase.table("items").update({"lifecycle_state": "claimed"}).eq("id", item_id).execute()
    audit("Claim submitted", g.user["id"], claim["id"], item["title"], "medium")
    notify_user(
        item["user_id"],
        "claim_update",
        "New verified claim submitted",
        f"{g.user.get('full_name') or 'A student'} submitted a {challenge_score}% confidence claim for {item['title']}.",
    )
    return jsonify({"claim": claim}), 201


@bp.get("/mine")
@auth_required
def mine():
    rows = (
        supabase.table("claims")
        .select("*, items(*)")
        .eq("claimant_id", g.user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return jsonify({"claims": rows.data or []})


@bp.patch("/<claim_id>")
@admin_required
def review_claim(claim_id):
    body = request.get_json() or {}
    status = body.get("status")
    if status not in {"approved", "rejected"}:
        return jsonify({"error": "Status must be approved or rejected."}), 400
    claim = supabase.table("claims").select("*, items(*)").eq("id", claim_id).maybe_single().execute().data
    if not claim:
        return jsonify({"error": "Claim not found."}), 404
    updated = supabase.table("claims").update({
        "status": status,
        "handoff_status": "approved" if status == "approved" else "rejected",
        "admin_note": body.get("admin_note"),
    }).eq("id", claim_id).execute().data[0]
    if status == "approved":
        supabase.table("items").update({"status": "claimed", "lifecycle_state": "verified"}).eq("id", claim["item_id"]).execute()
        notify_item_status(claim["items"], "claimed")
    audit(f"Claim {status}", g.user["id"], claim_id, claim["items"]["title"], "low" if status == "approved" else "medium")
    notify_user(
        claim["claimant_id"],
        "claim_update",
        f"Claim {status}",
        body.get("admin_note") or f"Your claim for {claim['items']['title']} was {status}.",
    )
    return jsonify({"claim": updated})
