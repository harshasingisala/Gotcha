from collections import Counter, defaultdict
from datetime import date, datetime, timedelta
from flask import Blueprint, g, jsonify, request
from middleware.auth_guard import admin_required
from utils.supabase_client import supabase

bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def audit(action, actor_id=None, target_type=None, target_id=None, target_label=None, risk="low", metadata=None):
    payload = {
        "actor_id": actor_id,
        "action": action,
        "target_type": target_type,
        "target_id": target_id,
        "target_label": target_label,
        "risk": risk,
        "metadata": metadata or {},
    }
    try:
        supabase.table("audit_events").insert(payload).execute()
    except Exception:
        pass


def _items():
    return supabase.table("items").select("*, users!items_user_id_fkey(full_name,email)").execute().data or []


def _claims():
    return supabase.table("claims").select("*, claimant:claimant_id(id,full_name,email), items(title,user_id)").execute().data or []


def _month_label(value):
    if not value:
        return ""
    return datetime.fromisoformat(value.replace("Z", "+00:00")).strftime("%b")


@bp.get("/stats")
@admin_required
def stats():
    users = supabase.table("users").select("id", count="exact").execute().count or 0
    lost = supabase.table("items").select("id", count="exact").eq("type", "lost").execute().count or 0
    found = supabase.table("items").select("id", count="exact").eq("type", "found").execute().count or 0
    recovered = supabase.table("items").select("id", count="exact").eq("lifecycle_state", "closed").execute().count or 0
    pending = supabase.table("claims").select("id", count="exact").eq("status", "pending").execute().count or 0
    items = _items()
    trends_by_month = Counter(_month_label(item.get("created_at")) for item in items if item.get("lifecycle_state") == "closed" or item.get("status") == "returned")
    trends = []
    today = date.today().replace(day=1)
    for i in range(5, -1, -1):
        month = today - timedelta(days=30 * i)
        label = month.strftime("%b")
        trends.append({"month": label, "recovered": trends_by_month.get(label, 0)})
    total_items = lost + found
    return jsonify({
        "total_users": users,
        "lost_items": lost,
        "found_items": found,
        "recovered_items": recovered,
        "pending_claims": pending,
        "recovery_rate_percent": round((recovered / total_items) * 100, 1) if total_items else 0,
        "monthly_trends": trends,
    })


@bp.get("/claims")
@admin_required
def claims():
    rows = supabase.table("claims").select("*, items(*), claimant:claimant_id(*)").order("created_at", desc=True).execute()
    return jsonify({"claims": rows.data or []})


@bp.get("/users")
@admin_required
def users():
    q = request.args.get("q")
    query = supabase.table("users").select("*").order("created_at", desc=True)
    if q:
        query = query.or_(f"full_name.ilike.%{q}%,email.ilike.%{q}%")
    return jsonify({"users": query.execute().data or []})


@bp.patch("/users/<user_id>/role")
@admin_required
def role(user_id):
    role_name = (request.get_json() or {}).get("role")
    if role_name not in {"student", "admin"}:
        return jsonify({"error": "Invalid role."}), 400
    row = supabase.table("users").update({"role": role_name}).eq("id", user_id).execute()
    audit("Role changed", target_type="user", target_id=user_id, target_label=role_name, risk="medium")
    return jsonify({"user": row.data[0] if row.data else None})


@bp.get("/analytics")
@admin_required
def analytics():
    items = _items()
    claims = _claims()
    category_counts = Counter(item.get("category") or "Other" for item in items)
    location_counts = Counter(item.get("location") or "Unknown" for item in items)
    type_counts = Counter(item.get("type") for item in items)
    recovered = Counter(_month_label(item.get("created_at")) for item in items if item.get("lifecycle_state") == "closed" or item.get("status") == "returned")
    monthly_trends = [{"month": label, "recovered": recovered.get(label, 0)} for label in ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]]
    returned_by_category = Counter((item.get("category") or "Other") for item in items if item.get("lifecycle_state") == "closed" or item.get("status") == "returned")
    return jsonify({
        "category_breakdown": [
            {"name": name, "count": count, "recovery_rate_percent": round((returned_by_category.get(name, 0) / count) * 100, 1) if count else 0}
            for name, count in category_counts.most_common()
        ],
        "location_breakdown": [{"name": name, "count": count} for name, count in location_counts.most_common(10)],
        "type_breakdown": [{"name": name or "unknown", "value": count} for name, count in type_counts.items()],
        "monthly_trends": monthly_trends,
        "claim_status": [{"name": name, "count": count} for name, count in Counter(claim.get("status") for claim in claims).items()],
    })


