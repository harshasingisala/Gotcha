import React, { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import FilterBar from "../components/FilterBar";
import ItemCard from "../components/ItemCard";
import SkeletonCard from "../components/SkeletonCard";
import { useItems } from "../hooks/useItems";
import { useGsapMotion } from "../hooks/useGsapMotion";
import { api } from "../lib/api";

const features = [
  ["travel_explore", "Smart match engine", "Fuzzy keyword, location, and category signals surface likely matches without manual searching."],
  ["verified_user", "Verified claim flow", "Secret proof, student identity, and staff review keep recoveries trustworthy."],
  ["forum", "Private coordination", "Students can arrange handoff without exposing personal contact details."],
  ["notifications_active", "Real-time campus alerts", "Emergency items and high-confidence matches can be broadcast quickly."],
  ["admin_panel_settings", "Operational admin console", "Claims, moderation, announcements, users, and audit trails stay in one place."],
  ["map", "Loss-pattern intelligence", "Heatmaps show where recoveries slow down so staff can act early."]
];

function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-black text-navy">
          <span className="material-symbols-outlined filled grid h-9 w-9 place-items-center rounded-lg bg-orange text-white">location_on</span>
          <span>Campus Found</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold text-muted md:flex">
          <Link className="hover:text-navy" to="/about">About</Link>
          <Link className="hover:text-navy" to="/services">Services</Link>
          <Link className="hover:text-navy" to="/items">Items</Link>
          <Link className="hover:text-navy" to="/contact">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-bold text-navy hover:bg-surface">Sign in</Link>
          <Link to="/login" className="rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white shadow-soft hover:bg-navy-soft">Launch app</Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#07182f] px-4 py-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 text-xl font-black"><span className="material-symbols-outlined filled text-orange">location_on</span>Campus Found</div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/68">A verified lost-and-found operating system for busy colleges, built around speed, trust, and calm recovery workflows.</p>
        </div>
        <div><b>Explore</b><p className="mt-3 text-sm leading-7 text-white/68">About<br />Services<br />Public items</p></div>
        <div><b>Contact</b><p className="mt-3 text-sm leading-7 text-white/68">hello@campuslost.in<br />Secunderabad, Hyderabad</p></div>
        <div><b>Demo</b><p className="mt-3 text-sm leading-7 text-white/68">Student and admin demo access are available from sign in.</p></div>
      </div>
    </footer>
  );
}

