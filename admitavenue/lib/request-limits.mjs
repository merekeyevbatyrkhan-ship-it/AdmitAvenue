import {AiInsightsError} from './errors.mjs';
// Single-process deployment guard. Do not trust client-supplied X-Forwarded-For.
export function createRequestLimiter({now=Date.now,perHour=8,totalPerDay=100,maxConcurrent=2}={}){
  const clients=new Map();let day=0,total=0,active=0;
  return {acquire(ip){
    const time=now(),today=Math.floor(time/86400000);if(today!==day){day=today;total=0;}
    for(const [key,value] of clients)if(time-value.start>=3600000)clients.delete(key);
    const bucket=clients.get(ip)||{start:time,count:0,active:0};
    if(bucket.active||active>=maxConcurrent)throw new AiInsightsError('ai_busy',429);
    if(bucket.count>=perHour||total>=totalPerDay)throw new AiInsightsError('ai_rate_limit',429);
    bucket.count++;bucket.active++;clients.set(ip,bucket);active++;total++;
    let released=false;return ()=>{if(!released){released=true;active--;bucket.active--;}};
  }};
}
