import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Env } from '../types'

let client: SupabaseClient | null = null

export function getSupabase(env: Env): SupabaseClient {
  if (!client) {
    client = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)
  }
  return client
}
