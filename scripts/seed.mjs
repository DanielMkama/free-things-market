// Seed The Free Things Market (Supabase) with a realistic demo dataset.
//   npm run seed
// Safe to re-run — it deletes the demo auth users (which cascade-deletes their
// data) and rebuilds everything. Needs:
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.",
  );
  process.exit(1);
}

const db = createClient(URL, KEY, { auth: { persistSession: false } });

const iso = (daysAgo = 0) =>
  new Date(Date.now() - daysAgo * 86400000).toISOString();
const inDays = (d) => new Date(Date.now() + d * 86400000).toISOString();
const slug = (t) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48) + `-${Math.random().toString(36).slice(2, 6)}`;

async function must(promiseLike, label) {
  const { data, error } = await promiseLike;
  if (error) {
    console.error(`✗ ${label}:`, error.message);
    process.exit(1);
  }
  return data;
}

/* ---------------- wipe ---------------- */

const DEMO_EMAILS = [
  "admin@freethings.market",
  "daniel@example.com",
  "amina@example.com",
  "john@example.com",
  "kelvin@example.com",
  "asha@example.com",
  "grace@example.com",
  "peter@example.com",
  "lucy@example.com",
  "sam@example.com",
];

console.log("Clearing previous demo data…");
{
  let page = 1;
  for (;;) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.error(error.message);
      process.exit(1);
    }
    for (const u of data.users) {
      if (u.email && DEMO_EMAILS.includes(u.email)) {
        await db.auth.admin.deleteUser(u.id); // cascades to public.users + data
      }
    }
    if (data.users.length < 200) break;
    page += 1;
  }
}
await db.from("events").delete().not("id", "is", null);
await db.from("analytics_events").delete().not("id", "is", null);

/* ---------------- users ---------------- */

async function user(handle, name, email, profile) {
  const password = profile.admin ? "admin12345" : "password123";
  const created = await must(
    db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    }),
    `create auth user ${email}`,
  );
  const id = created.user.id;
  await must(
    db
      .from("users")
      .update({
        handle,
        name,
        email,
        role: profile.admin ? "admin" : "member",
        avatar_color: profile.color ?? "#ceff1a",
        headline: profile.headline ?? null,
        bio: profile.bio ?? null,
        city: profile.city ?? null,
        country: "Tanzania",
        give_tags: profile.give ?? [],
        need_tags: profile.need ?? [],
        onboarded: true,
      })
      .eq("id", id),
    `profile ${handle}`,
  );
  return id;
}

console.log("Creating members…");
const admin = await user("market-team", "Market Team", "admin@freethings.market", {
  admin: true,
  color: "#16150f",
  headline: "Keeping the market kind",
  bio: "We look after The Free Things Market.",
  city: "Arusha",
});
void admin;
const daniel = await user("daniel", "Daniel Mkama", "daniel@example.com", {
  color: "#ceff1a",
  headline: "Brand Designer",
  bio: "Helping people turn ideas into brands.",
  city: "Arusha",
  give: ["Brand design", "Brand strategy", "Books", "1 hour of mentorship"],
  need: ["Photography help"],
});
const amina = await user("amina", "Amina Juma", "amina@example.com", {
  color: "#ffb020",
  headline: "Photographer & job-seeker",
  bio: "Portraits, events, and a lot of coffee.",
  city: "Arusha",
  give: ["Photography", "Portrait sessions"],
  need: ["CV review", "Career advice"],
});
const john = await user("john", "John Melami", "john@example.com", {
  color: "#7cc4ff",
  headline: "Marketing student",
  bio: "Learning by doing.",
  city: "Mwanza",
  give: ["Writing", "Social media help"],
  need: ["Figma basics", "Coding intro"],
});
const kelvin = await user("kelvin", "Kelvin Shirima", "kelvin@example.com", {
  color: "#b0e57c",
  headline: "Self-taught developer",
  bio: "HTML, CSS, and endless curiosity.",
  city: "Dar es Salaam",
  give: ["Intro to coding", "Website feedback"],
  need: ["Design mentorship"],
});
const asha = await user("asha", "Asha Ndlovu", "asha@example.com", {
  color: "#e0c3fc",
  headline: "Small business owner",
  bio: "I read too many business books.",
  city: "Arusha",
  give: ["Business books", "Mentorship"],
  need: ["Bookkeeping help"],
});
const grace = await user("grace", "Grace Mushi", "grace@example.com", {
  color: "#ff8da8",
  headline: "Cook & neighbour",
  bio: "There is always an extra plate.",
  city: "Arusha",
  give: ["Homemade meals", "Cooking lessons"],
  need: ["Plant cuttings"],
});
const peter = await user("peter", "Peter Olek'", "peter@example.com", {
  color: "#ceff1a",
  headline: "Bicycle mechanic",
  bio: "Bikes should not sit broken.",
  city: "Mwanza",
  give: ["Bike repair", "Tools"],
  need: ["Guitar lessons"],
});
const lucy = await user("lucy", "Lucy Kimaro", "lucy@example.com", {
  color: "#7cc4ff",
  headline: "Teacher",
  bio: "Spreadsheets don't have to be scary.",
  city: "Dar es Salaam",
  give: ["Excel", "Maths tutoring"],
  need: ["Public speaking practice"],
});
const sam = await user("sam", "Sam Fadhili", "sam@example.com", {
  color: "#ffb020",
  headline: "Musician",
  bio: "Guitar, keys, patience included.",
  city: "Arusha",
  give: ["Guitar lessons", "Music"],
  need: ["Photography help"],
});

