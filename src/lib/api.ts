// Client-side API fetch helpers

const BASE = "";

export async function fetchVenues(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await fetch(`${BASE}/api/venues${qs}`);
  if (!res.ok) throw new Error("Failed to fetch venues");
  return res.json();
}

export async function fetchVenue(id: string) {
  const res = await fetch(`${BASE}/api/venues/${id}`);
  if (!res.ok) throw new Error("Failed to fetch venue");
  return res.json();
}

export async function fetchTournaments(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await fetch(`${BASE}/api/tournaments${qs}`);
  if (!res.ok) throw new Error("Failed to fetch tournaments");
  return res.json();
}

export async function fetchTournament(id: string) {
  const res = await fetch(`${BASE}/api/tournaments/${id}`);
  if (!res.ok) throw new Error("Failed to fetch tournament");
  return res.json();
}

export async function fetchCoaches(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await fetch(`${BASE}/api/coaches${qs}`);
  if (!res.ok) throw new Error("Failed to fetch coaches");
  return res.json();
}

export async function triggerSync(source: string) {
  const res = await fetch(`${BASE}/api/admin/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source }),
  });
  return res.json();
}
