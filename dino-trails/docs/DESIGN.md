# Dino Trails: Design and Plan

## Locked scope
- **Platform:** iPhone first (tested in Expo Go from a Windows PC), Android second from the same code.
- **Stack:** React Native + Expo (TypeScript), Supabase (auth, Postgres, edge functions), MapLibre + MapTiler/OpenStreetMap from M3.
- **Budget:** $0 until M3, when an Apple Developer account ($99/yr) is needed for custom native builds.
- **Pace:** ~10 hrs/week, 2–3 weeks per milestone.
- **Cut from launch:** AR camera mode, real-time combat, breeding (ships as the first post-launch update).

## Architecture

```
iPhone app (Expo)                          Supabase
───────────────────                        ─────────────────────────────
Map + GPS                                  Auth (email / Apple sign-in)
Spawn generator (shared code) ──────────▶  Edge functions (same spawn code)
Taming minigame → sends taps only          ├─ tame: re-derives the spawn, checks
Roster, crafting, tribe screens            │   distance, speed, timing → rolls result
                                           ├─ gather, craft, battle, raid
                                           Postgres (source of truth)
```

**Rule:** the phone shows things; the server decides things. Anything that gives a player an item, a dino, or a win is calculated on the server.

### Deterministic spawning
- The world is a grid of cells 0.0025° on a side (~275 m north–south). Time is split into 15-minute windows.
- `seed = hash("cellX:cellY:window")` feeds a seeded random generator that picks how many dinos (0–3), where in the cell, the tier, and the species.
- Night species use solar time at the cell's longitude, so all players agree on day/night.
- The client and server run the **same** `spawns.ts`. When you try to tame spawn `cellX:cellY:window:i`, the server regenerates it and checks it really exists, hasn't despawned, and is within 40 m of you.
- **M3 adds biomes:** each cell gets tagged (park, water, woods, field, rocky, town) from OpenStreetMap land-use data, and species only spawn in their biomes.

### Data model (M3+)
| Table | Key fields |
|---|---|
| `players` | id, username, level, xp, tribe_id, created_at |
| `dinos` | id, owner_id, species_id, stat rolls (hp/atk/spd/sta), quality, level, xp, tamed_at, tame_method |
| `inventory` | player_id, item_id, quantity |
| `landmarks` | id, name, lat, lng, kind, tribe_id (owner), defended_until |
| `landmark_defenders` | landmark_id, dino_id, slot (1–6) |
| `tribes` | id, name, tag, leader_id |
| `tame_attempts` | id, player_id, spawn_id, started_at, result (blocks re-taming the same spawn) |
| `eggs` (post-launch) | id, owner_id, species_id, parent_a, parent_b, km_required, km_walked |

Location privacy: player positions are **never** stored long-term. The server keeps only the last checked position per player (for speed checks) and overwrites it.

### API (Supabase edge functions)
| Endpoint | Does |
|---|---|
| `POST /tame/start` | Validates spawn + distance + speed, creates a tame attempt |
| `POST /tame/finish` | Takes the tap timings, rolls Torpor/Trust/Fear, creates the dino |
| `POST /gather` | Validates landmark distance and cooldown, grants resources |
| `POST /craft` | Spends resources, grants an item |
| `POST /battle` | Simulates a turn-based fight vs. a landmark's defenders, transfers ownership |
| `POST /raid/join`, `/raid/attack` | Group boss fights at landmarks |

### Anti-cheat and safety
- Reject requests that imply moving faster than ~50 m/s between checks (teleporting), and hide dinos above ~7 m/s (driving).
- Flag `mocked` locations (Android) and jailbreak/spoofing signals; soft-ban repeat offenders from rewards.
- No landmarks on schools, highways, or private homes: filter OSM tags when we import landmarks.

## Milestones
| # | Builds | Done when… |
|---|---|---|
| **M1** | Map, GPS, deterministic spawns, dino info card, safety screen, speed lockout | You walk around and see dinos appear; two phones at the same spot see the same dinos |
| **M2** | Taming minigame (knockout + feeding), roster screen, stat rolls, saved on the phone | You can tame a dino within 40 m and see it with its rolled stats in your roster |
| **M3** | Supabase accounts, server-side tame validation, biome tags, MapLibre custom map, first EAS build | Roster survives reinstalls; a faked tame request is rejected; raptors show up in parks |
| **M4** | Landmarks as resource nodes, inventory, crafting, gear affects taming | You gather at a landmark, craft Heavy Darts, and they make taming easier |
| **M5** | Tribes, claiming landmarks, defenders, turn-based battles | Your tribe takes a landmark from another test account and holds it |
| **M6** | Raids, quests, field guide, polish, privacy policy, App Store submission | The app is approved on TestFlight, then the App Store |
| Post-launch | Breeding + eggs, Android, AR mode, seasonal events | — |
