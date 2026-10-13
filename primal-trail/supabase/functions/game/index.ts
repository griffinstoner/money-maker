// Primal Trail game server. One endpoint, POST { type: ..., ... } (see
// GameAction in _shared/game/protocol.ts). Runs the shared rules engine
// against the caller's state and commits with optimistic locking.
//
// Env: SPAWN_SECRET (set with `supabase secrets set SPAWN_SECRET=...`).
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by the platform.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHandler } from './handler.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

Deno.serve(
  createHandler({
    spawnSecret: Deno.env.get('SPAWN_SECRET'),
    async getUserId(jwt) {
      const { data, error } = await supabase.auth.getUser(jwt);
      return error || !data.user ? null : data.user.id;
    },
    async loadState(playerId) {
      const { data, error } = await supabase
        .from('player_state')
        .select('state, version')
        .eq('player_id', playerId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async commit(playerId, expectedVersion, state, newTames) {
      const { data, error } = await supabase.rpc('commit_player_state', {
        p_player: playerId,
        p_expected_version: expectedVersion,
        p_state: state,
        p_new_tames: newTames,
      });
      if (error) throw error;
      return data === true;
    },
  }),
);
