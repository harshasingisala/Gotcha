export const demoUsers = {
  admin: {
    id: "demo-admin",
    email: "admin@campuslost.demo",
    password: "Admin@123",
    full_name: "Arjun Mehta",
    role: "admin",
    department: "Student Affairs"
  },
  student: {
    id: "demo-student",
    email: "riya.sharma@campuslost.demo",
    password: "Demo@123",
    full_name: "Riya Sharma",
    role: "student",
    department: "Computer Science"
  }
};

export const demoSessionKey = "campus-lost-demo-session";
const demoItemsKey = "campus-lost-demo-items";
const demoClaimsKey = "campus-lost-demo-claims";
const demoNotificationsKey = "campus-lost-demo-notifications";
const demoConversationsKey = "campus-lost-demo-conversations";
const demoAnnouncementsKey = "campus-lost-demo-announcements";
const demoContactsKey = "campus-lost-demo-contacts";
const demoUsersKey = "campus-lost-demo-users";

function demoLifecycle(status) {
  if (status === "returned" || status === "closed") return "closed";
  if (status === "claimed") return "verified";
  return "reported";
}

function demoCategory(title) {
  const value = title.toLowerCase();
  if (value.includes("phone") || value.includes("earbud") || value.includes("watch")) return "Phone";
  if (value.includes("id card")) return "ID Card";
  if (value.includes("key")) return "Keys";
  if (value.includes("bag")) return "Bag";
  if (value.includes("wallet")) return "Wallet";
  if (value.includes("laptop")) return "Laptop";
  return "Other";
}

function demoZone(location) {
  const value = location.toLowerCase();
  if (value.includes("library")) return "Library";
  if (value.includes("cafeteria") || value.includes("canteen")) return "Canteen";
  if (value.includes("b-") || value.includes("block b")) return "Block B";
  if (value.includes("lab")) return "Labs";
  if (value.includes("sport")) return "Sports Ground";
  if (value.includes("admin")) return "Admin Block";
  if (value.includes("parking")) return "Parking";
  return "Other";
}

export function makeDemoSession(user) {
  return {
    access_token: `demo-${user.role}-token`,
    user: { id: user.id, email: user.email },
    demo: true
  };
}

export function getStoredDemoAuth() {
  try {
    const raw = localStorage.getItem(demoSessionKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDemoAuth(user) {
  const auth = { user, session: makeDemoSession(user) };
  localStorage.setItem(demoSessionKey, JSON.stringify(auth));
  return auth;
}

export function clearDemoAuth() {
  localStorage.removeItem(demoSessionKey);
}

export function resetDemoWorkspace() {
  localStorage.removeItem(demoItemsKey);
  localStorage.removeItem(demoClaimsKey);
  localStorage.removeItem(demoNotificationsKey);
  localStorage.removeItem(demoConversationsKey);
  localStorage.removeItem(demoAnnouncementsKey);
  localStorage.removeItem(demoContactsKey);
  localStorage.removeItem(demoUsersKey);
}

export const demoItems = [
  { id: "item-1", title: "Black laptop bag", type: "lost", status: "active", category: "Electronics", location: "Library second floor", description: "Contains a laptop charger, blue notebook, and a small keychain on the zip.", created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), image_url: "", user_id: "demo-student", users: { full_name: "Demo Student" } },
  { id: "item-2", title: "Student ID card", type: "found", status: "active", category: "ID/Documents", location: "Cafeteria counter", description: "Blue lanyard attached. Name partially visible, kept at help desk.", created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), image_url: "", user_id: "demo-2", users: { full_name: "Asha Kumar" } },
  { id: "item-3", title: "Silver water bottle", type: "found", status: "claimed", category: "Accessories", location: "Sports complex", description: "Steel bottle with a sticker near the cap.", created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(), image_url: "", user_id: "demo-3", users: { full_name: "Ravi Patel" } },
  { id: "item-4", title: "Scientific calculator", type: "lost", status: "active", category: "Stationery", location: "Room B-204", description: "Casio calculator with initials written behind the cover.", created_at: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(), image_url: "", user_id: "demo-student", users: { full_name: "Demo Student" } },
  { id: "item-5", title: "Red hoodie", type: "found", status: "returned", category: "Clothing", location: "Auditorium", description: "Medium size hoodie from event rehearsal.", created_at: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), image_url: "", user_id: "demo-4", users: { full_name: "Meera Shah" } },
  { id: "item-6", title: "Wireless earbuds case", type: "lost", status: "active", category: "Electronics", location: "Bus bay", description: "White case, left earbud missing. Last seen near route board.", created_at: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(), image_url: "", user_id: "demo-student", users: { full_name: "Demo Student" } },
  { id: "item-7", title: "Blue umbrella", type: "found", status: "active", category: "Accessories", location: "Admin Block", description: "Foldable umbrella with a striped handle.", created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), image_url: "", user_id: "demo-admin", users: { full_name: "Campus Admin" } },
  { id: "item-8", title: "Notebook set", type: "lost", status: "active", category: "Stationery", location: "Chemistry Lab", description: "Three spiral notebooks bundled with a black elastic band.", created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), image_url: "", user_id: "demo-2", users: { full_name: "Asha Kumar" } },
  { id: "item-9", title: "Smart watch", type: "found", status: "active", category: "Electronics", location: "Main Gate", description: "Black strap, screen locked. Stored with security desk.", created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), image_url: "", user_id: "demo-admin", users: { full_name: "Campus Admin" } },
  { id: "item-10", title: "Lab coat", type: "lost", status: "closed", category: "Clothing", location: "Bio Lab", description: "White coat with a pen in the chest pocket.", created_at: new Date(Date.now() - 1000 * 60 * 60 * 84).toISOString(), image_url: "", user_id: "demo-3", users: { full_name: "Ravi Patel" } },
  { id: "item-11", title: "Library book", type: "found", status: "active", category: "Other", location: "Library return desk", description: "Database systems textbook with sticky notes.", created_at: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(), image_url: "", user_id: "demo-4", users: { full_name: "Meera Shah" } },
  { id: "item-12", title: "Wallet", type: "lost", status: "active", category: "Accessories", location: "Parking lot", description: "Brown wallet with cards. Reward offered by owner.", created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(), image_url: "", user_id: "demo-student", users: { full_name: "Demo Student" } }
].map((item) => ({
  ...item,
  category: demoCategory(item.title),
  location_zone: demoZone(item.location),
  lifecycle_state: demoLifecycle(item.status),
  expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString()
}));

