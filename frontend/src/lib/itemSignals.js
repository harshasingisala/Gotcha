function tokenize(value) {
  return String(value || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

export function getClaimConfidence(item, proof = "") {
  const base = item?.category === "ID/Documents" ? 84 : item?.category === "Electronics" ? 78 : 71;
  const proofBoost = Math.min(14, tokenize(proof || item?.description).length);
  const ownerSignal = item?.users?.full_name ? 5 : 0;
  return Math.min(97, base + proofBoost + ownerSignal);
}

export function getQrPayload(item) {
  const slug = String(item?.title || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24);
  return `CL-${item?.id || "pending"}-${slug}`;
}
