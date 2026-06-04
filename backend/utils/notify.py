import json
from urllib import request as urlrequest
from urllib.error import URLError

from config import Config
from utils.supabase_client import supabase

try:
    from pywebpush import WebPushException, webpush
except Exception:  # pragma: no cover - optional deployment dependency
    WebPushException = Exception
    webpush = None


def _delivery(notification_id, user_id, channel, status, detail=None):
    try:
        supabase.table("notification_deliveries").insert({
            "notification_id": notification_id,
            "user_id": user_id,
            "channel": channel,
            "status": status,
            "detail": (detail or "")[:500],
        }).execute()
    except Exception:
        pass


def _user(user_id):
    try:
        return supabase.table("users").select("id,email,full_name").eq("id", user_id).maybe_single().execute().data or {}
    except Exception:
        return {}


def _send_email(notification, recipient):
    email = recipient.get("email")
    if not Config.RESEND_API_KEY or not email:
        _delivery(notification["id"], notification["user_id"], "email", "skipped", "Missing RESEND_API_KEY or recipient email.")
        return
    payload = {
        "from": Config.EMAIL_FROM,
        "to": [email],
        "subject": notification["title"],
        "html": (
            f"<div style='font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111c2d'>"
            f"<h2 style='color:#002452'>Campus Found</h2>"
            f"<p><strong>{notification['title']}</strong></p>"
            f"<p>{notification.get('body') or ''}</p>"
            f"<p><a href='{Config.FRONTEND_URL}' style='color:#fd761a;font-weight:700'>Open Campus Found</a></p>"
            f"</div>"
        ),
    }
    req = urlrequest.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {Config.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlrequest.urlopen(req, timeout=8) as response:
            _delivery(notification["id"], notification["user_id"], "email", "sent", f"HTTP {response.status}")
    except URLError as exc:
        _delivery(notification["id"], notification["user_id"], "email", "failed", str(exc))


def _send_push(notification):
    if not webpush or not Config.VAPID_PUBLIC_KEY or not Config.VAPID_PRIVATE_KEY:
        _delivery(notification["id"], notification["user_id"], "push", "skipped", "Push is not configured.")
        return
    rows = supabase.table("push_subscriptions").select("*").eq("user_id", notification["user_id"]).execute().data or []
    if not rows:
        _delivery(notification["id"], notification["user_id"], "push", "skipped", "No push subscription.")
        return
    payload = json.dumps({
        "title": notification["title"],
        "body": notification.get("body") or "",
        "url": Config.FRONTEND_URL,
    })
    for row in rows:
        subscription = {
            "endpoint": row["endpoint"],
            "keys": {"p256dh": row["p256dh"], "auth": row["auth"]},
        }
        try:
            webpush(
                subscription_info=subscription,
                data=payload,
                vapid_private_key=Config.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": Config.VAPID_CLAIMS_EMAIL},
            )
            _delivery(notification["id"], notification["user_id"], "push", "sent", row["endpoint"][:120])
        except WebPushException as exc:
            _delivery(notification["id"], notification["user_id"], "push", "failed", str(exc))


def notify_user(user_id, type_, title, body, *, email=True, push=True):
    notification = supabase.table("notifications").insert({
        "user_id": user_id,
        "type": type_,
        "title": title,
        "body": body,
    }).execute().data[0]
    recipient = _user(user_id)
    if email:
        _send_email(notification, recipient)
    if push:
        _send_push(notification)
    return notification
