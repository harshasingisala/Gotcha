from flask import Blueprint, jsonify, request
from routes.items import PUBLIC_ITEM_SELECT
from utils.supabase_client import supabase

bp = Blueprint("search", __name__, url_prefix="/api/search")


@bp.get("")
def search():
    q = (request.args.get("q", "") or "")[:80].replace(",", " ")
    query = supabase.table("items").select(PUBLIC_ITEM_SELECT).eq("status", "active")
    if q:
        query = query.or_(f"title.ilike.%{q}%,description.ilike.%{q}%,location.ilike.%{q}%")
    for field in ["type", "category", "location_zone", "lifecycle_state"]:
        if request.args.get(field):
            query = query.eq(field, request.args[field])
    return jsonify({"results": query.order("created_at", desc=True).limit(30).execute().data or []})
