-- ============================================================================
--  THE FREE THINGS MARKET — Supabase schema
--  Run this once in the Supabase SQL Editor on a fresh project.
--  Safe to re-run (idempotent-ish: uses IF NOT EXISTS / DROP POLICY IF EXISTS).
--
--  Also do: Authentication → Providers → Email → turn OFF "Confirm email"
--  (the app logs users in immediately after signup).
-- ============================================================================

-- ---------------------------------------------------------------------------
--  Tables
-- ---------------------------------------------------------------------------

create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  handle        text not null unique,
  name          text not null,
  -- Mirror of auth.users.email, kept in sync by the triggers below. Lets the
  -- app show a connected member's contact address without an Admin API call.
  email         text,
  role          text not null default 'member' check (role in ('member','admin')),
  avatar_color  text not null default '#ceff1a',
  avatar_url    text,
  headline      text,
  bio           text,
  city          text,
  country       text,
  give_tags     jsonb not null default '[]'::jsonb,
  need_tags     jsonb not null default '[]'::jsonb,
  onboarded     boolean not null default false,
  suspended     boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text not null,
  date        timestamptz not null,
  location    text not null,
  status      text not null default 'upcoming' check (status in ('upcoming','live','past')),
  created_at  timestamptz not null default now()
);

create table if not exists public.offers (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  user_id          uuid not null references public.users(id) on delete cascade,
  type             text not null,
  title            text not null,
  description      text not null,
  category         text not null,
  city             text,
  country          text,
  online_available boolean not null default false,
  availability     text,
  capacity         text,
  image_url        text,
  status           text not null default 'active' check (status in ('active','paused','completed','removed')),
  hidden_by_admin  boolean not null default false,
  event_id         uuid references public.events(id) on delete set null,
  created_at       timestamptz not null default now()
);
create index if not exists offers_status_idx   on public.offers(status);
create index if not exists offers_category_idx on public.offers(category);
create index if not exists offers_user_idx     on public.offers(user_id);

create table if not exists public.requests (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  user_id          uuid not null references public.users(id) on delete cascade,
  type             text not null,
  title            text not null,
  description      text not null,
  category         text not null,
  city             text,
  country          text,
  online_available boolean not null default false,
  urgency          text not null default 'Whenever' check (urgency in ('Whenever','This week','This month')),
  status           text not null default 'active' check (status in ('active','fulfilled','removed')),
  hidden_by_admin  boolean not null default false,
  event_id         uuid references public.events(id) on delete set null,
  created_at       timestamptz not null default now()
);
create index if not exists requests_status_idx   on public.requests(status);
create index if not exists requests_category_idx on public.requests(category);
create index if not exists requests_user_idx     on public.requests(user_id);

create table if not exists public.connections (
  id           uuid primary key default gen_random_uuid(),
  offer_id     uuid references public.offers(id) on delete set null,
  request_id   uuid references public.requests(id) on delete set null,
  giver_id     uuid not null references public.users(id) on delete cascade,
  receiver_id  uuid not null references public.users(id) on delete cascade,
  initiator_id uuid not null references public.users(id) on delete cascade,
  message      text,
  status       text not null default 'pending' check (status in ('pending','accepted','declined','completed')),
  created_at   timestamptz not null default now(),
  accepted_at  timestamptz,
  completed_at timestamptz
);
create index if not exists connections_giver_idx    on public.connections(giver_id);
create index if not exists connections_receiver_idx on public.connections(receiver_id);
create index if not exists connections_status_idx   on public.connections(status);

