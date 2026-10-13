-- Primal Trail: initial schema.
--
-- The game server (Edge Function `game`) is the only writer of game state. It
-- runs the shared rules engine and commits with optimistic locking, so a
-- double-tap or two devices can never apply the same action twice.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  created_at timestamptz not null default now()
);

-- Whole player state as one JSON document (inventory, survival, cooldowns,
-- the active taming session). `version` guards concurrent writes.
create table public.player_state (
  player_id uuid primary key references auth.users on delete cascade,
  state jsonb not null,
  version bigint not null default 1,
  updated_at timestamptz not null default now()
);

create table public.tamed_creatures (
  id text primary key,
  player_id uuid not null references auth.users on delete cascade,
  creature_id text not null,
  nickname text check (char_length(nickname) <= 24),
  level int not null check (level > 0),
  stats jsonb not null,
  tamed_at timestamptz not null,
  -- coarse ~170 m grid cell, never exact coordinates
  tamed_in_cell text not null
);
create index tamed_creatures_player_idx on public.tamed_creatures (player_id, tamed_at desc);

-- Phase 2 (base building). Created now so the shape is agreed, but locked
-- down: no policies, so only the service role can touch it.
create table public.bases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users on delete cascade, -- one base per player for now
  name text not null check (char_length(name) between 1 and 32),
  lat double precision not null,
  lng double precision not null,
  radius_m int not null default 30,
  structures jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row level security

alter table public.profiles enable row level security;
alter table public.player_state enable row level security;
alter table public.tamed_creatures enable row level security;
alter table public.bases enable row level security;

-- Usernames are public (needed later for tribes and visiting bases).
create policy "profiles are readable" on public.profiles for select to authenticated using (true);
create policy "insert own profile" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "update own profile" on public.profiles for update to authenticated using (id = (select auth.uid()));

-- player_state has no client policies at all: it holds anti-cheat data and
-- the player's last location. Clients go through the game function.

create policy "read own creatures" on public.tamed_creatures for select to authenticated
  using (player_id = (select auth.uid()));
create policy "rename own creatures" on public.tamed_creatures for update to authenticated
  using (player_id = (select auth.uid())) with check (player_id = (select auth.uid()));
revoke update on public.tamed_creatures from authenticated;
grant update (nickname) on public.tamed_creatures to authenticated;

-- ---------------------------------------------------------------------------
-- Atomic commit used by the game function.
-- Returns false when someone else wrote first; the caller reloads and retries.

create function public.commit_player_state(
  p_player uuid,
  p_expected_version bigint, -- null = player has no state row yet
  p_state jsonb,
  p_new_tames jsonb default '[]'
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_expected_version is null then
    insert into public.player_state (player_id, state) values (p_player, p_state)
    on conflict (player_id) do nothing;
  else
    update public.player_state
       set state = p_state, version = version + 1, updated_at = now()
     where player_id = p_player and version = p_expected_version;
  end if;
  if not found then
    return false;
  end if;

  insert into public.tamed_creatures (id, player_id, creature_id, nickname, level, stats, tamed_at, tamed_in_cell)
  select t->>'id', p_player, t->>'creatureId', t->>'nickname', (t->>'level')::int, t->'stats',
         to_timestamp((t->>'tamedAt')::double precision / 1000), t->>'tamedInCell'
    from jsonb_array_elements(coalesce(p_new_tames, '[]'::jsonb)) as t;
  return true;
end;
$$;

revoke execute on function public.commit_player_state(uuid, bigint, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.commit_player_state(uuid, bigint, jsonb, jsonb) to service_role;