export const demoStats = {
  total_users: 248,
  lost_items: 38,
  found_items: 52,
  pending_claims: 11,
  recovered_items: 41,
  recovery_rate_percent: 73,
  monthly_trends: [
    { month: "Jan", recovered: 6 },
    { month: "Feb", recovered: 9 },
    { month: "Mar", recovered: 7 },
    { month: "Apr", recovered: 13 },
    { month: "May", recovered: 16 },
    { month: "Jun", recovered: 12 }
  ]
};

export const demoHeatmap = [
  { location: "Library", count: 42, risk: "High", left: 18, top: 28 },
  { location: "Canteen", count: 31, risk: "High", left: 42, top: 52 },
  { location: "Bus Stop", count: 24, risk: "Medium", left: 72, top: 34 },
  { location: "Lab Block", count: 19, risk: "Medium", left: 56, top: 22 },
  { location: "Sports Complex", count: 13, risk: "Low", left: 28, top: 68 }
];

export const demoAuditTrail = [
  { id: "audit-1", action: "Claim approved", actor: "Arjun Mehta", target: "Student ID card", risk: "low", created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
  { id: "audit-2", action: "Suspicious claim pattern flagged", actor: "System", target: "karan.verma@campuslost.demo", risk: "high", created_at: new Date(Date.now() - 1000 * 60 * 33).toISOString() },
  { id: "audit-3", action: "Emergency item broadcast sent", actor: "Campus Admin", target: "Wallet near Parking lot", risk: "medium", created_at: new Date(Date.now() - 1000 * 60 * 70).toISOString() },
  { id: "audit-4", action: "Device fingerprint linked", actor: "Risk Engine", target: "2 accounts on same browser", risk: "medium", created_at: new Date(Date.now() - 1000 * 60 * 160).toISOString() }
];

export const demoRiskUsers = [
  { name: "Karan Verma", email: "karan.verma@campuslost.demo", claims: 20, rejected: 18, device: "Chrome / Windows", ip: "103.44.21.90", risk: 91 },
  { name: "Anonymous Pattern", email: "multi-account cluster", claims: 8, rejected: 6, device: "Android WebView", ip: "Same subnet", risk: 76 },
  { name: "Riya Sharma", email: "riya.sharma@campuslost.demo", claims: 2, rejected: 0, device: "Edge / Windows", ip: "Verified campus Wi-Fi", risk: 8 }
];

export const demoReputation = [
  { name: "Asha Kumar", points: 420, badge: "Gold Finder", returns: 7 },
  { name: "Riya Sharma", points: 260, badge: "Silver Finder", returns: 4 },
  { name: "Ravi Patel", points: 130, badge: "Bronze Finder", returns: 2 }
];

export const demoClaims = [
  { id: "claim-1", status: "pending", proof_description: "I can identify the laptop charger brand.", items: { title: "Black laptop bag" }, claimant: { full_name: "Asha Kumar" } },
  { id: "claim-2", status: "approved", proof_description: "ID number matched.", items: { title: "Student ID card" }, claimant: { full_name: "Ravi Patel" } },
  { id: "claim-3", status: "pending", proof_description: "Bottle has a sticker near the cap.", items: { title: "Silver water bottle" }, claimant: { full_name: "Meera Shah" } }
];

export const demoAdminUsers = [
  demoUsers.admin,
  demoUsers.student,
  { id: "demo-2", full_name: "Asha Kumar", email: "asha@campus.test", role: "student", created_at: "2026-05-14" },
  { id: "demo-3", full_name: "Ravi Patel", email: "ravi@campus.test", role: "student", created_at: "2026-05-19" },
  { id: "demo-4", full_name: "Meera Shah", email: "meera@campus.test", role: "student", created_at: "2026-05-22" }
];

export function getDemoAdminUsers() {
  return readJson(demoUsersKey, demoAdminUsers);
}

export function saveDemoAdminUsers(users) {
  return writeJson(demoUsersKey, users);
}

export const demoNotifications = [
  { id: "notif-1", title: "Potential match found", body: "A found smart watch may match a recent lost electronics report.", read: false, created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { id: "notif-2", title: "Claim approved", body: "Your ID card claim was approved. Message the finder to arrange pickup.", read: false, created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: "notif-3", title: "New found item", body: "A blue umbrella was reported near Admin Block.", read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() }
];

export const demoConversations = [
  {
    conversation_id: "conv-1",
    other_user: { id: "demo-2", full_name: "Asha Kumar" },
    item: demoItems[1],
    unread_count: 1,
    last_message: { id: "msg-2", sender_id: "demo-2", receiver_id: "demo-student", content: "I kept the ID card at the cafeteria counter.", created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    messages: [
      { id: "msg-1", conversation_id: "conv-1", sender_id: "demo-student", receiver_id: "demo-2", content: "Hi, is the ID card still available?", created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString() },
      { id: "msg-2", conversation_id: "conv-1", sender_id: "demo-2", receiver_id: "demo-student", content: "I kept the ID card at the cafeteria counter.", created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() }
    ]
  },
  {
    conversation_id: "conv-2",
    other_user: { id: "demo-admin", full_name: "Campus Admin" },
    item: demoItems[8],
    unread_count: 0,
    last_message: { id: "msg-4", sender_id: "demo-student", receiver_id: "demo-admin", content: "I can describe the watch face.", created_at: new Date(Date.now() - 1000 * 60 * 130).toISOString() },
    messages: [
      { id: "msg-3", conversation_id: "conv-2", sender_id: "demo-admin", receiver_id: "demo-student", content: "Please share a unique detail before pickup.", created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString() },
      { id: "msg-4", conversation_id: "conv-2", sender_id: "demo-student", receiver_id: "demo-admin", content: "I can describe the watch face.", created_at: new Date(Date.now() - 1000 * 60 * 130).toISOString() }
    ]
  }
];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function getDemoItems() {
  return readJson(demoItemsKey, demoItems).map((item, index) => ({
    ...item,
    image_url: item.image_url || `https://picsum.photos/seed/campus-lost-${item.id || index}/600/600`
  }));
}

export function saveDemoItems(items) {
  return writeJson(demoItemsKey, items);
}

export function upsertDemoItem(item) {
  const items = getDemoItems();
  const next = items.some((row) => row.id === item.id) ? items.map((row) => row.id === item.id ? item : row) : [item, ...items];
  saveDemoItems(next);
  return item;
}

export function getDemoClaims() {
  return readJson(demoClaimsKey, demoClaims);
}

export function saveDemoClaims(claims) {
  return writeJson(demoClaimsKey, claims);
}

export function getDemoNotifications() {
  return readJson(demoNotificationsKey, demoNotifications);
}

export function saveDemoNotifications(notifications) {
  return writeJson(demoNotificationsKey, notifications);
}

export function addDemoNotification(notification) {
  const next = [{
    id: notification.id || `notif-${Date.now()}`,
    title: notification.title,
    body: notification.body,
    read: false,
    created_at: new Date().toISOString(),
    ...notification
  }, ...getDemoNotifications()];
  saveDemoNotifications(next);
  return next[0];
}

export function getDemoConversations() {
  return readJson(demoConversationsKey, demoConversations);
}

export function saveDemoConversations(conversations) {
  return writeJson(demoConversationsKey, conversations);
}

export function upsertDemoConversation({ item, otherUser, message }) {
  const auth = getStoredDemoAuth();
  const me = auth?.user?.id || "demo-student";
  const conversationId = `conv-${item.id}-${otherUser.id}`;
  const conversations = getDemoConversations();
  const existing = conversations.find((conversation) => conversation.conversation_id === conversationId);
  const nextMessage = {
    id: message?.id || `msg-${Date.now()}`,
    conversation_id: conversationId,
    sender_id: message?.sender_id || otherUser.id,
    receiver_id: message?.receiver_id || me,
    item_id: item.id,
    content: message?.content || `Update about ${item.title}`,
    created_at: new Date().toISOString()
  };
  const nextConversation = existing ? {
    ...existing,
    last_message: nextMessage,
    messages: [...(existing.messages || []), nextMessage],
    unread_count: existing.unread_count || 0
  } : {
    conversation_id: conversationId,
    other_user: otherUser,
    item,
    unread_count: 0,
    last_message: nextMessage,
    messages: [nextMessage]
  };
  const next = existing
    ? conversations.map((conversation) => conversation.conversation_id === conversationId ? nextConversation : conversation)
    : [nextConversation, ...conversations];
  saveDemoConversations(next);
  return nextConversation;
}

export function getDemoAnnouncements() {
  return readJson(demoAnnouncementsKey, [
    { id: "ann-1", title: "Exam week lost-item desk", body: "Extended desk hours near the library help point.", audience: "all", status: "sent", when: "Today", created_at: new Date().toISOString() },
    { id: "ann-2", title: "Sports complex pickup window", body: "Recovered sports gear can be collected tomorrow.", audience: "students", status: "scheduled", when: "Tomorrow", created_at: new Date().toISOString() },
    { id: "ann-3", title: "Library recovery reminder", body: "Check the recovery shelf before leaving campus.", audience: "all", status: "draft", when: "Draft", created_at: new Date().toISOString() }
  ]);
}

export function saveDemoAnnouncements(announcements) {
  return writeJson(demoAnnouncementsKey, announcements);
}

export function saveDemoContact(contact) {
  const contacts = readJson(demoContactsKey, []);
  return writeJson(demoContactsKey, [{ id: `contact-${Date.now()}`, created_at: new Date().toISOString(), ...contact }, ...contacts]);
}

function tokenize(value) {
  return String(value || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

export function scoreItemMatch(source, candidate) {
  const sourceTokens = new Set(tokenize(`${source.title} ${source.description} ${source.category} ${source.location}`));
  const candidateTokens = tokenize(`${candidate.title} ${candidate.description} ${candidate.category} ${candidate.location}`);
  const overlap = candidateTokens.filter((token) => sourceTokens.has(token)).length;
  const categoryBoost = source.category === candidate.category ? 25 : 0;
  const typeBoost = source.type !== candidate.type ? 20 : 0;
  const locationBoost = source.location && candidate.location && source.location.split(" ")[0] === candidate.location.split(" ")[0] ? 10 : 0;
  return Math.min(98, Math.round(overlap * 9 + categoryBoost + typeBoost + locationBoost));
}

export function getSmartMatches(item, limit = 3) {
  return getDemoItems()
    .filter((candidate) => candidate.id !== item.id && candidate.status === "active" && candidate.type !== item.type)
    .map((candidate) => ({ ...candidate, matchScore: scoreItemMatch(item, candidate) }))
    .filter((candidate) => candidate.matchScore >= 35)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

export function getClaimConfidence(item, proof = "") {
  const base = item.category === "ID/Documents" ? 84 : item.category === "Electronics" ? 78 : 71;
  const proofBoost = Math.min(14, tokenize(proof || item.description).length);
  const emailBoost = getStoredDemoAuth()?.user?.email?.includes("campuslost.demo") ? 6 : 0;
  return Math.min(97, base + proofBoost + emailBoost);
}

export function getQrPayload(item) {
  return `CL-${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}`;
}

export function generateAiDescription(title, category) {
  const categoryText = {
    Electronics: "with visible model details and a protective case",
    Accessories: "with identifiable color, texture, and small marks",
    "ID/Documents": "with masked personal details and college verification",
    Stationery: "with brand marks and handwritten identifiers",
    Clothing: "with size, color, and fabric details",
    Other: "with clear identifying characteristics"
  };
  return `${title || "Item"} ${categoryText[category] || categoryText.Other}. Add any secret mark only the owner would know.`;
}