create table if not exists public.generosity_acts (
  id            uuid primary key default gen_random_uuid(),
  giver_id      uuid not null references public.users(id) on delete cascade,
  receiver_id   uuid references public.users(id) on delete set null,
  connection_id uuid unique references public.connections(id) on delete set null,
  type          text,
  description   text not null,
  hours         numeric,
  image_url     text,
  is_public     boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists acts_giver_idx    on public.generosity_acts(giver_id);
create index if not exists acts_receiver_idx on public.generosity_acts(receiver_id);

create table if not exists public.give_forward_commitments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  trigger_act_id   uuid references public.generosity_acts(id) on delete set null,
  type             text not null,
  commitment_text  text not null,
  deadline         timestamptz not null,
  status           text not null default 'pending' check (status in ('pending','completed','expired')),
  reminder_sent_at timestamptz,
  fulfilled_act_id uuid references public.generosity_acts(id) on delete set null,
  completed_at     timestamptz,
  created_at       timestamptz not null default now()
);
create index if not exists gf_status_idx   on public.give_forward_commitments(status);
create index if not exists gf_deadline_idx on public.give_forward_commitments(deadline);

create table if not exists public.generosity_chains (
  id            uuid primary key default gen_random_uuid(),
  origin_act_id uuid not null unique references public.generosity_acts(id) on delete cascade,
  status        text not null default 'active' check (status in ('active','dormant')),
  created_at    timestamptz not null default now()
);

create table if not exists public.generosity_chain_members (
  id       uuid primary key default gen_random_uuid(),
  chain_id uuid not null references public.generosity_chains(id) on delete cascade,
  act_id   uuid not null unique references public.generosity_acts(id) on delete cascade,
  position integer not null,
  unique (chain_id, position)
);
create index if not exists chain_member_chain_idx on public.generosity_chain_members(chain_id);

create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.users(id) on delete cascade,
  content_type text not null check (content_type in ('offer','request','user')),
  content_id   uuid not null,
  reason       text not null,
  detail       text,
  status       text not null default 'open' check (status in ('open','reviewed','dismissed')),
  created_at   timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports(status);

create table if not exists public.event_participants (
  id       uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id  uuid not null references public.users(id) on delete cascade,
  unique (event_id, user_id)
);

