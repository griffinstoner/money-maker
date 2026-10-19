# Dino Trails

A location-based dinosaur-taming game for iPhone (Android later). Walk around, find dinos on the map, tame them, and fight for real-world landmarks.

Game design, architecture, and the milestone plan: [docs/DESIGN.md](docs/DESIGN.md).

## Run it on your iPhone (from Windows)

You need **Node.js LTS** on your PC and **Expo Go** on your iPhone.

1. **Get the code.** Go to https://github.com/griffinstoner/money-maker, switch the branch dropdown to `claude/elegant-albattani-7e2hfy`, click the green **Code** button → **Download ZIP**, and unzip it.
2. **Open a terminal in the game folder.** In File Explorer, open the unzipped `dino-trails` folder, click the address bar, type `cmd`, and press Enter.
3. **Install the game's packages** (first time only, takes a few minutes):
   ```
   npm install
   ```
4. **Start the game server:**
   ```
   npx expo start
   ```
   If Windows asks whether to allow Node.js through the firewall, click **Allow**.
5. **Open it on your phone.** Make sure your iPhone is on the **same Wi-Fi** as your PC, open the **Camera** app, and point it at the QR code in the terminal. Tap the banner and the game opens in Expo Go.

**If your phone can't connect**, stop the server with `Ctrl + C` and run `npx expo start --tunnel` instead. That works even on different networks.

Leave the terminal window open while you play. When you're done, press `Ctrl + C` to stop it.

## What's in M1

- Safety screen on launch
- Live map that follows your GPS position
- 15 dinosaur species spawning around you; the same spot shows the same dinos to everyone, and they reshuffle every 15 minutes
- Day/night spawns (Triceratops only by day, Spinosaurus only at night; Tyrannosaurus is saved for raids)
- Tap a dino to see its stats, distance, and time left; get within 40 m to unlock taming (M2)
- Dinos hide if you're moving faster than ~15 mph

## Project layout

| Path | What it is |
|---|---|
| `App.tsx` | The main map screen |
| `src/data/species.ts` | All 15 dinosaurs and their stats |
| `src/game/spawns.ts` | Decides which dinos appear where |
| `src/game/rng.ts` | Seeded random numbers (same seed → same dinos) |
| `src/game/geo.ts` | Distance and day/night math |
| `src/components/` | The safety screen and dino info card |