@bp.get("/insights")
@admin_required
def insights():
    items = _items()
    claims = _claims()
    users = supabase.table("users").select("*").execute().data or []
    location_counts = Counter(item.get("location") or "Unknown" for item in items)
    heatmap = []
    for index, (location, count) in enumerate(location_counts.most_common(8)):
        risk = "High" if count >= 8 else "Medium" if count >= 4 else "Low"
        heatmap.append({
            "location": location,
            "count": count,
            "risk": risk,
            "left": [18, 42, 72, 56, 28, 82, 36, 62][index % 8],
            "top": [28, 52, 34, 22, 68, 62, 42, 74][index % 8],
        })
    returns_by_user = defaultdict(int)
    for item in items:
        if item.get("lifecycle_state") == "closed" or item.get("status") == "returned":
            returns_by_user[item.get("user_id")] += 1
    reputation = []
    for user in users:
        returns = returns_by_user.get(user["id"], 0)
        if returns:
            reputation.append({
                "name": user.get("full_name") or user.get("email"),
                "returns": returns,
                "points": returns * 60,
                "badge": "Gold Finder" if returns >= 7 else "Silver Finder" if returns >= 4 else "Bronze Finder",
            })
    claim_counts = defaultdict(lambda: {"claims": 0, "rejected": 0})
    for claim in claims:
        claimant = claim.get("claimant") or {}
        key = claimant.get("email") or claim.get("claimant_id")
        claim_counts[key]["claims"] += 1
        if claim.get("status") == "rejected":
            claim_counts[key]["rejected"] += 1
        claim_counts[key]["name"] = claimant.get("full_name") or "Unknown"
        claim_counts[key]["email"] = claimant.get("email") or key
    risk_users = []
    for row in claim_counts.values():
        risk = min(95, row["rejected"] * 22 + max(0, row["claims"] - 3) * 7)
        if risk >= 20:
            risk_users.append({**row, "risk": risk, "device": "Recent browser session", "ip": "Captured by edge logs"})
    audit_rows = supabase.table("audit_events").select("*").order("created_at", desc=True).limit(20).execute().data or []
    audit_trail = [{
        **event,
        "actor": event.get("actor_id") or "System",
        "target": event.get("target_label") or event.get("target_type") or "Platform",
    } for event in audit_rows]
    return jsonify({"heatmap": heatmap, "reputation": reputation, "risk_users": risk_users, "audit_trail": audit_trail})


@bp.get("/announcements")
@admin_required
def list_announcements():
    rows = supabase.table("announcements").select("*, creator:created_by(full_name,email)").order("created_at", desc=True).execute()
    return jsonify({"announcements": rows.data or []})


@bp.post("/announcements")
@admin_required
def create_announcement():
    body = request.get_json() or {}
    title = (body.get("title") or "").strip()
    content = (body.get("body") or "").strip()
    if not title or not content:
        return jsonify({"error": "Title and body are required."}), 400
    status = "scheduled" if body.get("scheduled") or body.get("status") == "scheduled" else "sent"
    announcement = supabase.table("announcements").insert({
        "title": title,
        "body": content,
        "audience": body.get("audience") or "all",
        "status": status,
        "created_by": g.user["id"],
    }).execute().data[0]
    if status == "sent":
        audience = announcement["audience"]
        users_query = supabase.table("users").select("id,role")
        if audience == "students":
            users_query = users_query.eq("role", "student")
        elif audience == "admins":
            users_query = users_query.eq("role", "admin")
        notifications = [{"user_id": user["id"], "type": "announcement", "title": title, "body": content} for user in users_query.execute().data or []]
        if notifications:
            supabase.table("notifications").insert(notifications).execute()
    audit("Announcement created", target_type="announcement", target_id=announcement["id"], target_label=title, risk="low")
    return jsonify({"announcement": announcement}), 201


@bp.get("/contacts")
@admin_required
def contacts():
    rows = supabase.table("contact_submissions").select("*").order("created_at", desc=True).execute()
    return jsonify({"contacts": rows.data or []})


@bp.get("/safety-reports")
@admin_required
def safety_reports():
    rows = supabase.table("safety_reports").select("*, reporter:reporter_id(full_name,email)").order("created_at", desc=True).execute()
    return jsonify({"reports": rows.data or []})


@bp.post("/users/<user_id>/audit")
@admin_required
def audit_user(user_id):
    body = request.get_json() or {}
    action = body.get("action") or "User audit opened"
    audit(action, target_type="user", target_id=user_id, target_label=body.get("note"), risk=body.get("risk") or "medium")
    return jsonify({"ok": True})