create table if not exists public.analytics_events (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  user_id    uuid,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists analytics_name_idx on public.analytics_events(name);

-- ---------------------------------------------------------------------------
--  Helper: is the current user an admin?
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
--  Trigger: create a public.users profile row for every new auth user
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := regexp_replace(
    lower(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'friend')),
    '[^a-z0-9]+', '-', 'g'
  );
  base := trim(both '-' from base);
  if base = '' then base := 'friend'; end if;
  candidate := base;
  while exists (select 1 from public.users where handle = candidate) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;

  insert into public.users (id, handle, name, email)
  values (new.id, candidate, coalesce(new.raw_user_meta_data->>'name', 'Friend'), new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep public.users.email in sync when the auth email changes.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.users set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_change on auth.users;
create trigger on_auth_user_email_change
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- ---------------------------------------------------------------------------
--  View: community impact stats (single row, public)
-- ---------------------------------------------------------------------------

create or replace view public.impact_stats
with (security_invoker = false) as
select
  (select count(*) from public.users where onboarded and not suspended)                       as people_participating,
  (select count(*) from (
      select user_id as uid from public.offers where status <> 'removed'
      union
      select giver_id from public.generosity_acts
   ) s)                                                                                        as people_giving,
  (select count(*) from public.offers   where status <> 'removed')                             as offers,
  (select count(*) from public.requests where status <> 'removed')                             as requests,
  (select count(*) from public.requests where status = 'fulfilled')                            as requests_fulfilled,
  (select count(*) from public.connections where status in ('accepted','completed'))           as connections_made,
  (select count(*) from public.generosity_acts)                                                as acts_completed,
  (select count(*) from public.generosity_acts where type = 'Thing')                           as things_given,
  (select count(*) from public.generosity_acts where type = 'Skill')                           as skills_shared,
  (select coalesce(sum(hours), 0) from public.generosity_acts)                                 as hours_given,
  (select count(*) from public.give_forward_commitments)                                       as give_forward_commitments,
  (select count(*) from public.give_forward_commitments where status = 'completed')            as give_forward_completed,
  (select count(*) from public.generosity_chains)                                              as chains,
  (select coalesce(max(cnt), 0) from (
      select count(*) as cnt from public.generosity_chain_members group by chain_id
   ) c)                                                                                        as longest_chain;

-- ---------------------------------------------------------------------------
--  RPC: per-user generosity numbers
-- ---------------------------------------------------------------------------

create or replace function public.user_generosity(uid uuid)
returns table (
  acts_given        integer,
  acts_received     integer,
  people_helped     integer,
  give_forward_acts integer,
  chains            integer
)
language sql
security definer
stable
set search_path = public
as $$
  select
    (select count(*)::int from generosity_acts where giver_id = uid),
    (select count(*)::int from generosity_acts where receiver_id = uid),
    (select count(distinct receiver_id)::int from generosity_acts
       where giver_id = uid and receiver_id is not null),
    (select count(*)::int from give_forward_commitments
       where user_id = uid and status = 'completed'),
    (select count(distinct m.chain_id)::int
       from generosity_chain_members m
       join generosity_acts a on a.id = m.act_id
       where a.giver_id = uid or a.receiver_id = uid);
$$;

-- ---------------------------------------------------------------------------
--  RPC: link a new act into the generosity chain of its trigger act
--       (find-or-create the chain, append at max(position)+1)
-- ---------------------------------------------------------------------------

create or replace function public.link_act_to_chain(new_act uuid, trigger_act uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
  maxpos int;
begin
  select chain_id into cid
    from generosity_chain_members where act_id = trigger_act;

  if cid is null then
    insert into generosity_chains (origin_act_id) values (trigger_act)
      returning id into cid;
    insert into generosity_chain_members (chain_id, act_id, position)
      values (cid, trigger_act, 0);
  end if;

  select coalesce(max(position), -1) into maxpos
    from generosity_chain_members where chain_id = cid;

  insert into generosity_chain_members (chain_id, act_id, position)
    values (cid, new_act, maxpos + 1);

  return cid;
end;
$$;

-- ---------------------------------------------------------------------------
--  Grants (RLS still gates every row)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant select on public.impact_stats to anon, authenticated;
grant execute on function public.user_generosity(uuid)      to anon, authenticated;
grant execute on function public.link_act_to_chain(uuid, uuid) to authenticated, service_role;
grant execute on function public.is_admin()                 to anon, authenticated;

-- ---------------------------------------------------------------------------
--  Row Level Security
-- ---------------------------------------------------------------------------

alter table public.users                    enable row level security;
alter table public.offers                   enable row level security;
alter table public.requests                 enable row level security;
alter table public.connections              enable row level security;
alter table public.generosity_acts          enable row level security;
alter table public.give_forward_commitments enable row level security;
alter table public.generosity_chains        enable row level security;
alter table public.generosity_chain_members enable row level security;
alter table public.reports                  enable row level security;
alter table public.events                   enable row level security;
alter table public.event_participants       enable row level security;
alter table public.analytics_events         enable row level security;

-- users -------------------------------------------------------------------
drop policy if exists users_select on public.users;
create policy users_select on public.users
  for select using (true);

drop policy if exists users_update on public.users;
create policy users_update on public.users
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- offers ----------------------------------------------------------------
drop policy if exists offers_select on public.offers;
create policy offers_select on public.offers
  for select using (
    (status <> 'removed' and hidden_by_admin = false)
    or auth.uid() = user_id
    or public.is_admin()
  );

drop policy if exists offers_insert on public.offers;
create policy offers_insert on public.offers
  for insert with check (auth.uid() = user_id);

drop policy if exists offers_update on public.offers;
create policy offers_update on public.offers
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists offers_delete on public.offers;
create policy offers_delete on public.offers
  for delete using (auth.uid() = user_id or public.is_admin());

-- requests ------------------------------------------------------------
drop policy if exists requests_select on public.requests;
create policy requests_select on public.requests
  for select using (
    (status <> 'removed' and hidden_by_admin = false)
    or auth.uid() = user_id
    or public.is_admin()
  );

drop policy if exists requests_insert on public.requests;
create policy requests_insert on public.requests
  for insert with check (auth.uid() = user_id);

drop policy if exists requests_update on public.requests;
create policy requests_update on public.requests
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists requests_delete on public.requests;
create policy requests_delete on public.requests
  for delete using (auth.uid() = user_id or public.is_admin());

-- connections -------------------------------------------------------
drop policy if exists connections_select on public.connections;
create policy connections_select on public.connections
  for select using (
    auth.uid() in (giver_id, receiver_id) or public.is_admin()
  );

drop policy if exists connections_insert on public.connections;
create policy connections_insert on public.connections
  for insert with check (
    auth.uid() = initiator_id and auth.uid() in (giver_id, receiver_id)
  );

drop policy if exists connections_update on public.connections;
create policy connections_update on public.connections
  for update using (auth.uid() in (giver_id, receiver_id) or public.is_admin())
  with check (auth.uid() in (giver_id, receiver_id) or public.is_admin());

-- generosity_acts -------------------------------------------------
drop policy if exists acts_select on public.generosity_acts;
create policy acts_select on public.generosity_acts
  for select using (
    is_public
    or auth.uid() in (giver_id, receiver_id)
    or public.is_admin()
  );

drop policy if exists acts_insert on public.generosity_acts;
create policy acts_insert on public.generosity_acts
  for insert with check (auth.uid() in (giver_id, receiver_id));

drop policy if exists acts_update on public.generosity_acts;
create policy acts_update on public.generosity_acts
  for update using (auth.uid() in (giver_id, receiver_id) or public.is_admin())
  with check (auth.uid() in (giver_id, receiver_id) or public.is_admin());

-- give_forward_commitments -------------------------------------
drop policy if exists gf_select on public.give_forward_commitments;
create policy gf_select on public.give_forward_commitments
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists gf_insert on public.give_forward_commitments;
create policy gf_insert on public.give_forward_commitments
  for insert with check (auth.uid() = user_id);

drop policy if exists gf_update on public.give_forward_commitments;
create policy gf_update on public.give_forward_commitments
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- generosity_chains + members (public read; writes via RPC/service role) --
drop policy if exists chains_select on public.generosity_chains;
create policy chains_select on public.generosity_chains
  for select using (true);

drop policy if exists chains_admin_write on public.generosity_chains;
create policy chains_admin_write on public.generosity_chains
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists chain_members_select on public.generosity_chain_members;
create policy chain_members_select on public.generosity_chain_members
  for select using (true);

drop policy if exists chain_members_admin_write on public.generosity_chain_members;
create policy chain_members_admin_write on public.generosity_chain_members
  for all using (public.is_admin()) with check (public.is_admin());

-- reports -------------------------------------------------------
drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports
  for select using (auth.uid() = reporter_id or public.is_admin());

drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports
  for insert with check (auth.uid() = reporter_id);

drop policy if exists reports_update on public.reports;
create policy reports_update on public.reports
  for update using (public.is_admin()) with check (public.is_admin());

-- events + participants (public read; admin write) ------------
drop policy if exists events_select on public.events;
create policy events_select on public.events for select using (true);

drop policy if exists events_admin_write on public.events;
create policy events_admin_write on public.events
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists event_participants_select on public.event_participants;
create policy event_participants_select on public.event_participants
  for select using (true);

drop policy if exists event_participants_insert on public.event_participants;
create policy event_participants_insert on public.event_participants
  for insert with check (auth.uid() = user_id or public.is_admin());

-- analytics_events (write-only for users; admin reads) --------
drop policy if exists analytics_insert on public.analytics_events;
create policy analytics_insert on public.analytics_events
  for insert with check (auth.role() = 'authenticated');

drop policy if exists analytics_select on public.analytics_events;
create policy analytics_select on public.analytics_events
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
--  Storage buckets + policies
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "ftm public read" on storage.objects;
create policy "ftm public read" on storage.objects
  for select using (bucket_id in ('avatars', 'post-images'));

drop policy if exists "ftm owner insert" on storage.objects;
create policy "ftm owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('avatars', 'post-images')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "ftm owner update" on storage.objects;
create policy "ftm owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('avatars', 'post-images')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "ftm owner delete" on storage.objects;
create policy "ftm owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('avatars', 'post-images')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
