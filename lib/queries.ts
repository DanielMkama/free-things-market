import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  mapOffer,
  mapRequest,
  mapAuthor,
  mapUser,
  mapConnection,
  mapAct,
  mapCommitment,
  type Offer,
  type RequestPost,
  type PublicAuthor,
  type User,
  type Connection,
  type GenerosityAct,
  type GiveForwardCommitment,
} from "@/lib/models";

export type OfferWithAuthor = Offer & { author: PublicAuthor };
export type RequestWithAuthor = RequestPost & { author: PublicAuthor };

export type BoardFilters = {
  q?: string;
  type?: string;
  category?: string;
  place?: string; // matches city
  online?: boolean;
};

type Row = Record<string, unknown>;

const AUTHOR_COLS =
  "id,handle,name,avatar_color,avatar_url,headline,city";

const FALLBACK_AUTHOR: PublicAuthor = {
  id: "",
  handle: "",
  name: "A member",
  avatarColor: "#ceff1a",
  avatarUrl: null,
  headline: null,
  city: null,
};

function withAuthor<T>(row: Row, map: (r: Row) => T): T & { author: PublicAuthor } {
  const author = row.author
    ? mapAuthor(row.author as Row)
    : FALLBACK_AUTHOR;
  return { ...map(row), author };
}

/** strip characters that would break a PostgREST `or()` / pattern filter */
function clean(term: string): string {
  return term.replace(/[,()*:%\\]/g, " ").trim();
}

/* ---------------- Offers ---------------- */

