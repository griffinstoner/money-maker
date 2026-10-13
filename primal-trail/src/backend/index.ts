import { createOfflineBackend } from './offline';
import { createSupabaseBackend } from './supabase';
import type { Backend } from './types';

export * from './types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** Online when Supabase is configured, otherwise offline playtest mode. */
export const backend: Backend = url && anonKey ? createSupabaseBackend(url, anonKey) : createOfflineBackend();
