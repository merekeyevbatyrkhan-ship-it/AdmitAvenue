import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({path:fileURLToPath(new URL('./.env',import.meta.url)),quiet:true});

// Only these two intentionally public values may leave the server.
export function publicConfig(env=process.env) {
  const url=env.SUPABASE_URL||'', key=env.SUPABASE_PUBLISHABLE_KEY||'';
  if(!url&&!key)return {configured:false};
  if(!/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url)||!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))
    throw new Error('Set a valid Supabase URL and publishable key in .env.');
  return {configured:true,url:url.replace(/\/$/,''),publishableKey:key};
}
