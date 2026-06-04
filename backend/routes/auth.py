from flask import Blueprint, g, jsonify, request
from config import Config
from middleware.auth_guard import auth_required
from utils.supabase_client import supabase

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _email_allowed(email):
    if not Config.ALLOWED_EMAIL_DOMAINS:
        return True
    domain = (email or "").split("@")[-1].lower()
    return domain in Config.ALLOWED_EMAIL_DOMAINS


@bp.get("/me")
@auth_required
def me():
    return jsonify({"user": g.user})


@bp.patch("/profile")
@auth_required
def profile():
    data = request.get_json() or {}
    full_name = (data.get("full_name") or "").strip()
    if not full_name:
        return jsonify({"error": "Full name is required."}), 400
    payload = {
        "id": g.user["id"],
        "full_name": full_name,
        "email": g.user.get("email") or data.get("email", ""),
        "student_id": data.get("student_id"),
        "college": data.get("college"),
        "avatar_url": data.get("avatar_url"),
    }
    if not _email_allowed(payload["email"]):
        return jsonify({"error": "Use your official college email to finish setup."}), 403
    response = supabase.table("users").upsert(payload).execute()
    return jsonify({"user": response.data[0] if response.data else payload})
