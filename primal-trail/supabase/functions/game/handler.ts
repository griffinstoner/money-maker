import { type GameAction, GameError, type PlayerState, type TamedCreature, applyAction, newPlayerState } from '../_shared/game/index.ts';

/** Storage and auth the handler needs. index.ts wires these to Supabase. */
export interface GameDeps {
  spawnSecret: string | undefined;
  /** Resolve a bearer token to a user id, or null if invalid. */
  getUserId(jwt: string): Promise<string | null>;
  loadState(playerId: string): Promise<{ state: PlayerState; version: number } | null>;
  /** false = version conflict, retry. */
  commit(playerId: string, expectedVersion: number | null, state: PlayerState, newTames: TamedCreature[]): Promise<boolean>;
  now?: () => number;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

const error = (status: number, code: string, message: string) => json({ error: { code, message } }, status);

export function createHandler(deps: GameDeps) {
  const now = deps.now ?? Date.now;

  return async function handle(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
    if (req.method !== 'POST') return error(405, 'method_not_allowed', 'POST only.');
    if (!deps.spawnSecret) return error(500, 'misconfigured', 'SPAWN_SECRET is not set.');

    const jwt = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    const playerId = jwt ? await deps.getUserId(jwt) : null;
    if (!playerId) return error(401, 'unauthorized', 'Session expired. Sign in again.');

    let action: GameAction;
    try {
      action = await req.json();
    } catch {
      return error(400, 'bad_request', 'Body must be JSON.');
    }

    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const row = await deps.loadState(playerId);
        const t = now();
        const state = row?.state ?? newPlayerState(t);

        let result;
        try {
          result = applyAction(state, action, t, { spawnSecret: deps.spawnSecret });
        } catch (e) {
          if (e instanceof GameError) return error(400, e.code, e.message);
          throw e;
        }

        if (await deps.commit(playerId, row?.version ?? null, result.state, result.newTames)) {
          return json(result.response);
        }
        // Another request from this player won the race. Reload and replay.
      }
      return error(409, 'busy', 'Too many actions at once. Try again.');
    } catch (e) {
      console.error(e);
      return error(500, 'internal', 'Something went wrong.');
    }
  };
}
