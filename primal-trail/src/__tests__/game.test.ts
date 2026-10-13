import {
  CREATURES,
  CREATURES_BY_ID,
  type CreatureSpawn,
  GameError,
  ITEMS,
  type ItemId,
  type LatLng,
  type PlayerState,
  RECIPES,
  RULES,
  SPAWN_WINDOW_MS,
  applyAction,
  applyTime,
  cellsAround,
  craft,
  creatureSpawnsForCell,
  feed,
  findCreatureSpawn,
  gather,
  isNight,
  isWatching,
  levelForXp,
  nearby,
  newPlayerState,
  offsetMeters,
  pseudoBiome,
  resourceNodesForCell,
  shoot,
  startTame,
  updateLocation,
  worldAround,
} from '@game';

const cfg = { spawnSecret: 'test-secret' };
const HOME: LatLng = { lat: 40.7484, lng: -73.9857 };
const T0 = Date.UTC(2026, 5, 1, 16, 0, 0); // midday in New York

function stateAt(p: LatLng, now: number, inv: PlayerState['inventory'] = {}): PlayerState {
  const s = newPlayerState(now);
  s.location = { ...p, at: now };
  s.inventory = { ...s.inventory, ...inv };
  return s;
}

function code(fn: () => unknown): string {
  try {
    fn();
  } catch (e) {
    if (e instanceof GameError) return e.code;
    throw e;
  }
  return 'ok';
}

/** Scan nearby cells for a spawn matching `pred` (world is deterministic). */
function findSpawn(pred: (s: CreatureSpawn) => boolean, now = T0): CreatureSpawn {
  for (let ring = 0; ring < 40; ring++) {
    const p = offsetMeters(HOME, ring * 450, ring * 170);
    for (const cell of cellsAround(p)) {
      const hit = creatureSpawnsForCell(cell, now, cfg).find(pred);
      if (hit) return hit;
    }
  }
  throw new Error('no matching spawn found');
}

