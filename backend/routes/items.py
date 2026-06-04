from hashlib import sha256
from datetime import datetime, timedelta, timezone
from uuid import uuid4
from flask import Blueprint, g, jsonify, request
from config import Config
from middleware.auth_guard import auth_required
from utils.image_utils import resize_image
from utils.matching import find_matches, persist_match
from utils.notify import notify_user
from utils.supabase_client import supabase

bp = Blueprint("items", __name__, url_prefix="/api/items")
ALLOWED_TYPES = {"lost", "found"}
ALLOWED_STATUS = {"active", "claimed", "returned", "closed"}
ALLOWED_LIFECYCLE = {"reported", "matched", "claimed", "verified", "closed"}
ALLOWED_CATEGORIES = {"Phone", "ID Card", "Keys", "Bag", "Wallet", "Laptop", "Electronics", "Stationery", "ID/Documents", "Clothing", "Accessories", "Other"}
ALLOWED_ZONES = {"Library", "Canteen", "Block A", "Block B", "Block C", "Block D", "Labs", "Parking", "Sports Ground", "Admin Block", "Hostel", "Other"}
PUBLIC_ITEM_SELECT = "id,user_id,type,title,description,category,location,location_zone,date_occurred,image_url,status,lifecycle_state,expires_at,closed_at,created_at,urgency,claim_challenge_questions,users!items_user_id_fkey(full_name, avatar_url)"


def _hash_answer(value):
    normalized = (value or "").strip().lower()
    if not normalized:
        return None
    return sha256(normalized.encode("utf-8")).hexdigest()


def _challenge_questions(category, location_zone):
    return [
        {
            "id": "owner_clue",
            "label": "Owner-only detail",
            "question": "What unique detail proves this item is yours?",
            "required": True,
        },
        {
            "id": "category_check",
            "label": "Item type",
            "question": f"What kind of item are you claiming? Hint: {category}.",
            "required": True,
        },
        {
            "id": "zone_check",
            "label": "Campus zone",
            "question": f"Where did you likely lose it? Hint: {location_zone}.",
            "required": True,
        },
    ]


def _expiry():
    return (datetime.now(timezone.utc) + timedelta(days=14)).isoformat()


def _lifecycle_for_status(status):
    return {
        "active": "reported",
        "claimed": "verified",
        "returned": "closed",
        "closed": "closed",
    }.get(status, "reported")


def _closed_at_for_status(status):
    if status in {"returned", "closed"}:
        return datetime.now(timezone.utc).isoformat()
    return None


def upload_image(file, user_id):
    if not file:
        return None
    data, mimetype = resize_image(file)
    path = f"{user_id}/{uuid4()}.{mimetype.split('/')[-1].replace('jpeg', 'jpg')}"
    supabase.storage.from_(Config.ITEM_IMAGE_BUCKET).upload(path, data, {"content-type": mimetype})
    return supabase.storage.from_(Config.ITEM_IMAGE_BUCKET).get_public_url(path)


def audit(action, actor_id, target_id, target_label, risk="low"):
    try:
        supabase.table("audit_events").insert({
            "actor_id": actor_id,
            "action": action,
            "target_type": "item",
            "target_id": target_id,
            "target_label": target_label,
            "risk": risk,
        }).execute()
    except Exception:
        pass


def notify_item_status(item, status):
    if status not in {"claimed", "returned"}:
        return None
    title = "Item found" if status == "returned" else "Item claim approved"
    body = (
        f"{item['title']} has been marked as found and returned."
        if status == "returned"
        else f"{item['title']} has moved into the claimed recovery stage."
    )
    try:
        return notify_user(item["user_id"], "item_found", title, body)
    except Exception:
        return None


