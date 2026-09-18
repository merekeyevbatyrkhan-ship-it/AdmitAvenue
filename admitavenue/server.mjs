import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { publicConfig } from './config.mjs';
import { requestAiInsights, AiInsightsError } from './lib/ai-insights.mjs';
import {loadPrograms} from './lib/catalog.mjs';
import {createRequestLimiter} from './lib/request-limits.mjs';

const config=publicConfig();
const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

async function readJsonBody(req, limit = 100_000) {
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('payload_too_large');
    chunks.push(chunk);
  }
  if (!chunks.length) return null;
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new Error('invalid_json'); }
}

export function createApp({analyze=requestAiInsights,catalogLoader=loadPrograms,limiter=createRequestLimiter()}={}){return http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

    // AI insights: the only POST route. Everything else stays GET/HEAD-only.
    if (pathname === '/api/ai-insights') {
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
        release=limiter.acquire(req.socket.remoteAddress||'local');
        const result = await analyze(body,{signal:controller.signal});
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