/* ---------------- offers & requests ---------------- */

async function offer(userId, o) {
  const row = await must(
    db
      .from("offers")
      .insert({
        slug: slug(o.title),
        user_id: userId,
        type: o.type,
        title: o.title,
        description: o.desc,
        category: o.cat,
        city: o.city ?? null,
        country: "Tanzania",
        online_available: !!o.online,
        availability: o.avail ?? "Flexible",
        capacity: o.cap ?? null,
        status: "active",
        created_at: iso(o.daysAgo ?? 10),
      })
      .select("id")
      .single(),
    `offer ${o.title}`,
  );
  return row.id;
}

async function request(userId, r) {
  const row = await must(
    db
      .from("requests")
      .insert({
        slug: slug(r.title),
        user_id: userId,
        type: r.type,
        title: r.title,
        description: r.desc,
        category: r.cat,
        city: r.city ?? null,
        country: "Tanzania",
        online_available: !!r.online,
        urgency: r.urg ?? "Whenever",
        status: r.status ?? "active",
        created_at: iso(r.daysAgo ?? 10),
      })
      .select("id")
      .single(),
    `request ${r.title}`,
  );
  return row.id;
}

console.log("Posting offers & requests…");
const offBrand = await offer(daniel, {
  type: "Skill",
  title: "One hour of brand feedback",
  desc: "I'll spend an hour helping someone improve their brand positioning, landing page or visual identity. Practical notes you can act on.",
  cat: "Design",
  city: "Arusha",
  online: true,
  avail: "This week",
  cap: "I can help 2 people",
  daysAgo: 35,
});
await offer(asha, {
  type: "Thing",
  title: "Three business books",
  desc: "I've read these and would love for someone else to enjoy them. Pickup in Arusha.",
  cat: "Books",
  city: "Arusha",
  avail: "Anytime",
  daysAgo: 34,
});
const offCoding = await offer(kelvin, {
  type: "Knowledge",
  title: "Intro to web development",
  desc: "I can walk a beginner through how websites are built — HTML, CSS, and where to go next.",
  cat: "Technology",
  city: "Dar es Salaam",
  online: true,
  daysAgo: 28,
});
await offer(amina, {
  type: "Skill",
  title: "Portrait photography session",
  desc: "One simple portrait session for someone building their professional profile.",
  cat: "Photography",
  city: "Arusha",
  avail: "This month",
  daysAgo: 25,
});
await offer(grace, {
  type: "Thing",
  title: "A homemade meal",
  desc: "I can cook an extra meal for someone nearby this weekend. Let me know about allergies.",
  cat: "Food",
  city: "Arusha",
  avail: "This week",
  daysAgo: 18,
});
await offer(peter, {
  type: "Skill",
  title: "Bicycle repair",
  desc: "Flat tyres, brakes, gears, a full tune-up. Bring your bike to me in Mwanza.",
  cat: "Repair",
  city: "Mwanza",
  avail: "Anytime",
  daysAgo: 15,
});
await offer(lucy, {
  type: "Knowledge",
  title: "Learn practical Excel",
  desc: "Formulas, tables, and the shortcuts that save hours. Great for anyone doing admin work.",
  cat: "Education",
  city: "Dar es Salaam",
  online: true,
  daysAgo: 11,
});
await offer(sam, {
  type: "Time",
  title: "Guitar lesson for a beginner",
  desc: "One hour, first lesson, guitar provided. We'll get you playing a song.",
  cat: "Art",
  city: "Arusha",
  avail: "This week",
  daysAgo: 7,
});
await offer(daniel, {
  type: "Connection",
  title: "Intro to a local print shop",
  desc: "I know a reliable, fair-priced print shop in Arusha and I'm happy to introduce you.",
  cat: "Business",
  city: "Arusha",
  online: true,
  avail: "Anytime",
  daysAgo: 6,
});
await offer(john, {
  type: "Skill",
  title: "Website copy review",
  desc: "I'll read your website and rewrite the confusing parts so visitors actually get it.",
  cat: "Career",
  city: "Mwanza",
  online: true,
  avail: "This week",
  daysAgo: 3,
});

