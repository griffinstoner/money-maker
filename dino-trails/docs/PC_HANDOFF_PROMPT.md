# PC Handoff Prompt

Paste everything below the line into **Claude Code on your Windows PC** (the Claude desktop app's Code tab, or the `claude` command in a terminal). Running locally lets Claude start the game server on your own computer, so it can get the game onto your iPhone itself.

---

You're picking up an in-progress game project from a cloud session. You're my lead game developer and game designer. I've never coded, so explain things in plain English, run the commands yourself whenever you can, and tell me exactly what to tap or click when you can't.

## Get the project onto this PC
1. Check that `git` and Node.js LTS are installed (`git --version`, `node -v`). If either is missing, tell me how to install it on Windows and wait.
2. Clone the repo into my user folder and switch to the working branch:
   `git clone https://github.com/griffinstoner/money-maker.git` then `git checkout claude/elegant-albattani-7e2hfy`
3. The game lives in `money-maker/dino-trails/`. Read `README.md`, `docs/DESIGN.md`, `AGENTS.md`, and every file in `src/` and `App.tsx` before changing anything.

## What the project is
**Dino Trails**: an original location-based mobile game. Players walk around the real world, find dinosaurs on a live map, tame them, level them up, gather resources at landmarks, craft gear, join tribes, and fight for real-world landmarks. It's inspired by Pokémon GO's loop and ARK's taming, but contains no code, art, names, or data from either. Never decompile, copy, or call Niantic's or Studio Wildcard's code, servers, APIs, or art, and never use the name "ARK".

## Locked decisions (don't re-open these unless I ask)
- **Me:** no coding experience, Windows PC, **iPhone** (no Android device), about 10 hours a week, $0–25/month budget, goal is to **make money**.
- **Stack:** React Native + Expo SDK 58 (TypeScript), tested on my iPhone through **Expo Go**. Supabase for the backend from M3. MapLibre + MapTiler/OpenStreetMap maps from M3 (Apple Maps via `react-native-maps` until then).
- **Launch:** iPhone first, with builds made by Expo's cloud service (no Mac needed). The Apple Developer account ($99/yr) waits until M3. Android comes later from the same code.
- **Cut from launch:** AR camera mode, real-time combat (turn-based only), breeding (first post-launch update).
- **Server-authoritative:** the phone shows things, the server decides anything that grants dinos, items, or wins. Spawns are deterministic (seeded per ~275 m grid cell and 15-minute window) so client and server agree.
- **Safety and privacy:** safety screen at launch, dinos hide above about 7 m/s (driving), no spawns or landmarks on schools, highways, or private property, minimal location storage, never show exact player positions.
- **Fair monetization only:** cosmetics, a season pass, extra storage. No pay-to-win and no loot boxes sold to minors.

## Where we are
- **M1 is built** (map, GPS, 15 species, deterministic spawns, day/night rules, dino info card, speed lockout). It typechecks and bundles for iOS, but **has never been run on a real phone.**
- The full design doc, architecture, data model, API, and milestone plan (M1–M6) are in `docs/DESIGN.md`.

## What to do now
1. In `dino-trails/`, run `npm install`, then start the dev server with `npx expo start`. If my iPhone can't connect over Wi-Fi, use `npx expo start --tunnel`. Tell me to open the Camera app and scan the QR code; it opens in Expo Go. If Windows Firewall asks, tell me to click Allow.
2. Walk me through testing M1 against the "Done when…" line in `docs/DESIGN.md`, and fix anything I report is broken.
3. Once M1 works, build **M2**: the taming minigame (knockout with tranq darts + passive feeding, Torpor/Trust/Fear meters, tier difficulty from the design doc), stat rolls of ±20% with a Quality score, and a roster screen, saved on the phone for now. Stop for me to test before starting M3.

## Working rules
- Run `npx tsc --noEmit` and `npx expo lint` before saying anything is done. Use `npx expo install <package>` to add packages.
- Commit to the `claude/elegant-albattani-7e2hfy` branch with clear messages and push when a milestone step works. Don't open a pull request unless I ask.
- Keep each milestone small enough for 10 hours a week. If something's too big, cut scope and tell me what you cut.
- Explain decisions in plain English as you go. Don't just dump code.
- End every reply with **"Your next action (under 1 hour):"** and one concrete task.

Start with "Get the project onto this PC".
