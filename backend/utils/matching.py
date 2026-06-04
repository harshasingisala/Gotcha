import re
from datetime import datetime, timedelta, timezone
from utils.supabase_client import supabase

STOPWORDS = {"a", "an", "and", "or", "the", "to", "of", "in", "on", "for", "with", "my", "lost", "found", "item"}


def _keywords(text):
    return {w for w in re.findall(r"[a-z0-9]+", (text or "").lower()) if w not in STOPWORDS and len(w) > 2}


def _score(new_item, candidate):
    score = 0
    reasons = []
    if new_item.get("category") and new_item.get("category") == candidate.get("category"):
        score += 30
        reasons.append(f"Same category: {new_item['category']}")
    if new_item.get("location_zone") and new_item.get("location_zone") == candidate.get("location_zone"):
        score += 25
        reasons.append(f"Same campus zone: {new_item['location_zone']}")
    new_location = (new_item.get("location") or "").lower()
    old_location = (candidate.get("location") or "").lower()
    if new_location and old_location and (new_location in old_location or old_location in new_location):
        score += 15
        reasons.append("Exact location text overlaps")
    title_overlap = _keywords(new_item.get("title")) & _keywords(candidate.get("title"))
    if title_overlap:
        score += min(20, len(title_overlap) * 10)
        reasons.append(f"Title overlap: {', '.join(sorted(title_overlap)[:3])}")
    description_overlap = _keywords(new_item.get("description")) & _keywords(candidate.get("description"))
    if description_overlap:
        score += min(20, len(description_overlap) * 5)
        reasons.append(f"Description overlap: {', '.join(sorted(description_overlap)[:4])}")
    return min(100, score), reasons


def persist_match(source_item, matched_item):
    try:
        return supabase.table("item_matches").upsert({
            "source_item_id": source_item["id"],
            "matched_item_id": matched_item["id"],
            "score": matched_item["match_score"],
            "reasons": matched_item.get("match_reasons") or [],
            "status": "notified" if matched_item["match_score"] >= 70 else "suggested",
        }, on_conflict="source_item_id,matched_item_id").execute().data[0]
    except Exception:
        return None


def find_matches(new_item):
    since = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    response = (
        supabase.table("items")
        .select("*, users!items_user_id_fkey(full_name, avatar_url)")
        .neq("type", new_item["type"])
        .eq("status", "active")
        .gte("created_at", since)
        .limit(50)
        .execute()
    )
    scored = []
    for item in response.data or []:
        if item["id"] == new_item.get("id"):
            continue
        score, reasons = _score(new_item, item)
        if score >= 45:
            scored.append({**item, "match_score": score, "match_reasons": reasons})
    return sorted(scored, key=lambda row: row["match_score"], reverse=True)[:3]
