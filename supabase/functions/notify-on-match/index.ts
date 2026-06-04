import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FCM_SERVER_KEY = Deno.env.get("FCM_SERVER_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

type ItemRecord = {
  id: string;
  user_id: string;
  type: string;
  title?: string;
  category?: string;
  location_zone?: string;
  status?: string;
};

Deno.serve(async (req) => {
  try {
    if (!FCM_SERVER_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return json({ error: "Missing required Edge Function secrets." }, 500);
    }

    const payload = await req.json();
    const newItem = payload.record as ItemRecord | undefined;

    if (!newItem || newItem.type?.toLowerCase() !== "found") {
      return new Response("Not a found item - skipping", { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: matches, error: matchErr } = await supabase
      .from("items")
      .select("id, user_id, title, category, location_zone")
      .eq("type", "lost")
      .eq("category", newItem.category)
      .eq("location_zone", newItem.location_zone)
      .neq("user_id", newItem.user_id)
      .eq("status", "active")
      .in("lifecycle_state", ["reported", "matched"]);

    if (matchErr) throw matchErr;
    if (!matches?.length) {
      return new Response("No matches found", { status: 200 });
    }

    const userIds = [...new Set(matches.map((match) => match.user_id))];
    const { data: tokens, error: tokenErr } = await supabase
      .from("push_subscriptions")
      .select("user_id, fcm_token")
      .in("user_id", userIds)
      .not("fcm_token", "is", null);

    if (tokenErr) throw tokenErr;
    if (!tokens?.length) {
      return new Response("No push tokens for matched users", { status: 200 });
    }

    const staleTokens: string[] = [];

    await Promise.all(
      tokens.map(async ({ fcm_token }) => {
        const res = await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            Authorization: `key=${FCM_SERVER_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            to: fcm_token,
            notification: {
              title: "Possible match found!",
              body: `A ${newItem.category || "item"} was found in ${newItem.location_zone || "campus"}. Check Campus Lost.`
            },
            data: {
              item_id: newItem.id,
              url: `/app/items/${newItem.id}`
            },
            webpush: {
              fcm_options: { link: `/app/items/${newItem.id}` }
            }
          })
        });

        const result = await safeJson(res);
        const failedResult = result?.results?.[0];
        if (
          res.status === 404 ||
          res.status === 410 ||
          failedResult?.error === "InvalidRegistration" ||
          failedResult?.error === "NotRegistered"
        ) {
          staleTokens.push(fcm_token);
        }
      })
    );

    if (staleTokens.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("fcm_token", staleTokens);
    }

    return json({ sent: tokens.length, staleRemoved: staleTokens.length });
  } catch (err) {
    console.error("[notify-on-match]", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