await request(amina, {
  type: "Skill",
  title: "I need help with my CV",
  desc: "I've been applying for jobs and would love someone to review my CV and tell me what's missing.",
  cat: "Career",
  city: "Arusha",
  online: true,
  urg: "This week",
  daysAgo: 24,
});
await request(john, {
  type: "Skill",
  title: "I want to learn the basics of Figma",
  desc: "Looking for someone to spend an hour showing me how to actually use Figma.",
  cat: "Design",
  city: "Mwanza",
  online: true,
  urg: "This month",
  daysAgo: 20,
});
await request(asha, {
  type: "Knowledge",
  title: "I need help with bookkeeping",
  desc: "My small shop's books are a mess. I need someone patient to help me set up a simple system.",
  cat: "Business",
  city: "Arusha",
  daysAgo: 17,
});
await request(kelvin, {
  type: "Knowledge",
  title: "I need design mentorship",
  desc: "I can build things but they look rough. Looking for a designer to review my work now and then.",
  cat: "Design",
  city: "Dar es Salaam",
  online: true,
  daysAgo: 13,
});
await request(sam, {
  type: "Skill",
  title: "I need photos for my music page",
  desc: "A few good photos of me with my guitar for social media and posters.",
  cat: "Photography",
  city: "Arusha",
  urg: "This month",
  daysAgo: 9,
});
await request(lucy, {
  type: "Time",
  title: "I need someone to practise public speaking with",
  desc: "I have a presentation in three weeks and freeze up. Just need a friendly audience once or twice.",
  cat: "Education",
  city: "Dar es Salaam",
  online: true,
  urg: "This week",
  daysAgo: 5,
});
await request(grace, {
  type: "Thing",
  title: "Looking for plant cuttings",
  desc: "Starting a little balcony garden. Any cuttings or seedlings you can spare would be lovely.",
  cat: "Lifestyle",
  city: "Arusha",
  daysAgo: 2,
});

/* ---------------- connections, acts, the chain ---------------- */

async function connection(c) {
  const row = await must(
    db
      .from("connections")
      .insert({
        offer_id: c.offer ?? null,
        request_id: c.request ?? null,
        giver_id: c.giver,
        receiver_id: c.receiver,
        initiator_id: c.initiator,
        message: c.msg ?? null,
        status: c.status,
        created_at: iso(c.daysAgo),
        accepted_at: c.status === "pending" ? null : iso(c.daysAgo - 1),
        completed_at: c.status === "completed" ? iso(c.daysAgo - 2) : null,
      })
      .select("id")
      .single(),
    "connection",
  );
  return row.id;
}

async function act(a) {
  const row = await must(
    db
      .from("generosity_acts")
      .insert({
        giver_id: a.giver,
        receiver_id: a.receiver ?? null,
        connection_id: a.conn ?? null,
        type: a.type ?? null,
        description: a.desc,
        hours: a.hours ?? null,
        is_public: true,
        created_at: iso(a.daysAgo),
      })
      .select("id")
      .single(),
    "act",
  );
  return row.id;
}

async function commitment(g) {
  await must(
    db.from("give_forward_commitments").insert({
      user_id: g.user,
      trigger_act_id: g.trigger ?? null,
      type: g.type,
      commitment_text: g.text,
      deadline: g.deadline,
      status: g.status ?? "pending",
      fulfilled_act_id: g.fulfilled ?? null,
      completed_at: g.completed ?? null,
      created_at: g.created ?? iso(5),
    }),
    "commitment",
  );
}

console.log("Building connections & the generosity chain…");

// pending / accepted / declined samples
await connection({
  offer: offBrand,
  giver: daniel,
  receiver: sam,
  initiator: sam,
  msg: "Hi Daniel — I'd love a second opinion on my music brand.",
  status: "pending",
  daysAgo: 2,
});
await connection({
  offer: offCoding,
  giver: kelvin,
  receiver: john,
  initiator: john,
  msg: "Keen to start with the basics!",
  status: "accepted",
  daysAgo: 4,
});