describe('game data', () => {
  it('has 20 unique creatures, 10 of them in the MVP', () => {
    expect(CREATURES).toHaveLength(20);
    expect(new Set(CREATURES.map((c) => c.id)).size).toBe(20);
    expect(CREATURES.filter((c) => c.spawnsInMvp)).toHaveLength(10);
  });

  it('only references real items', () => {
    for (const c of CREATURES) expect(ITEMS[c.preferredFood]).toBeDefined();
    expect(RECIPES.length).toBeGreaterThanOrEqual(5);
    expect(RECIPES.length).toBeLessThanOrEqual(10);
    for (const r of RECIPES) {
      expect(ITEMS[r.output]).toBeDefined();
      for (const id of Object.keys(r.inputs)) expect(ITEMS[id as ItemId]).toBeDefined();
    }
  });

  it('has something to find in every biome, day and night', () => {
    for (const biome of ['forest', 'plains', 'wetland', 'urban'] as const) {
      for (const night of [false, true]) {
        const pool = CREATURES.filter(
          (c) =>
            c.spawnsInMvp &&
            (c.biomes === 'any' || c.biomes.includes(biome)) &&
            (c.activeTime === 'any' || (c.activeTime === 'night') === night),
        );
        expect(pool.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('spawns', () => {
  it('are identical for everyone in the same cell and window', () => {
    const a = worldAround(HOME, T0, cfg);
    const b = worldAround(HOME, T0 + 60_000, cfg);
    expect(b.creatures).toEqual(a.creatures);
    expect(b.nodes.filter((n) => n.type !== 'supply_drop')).toEqual(a.nodes.filter((n) => n.type !== 'supply_drop'));
  });

  it('depend on the server secret', () => {
    const a = worldAround(HOME, T0, cfg);
    const b = worldAround(HOME, T0, { spawnSecret: 'other' });
    expect(JSON.stringify(b.nodes)).not.toEqual(JSON.stringify(a.nodes));
  });

  it('rotate every window and can be re-derived from their id', () => {
    const s = findSpawn(() => true);
    expect(findCreatureSpawn(s.id, T0, cfg)).toEqual(s);
    expect(findCreatureSpawn(s.id, T0 + SPAWN_WINDOW_MS, cfg)).toBeNull();
    expect(findCreatureSpawn(s.id.replace(/:\d+$/, ':99'), T0, cfg)).toBeNull();
    expect(findCreatureSpawn('s:garbage', T0, cfg)).toBeNull();
  });

  it('only spawn MVP creatures that match biome and time of day', () => {
    const night = T0 + 9 * 3_600_000; // ~1am local
    expect(isNight(T0, HOME.lng)).toBe(false);
    expect(isNight(night, HOME.lng)).toBe(true);
    for (const now of [T0, night]) {
      for (let i = 0; i < 30; i++) {
        const p = offsetMeters(HOME, i * 400, -i * 250);
        for (const cell of cellsAround(p)) {
          for (const s of creatureSpawnsForCell(cell, now, cfg)) {
            const def = CREATURES_BY_ID[s.creatureId];
            expect(def.spawnsInMvp).toBe(true);
            const biome = pseudoBiome(cell);
            expect(def.biomes === 'any' || def.biomes.includes(biome)).toBe(true);
            if (def.activeTime !== 'any') expect(def.activeTime === 'night').toBe(isNight(now, p.lng));
          }
        }
      }
    }
  });

  it('skip points the safety hook rejects', () => {
    const cell = cellsAround(HOME)[4];
    expect(resourceNodesForCell(cell, T0, cfg, { isSpawnable: () => false })).toHaveLength(0);
    expect(creatureSpawnsForCell(cell, T0, cfg, { isSpawnable: () => false })).toHaveLength(0);
  });
});

describe('survival', () => {
  const full = { health: 100, hunger: 100, stamina: 100, updatedAt: 0 };
  const h = 3_600_000;

  it('drains hunger slowly and forgivingly', () => {
    const day = applyTime(full, 24 * h);
    expect(day.hunger).toBeCloseTo(4);
    expect(day.health).toBe(100);
    const week = applyTime(full, 7 * 24 * h);
    expect(week.hunger).toBe(0);
    expect(week.health).toBe(20); // never starves below the floor
  });

  it('heals while well fed and regenerates stamina', () => {
    const s = applyTime({ health: 50, hunger: 90, stamina: 0, updatedAt: 0 }, 5 * h);
    expect(s.health).toBeCloseTo(80);
    expect(s.stamina).toBe(100);
  });

  it('levels follow 0/100/300/600 xp', () => {
    expect([0, 99, 100, 299, 300, 600, 1000].map(levelForXp)).toEqual([1, 1, 2, 2, 3, 4, 5]);
  });
});

describe('anti-spoofing', () => {
  it('accepts walking and GPS jitter', () => {
    let s = stateAt(HOME, T0);
    for (let i = 1; i <= 10; i++) {
      const r = updateLocation(s, offsetMeters(HOME, i * 10, 0), T0 + i * 7000);
      expect(r.result.accepted).toBe(true);
      s = r.state;
    }
  });

  it('rejects teleports and locks after repeated strikes', () => {
    let s = stateAt(HOME, T0);
    const far = offsetMeters(HOME, 5000, 0);
    for (let i = 1; i <= 3; i++) {
      const r = updateLocation(s, far, T0 + i * 1000);
      expect(r.result).toEqual({ accepted: false, reason: 'too_fast' });
      s = r.state;
    }
    expect(s.lockedUntil).toBeGreaterThan(T0);
    expect(updateLocation(s, HOME, T0 + 5000).result).toEqual({ accepted: false, reason: 'locked' });
  });

  it('allows long trips after a realistic cooldown', () => {
    const s = stateAt(HOME, T0);
    const paris = { lat: 48.8566, lng: 2.3522 };
    expect(updateLocation(s, paris, T0 + 60_000).result.accepted).toBe(false);
    expect(updateLocation(s, paris, T0 + 8 * 3_600_000).result.accepted).toBe(true);
  });

  it('ignores inaccurate fixes without punishing', () => {
    const r = updateLocation(stateAt(HOME, T0), { ...HOME, accuracy: 500 }, T0 + 1000);
    expect(r.result).toEqual({ accepted: false, reason: 'low_accuracy' });
    expect(r.state.strikes).toBe(0);
  });
});

describe('gathering', () => {
  const world = worldAround(HOME, T0, cfg);
  const node = world.nodes.find((n) => n.type === 'tree' || n.type === 'bush' || n.type === 'rock')!;

  it('needs you to be close', () => {
    const s = stateAt(offsetMeters(node.pos, 200, 0), T0);
    expect(code(() => gather(s, node.id, T0, cfg))).toBe('too_far');
  });

  it('gives loot, xp, costs stamina and respawns after the timer', () => {
    const s = stateAt(node.pos, T0);
    const r = gather(s, node.id, T0, cfg);
    expect(Object.values(r.loot).reduce((a, b) => a! + b!, 0)).toBeGreaterThan(0);
    expect(r.state.xp).toBe(RULES.xp.gather);
    expect(r.state.survival.stamina).toBe(100 - RULES.gatherStaminaCost);
    expect(code(() => gather(r.state, node.id, T0 + 1000, cfg))).toBe('cooldown');
    const later = T0 + RULES.nodeRespawnMs;
    const moved = { ...r.state, location: { ...node.pos, at: later } };
    expect(code(() => gather(moved, node.id, later, cfg))).toBe('ok');
    expect(nearby(r.state, T0 + 1000, cfg)!.nodes.find((n) => n.id === node.id)!.readyAt).toBe(later);
  });

  it('requires a pick for metal', () => {
    for (let i = 0; i < 40; i++) {
      const p = offsetMeters(HOME, i * 300, i * 300);
      const metal = worldAround(p, T0, cfg).nodes.find((n) => n.type === 'metal_deposit');
      if (!metal) continue;
      expect(code(() => gather(stateAt(metal.pos, T0), metal.id, T0, cfg))).toBe('need_tool');
      expect(code(() => gather(stateAt(metal.pos, T0, { stone_pick: 1 }), metal.id, T0, cfg))).toBe('ok');
      return;
    }
    throw new Error('no metal deposit found');
  });
});

describe('crafting', () => {
  it('checks level, materials, and duplicate tools', () => {
    const s = stateAt(HOME, T0, { wood: 10, fiber: 10, dozeberry: 10, stone: 5 });
    expect(code(() => craft(s, 'tranq_dart', T0))).toBe('locked_recipe');
    const r = craft(s, 'slingshot', T0);
    expect(r.state.inventory.slingshot).toBe(1);
    expect(r.state.inventory.wood).toBe(7);
    expect(code(() => craft(r.state, 'slingshot', T0))).toBe('already_owned');
    expect(code(() => craft(stateAt(HOME, T0), 'stone_pick', T0))).toBe('missing_items');
  });
});

describe('taming', () => {
  it('knockout flow: shoot until down, then feed until tamed', () => {
    const spawn = findSpawn((s) => s.creatureId === 'brambleback');
    let s = stateAt(spawn.pos, T0, { slingshot: 1, stone: 50, berries: 20 });
    expect(code(() => feed(startTame(s, spawn.id, T0, cfg).state, 'berries', T0))).toBe('not_down');

    s = startTame(s, spawn.id, T0, cfg).state;
    let t = T0;
    let shots = 0;
    while (s.tameSession!.knockedOutAt === null) {
      t += RULES.shotCooldownMs;
      s = shoot(s, 'slingshot', 1, t).state;
      shots++;
    }
    expect(shots).toBeGreaterThan(1);
    expect(s.inventory.stone).toBe(50 - shots);

    let tamed = null;
    for (let i = 0; i < 10 && !tamed; i++) {
      t += 5000;
      const r = feed(s, 'berries', t);
      s = r.state;
      tamed = r.tamed;
    }
    expect(tamed).not.toBeNull();
    expect(tamed!.creatureId).toBe('brambleback');
    expect(s.tameSession).toBeNull();
    expect(s.xp).toBe(100);
    expect(code(() => startTame(s, spawn.id, t, cfg))).toBe('spent');
  });

  it('enforces feed pacing', () => {
    const spawn = findSpawn((s) => CREATURES_BY_ID[s.creatureId].tameMethod === 'passive');
    let s = startTame(stateAt(spawn.pos, T0, { berries: 20, raw_meat: 5 }), spawn.id, T0, cfg).state;
    let t = T0;
    while (isWatching(spawn.id, t) || isWatching(spawn.id, t - RULES.watchGraceMs)) t += 100;
    s = feed(s, 'berries', t).state;
    expect(code(() => feed(s, 'berries', t + 100))).toBe('too_soon');
  });

  it('passive creatures notice you if you feed while they watch', () => {
    const spawn = findSpawn((s) => CREATURES_BY_ID[s.creatureId].tameMethod === 'passive');
    let s = startTame(stateAt(spawn.pos, T0, { berries: 20 }), spawn.id, T0, cfg).state;
    let t = T0 + 10_000;
    const watched = () => {
      while (!(isWatching(spawn.id, t) && isWatching(spawn.id, t - RULES.watchGraceMs))) t += 100;
    };
    watched();
    const r1 = feed(s, 'berries', t);
    expect(r1.outcome).toBe('spotted');
    expect(r1.state.inventory.berries).toBe(20); // spotted feeds don't use food
    t += 10_000;
    watched();
    const r2 = feed(r1.state, 'berries', t);
    expect(r2.outcome).toBe('fled');
    expect(r2.state.spentSpawns[spawn.id]).toBeDefined();
    s = r2.state;
    expect(s.tameSession).toBeNull();
  });

  it('rare creatures need a better weapon', () => {
    const spawn = findSpawn((s) => CREATURES_BY_ID[s.creatureId].minWeapon === 'blowpipe');
    const s = stateAt(spawn.pos, T0, { slingshot: 1, stone: 10, raw_meat: 5 });
    expect(code(() => startTame(s, spawn.id, T0, cfg))).toBe('need_weapon');
  });
});

describe('protocol', () => {
  it('returns a client view without anti-cheat bookkeeping', () => {
    const r = applyAction(newPlayerState(T0), { type: 'sync', location: HOME }, T0, cfg);
    expect(r.response.event).toEqual({ kind: 'location', result: { accepted: true } });
    expect(r.response.nearby!.nodes.length).toBeGreaterThan(0);
    expect(r.response.player).not.toHaveProperty('gathered');
    expect(r.response.player).not.toHaveProperty('strikes');
    expect(r.response.player.level).toBe(1);
  });

  it('rejects unknown actions', () => {
    expect(code(() => applyAction(newPlayerState(T0), { type: 'nope' } as never, T0, cfg))).toBe('bad_request');
  });
});
