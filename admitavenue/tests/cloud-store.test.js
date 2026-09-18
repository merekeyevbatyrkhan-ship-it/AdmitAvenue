import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
import {createProfileStore,ProfileConflict} from '../public/cloud-store.js';
import {publicConfig} from '../config.mjs';

function fixture(){
  let row=null;const requests=[];
  const client=createClient('https://example.supabase.co','public-test-key',{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:async(url,options)=>{
    const u=new URL(url),method=options.method||'GET',body=options.body?JSON.parse(options.body):null;
    requests.push({method,body,params:u.searchParams});
    let data=[];
    if(method==='POST'){
      if(row)return new Response(JSON.stringify({code:'23505',message:'duplicate'}),{status:409});
      row={...body,revision:1,created_at:'original'};data=[row];
    }else if(method==='PATCH'){
      if(row&&u.searchParams.get('user_id')===`eq.${row.user_id}`&&u.searchParams.get('revision')===`eq.${row.revision}`){row={...row,...body,revision:row.revision+1};data=[row];}
    }else if(row&&u.searchParams.get('user_id')===`eq.${row.user_id}`)data=[row];
    return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
  }}});
  return {store:createProfileStore(client),requests};
}
const draft={profile:{version:1,name:'Test',exams:[{type:'ielts',status:'not_taken',score:''}]},step:3,locale:'kk'};
test('new profile preserves exam status and sends only allowed insert columns',async()=>{
  const {store,requests}=fixture();assert.equal(await store.read('A'),null);
  const row=await store.write('A',null,draft);assert.equal(row.revision,1);assert.deepEqual(row.draft,draft.profile);
  assert.deepEqual(Object.keys(requests[1].body).sort(),['current_step','draft','locale','user_id']);
});
test('simultaneous updates of one revision cannot silently overwrite each other',async()=>{
  const {store,requests}=fixture();await store.write('A',null,draft);
  const results=await Promise.allSettled([store.write('A',1,draft),store.write('A',1,{...draft,step:4})]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,1);
  assert.ok(results.find(x=>x.status==='rejected').reason instanceof ProfileConflict);
  for(const r of requests.filter(x=>x.method==='PATCH')){assert.deepEqual(Object.keys(r.body).sort(),['current_step','draft','locale']);assert.equal(r.params.get('user_id'),'eq.A');assert.equal(r.params.get('revision'),'eq.1');}
  assert.equal((await store.read('A')).created_at,'original');
});
test('racing initial inserts produce a conflict, never an upsert',async()=>{
  const {store}=fixture();await store.write('A',null,draft);
  await assert.rejects(store.write('A',null,draft),ProfileConflict);
});
test('unread cloud state cannot be written and reads are scoped to user',async()=>{
  const {store,requests}=fixture();await assert.rejects(store.write('A',undefined,draft));assert.equal(requests.length,0);
  await store.read('B');assert.equal(requests[0].params.get('user_id'),'eq.B');
});
test('public configuration excludes secrets and rejects secret keys or arbitrary origins',()=>{
  const config=publicConfig({SUPABASE_URL:'https://example.supabase.co/',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test',SERVICE_ROLE_KEY:'private',AI_API_KEY:'private'});
  assert.deepEqual(config,{configured:true,url:'https://example.supabase.co',publishableKey:'sb_publishable_test'});
  assert.throws(()=>publicConfig({SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_secret_no'}));
  assert.throws(()=>publicConfig({SUPABASE_URL:'https://evil.example',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'}));
  assert.deepEqual(publicConfig({}),{configured:false});
});