// 1) Daniel gave brand help to Amina
const cDanielAmina = await connection({
  offer: offBrand,
  giver: daniel,
  receiver: amina,
  initiator: amina,
  msg: "Would love help sharpening how I describe my work.",
  status: "completed",
  daysAgo: 22,
});
const actA = await act({
  giver: daniel,
  receiver: amina,
  conn: cDanielAmina,
  type: "Skill",
  desc: "Helped Amina rewrite her positioning and portfolio intro before job applications.",
  hours: 1,
  daysAgo: 20,
});

// 2) Amina committed to give forward, then gave photography help to John
const reqJohnPhoto = await request(john, {
  type: "Skill",
  title: "I need a decent headshot",
  desc: "Just need one good photo for my applications.",
  cat: "Photography",
  city: "Mwanza",
  urg: "This week",
  daysAgo: 18,
  status: "fulfilled",
});
const cAminaJohn = await connection({
  request: reqJohnPhoto,
  giver: amina,
  receiver: john,
  initiator: amina,
  status: "completed",
  daysAgo: 16,
});
const actB = await act({
  giver: amina,
  receiver: john,
  conn: cAminaJohn,
  type: "Skill",
  desc: "Shot and edited a set of headshots for John's job search.",
  hours: 2,
  daysAgo: 15,
});
await commitment({
  user: amina,
  trigger: actA,
  type: "Give a skill",
  text: "I'll give someone a free photography session.",
  deadline: inDays(-8),
  status: "completed",
  fulfilled: actB,
  completed: iso(15),
  created: iso(19),
});
await must(
  db.rpc("link_act_to_chain", { new_act: actB, trigger_act: actA }),
  "chain link A→B",
);

// 3) John committed, then rewrote Kelvin's website copy
const offJohnCopy = await offer(john, {
  type: "Skill",
  title: "Landing page copy help",
  desc: "I'll rewrite one page of your site.",
  cat: "Career",
  city: "Mwanza",
  online: true,
  avail: "This week",
  daysAgo: 12,
});
const cJohnKelvin = await connection({
  offer: offJohnCopy,
  giver: john,
  receiver: kelvin,
  initiator: kelvin,
  status: "completed",
  daysAgo: 10,
});
const actC = await act({
  giver: john,
  receiver: kelvin,
  conn: cJohnKelvin,
  type: "Skill",
  desc: "Rewrote the homepage copy for Kelvin's portfolio so it finally makes sense.",
  hours: 1.5,
  daysAgo: 9,
});
await commitment({
  user: john,
  trigger: actB,
  type: "Give a skill",
  text: "I'll help someone rewrite their website copy.",
  deadline: inDays(-3),
  status: "completed",
  fulfilled: actC,
  completed: iso(9),
  created: iso(14),
});
await must(
  db.rpc("link_act_to_chain", { new_act: actC, trigger_act: actB }),
  "chain link B→C",
);

// 4) Kelvin has an open Give Forward, due soon (drives the reminders demo)
await commitment({
  user: kelvin,
  trigger: actC,
  type: "Help someone",
  text: "I'll teach a beginner the basics of HTML and CSS.",
  deadline: inDays(1),
  status: "pending",
  created: iso(6),
});

// standalone act + its own open give-forward
const actGrace = await act({
  giver: grace,
  receiver: lucy,
  type: "Thing",
  desc: "Dropped off a week of home-cooked lunches while Lucy was unwell.",
  daysAgo: 5,
});
await commitment({
  user: lucy,
  trigger: actGrace,
  type: "Give your time",
  text: "I'll tutor a student in maths for an afternoon.",
  deadline: inDays(6),
  status: "pending",
  created: iso(4),
});

/* ---------------- a report + events ---------------- */

await must(
  db.from("reports").insert({
    reporter_id: peter,
    content_type: "offer",
    content_id: offCoding,
    reason: "Something else unsafe",
    detail: "Probably fine — just testing the report flow.",
    status: "open",
    created_at: iso(1),
  }),
  "report",
);

await must(
  db.from("events").insert([
    {
      slug: "arusha-spring",
      name: "Free Things Market — Arusha",
      description:
        "Bring something to give. Take something you need. No money at the door.",
      date: inDays(24),
      location: "Themi Living Garden, Arusha",
      status: "upcoming",
    },
    {
      slug: "mwanza-lakeside",
      name: "Free Things Market — Mwanza",
      description:
        "Skills corner, book swap, repair bench, and a lot of introductions.",
      date: inDays(52),
      location: "Rock City Mall forecourt, Mwanza",
      status: "upcoming",
    },
  ]),
  "events",
);

console.log(`
🌱  Seeded The Free Things Market

Log in with:
  admin   →  admin@freethings.market  /  admin12345
  members →  daniel@example.com … sam@example.com  /  password123
`);
