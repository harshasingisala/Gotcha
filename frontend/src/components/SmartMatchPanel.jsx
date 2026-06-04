import React, { useEffect, useState } from "react";
import ItemCard from "./ItemCard";
import { api } from "../lib/api";
import { useItems } from "../hooks/useItems";

export default function SmartMatchPanel({ item }) {
  const { items } = useItems({ type: "lost", status: "active", limit: 1 });
  const source = item || items[0];
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    let alive = true;
    if (!source?.id) {
      setMatches([]);
      return () => { alive = false; };
    }
    api.get(`/items/${source.id}/matches`).then((res) => {
      if (!Array.isArray(res.data?.matches)) throw new Error("Invalid matches response.");
      if (alive) setMatches(res.data.matches || []);
    }).catch(() => {
      if (alive) setMatches([]);
    });
    return () => { alive = false; };
  }, [source?.id]);

  return (
    <section className="rounded-xl border border-orange/20 bg-gradient-to-br from-orange/10 via-white to-surface p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-orange-deep">AI Match Engine</p>
          <h2 className="mt-1 text-xl font-black text-navy">Potential matches found</h2>
          <p className="mt-1 text-sm text-muted">Weighted category, zone, location, title, and description scoring with explainable reasons.</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-orange-deep shadow-soft">Live scoring</span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {matches.map((match) => (
          <div key={match.id} className="relative">
            <div className="absolute right-3 top-3 z-10 rounded-full bg-navy px-3 py-1 text-xs font-black text-white">{match.matchScore}% match</div>
            <ItemCard item={match} />
            {!!match.match_reasons?.length && <div className="mt-2 rounded-lg bg-white p-3 text-xs font-bold text-muted shadow-soft">{match.match_reasons.slice(0, 2).join(" • ")}</div>}
          </div>
        ))}
        {!matches.length && <p className="text-sm text-muted">No high-confidence matches yet. New found reports will be checked automatically.</p>}
      </div>
    </section>
  );
}
