import uuid
import re
from flask import Blueprint, current_app, g, jsonify, request
from middleware.auth_guard import auth_required
from utils.notify import notify_user
from utils.supabase_client import supabase

bp = Blueprint("messages", __name__, url_prefix="/api/messages")
CONTACT_PATTERN = re.compile(r"(\+?\d[\d\s().-]{7,}\d)|([\w.+-]+@[\w-]+\.[\w.-]+)|(https?://|www\.)", re.IGNORECASE)


def conversation_uuid(sender_id, receiver_id, item_id):
    people = sorted([sender_id, receiver_id])
    source = f"{people[0]}:{people[1]}:{item_id or 'general'}"
    return str(uuid.uuid5(uuid.NAMESPACE_URL, source))


@bp.get("/conversations")
@auth_required
def conversations():
    rows = (
        supabase.table("messages")
        .select("*, sender:sender_id(id,full_name,avatar_url), receiver:receiver_id(id,full_name,avatar_url), items(*)")
        .or_(f"sender_id.eq.{g.user['id']},receiver_id.eq.{g.user['id']}")
        .order("created_at", desc=True)
        .execute()
    )
    grouped = {}
    for msg in rows.data or []:
        cid = msg["conversation_id"]
        if cid not in grouped:
            other = msg["receiver"] if msg["sender_id"] == g.user["id"] else msg["sender"]
            grouped[cid] = {
                "conversation_id": cid,
                "other_user": other,
                "item": msg.get("items"),
                "last_message": msg,
                "unread_count": 0,
            }
        if msg["receiver_id"] == g.user["id"] and not msg["read"]:
            grouped[cid]["unread_count"] += 1
    return jsonify({"conversations": list(grouped.values())})


@bp.get("/<conversation_id>")
@auth_required
def thread(conversation_id):
    rows = (
        supabase.table("messages")
        .select("*, sender:sender_id(id,full_name,avatar_url), receiver:receiver_id(id,full_name,avatar_url), items(*)")
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .execute()
    )
    messages = rows.data or []
    if messages and not any(m["sender_id"] == g.user["id"] or m["receiver_id"] == g.user["id"] for m in messages):
        return jsonify({"error": "Conversation access denied."}), 403
    supabase.table("messages").update({"read": True}).eq("conversation_id", conversation_id).eq("receiver_id", g.user["id"]).execute()
    first = messages[0] if messages else {}
    other = None
    if first:
        other = first["receiver"] if first["sender_id"] == g.user["id"] else first["sender"]
    return jsonify({"messages": messages, "item": first.get("items"), "other_user": other})


@bp.post("")
@auth_required
def send_message():
    body = request.get_json() or {}
    receiver_id = body.get("receiver_id")
    content = (body.get("content") or "").strip()
    if not receiver_id or not content:
        return jsonify({"error": "Receiver and message content are required."}), 400
    if len(content) > 1000:
        return jsonify({"error": "Keep messages under 1000 characters."}), 400
    if CONTACT_PATTERN.search(content):
        return jsonify({"error": "Keep handoff coordination inside Campus Found. Phone numbers, emails, and links are blocked for safety."}), 400
    item_id = body.get("item_id")
    if item_id:
        item = supabase.table("items").select("id,user_id,title").eq("id", item_id).maybe_single().execute().data
        if not item:
            return jsonify({"error": "Item not found."}), 404
        if g.user["id"] != item["user_id"] and receiver_id != item["user_id"]:
            return jsonify({"error": "Item messages must start with the person who posted the listing."}), 403
        if g.user["id"] == item["user_id"] and receiver_id != item["user_id"]:
            incoming = (
                supabase.table("messages")
                .select("id")
                .eq("item_id", item_id)
                .eq("sender_id", receiver_id)
                .eq("receiver_id", g.user["id"])
                .limit(1)
                .execute()
            )
            outgoing = (
                supabase.table("messages")
                .select("id")
                .eq("item_id", item_id)
                .eq("sender_id", g.user["id"])
                .eq("receiver_id", receiver_id)
                .limit(1)
                .execute()
            )
            if not incoming.data and not outgoing.data:
                return jsonify({"error": "Reply from an existing item conversation before messaging this student."}), 403
    cid = conversation_uuid(g.user["id"], receiver_id, item_id)
    message = supabase.table("messages").insert({
        "conversation_id": cid,
        "sender_id": g.user["id"],
        "receiver_id": receiver_id,
        "item_id": item_id,
        "content": content,
    }).execute().data[0]
    note = notify_user(receiver_id, "message", "New message", content[:120], email=False)
    socketio = current_app.extensions.get("socketio")
    if socketio:
        socketio.emit("new_message", message, to=receiver_id)
        socketio.emit("notification", note, to=receiver_id)
    return jsonify({"message": message}), 201


@bp.post("/<message_id>/report")
@auth_required
def report_message(message_id):
    body = request.get_json() or {}
    reason = (body.get("reason") or "").strip()
    if len(reason) < 10:
        return jsonify({"error": "Add a short reason before reporting this message."}), 400
    message = supabase.table("messages").select("*").eq("id", message_id).maybe_single().execute().data
    if not message:
        return jsonify({"error": "Message not found."}), 404
    if message["sender_id"] != g.user["id"] and message["receiver_id"] != g.user["id"]:
        return jsonify({"error": "Message access denied."}), 403
    row = supabase.table("safety_reports").insert({
        "reporter_id": g.user["id"],
        "target_type": "message",
        "target_id": message_id,
        "reason": reason[:500],
    }).execute().data[0]
    return jsonify({"report": row}), 201
