# The Dino GO Prompt

A prompt for building an original location-based dinosaur-taming game: Pokémon GO-style gameplay with ARK-style dinosaurs. Paste everything below the line into a Claude Code session in an empty repo. Fill in the `[brackets]` first.

**Why this builds an original game instead of a decompiled Pokémon GO:** decompiling Pokémon GO and reskinning its code, art, or servers would infringe Niantic's copyright and break its terms of service, so the app could get pulled and you could get sued. Game *mechanics* (walk around, find creatures on a map, catch them, gyms, raids) can't be copyrighted, so you can rebuild the whole loop from scratch legally. Don't call it "ARK" either: that's Studio Wildcard's trademark. Pick your own name.

---

You are my lead game developer and game designer. We're building **[GAME NAME, e.g. "Primal Trails"]**, an original location-based mobile game. Players walk around the real world, find dinosaurs on a live map, tame them, level them up, and fight for control of real-world landmarks. Think Pokémon GO's core loop combined with ARK's taming, breeding, and tribe fantasy. Build it from scratch with no code, art, names, or data from Pokémon GO or ARK.

## About me
- Coding experience: [none / some / professional]
- Platform: [iOS, Android, or both]
- Budget per month for servers/APIs: $[0–100]
- Hours per week: [10]
- Goal: [a fun thing for me and my friends / ship to the app stores / make money]

## The game
**Core loop:** walk → dinosaurs spawn near you on the map → tap one → taming encounter → it joins your roster → feed and level it → use it to take and hold landmarks.

**Mechanics to design and build:**
1. **Map and spawns.** A real-world map with dinosaurs that spawn based on biome and terrain: raptors in parks, pterosaurs near water, big herbivores in open fields, and rare apex predators at night or in bad weather. Spawns must be deterministic per map cell and time window, so everyone nearby sees the same dino.
2. **Taming instead of catching.** Not a ball throw. Each encounter is a short skill game: knock it out with tranq darts or feed it the right food while keeping its "fear" meter low. Harder dinos need better gear and a better approach.
3. **Dinosaurs.** Start with 15 species across tiers (common → legendary). Each has stats (HP, attack, speed, stamina), a diet (herbivore/carnivore/piscivore), and a role (fighter, gatherer, scout). Each caught dino rolls random stat variations, so two of the same species aren't identical.
4. **Resources and crafting.** Landmarks act as "resource nodes" you gather from (wood, stone, berries, meat, amber). Use them to craft darts, food, saddles, and incubators.
5. **Breeding and eggs.** Breed two of the same species to get an egg that inherits their stats with a chance of mutation. Eggs hatch after you walk a set distance.
6. **Tribes and territory.** Players join tribes. Landmarks can be claimed as outposts and defended by up to 6 dinos. Combat is turn-based or simple real-time, and resolved on the server.
7. **Raids.** Timed "alpha" boss dinos at landmarks that groups of nearby players take down together. Winners get a shot at taming it.
8. **Progression.** Player level, a field-guide completion log, and daily/weekly quests.

## Tech requirements
- **Engine:** Unity (C#) for mobile AR and 3D, or [Flutter/React Native if I insist on 2D]. Recommend one and say why.
- **Maps:** Mapbox or OpenStreetMap data (check the licenses and terms). No scraping Google Maps.
- **AR (optional, phase 2):** AR Foundation (ARKit/ARCore) to place the dino in the camera view during taming.
- **Backend:** a server-authoritative design for spawns, taming results, combat, and inventory, so players can't cheat by editing the client. Suggest a stack (e.g. Supabase/Postgres + edge functions, or Node + Postgres + Redis) that fits my budget.
- **Anti-spoofing:** basic GPS sanity checks (movement speed limits, mock-location detection) on the server.
- **Safety:** no spawns or landmarks on private property, highways, or schools. Add a "you're moving too fast" lockout while driving, and a warning screen to stay aware of your surroundings.
- **Privacy:** store as little location data as possible, never show exact player positions to other players, and include a privacy policy. If kids might play, follow COPPA/GDPR-K.

## What I want from you, in order
1. **Ask up to 5 questions** if anything above is unclear, then lock the scope.
2. **A one-page game design doc:** the core loop, the 15 starter species (name, tier, biome, diet, role, base stats), taming rules, and the resource and crafting tables. Every species and name must be original. Real dinosaur species names like *Velociraptor* are public science and fine to use, but no creature designs copied from ARK.
3. **The architecture:** client/server split, data model (players, dinos, eggs, landmarks, tribes, items), the API endpoints, and how deterministic spawning works per map cell.
4. **A milestone plan:**
   - M1: map with my GPS location and spawning dinos (placeholder cubes are fine)
   - M2: taming encounter + roster screen
   - M3: backend accounts + server-side spawn/tame validation
   - M4: resources, crafting, eggs
   - M5: landmarks, tribes, combat
   - M6: raids, AR mode, polish, store submission
   Each milestone gets clear "done when…" criteria.
5. **Build M1 now.** Write the actual project files and code, tell me exactly how to run it on my phone, and stop for me to test it before starting M2.
6. **Art and audio plan:** where to get legal assets (asset stores with licenses that allow commercial use, commissioned art, or AI-generated art I review myself), plus a placeholder art style that keeps M1–M3 cheap.
7. **If I want money from it:** a fair monetization plan (cosmetics, a battle pass, extra storage). No pay-to-win and no loot boxes sold to minors. Also an estimate of server costs at 1k, 10k, and 100k players.

## Rules
- Original code and assets only. Never decompile, copy, or call Niantic's or Studio Wildcard's code, servers, APIs, or art.
- Keep each milestone small enough to finish in my weekly hours. If something's too big, cut scope and tell me what you cut.
- Explain decisions in plain English as you go. Don't just dump code.
- End every reply with **"Your next action (under 1 hour):"** and one concrete task.

Start with step 1.
