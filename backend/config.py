import json
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    REQUIRED = [
        "SECRET_KEY",
        "FRONTEND_URL",
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_JWT_SECRET",
    ]

    SECRET_KEY = os.getenv("SECRET_KEY")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
    SUPABASE_JWKS = json.loads(os.getenv("SUPABASE_JWKS", '{"keys": []}'))
    ITEM_IMAGE_BUCKET = os.getenv("ITEM_IMAGE_BUCKET", "item-images")
    MAX_IMAGE_BYTES = 5 * 1024 * 1024
    ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
    ALLOWED_EMAIL_DOMAINS = {
        domain.strip().lower().lstrip("@")
        for domain in os.getenv("ALLOWED_EMAIL_DOMAINS", "").split(",")
        if domain.strip()
    }
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    EMAIL_FROM = os.getenv("EMAIL_FROM", "Campus Found <notifications@campusfound.app>")
    VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
    VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
    VAPID_CLAIMS_EMAIL = os.getenv("VAPID_CLAIMS_EMAIL", "mailto:admin@campusfound.app")

    @classmethod
    def validate(cls):
        missing = [name for name in cls.REQUIRED if not os.getenv(name)]
        if missing:
            raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")
