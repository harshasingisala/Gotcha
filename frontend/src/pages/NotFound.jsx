import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-page px-4 py-10 text-text">
      <section className="w-full max-w-xl rounded-xl border border-surface-strong bg-white p-8 text-center shadow-soft md:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-orange text-white shadow-soft">
          <span className="material-symbols-outlined">travel_explore</span>
        </div>
        <p className="mt-6 text-7xl font-black leading-none text-navy md:text-8xl">404</p>
        <h1 className="mt-4 text-3xl font-black text-navy">Page not found</h1>
        <p className="mt-3 text-muted">This link may be broken or the item may have been removed.</p>
        <Link className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-orange px-6 font-black text-white shadow-soft hover:bg-orange-deep" to="/">Back to feed</Link>
      </section>
    </main>
  );
}
