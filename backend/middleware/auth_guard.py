from functools import wraps
from flask import g, jsonify, request
from jose import JWTError, jwt
from config import Config
from utils.supabase_client import supabase


def _bearer_token():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    return header.split(" ", 1)[1].strip()


def _decode_supabase_token(token):
    header = jwt.get_unverified_header(token)
    alg = header.get("alg")
    if alg == "ES256":
        kid = header.get("kid")
        key = next((item for item in Config.SUPABASE_JWKS.get("keys", []) if item.get("kid") == kid), None)
        if not key:
            raise JWTError("Missing Supabase signing key")
        return jwt.decode(token, key, algorithms=["ES256"], options={"verify_aud": False})
    return jwt.decode(
        token,
        Config.SUPABASE_JWT_SECRET,
        algorithms=["HS256"],
        options={"verify_aud": False},
    )


def current_user_from_token(required=True):
    token = _bearer_token()
    if not token:
        if required:
            return None, (jsonify({"error": "Missing bearer token"}), 401)
        return None, None
    try:
        payload = _decode_supabase_token(token)
    except JWTError:
        return None, (jsonify({"error": "Invalid or expired token"}), 401)
    user_id = payload.get("sub")
    if not user_id:
        return None, (jsonify({"error": "Invalid token subject"}), 401)
    row = supabase.table("users").select("*").eq("id", user_id).maybe_single().execute()
    user = row.data or {
        "id": user_id,
        "email": payload.get("email", ""),
        "role": "student",
        "full_name": "",
    }
    g.user = user
    g.token_payload = payload
    return user, None


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        _, error = current_user_from_token(required=True)
        if error:
            return error
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user, error = current_user_from_token(required=True)
        if error:
            return error
        if user.get("role") != "admin":
            return jsonify({"error": "Admin role required"}), 403
        return fn(*args, **kwargs)
    return wrapper
