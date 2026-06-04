from flask import Blueprint, g, jsonify, request
from config import Config
from middleware.auth_guard import auth_required
from utils.supabase_client import supabase

bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


@bp.get("")
@auth_required
def list_notifications():
    rows = supabase.table("notifications").select("*").eq("user_id", g.user["id"]).order("created_at", desc=True).execute()
    return jsonify({"notifications": rows.data or []})


@bp.patch("/read-all")
@auth_required
def read_all():
    supabase.table("notifications").update({"read": True}).eq("user_id", g.user["id"]).execute()
    return jsonify({"ok": True})


@bp.patch("/<notification_id>/read")
@auth_required
def read_one(notification_id):
    row = supabase.table("notifications").update({"read": True}).eq("id", notification_id).eq("user_id", g.user["id"]).execute()
    return jsonify({"notification": row.data[0] if row.data else None})


@bp.get("/push-key")
@auth_required
def push_key():
    return jsonify({"public_key": Config.VAPID_PUBLIC_KEY or ""})


@bp.post("/push-subscription")
@auth_required
def save_push_subscription():
    body = request.get_json() or {}
    keys = body.get("keys") or {}
    endpoint = body.get("endpoint")
    if not endpoint or not keys.get("p256dh") or not keys.get("auth"):
        return jsonify({"error": "Invalid push subscription."}), 400
    row = supabase.table("push_subscriptions").upsert({
        "user_id": g.user["id"],
        "endpoint": endpoint,
        "p256dh": keys["p256dh"],
        "auth": keys["auth"],
        "user_agent": request.headers.get("User-Agent", "")[:500],
    }, on_conflict="endpoint").execute()
    return jsonify({"subscription": row.data[0] if row.data else None}), 201
