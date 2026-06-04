from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, join_room
from postgrest.exceptions import APIError
from config import Config
from middleware.rate_limit import rate_limit
from routes import admin, assistant, auth, claims, items, messages, notifications, public, search

socketio = SocketIO(cors_allowed_origins=Config.FRONTEND_URL, async_mode="eventlet")


def create_app():
    Config.validate()
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins=[Config.FRONTEND_URL], supports_credentials=True)
    socketio.init_app(app)
    app.extensions["socketio"] = socketio

    @app.before_request
    def guard_abuse():
        return rate_limit()

    app.register_blueprint(auth.bp)
    app.register_blueprint(items.bp)
    app.register_blueprint(claims.bp)
    app.register_blueprint(messages.bp)
    app.register_blueprint(notifications.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(assistant.bp)
    app.register_blueprint(public.bp)
    app.register_blueprint(search.bp)

    @app.get("/api/health")
    def health():
        return jsonify({"ok": True})

    @app.errorhandler(ValueError)
    def value_error(exc):
        return jsonify({"error": str(exc)}), 400

    @app.errorhandler(APIError)
    def supabase_error(exc):
        detail = getattr(exc, "message", None) or str(exc)
        if "schema cache" in detail or "Could not find the table" in detail:
            return jsonify({
                "error": "Supabase database is not set up yet. Apply the SQL files in supabase/migrations, then retry.",
                "code": "SUPABASE_SCHEMA_MISSING",
            }), 503
        return jsonify({"error": "Supabase request failed.", "detail": detail}), 502

    return app


@socketio.on("join")
def on_join(payload):
    user_id = (payload or {}).get("user_id")
    if user_id:
        join_room(user_id)


app = create_app()

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
