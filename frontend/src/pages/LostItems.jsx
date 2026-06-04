import React, { useCallback } from "react";
import EmptyState from "../components/EmptyState";
import FilterBar from "../components/FilterBar";
import ItemCard from "../components/ItemCard";
import NewItemsToast from "../components/NewItemsToast";
import SkeletonCard from "../components/SkeletonCard";
import StudentPageHeader from "../components/StudentPageHeader";
import { useItems } from "../hooks/useItems";
import { useRealtimeFeed } from "../hooks/useRealtimeFeed";
import { useAuthStore } from "../store/authStore";

export default function LostItems() {
  const initialFilters = { type: "lost", status: "active" };
  const currentUser = useAuthStore((state) => state.user);
  const [feedFilters, setFeedFilters] = React.useState(initialFilters);
  const { items, loading, error, setFilters, fetchItems, loadMore, page, pages } = useItems(initialFilters);
  const { newCount, clearCount, realtimeStatus } = useRealtimeFeed({
    filters: {
      type: feedFilters.type,
      category: feedFilters.category,
      zone: feedFilters.location_zone,
      status: feedFilters.status,
      lifecycle_state: feedFilters.lifecycle_state,
      location: feedFilters.location,
      q: feedFilters.q,
      date_from: feedFilters.date_from,
      date_to: feedFilters.date_to,
    },
    currentUserId: currentUser?.id,
  });
  const onChange = useCallback((filters) => {
    setFeedFilters(filters);
    setFilters(filters);
  }, [setFilters]);
  const handleToastRefresh = useCallback(() => {
    clearCount();
    fetchItems(1, false);
  }, [clearCount, fetchItems]);

  return (
    <section className="space-y-5">
      <StudentPageHeader icon="search" title="Lost Items" description="Browse student reports, filter by category or place, and help bring belongings back home." actionLabel="Report lost item" actionTo="/app/report" />
      <FilterBar type="lost" onChange={onChange} />
      <NewItemsToast count={newCount} onRefresh={handleToastRefresh} />
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{loading && items.length === 0 ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />) : items.map((item) => <ItemCard key={item.id} item={item} />)}</div>
      {!loading && !items.length && <EmptyState title="No lost reports here" message="No lost reports match these filters. Create a quick report so matching and notifications can start working for you." ctaLabel="Report lost item" ctaPath="/app/report" />}
      {realtimeStatus === "CHANNEL_ERROR" && <p className="text-center text-xs text-muted">Live updates paused - check connection</p>}
      {page < pages && <button className="rounded-lg bg-navy px-5 py-3 text-sm font-black text-white shadow-sm" onClick={loadMore}>Load more</button>}
    </section>
  );
}
