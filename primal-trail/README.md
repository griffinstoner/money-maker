# Primal Trail

A location-based survival game: walk your real neighborhood to find prehistoric and mythical creatures, gather resources, craft gear and tame beasts. Every creature, name and rule here is original.

**Status: MVP.** Accounts, the GPS map, spawns, gathering, inventory, crafting, survival stats and taming all work. Base building, riding, raids, tribes, trading and breeding are planned, not built.

## Try it now (no server needed)

```bash
npm install
npx expo start          # press w for the browser, or scan the QR code with a dev build
```

With no Supabase keys set, the app runs in **offline playtest mode**: the same rules engine runs on the device and progress is saved locally. In dev builds, if location permission is denied (or `EXPO_PUBLIC_SIMULATE_LOCATION=1`), you get a simulated walker with arrow buttons, so you can play at your desk.

`react-native-maps` uses native code that Expo Go may not include. If the map doesn't load in Expo Go, make a development build: `npx expo run:ios` / `npx expo run:android`, or `npx eas-cli build --profile development`. The browser uses a simple schematic map instead.

## Go online with Supabase

1. Create a project at supabase.com. Then:
   ```bash
   npx supabase login
   npx supabase init                      # creates supabase/config.toml; keeps existing files
   npx supabase link --project-ref <your-ref>
   npx supabase db push                   # applies supabase/migrations
   npx supabase secrets set SPAWN_SECRET=$(openssl rand -hex 32)
   npx supabase functions deploy game
   ```
2. Copy `.env.example` to `.env.local` and fill in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API).
3. Restart `npx expo start`. The sign-in screen stops showing the offline notice.

Android builds also need `GOOGLE_MAPS_ANDROID_API_KEY` (Google Cloud → Maps SDK for Android). iOS uses Apple Maps and needs no key.

## Tests

| Command | What it checks |
|---|---|
| `npm test` | 25 unit tests of the rules engine: spawn determinism, survival math, anti-spoofing, gathering, crafting, both taming styles |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `scripts/test-server.sh` | The real Edge Function handler against Postgres with the real migration: auth, first-time players, two gathers racing (only one pays out), teleport rejection, a full tame written to the database. Needs `psql` and `deno`. |
| `scripts/playtest/play.js` | Browser playthrough of the web build: sign up → safety → walk → gather → craft → tame two creatures → reload and check they saved. Instructions at the top of the file. |

## How it's built

```
src/app/                    screens (Expo Router)
  sign-in, safety           auth and the safety screen everyone must accept
  (tabs)/index              map + survival HUD
  (tabs)/bag, craft         inventory (eat/use), crafting
  (tabs)/creatures          your creatures + 20-creature field guide
  (tabs)/profile            survivor stats, safety tips, sign out
  tame                      taming minigames
  creature/[id]             creature stats + rename
src/backend/                Supabase client and the offline backend (same interface)
src/game/GameProvider.tsx   app state, GPS tracking, server sync
src/components/map/         react-native-maps on phones, schematic map on web
supabase/functions/_shared/game/   THE RULES (shared by server and app)
supabase/functions/game/    Edge Function: one POST endpoint for every action
supabase/migrations/        schema + row level security
```

**One rules engine, two places.** All game logic lives in `supabase/functions/_shared/game/` as plain TypeScript with no dependencies. The Edge Function runs it on the server, and the app imports the same files (as `@game`) for offline mode and for drawing. Every action is a pure function `(state, action, now) → new state`, which is why it's easy to test.

**The server is in charge.** The client only sends what the player did ("gather node X", "feed berries"). The server checks distance, cooldowns, stamina, inventory and the anti-cheat rules, then saves using a version number so a double-tap can't run twice. The `player_state` table has no client access at all.

**Spawns are shared and unpredictable.** The world is a grid of ~170 m cells. Each cell's creatures (rotating every 15 min), resource nodes (daily) and supply drops (hourly) come from a seeded random generator keyed by cell, time window and a server-only `SPAWN_SECRET`. Everyone nearby sees the same creatures, but nobody can predict them without the secret. A spawn ID can be re-derived on the server, so faked IDs fail.

### Data models

| Model | Where | Notes |
|---|---|---|
| Player | `auth.users` + `profiles` + `player_state.state` | survival, XP/level, inventory, last accepted location, cooldowns, active taming session |
| Creature (species) | `creatures.ts` | name, role, rarity, biomes, day/night, base stats, taming style, favorite food. 20 defined, 10 spawn in the MVP. |
| TamedCreature | `tamed_creatures` table | owner, species, level, rolled stats, nickname, coarse cell (never exact coordinates) |
| ResourceNode | generated | tree, rock, berry bush, metal deposit, supply drop |
| Item / Recipe | `items.ts` | 18 items; 10 recipes unlocked by level (stone tools → slingshot → bandages, food, kibble → blowpipe + tranq darts → prime kibble) |
| Base | `bases` table | Phase 2. Table exists, locked down (no client access). |

### Game rules (tunable in code)

- **Survival:** hunger runs from full to empty in ~25 h. Starving only drains health down to 20, never lower. You heal while hunger is above 50. Gathering costs stamina, which refills at 1 per minute.
- **Gathering:** stand within 45 m and tap. Nodes regrow after 10 min, for you only. A hatchet doubles wood, a pick doubles stone and is required for metal.
- **Knockout taming:** time your shot as the marker sweeps the target zone (smaller for rarer creatures). Fill the torpor bar, then feed it before it wakes up (2 min). Rare creatures need a blowpipe and tranq darts.
- **Gentle (passive) taming:** the creature looks around on a fixed rhythm that the server also knows. Feed it while it's looking away. Get spotted twice and it flees.
- **Food:** its favorite food counts fully, kibble is universal, anything else counts half and lowers effectiveness (fewer bonus levels).
- **Anti-spoofing:** jumps over 50 m/s are rejected unless enough time has passed for real travel. Three strikes pause actions for 10 min. Low-accuracy GPS fixes are ignored without penalty.

## Known gaps before a public launch

These matter, and the MVP doesn't solve them yet:

1. **Spawns don't know about roads, water or private property yet.** Biomes are placeholder (pseudo-random regions), and nothing stops a spawn landing on a highway. The hooks exist (`WorldOptions.biomeOf` and `isSpawnable` in `spawns.ts`). The next step is classifying cells from OpenStreetMap land-use data (parks, water, roads, buildings), cached per cell. Until then, the 45 m interaction range and the safety screen are the only protection. **Fix this before real players.**
2. **Shot accuracy is reported by the client.** Ammo, cooldowns and torpor are enforced on the server, but a modified client could claim perfect aim. Fine for now; server-checked aiming (as already done for stealth feeding) is the fix.
3. **No rate limiting** on the Edge Function beyond the optimistic lock.
4. **Art is emoji placeholders.** Creature sprites and a map style are needed.
5. **Store requirements** not done yet: privacy policy, account deletion in the app, and age rating.

## Later phases

Base building (claim a public spot, place walls/campfire/storage/pens; visitable), riding (saddles from the tech tree), PvE raids against epic/legendary creatures at landmarks, tribes, trading, breeding, seasonal events. The 10 creatures marked `spawnsInMvp: false` are already designed for these.