function FeatureCard({ icon, title, body }) {
  return (
    <div className="premium-card motion-reveal rounded-xl p-5" data-tilt>
      <span className="material-symbols-outlined grid h-11 w-11 place-items-center rounded-lg bg-navy text-white">{icon}</span>
      <h3 className="mt-4 text-lg font-black text-navy">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}

export function LandingPage() {
  const motionRef = useRef(null);
  useGsapMotion(motionRef);
  const { items } = useItems({ limit: 6 });
  const [stats, setStats] = useState({ reports: 0, recovered: 0, verified_percent: 0, active_today: 0 });
  React.useEffect(() => {
    api.get("/public/stats").then((res) => {
      if (typeof res.data === "object" && !Array.isArray(res.data)) setStats(res.data);
    }).catch(() => {});
  }, []);
  const heroItems = items.slice(0, 3);
  const recovered = items.filter((item) => item.status === "returned").slice(0, 3);
  return (
    <div ref={motionRef} className="min-h-screen bg-page text-text">
      <PublicNav />
      <section className="relative overflow-hidden bg-[#f7fbff] px-4 pb-8 pt-8 text-text md:pt-10" data-parallax-scene>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(253,118,26,0.18),transparent_18rem),radial-gradient(circle_at_16%_38%,rgba(0,36,82,0.10),transparent_20rem)]" />
        <div className="absolute right-0 top-0 h-full w-[44%] bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1100&q=80')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-page to-transparent" />
        <div className="mx-auto grid min-h-[600px] max-w-7xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]" data-parallax="0.025">
          <div className="relative z-10 max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-orange/10 px-3 py-1 text-sm font-black text-orange-deep">
              <span className="material-symbols-outlined text-[18px]">verified</span> Trusted campus recovery network
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.02] text-navy md:text-7xl">Campus Found</h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-muted md:text-xl">A living lost-and-found command center with instant reports, smart matches, claim confidence, private handoffs, and admin control.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-orange px-5 py-3 font-black text-white shadow-lift hover:bg-orange-deep"><span className="material-symbols-outlined text-[19px]">add_circle</span>Report an item</Link>
              <Link to="/items" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-black text-navy shadow-soft ring-1 ring-surface-strong hover:bg-surface"><span className="material-symbols-outlined text-[19px]">inventory_2</span>Browse items</Link>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-4">
              {[
                [stats.reports || items.length, " reports"],
                [stats.recovered || recovered.length, " recovered"],
                [stats.verified_percent || 0, "% verified"],
                [stats.active_today || items.filter((item) => item.status === "active").length, " live"]
              ].map(([value, suffix]) => <div key={suffix} className="rounded-lg border border-surface-strong bg-white p-3 font-black text-navy shadow-soft" data-tilt>{value.toLocaleString()}{suffix}</div>)}
            </div>
          </div>

          <div className="relative z-10" data-tilt>
            <div className="overflow-hidden rounded-xl border border-surface-strong bg-white shadow-[0_28px_90px_rgba(17,28,45,0.16)]">
              <div className="flex items-center justify-between border-b border-surface-strong bg-surface/70 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-300" />
                  <span className="h-3 w-3 rounded-full bg-yellow-300" />
                  <span className="h-3 w-3 rounded-full bg-green-300" />
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">Live matching</span>
              </div>
              <div className="grid gap-4 p-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-white p-3 text-navy shadow-soft">
                    <span className="material-symbols-outlined text-orange">search</span>
                    <span className="text-sm font-black">Search wallet, ID card, earbuds...</span>
                  </div>
                  {heroItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg border border-surface-strong bg-white p-3 text-navy shadow-soft" data-float={index === 1 ? "true" : undefined}>
                      <img className="h-14 w-14 rounded-lg object-cover" src={item.image_url} alt="" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black">{item.title}</div>
                        <div className="mt-1 flex items-center gap-1 text-xs font-bold text-muted"><span className="material-symbols-outlined text-[14px]">location_on</span>{item.location}</div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-black ${item.type === "lost" ? "bg-orange/12 text-orange-deep" : "bg-green-100 text-green-700"}`}>{item.type}</span>
                    </div>
                  ))}
                </div>
                <div className="grid content-between gap-3">
                  <div className="rounded-lg bg-navy p-4 shadow-soft">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black">Claim confidence</span>
                      <span className="rounded-full bg-orange px-3 py-1 text-xs font-black">91%</span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/12"><div className="h-2 w-[91%] rounded-full bg-orange" /></div>
                    <p className="mt-3 text-xs font-semibold leading-5 text-white/68">Proof answer, location, category, and student account all line up.</p>
                  </div>
                  <div className="rounded-lg bg-white p-4 text-navy shadow-soft">
                    <div className="flex items-center gap-2 text-sm font-black"><span className="material-symbols-outlined text-orange">bolt</span>Recovery timeline</div>
                    <div className="mt-4 space-y-3 text-xs font-bold">
                      {["Found report created", "Smart match detected", "Private handoff ready"].map((step) => <div key={step} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange" />{step}</div>)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white/92 p-3 text-navy shadow-soft"><div className="text-2xl font-black">8m</div><div className="text-xs font-bold text-muted">fastest match</div></div>
                    <div className="rounded-lg bg-white/92 p-3 text-navy shadow-soft"><div className="text-2xl font-black">24/7</div><div className="text-xs font-bold text-muted">alerts active</div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-4 top-8 hidden rounded-lg border border-orange/20 bg-white px-4 py-3 text-sm font-black text-orange-deep shadow-lift md:block" data-float data-parallax="0.18">Emergency alert sent</div>
            <div className="pointer-events-none absolute -left-5 bottom-12 hidden rounded-lg border border-navy/10 bg-white px-4 py-3 text-sm font-black text-navy shadow-lift md:block" data-float data-parallax="0.22">ID card matched in 8 min</div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start" data-parallax-scene>
        <div className="motion-reveal">
          <p className="text-sm font-black uppercase text-orange-deep">Live recovery desk</p>
          <h2 className="mt-2 text-4xl font-black text-navy">Every recovery has a clear next step.</h2>
          <p className="mt-4 text-base leading-7 text-muted">Campus Found turns scattered WhatsApp posts, office visits, and guesswork into a clean operating flow: report, match, prove, approve, message, return.</p>
          <div className="mt-6 grid gap-3">
            {["Report in under a minute", "Match similar lost and found posts", "Approve claims with proof and audit history"].map((step, index) => (
              <div key={step} className="motion-reveal flex items-center gap-3 rounded-xl bg-white p-4 shadow-soft" data-tilt>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-orange/12 font-black text-orange-deep">{index + 1}</span>
                <b className="text-navy">{step}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2" data-parallax="0.08">
          {items.slice(0, 4).map((item) => <div className="motion-reveal" data-tilt key={item.id}><ItemCard item={item} /></div>)}
        </div>
      </section>

      <section className="bg-[#eef5ff] px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="motion-reveal max-w-2xl">
            <p className="text-sm font-black uppercase text-orange-deep">Built for real campus pressure</p>
            <h2 className="mt-2 text-4xl font-black text-navy">Fast for students. Serious for staff.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map(([icon, title, body]) => <FeatureCard key={title} icon={icon} title={title} body={body} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="motion-reveal mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase text-orange-deep">Proof it works</p>
            <h2 className="mt-2 text-3xl font-black text-navy">Recently recovered</h2>
          </div>
          <Link to="/items" className="inline-flex items-center gap-2 text-sm font-black text-navy">View public board <span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">{recovered.map((item) => <div className="motion-reveal" data-tilt key={item.id}><ItemCard item={item} /></div>)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="command-surface motion-reveal rounded-xl p-8 text-white md:p-10" data-tilt>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black">Ready to run your campus lost-and-found like a real operation?</h2>
            <p className="mt-3 text-white/76">Use the student or admin demo account and walk through the full recovery loop.</p>
            <Link to="/login" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-black text-navy"><span className="material-symbols-outlined text-[19px]">login</span>Open demo</Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export function AboutPage() {
  const motionRef = useRef(null);
  useGsapMotion(motionRef);
  return (
    <div ref={motionRef} className="bg-page">
      <PublicNav />
      <main className="mx-auto max-w-7xl px-4 py-16">
        <div className="motion-reveal max-w-3xl">
          <p className="text-sm font-black uppercase text-orange-deep">Why it exists</p>
          <h1 className="mt-2 text-5xl font-black text-navy">Lost items should not become lost time.</h1>
          <p className="mt-5 text-lg leading-8 text-muted">Campus Found was designed for the awkward gap between student urgency and administrative overload. It gives both sides a verified, searchable, auditable way to bring belongings home.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {["Trust", "Speed", "Privacy", "Community"].map((value) => <FeatureCard key={value} icon="stars" title={value} body="Every flow is built around confident handoffs, clear proof, and less chaos." />)}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function ServicesPage() {
  const motionRef = useRef(null);
  useGsapMotion(motionRef);
  return (
    <div ref={motionRef} className="bg-page">
      <PublicNav />
      <main className="mx-auto max-w-7xl px-4 py-16">
        <div className="motion-reveal">
          <p className="text-sm font-black uppercase text-orange-deep">Capabilities</p>
          <h1 className="mt-2 max-w-3xl text-5xl font-black text-navy">One platform for reports, claims, messages, analytics, and control.</h1>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {["Students", "Admins", "Institutions"].map((title, index) => <FeatureCard key={title} icon={["school", "admin_panel_settings", "domain"][index]} title={`For ${title}`} body="A complete workflow that feels simple on the surface and structured underneath." />)}
        </div>
        <div className="motion-reveal mt-10 overflow-hidden rounded-xl border border-surface-strong bg-white shadow-soft" data-tilt>
          {["Report items", "Secure claims", "Analytics", "Announcements"].map((row) => <div className="grid grid-cols-3 border-t border-surface-strong p-4 first:border-t-0" key={row}><b>{row}</b><span>Student</span><span>Institution</span></div>)}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function ContactPage() {
  const motionRef = useRef(null);
  useGsapMotion(motionRef);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    setSent(false);
    setSubmitError("");
    const data = new FormData(event.currentTarget);
    api.post("/public/contact", {
      name: data.get("name"),
      email: data.get("email"),
      topic: data.get("topic"),
      message: data.get("message")
    }).then((res) => {
      if (!res.data?.submission) throw new Error("Invalid contact response.");
      event.currentTarget.reset();
      setSent(true);
    }).catch(() => setSubmitError("Could not store the message because the API is not reachable."));
  };
  return (
    <div ref={motionRef} className="bg-page">
      <PublicNav />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="command-surface motion-reveal rounded-xl p-8 text-white" data-tilt>
          <p className="text-sm font-black uppercase text-orange">Contact</p>
          <h1 className="mt-2 text-4xl font-black">Bring Campus Found to your college.</h1>
          <p className="mt-5 leading-7 text-white/75">hello@campuslost.in<br />+91 90000 00000<br />Secunderabad, Hyderabad<br />Mon-Fri, 9am-6pm IST</p>
        </div>
        <form onSubmit={submit} className="premium-card motion-reveal rounded-xl p-6 md:p-8" data-tilt>
          <div className="grid gap-4 md:grid-cols-2">
            <input name="name" className="input-polish" placeholder="Name" required />
            <input name="email" className="input-polish" type="email" placeholder="Email" required />
            <select name="topic" className="input-polish md:col-span-2"><option>Lost item</option><option>Found item</option><option>Partnership</option><option>Bug report</option></select>
            <textarea name="message" className="input-polish md:col-span-2" rows="6" placeholder="Message" required />
          </div>
          {sent && <p className="mt-4 rounded-lg bg-green-100 p-3 text-sm font-black text-green-700">Message received and stored for the campus team.</p>}
          {submitError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-black text-red-700">{submitError}</p>}
          <button className="mt-5 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-3 font-black text-white"><span className="material-symbols-outlined text-[18px]">send</span>Submit</button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export function PublicItemsPage() {
  const motionRef = useRef(null);
  useGsapMotion(motionRef);
  const { items, loading, error, setFilters } = useItems({ limit: 30, status: "active" });
  const onChange = useCallback((filters) => setFilters({ ...filters, limit: 30 }), [setFilters]);
  return (
    <div ref={motionRef} className="bg-page">
      <PublicNav />
      <main className="mx-auto max-w-7xl px-4 py-16">
        <div className="motion-reveal mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase text-orange-deep">Public board</p>
            <h1 className="mt-2 text-5xl font-black text-navy">Browse campus reports</h1>
            <p className="mt-3 text-muted">Read-only preview. Sign in to claim, message, or report a match.</p>
          </div>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-orange px-5 py-3 font-black text-white"><span className="material-symbols-outlined text-[18px]">login</span>Sign in to claim</Link>
        </div>
        <FilterBar type="" onChange={onChange} />
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{loading && !items.length ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />) : items.map((item) => <div className="motion-reveal" data-tilt key={item.id}><ItemCard item={item} /></div>)}</div>
        {!loading && !items.length && <div className="mt-6"><EmptyState title="No public reports match" message="Try another category or campus zone, or sign in to create the first report for this area." ctaLabel="Open app" ctaPath="/login" /></div>}
      </main>
      <Footer />
    </div>
  );
}
