import {analysisProfile,analysisContext} from './analysis-profile.js';
export class AiInsightsError extends Error {constructor(code){super(code);this.code=code;}}
export async function fetchAiInsights(profile,locale,{signal,fetchImpl=fetch,timeoutMs=55000}={}){
  const timeout=AbortSignal.timeout(timeoutMs),combined=signal?AbortSignal.any([signal,timeout]):timeout;
  try{
    const response=await fetchImpl('/api/ai-insights',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile:analysisProfile(profile),locale}),signal:combined});
    const result=await response.json();
    if(!response.ok)throw new AiInsightsError(result?.error||'ai_unavailable');
    if(!result||!Array.isArray(result.recommendations)||typeof result.summary!=='string')throw new AiInsightsError('ai_bad_response');
    return result;
  }catch(error){if(error instanceof AiInsightsError)throw error;throw new AiInsightsError(signal?.aborted?'ai_cancelled':timeout.aborted?'ai_timeout':'ai_unreachable');}
}

export function createAiController({request=fetchAiInsights,onChange=()=>{}}={}){
  let context='',sequence=0,controller,state={status:'idle',data:null,error:null};
  const reset=()=>{sequence++;controller?.abort();controller=null;state={status:'idle',data:null,error:null};};
  return {
    get state(){return state;},
    sync(profile,locale,identity='guest'){
      const next=identity+'|'+analysisContext(profile,locale);if(next!==context){reset();context=next;}return state;
    },
    reset(){reset();context='';return state;},
    async run(profile,locale,identity='guest'){
      this.sync(profile,locale,identity);if(state.status==='loading')return;
      const token=++sequence;controller=new AbortController();state={status:'loading',data:null,error:null};onChange(state);
      try{const data=await request(structuredClone(profile),locale,{signal:controller.signal});if(token!==sequence)return;state={status:'ready',data,error:null};}
      catch(error){if(token!==sequence)return;state={status:'error',data:null,error:error.code||'ai_unavailable'};}
      if(token===sequence){controller=null;onChange(state);}
    }
  };
}
