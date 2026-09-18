import {validatePrograms} from '../public/catalog-core.js';
import {AiInsightsError} from './errors.mjs';
export async function loadPrograms({fetchImpl=fetch,url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY,signal}={}){
  if(!url||!key)throw new AiInsightsError('catalog_not_configured',503);
  try{
    const response=await fetchImpl(`${url.replace(/\/$/,'')}/rest/v1/admit_programs?select=data&active=eq.true&order=id&limit=500`,{
      headers:{apikey:key,Accept:'application/json'},signal:signal?AbortSignal.any([signal,AbortSignal.timeout(10000)]):AbortSignal.timeout(10000)
    });
    if(!response.ok)throw new AiInsightsError(response.status===404?'catalog_not_ready':'catalog_unavailable',503);
    const rows=await response.json();
    if(!Array.isArray(rows)||!rows.length)throw new AiInsightsError('catalog_empty',503);
    return validatePrograms(rows.map(r=>r.data));
  }catch(error){if(error instanceof AiInsightsError)throw error;if(signal?.aborted)throw error;throw new AiInsightsError('catalog_unavailable',503);}
}
