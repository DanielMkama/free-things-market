import "server-only";
import { parseTags } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types (camelCase, app-facing)                                       */
/* ------------------------------------------------------------------ */

export type User = {
  id: string;
  handle: string;
  name: string;
  email: string | null;
  role: "member" | "admin";
  avatarColor: string;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  giveTags: string[];
  needTags: string[];
  onboarded: boolean;
  suspended: boolean;
  createdAt: string;
};

export type Offer = {
  id: string;
  slug: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  category: string;
  city: string | null;
  country: string | null;
  onlineAvailable: boolean;
  availability: string | null;
  capacity: string | null;
  imageUrl: string | null;
  status: string;
  hiddenByAdmin: boolean;
  eventId: string | null;
  createdAt: string;
};

export type RequestPost = {
  id: string;
  slug: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  category: string;
  city: string | null;
  country: string | null;
  onlineAvailable: boolean;
  urgency: string;
  status: string;
  hiddenByAdmin: boolean;
  eventId: string | null;
  createdAt: string;
};

export type Connection = {
  id: string;
  offerId: string | null;
  requestId: string | null;
  giverId: string;
  receiverId: string;
  initiatorId: string;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "completed";
  createdAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
};

export type GenerosityAct = {
  id: string;
  giverId: string;
  receiverId: string | null;
  connectionId: string | null;
  type: string | null;
  description: string;
  hours: number | null;
  imageUrl: string | null;
  isPublic: boolean;
  createdAt: string;
};

export type GiveForwardCommitment = {
  id: string;
  userId: string;
  triggerActId: string | null;
  type: string;
  commitmentText: string;
  deadline: string;
  status: "pending" | "completed" | "expired";
  reminderSentAt: string | null;
  fulfilledActId: string | null;
  completedAt: string | null;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/* Row mappers (snake_case null-proto rows -> typed objects)           */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>;
const s = (v: unknown) => (v == null ? null : String(v));
const b = (v: unknown) => Boolean(v);
const n = (v: unknown) => (v == null ? null : Number(v));

export function mapUser(r: Row): User {
  return {
    id: String(r.id),
    handle: String(r.handle),
    name: String(r.name),
    email: s(r.email),
    role: r.role === "admin" ? "admin" : "member",
    avatarColor: String(r.avatar_color),
    avatarUrl: s(r.avatar_url),
    headline: s(r.headline),
    bio: s(r.bio),
    city: s(r.city),
    country: s(r.country),
    giveTags: parseTags(r.give_tags),
    needTags: parseTags(r.need_tags),
    onboarded: b(r.onboarded),
    suspended: b(r.suspended),
    createdAt: String(r.created_at),
  };
}

export function mapOffer(r: Row): Offer {
  return {
    id: String(r.id),
    slug: String(r.slug),
    userId: String(r.user_id),
    type: String(r.type),
    title: String(r.title),
    description: String(r.description),
    category: String(r.category),
    city: s(r.city),
    country: s(r.country),
    onlineAvailable: b(r.online_available),
    availability: s(r.availability),
    capacity: s(r.capacity),
    imageUrl: s(r.image_url),
    status: String(r.status),
    hiddenByAdmin: b(r.hidden_by_admin),
    eventId: s(r.event_id),
    createdAt: String(r.created_at),
  };
}

export function mapRequest(r: Row): RequestPost {
  return {
    id: String(r.id),
    slug: String(r.slug),
    userId: String(r.user_id),
    type: String(r.type),
    title: String(r.title),
    description: String(r.description),
    category: String(r.category),
    city: s(r.city),
    country: s(r.country),
    onlineAvailable: b(r.online_available),
    urgency: String(r.urgency),
    status: String(r.status),
    hiddenByAdmin: b(r.hidden_by_admin),
    eventId: s(r.event_id),
    createdAt: String(r.created_at),
  };
}

export function mapConnection(r: Row): Connection {
  return {
    id: String(r.id),
    offerId: s(r.offer_id),
    requestId: s(r.request_id),
    giverId: String(r.giver_id),
    receiverId: String(r.receiver_id),
    initiatorId: String(r.initiator_id),
    message: s(r.message),
    status: String(r.status) as Connection["status"],
    createdAt: String(r.created_at),
    acceptedAt: s(r.accepted_at),
    completedAt: s(r.completed_at),
  };
}

export function mapAct(r: Row): GenerosityAct {
  return {
    id: String(r.id),
    giverId: String(r.giver_id),
    receiverId: s(r.receiver_id),
    connectionId: s(r.connection_id),
    type: s(r.type),
    description: String(r.description),
    hours: n(r.hours),
    imageUrl: s(r.image_url),
    isPublic: b(r.is_public),
    createdAt: String(r.created_at),
  };
}

export function mapCommitment(r: Row): GiveForwardCommitment {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    triggerActId: s(r.trigger_act_id),
    type: String(r.type),
    commitmentText: String(r.commitment_text),
    deadline: String(r.deadline),
    status: String(r.status) as GiveForwardCommitment["status"],
    reminderSentAt: s(r.reminder_sent_at),
    fulfilledActId: s(r.fulfilled_act_id),
    completedAt: s(r.completed_at),
    createdAt: String(r.created_at),
  };
}

export type PublicAuthor = Pick<
  User,
  "id" | "handle" | "name" | "avatarColor" | "avatarUrl" | "headline" | "city"
>;

export function mapAuthor(r: Row): PublicAuthor {
  return {
    id: String(r.id),
    handle: String(r.handle),
    name: String(r.name),
    avatarColor: String(r.avatar_color),
    avatarUrl: s(r.avatar_url),
    headline: s(r.headline),
    city: s(r.city),
  };
}