@bp.get("")
def list_items():
    page = max(int(request.args.get("page", 1)), 1)
    limit = min(max(int(request.args.get("limit", 12)), 1), 50)
    query = supabase.table("items").select(PUBLIC_ITEM_SELECT, count="exact")
    for field in ["type", "category", "status", "lifecycle_state", "location_zone"]:
        if request.args.get(field):
            query = query.eq(field, request.args[field])
    if request.args.get("location"):
        query = query.ilike("location", f"%{request.args['location']}%")
    if request.args.get("date_from"):
        query = query.gte("created_at", request.args["date_from"])
    if request.args.get("date_to"):
        query = query.lte("created_at", request.args["date_to"])
    if request.args.get("q"):
        q = request.args["q"][:80].replace(",", " ")
        query = query.or_(f"title.ilike.%{q}%,description.ilike.%{q}%")
    start = (page - 1) * limit
    result = query.order("created_at", desc=True).range(start, start + limit - 1).execute()
    total = result.count or 0
    return jsonify({"data": result.data or [], "total": total, "page": page, "pages": (total + limit - 1) // limit})


@bp.post("")
@auth_required
def create_item():
    form = request.form
    title = (form.get("title") or "").strip()
    description = (form.get("description") or "").strip()
    category = form.get("category") or "Other"
    location_zone = (form.get("location_zone") or "Other").strip()
    item_type = form.get("type")
    if not title or item_type not in ALLOWED_TYPES:
        return jsonify({"error": "Title and a valid type are required."}), 400
    if category not in ALLOWED_CATEGORIES:
        return jsonify({"error": "Choose a valid category."}), 400
    if len(title) > 90:
        return jsonify({"error": "Keep the item title under 90 characters."}), 400
    if len(description) > 600:
        return jsonify({"error": "Keep the description under 600 characters."}), 400
    if len((form.get("location") or "").strip()) > 120:
        return jsonify({"error": "Keep the location under 120 characters."}), 400
    if location_zone not in ALLOWED_ZONES:
        return jsonify({"error": "Choose a valid campus zone."}), 400
    if item_type == "found":
        if not request.files.get("image"):
            return jsonify({"error": "Found item reports need a photo so claims can be verified."}), 400
        if len((form.get("secret_answer") or "").strip()) < 3:
            return jsonify({"error": "Found item reports need one owner-only verification clue."}), 400
    image_url = upload_image(request.files.get("image"), g.user["id"])
    payload = {
        "user_id": g.user["id"],
        "title": title,
        "type": item_type,
        "category": category,
        "location": (form.get("location") or "").strip(),
        "location_zone": location_zone,
        "date_occurred": form.get("date_occurred") or None,
        "description": description,
        "image_url": image_url,
        "lifecycle_state": "reported",
        "expires_at": _expiry(),
        "urgency": "emergency" if form.get("emergency") in {"true", "on", "1"} else "normal",
        "verification_answer_hash": _hash_answer(form.get("secret_answer")),
        "claim_challenge_questions": _challenge_questions(category, location_zone) if item_type == "found" else [],
    }
    created = supabase.table("items").insert(payload).execute().data[0]
    created_public = {key: value for key, value in created.items() if key != "verification_answer_hash"}
    audit("Item reported", g.user["id"], created["id"], created["title"], "medium" if form.get("emergency") else "low")
    notifications = []
    for match in find_matches(created):
        target_user = match["user_id"]
        persist_match(created, match)
        reason = "; ".join(match.get("match_reasons") or []) or "category and location overlap"
        note_row = notify_user(
            target_user,
            "match",
            "Potential item match found",
            f"{created['title']} may match {match['title']} ({match['match_score']}%). {reason}",
        )
        notifications.append(note_row)
    if notifications:
        supabase.table("items").update({"lifecycle_state": "matched"}).eq("id", created["id"]).execute()
        created_public["lifecycle_state"] = "matched"
    return jsonify({"item": created_public, "matches": notifications}), 201


@bp.get("/<item_id>")
def get_item(item_id):
    result = supabase.table("items").select(PUBLIC_ITEM_SELECT).eq("id", item_id).maybe_single().execute()
    if not result.data:
        return jsonify({"error": "Item not found."}), 404
    return jsonify({"item": result.data})


@bp.get("/<item_id>/matches")
def get_matches(item_id):
    result = supabase.table("items").select("*").eq("id", item_id).maybe_single().execute()
    if not result.data:
        return jsonify({"error": "Item not found."}), 404
    matches = [
        {**match, "matchScore": match.get("match_score") or 0}
        for match in find_matches(result.data)
    ]
    return jsonify({"matches": matches})


@bp.patch("/<item_id>/status")
@auth_required
def update_status(item_id):
    status = (request.get_json() or {}).get("status")
    if status not in ALLOWED_STATUS:
        return jsonify({"error": "Invalid status."}), 400
    item = supabase.table("items").select("*").eq("id", item_id).maybe_single().execute().data
    if not item:
        return jsonify({"error": "Item not found."}), 404
    if item["user_id"] != g.user["id"] and g.user.get("role") != "admin":
        return jsonify({"error": "You do not own this item."}), 403
    updated = supabase.table("items").update({
        "status": status,
        "lifecycle_state": _lifecycle_for_status(status),
        "closed_at": _closed_at_for_status(status),
    }).eq("id", item_id).execute().data[0]
    audit("Item status updated", g.user["id"], item_id, item["title"], "medium" if status == "closed" else "low")
    notification = notify_item_status(item, status)
    return jsonify({"item": updated, "notification": notification})


@bp.post("/<item_id>/report")
@auth_required
def report_item(item_id):
    body = request.get_json() or {}
    reason = (body.get("reason") or "").strip()
    if len(reason) < 10:
        return jsonify({"error": "Add a short reason before reporting this item."}), 400
    item = supabase.table("items").select("id,title").eq("id", item_id).maybe_single().execute().data
    if not item:
        return jsonify({"error": "Item not found."}), 404
    row = supabase.table("safety_reports").insert({
        "reporter_id": g.user["id"],
        "target_type": "item",
        "target_id": item_id,
        "reason": reason[:500],
    }).execute().data[0]
    audit("Item safety report submitted", g.user["id"], item_id, item["title"], "medium")
    return jsonify({"report": row}), 201
