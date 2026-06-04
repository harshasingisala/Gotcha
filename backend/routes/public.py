from flask import Blueprint, jsonify, request
from utils.supabase_client import supabase

bp = Blueprint("public", __name__, url_prefix="/api/public")


@bp.post("/contact")
def contact():
    data = request.get_json() or {}
    payload = {
        "name": (data.get("name") or "").strip(),
        "email": (data.get("email") or "").strip(),
        "topic": (data.get("topic") or "General").strip(),
        "message": (data.get("message") or "").strip(),
    }
    if not payload["name"] or not payload["email"] or not payload["message"]:
        return jsonify({"error": "Name, email, and message are required."}), 400
    row = supabase.table("contact_submissions").insert(payload).execute().data[0]
    return jsonify({"submission": row}), 201


@bp.get("/announcements")
def announcements():
    rows = (
        supabase.table("announcements")
        .select("*")
        .eq("status", "sent")
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )
    return jsonify({"announcements": rows.data or []})


@bp.get("/stats")
def stats():
    lost = supabase.table("items").select("id", count="exact").eq("type", "lost").execute().count or 0
    found = supabase.table("items").select("id", count="exact").eq("type", "found").execute().count or 0
    recovered = supabase.table("items").select("id", count="exact").eq("lifecycle_state", "closed").execute().count or 0
    active = supabase.table("items").select("id", count="exact").eq("status", "active").execute().count or 0
    total = lost + found
    return jsonify({
        "reports": total,
        "recovered": recovered,
        "verified_percent": round((recovered / total) * 100, 1) if total else 0,
        "active_today": active,
    })
