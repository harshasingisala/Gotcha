from flask import Blueprint, jsonify, request
from utils.supabase_client import supabase

bp = Blueprint("assistant", __name__, url_prefix="/api/assistant")


def _item_summary():
    try:
        rows = (
            supabase.table("items")
            .select("title,type,status,category,location,created_at")
            .order("created_at", desc=True)
            .limit(8)
            .execute()
            .data
            or []
        )
    except Exception:
        rows = []
    if not rows:
        return "I do not see live item data yet."
    return "Recent campus reports: " + "; ".join(
        f"{row.get('title')} ({row.get('type')}, {row.get('status')}) near {row.get('location')}"
        for row in rows[:5]
    )


def answer_question(question):
    q = (question or "").lower()
    if any(word in q for word in ["claim", "prove", "proof", "owner"]):
        return "Open the item, tap Submit Claim, add a detail only the owner would know, and wait for admin review. Strong proof raises the confidence score and helps staff approve safely."
    if any(word in q for word in ["message", "pickup", "handoff", "chat"]):
        return "Use Messages after a claim or item conversation exists. Keep pickup details inside the app, meet at a campus desk or security point, and avoid sharing personal phone numbers."
    if any(word in q for word in ["report", "lost", "found", "upload"]):
        return "Use Report Item, choose Lost or Found, add title, category, location, date, description, and a photo if available. Emergency mode is best for ID cards, wallets, phones, and high-value items."
    if any(word in q for word in ["qr", "code", "tag"]):
        return "The recovery QR creates a safe item identifier. A finder can reference the item without exposing the owner phone or email."
    if any(word in q for word in ["match", "similar", "ai"]):
        return f"Smart matching compares opposite-type reports using category, location, and title keywords. {_item_summary()}"
    if any(word in q for word in ["admin", "approve", "reject", "risk"]):
        return "Admins review claims, moderate item status, audit users, send announcements, and monitor risk signals from the command center."
    return "I can help with reporting lost or found items, claim proof, smart matches, QR recovery, safe pickup messages, and admin review steps."


@bp.post("")
def assistant():
    body = request.get_json() or {}
    question = (body.get("question") or "").strip()
    if not question:
        return jsonify({"error": "Question is required."}), 400
    return jsonify({"answer": answer_question(question)})
