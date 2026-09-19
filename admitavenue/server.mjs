import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { publicConfig } from './config.mjs';
import { requestAiInsights, AiInsightsError } from './lib/ai-insights.mjs';
import {loadPrograms} from './lib/catalog.mjs';
import {createRequestLimiter} from './lib/request-limits.mjs';
import {requestChat} from './lib/chat.mjs';

const config=publicConfig();
const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

function readJsonBody(req,limit=100_000){return new Promise((resolve,reject)=>{
  let size=0,tooLarge=false;const chunks=[];
  req.on('data',chunk=>{size+=chunk.length;if(size>limit){if(!tooLarge){tooLarge=true;chunks.length=0;reject(new Error('payload_too_large'));}}else if(!tooLarge)chunks.push(chunk);});
  req.on('end',()=>{if(tooLarge)return;try{resolve(chunks.length?JSON.parse(Buffer.concat(chunks).toString('utf8')):null);}catch{reject(new Error('invalid_json'));}});
  req.on('error',reject);req.on('aborted',()=>reject(new Error('request_aborted')));
});}

export function createApp({analyze=requestAiInsights,chat=requestChat,catalogLoader=loadPrograms,limiter=createRequestLimiter(),chatLimiter=createRequestLimiter({perHour:30,totalPerDay:300})}={}){return http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

    // AI routes are server-only; the secret never enters the public config.
    if (pathname === '/api/ai-insights'||pathname==='/api/chat') {
      if (req.method !== 'POST') { res.writeHead(405,{Allow:'POST'}).end(); return; }
      const allowed=new Set(['http://127.0.0.1:'+port,'http://localhost:'+port,...(process.env.APP_ORIGIN?[process.env.APP_ORIGIN]:[])]);
      if(req.headers.origin&&!allowed.has(req.headers.origin)){res.writeHead(403,{'Content-Type':'application/json'}).end(JSON.stringify({error:'origin_rejected'}));return;}
      if((req.headers['content-type']||'').split(';')[0].trim()!=='application/json'){res.writeHead(415,{'Content-Type':'application/json'}).end(JSON.stringify({error:'invalid_content_type'}));return;}
      let body;
      try { body = await readJsonBody(req); }
      catch (err) {
        res.writeHead(err.message==='payload_too_large'?413:400,{'Content-Type':'application/json'}).end(JSON.stringify({error:err.message}));
        return;
      }
      let release;const controller=new AbortController();res.on('close',()=>{if(!res.writableEnded)controller.abort();});
      try {
        release=(pathname==='/api/chat'?chatLimiter:limiter).acquire(req.socket.remoteAddress||'local');
        const result = await (pathname==='/api/chat'?chat:analyze)(body,{signal:controller.signal});
        res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(JSON.stringify(result));
      } catch (err) {
        if (err instanceof AiInsightsError) res.writeHead(err.status,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({error:err.code}));
        else { res.writeHead(502,{'Content-Type':'application/json'}).end(JSON.stringify({error:'ai_unavailable'})); }
      }finally{release?.();}
      return;
    }

    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
    if(pathname==='/api/programs'){
      try{const programs=await catalogLoader();res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(req.method==='HEAD'?undefined:JSON.stringify({source:'supabase',programs}));}
      catch(error){res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({error:error.code||'catalog_unavailable'}));}return;
    }
    if(pathname==='/api/config'){
      res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(req.method==='HEAD'?undefined:JSON.stringify(config));return;
    }
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(root + path.sep) && target !== root) {
      res.writeHead(403).end('Forbidden'); return;
    }
    const body = await readFile(target);
    res.writeHead(200, {
      'Content-Type': mime[path.extname(target)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-cache',
      'Content-Security-Policy': `default-src 'self'; connect-src 'self' ${config.configured?config.url:''}; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`
    }).end(req.method==='HEAD'?undefined:body);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found'); }
});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))createApp().listen(port,'127.0.0.1',()=>console.log(`AdmitAvenue: http://127.0.0.1:${port}`));