export async function listOffers(
  f: BoardFilters = {},
): Promise<OfferWithAuthor[]> {
  const supabase = await createClient();
  let query = supabase
    .from("offers")
    .select(`*, author:users!inner(${AUTHOR_COLS}, suspended)`)
    .eq("status", "active")
    .eq("hidden_by_admin", false)
    .eq("author.suspended", false)
    .order("created_at", { ascending: false });

  if (f.type && f.type !== "All") query = query.eq("type", f.type);
  if (f.category && f.category !== "All")
    query = query.eq("category", f.category);
  if (f.place) query = query.ilike("city", `%${clean(f.place)}%`);
  if (f.online) query = query.eq("online_available", true);
  if (f.q) {
    const q = clean(f.q);
    if (q) query = query.or(`title.ilike.*${q}*,description.ilike.*${q}*`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((r) => withAuthor(r as Row, mapOffer));
}

export async function getOfferBySlug(
  slug: string,
): Promise<OfferWithAuthor | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("offers")
    .select(`*, author:users!inner(${AUTHOR_COLS})`)
    .eq("slug", slug)
    .maybeSingle();
  return data ? withAuthor(data as Row, mapOffer) : null;
}

/* ---------------- Requests ---------------- */

export async function listRequests(
  f: BoardFilters = {},
): Promise<RequestWithAuthor[]> {
  const supabase = await createClient();
  let query = supabase
    .from("requests")
    .select(`*, author:users!inner(${AUTHOR_COLS}, suspended)`)
    .eq("status", "active")
    .eq("hidden_by_admin", false)
    .eq("author.suspended", false)
    .order("created_at", { ascending: false });

  if (f.type && f.type !== "All") query = query.eq("type", f.type);
  if (f.category && f.category !== "All")
    query = query.eq("category", f.category);
  if (f.place) query = query.ilike("city", `%${clean(f.place)}%`);
  if (f.online) query = query.eq("online_available", true);
  if (f.q) {
    const q = clean(f.q);
    if (q) query = query.or(`title.ilike.*${q}*,description.ilike.*${q}*`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((r) => withAuthor(r as Row, mapRequest));
}

export async function getRequestBySlug(
  slug: string,
): Promise<RequestWithAuthor | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("requests")
    .select(`*, author:users!inner(${AUTHOR_COLS})`)
    .eq("slug", slug)
    .maybeSingle();
  return data ? withAuthor(data as Row, mapRequest) : null;
}

/* ---------------- Matching (keyword/category/type overlap — no AI, §13) --- */

export async function matchOffersForRequest(
  req: RequestPost,
  limit = 4,
): Promise<OfferWithAuthor[]> {
  const pool = await listOffers({});
  const words = keywords(`${req.title} ${req.description}`);
  return pool
    .filter((o) => o.userId !== req.userId)
    .map((o) => {
      let score = 0;
      if (o.category === req.category) score += 3;
      if (o.type === req.type) score += 2;
      if (req.onlineAvailable && o.onlineAvailable) score += 1;
      if (req.city && o.city && req.city.toLowerCase() === o.city.toLowerCase())
        score += 2;
      const hay = keywords(`${o.title} ${o.description} ${o.category}`);
      for (const w of words) if (hay.has(w)) score += 1;
      return { o, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.o);
}

export async function matchRequestsForOffer(
  offer: Offer,
  limit = 4,
): Promise<RequestWithAuthor[]> {
  const pool = await listRequests({});
  const words = keywords(`${offer.title} ${offer.description} ${offer.category}`);
  return pool
    .filter((r) => r.userId !== offer.userId)
    .map((r) => {
      let score = 0;
      if (r.category === offer.category) score += 3;
      if (r.type === offer.type) score += 2;
      if (offer.onlineAvailable && r.onlineAvailable) score += 1;
      if (
        offer.city &&
        r.city &&
        offer.city.toLowerCase() === r.city.toLowerCase()
      )
        score += 2;
      const hay = keywords(`${r.title} ${r.description}`);
      for (const w of words) if (hay.has(w)) score += 1;
      return { r, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.r);
}

const STOP = new Set([
  "the", "and", "for", "with", "you", "your", "someone", "need", "want",
  "help", "some", "have", "this", "that", "from", "would", "like", "can",
  "about", "into", "any", "get", "who", "one", "out", "how",
]);

function keywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

/* ---------------- Profiles ---------------- */

export async function getUserByHandle(handle: string): Promise<User | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("handle", handle)
    .maybeSingle();
  return data ? mapUser(data as Row) : null;
}

export async function getPublicOffersForUser(userId: string): Promise<Offer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("offers")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("hidden_by_admin", false)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => mapOffer(r as Row));
}

export async function getPublicActsForUser(
  userId: string,
): Promise<GenerosityAct[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("generosity_acts")
    .select("*")
    .or(`giver_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []).map((r) => mapAct(r as Row));
}

/* ---------------- Connections & dashboard ---------------- */

export type ConnectionView = Connection & {
  giver: PublicAuthor;
  receiver: PublicAuthor;
  offer: Pick<Offer, "id" | "slug" | "title"> | null;
  request: Pick<RequestPost, "id" | "slug" | "title"> | null;
  act: GenerosityAct | null;
};

export async function getConnectionsForUser(
  userId: string,
): Promise<ConnectionView[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("connections")
    .select(
      `*,
       giver:users!connections_giver_id_fkey(${AUTHOR_COLS}),
       receiver:users!connections_receiver_id_fkey(${AUTHOR_COLS}),
       offer:offers(id,slug,title),
       request:requests(id,slug,title),
       act:generosity_acts(*)`,
    )
    .or(`giver_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => {
    const row = r as Row;
    const actRaw = row.act;
    const act = Array.isArray(actRaw) ? actRaw[0] : actRaw;
    const offer = Array.isArray(row.offer) ? row.offer[0] : row.offer;
    const request = Array.isArray(row.request) ? row.request[0] : row.request;
    return {
      ...mapConnection(row),
      giver: row.giver ? mapAuthor(row.giver as Row) : FALLBACK_AUTHOR,
      receiver: row.receiver ? mapAuthor(row.receiver as Row) : FALLBACK_AUTHOR,
      offer: offer
        ? {
            id: String((offer as Row).id),
            slug: String((offer as Row).slug),
            title: String((offer as Row).title),
          }
        : null,
      request: request
        ? {
            id: String((request as Row).id),
            slug: String((request as Row).slug),
            title: String((request as Row).title),
          }
        : null,
      act: act ? mapAct(act as Row) : null,
    };
  });
}

export async function getConnectionById(
  id: string,
): Promise<Connection | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("connections")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapConnection(data as Row) : null;
}

export async function getActByConnection(
  connectionId: string,
): Promise<GenerosityAct | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("generosity_acts")
    .select("*")
    .eq("connection_id", connectionId)
    .maybeSingle();
  return data ? mapAct(data as Row) : null;
}

export async function getActById(id: string): Promise<GenerosityAct | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("generosity_acts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapAct(data as Row) : null;
}

export async function getOpenCommitmentForUser(
  userId: string,
): Promise<GiveForwardCommitment | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("give_forward_commitments")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("deadline", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data ? mapCommitment(data as Row) : null;
}

export async function getCommitmentsForUser(
  userId: string,
): Promise<GiveForwardCommitment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("give_forward_commitments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => mapCommitment(r as Row));
}

export async function getRecentActivityForUser(
  userId: string,
): Promise<GenerosityAct[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("generosity_acts")
    .select("*")
    .or(`giver_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(12);
  return (data ?? []).map((r) => mapAct(r as Row));
}

export async function userName(id: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  return (data?.name as string) ?? "Someone";
}

export async function userEmail(id: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("email")
    .eq("id", id)
    .maybeSingle();
  return (data?.email as string | null) ?? null;
}
