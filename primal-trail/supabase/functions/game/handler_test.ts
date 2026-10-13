// Integration test: the real handler against a real Postgres with the real
// migration applied. Run with:
//   PT_TEST_DATABASE_URL=postgres://... deno test -A supabase/functions/game/
// The database needs Supabase's auth schema (or the stub in scripts/).

import postgres from 'npm:postgres@3';
import { assert, assertEquals } from 'jsr:@std/assert@1';
import {
  CREATURES_BY_ID,
  type PlayerState,
  RULES,
  cellsAround,
  creatureSpawnsForCell,
  offsetMeters,
  worldAround,
} from '../_shared/game/index.ts';
import { createHandler } from './handler.ts';

const DB_URL = Deno.env.get('PT_TEST_DATABASE_URL');
const SECRET = 'integration-secret';
const HOME = { lat: 40.7484, lng: -73.9857 };
const T0 = Date.UTC(2026, 5, 1, 16, 0, 0);

Deno.test({
  name: 'game handler against Postgres',
  ignore: !DB_URL,
  sanitizeResources: false,
  sanitizeOps: false,
  async fn(t) {
    const sql = postgres(DB_URL!, { onnotice: () => {} });
    const player = crypto.randomUUID();
    await sql`insert into auth.users (id) values (${player})`;
    let clock = T0;

    const handle = createHandler({
      spawnSecret: SECRET,
      now: () => clock,
      getUserId: async (jwt) => (jwt === 'good-token' ? player : null),
      async loadState(id) {
        const [row] = await sql`select state, version from public.player_state where player_id = ${id}`;
        return row ? { state: row.state as PlayerState, version: Number(row.version) } : null;
      },
      async commit(id, version, state, tames) {
        const [r] = await sql`select public.commit_player_state(${id}, ${version}, ${sql.json(state as never)}, ${sql.json(tames as never)}) as ok`;
        return r.ok;
      },
    });

    const call = async (body: unknown, token = 'good-token') => {
      const res = await handle(
        new Request('http://x/game', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
      );
      return { status: res.status, body: await res.json() };
    };

    await t.step('rejects missing auth', async () => {
      assertEquals((await call({ type: 'sync' }, 'bad')).status, 401);
    });

    const node = worldAround(HOME, T0, { spawnSecret: SECRET }).nodes.find((n) => ['tree', 'bush', 'rock'].includes(n.type))!;

    await t.step('first sync creates the player', async () => {
      const r = await call({ type: 'sync', location: node.pos });
      assertEquals(r.status, 200);
      assertEquals(r.body.event.result.accepted, true);
      assert(r.body.nearby.nodes.some((n: { id: string }) => n.id === node.id));
      assertEquals(r.body.player.gathered, undefined);
    });

    await t.step('gathering the same node twice at once only pays once', async () => {
      clock += 1000;
      const [a, b] = await Promise.all([call({ type: 'gather', nodeId: node.id }), call({ type: 'gather', nodeId: node.id })]);
      const statuses = [a.status, b.status].sort();
      assertEquals(statuses, [200, 400]);
      const failed = a.status === 400 ? a : b;
      assertEquals(failed.body.error.code, 'cooldown');
      const [row] = await sql`select state from public.player_state where player_id = ${player}`;
      assertEquals(row.state.xp, RULES.xp.gather);
    });

    await t.step('teleporting is rejected and does not move the player', async () => {
      clock += 1000;
      const r = await call({ type: 'sync', location: offsetMeters(node.pos, 20_000, 0) });
      assertEquals(r.body.event.result, { accepted: false, reason: 'too_fast' });
      assertEquals(r.body.player.location.lat, node.pos.lat);
    });

    await t.step('a full knockout tame lands in tamed_creatures', async () => {
      let spawn = null;
      for (let i = 0; i < 40 && !spawn; i++) {
        for (const cell of cellsAround(offsetMeters(HOME, i * 450, i * 170))) {
          spawn ??= creatureSpawnsForCell(cell, T0, { spawnSecret: SECRET }).find(
            (s) => CREATURES_BY_ID[s.creatureId].minWeapon === 'slingshot',
          ) ?? null;
        }
      }
      assert(spawn, 'no slingshot-tameable spawn found');
      const def = CREATURES_BY_ID[spawn.creatureId];

      // Give the player gear directly, then walk them to the creature over time.
      const [row] = await sql`select state, version from public.player_state where player_id = ${player}`;
      const state = row.state as PlayerState;
      state.inventory = { ...state.inventory, slingshot: 1, stone: 200, [def.preferredFood]: 20 };
      state.location = { ...spawn.pos, at: clock };
      await sql`update public.player_state set state = ${sql.json(state as never)} where player_id = ${player}`;

      clock += 1000;
      const start = await call({ type: 'tame_start', spawnId: spawn.id });
      assertEquals(start.status, 200, JSON.stringify(start.body));

      let down = false;
      for (let i = 0; i < 100 && !down; i++) {
        clock += RULES.shotCooldownMs;
        const r = await call({ type: 'tame_shoot', weapon: 'slingshot', accuracy: 1 });
        assertEquals(r.status, 200, JSON.stringify(r.body));
        down = r.body.event.knockedOut;
      }
      assert(down);

      let outcome = '';
      for (let i = 0; i < 20 && outcome !== 'tamed'; i++) {
        clock += 5000;
        const r = await call({ type: 'tame_feed', itemId: def.preferredFood });
        assertEquals(r.status, 200, JSON.stringify(r.body));
        outcome = r.body.event.outcome;
      }
      assertEquals(outcome, 'tamed');
      const tames = await sql`select creature_id, level from public.tamed_creatures where player_id = ${player}`;
      assertEquals(tames.length, 1);
      assertEquals(tames[0].creature_id, def.id);
    });

    await sql`delete from auth.users where id = ${player}`;
    await sql.end();
  },
});
