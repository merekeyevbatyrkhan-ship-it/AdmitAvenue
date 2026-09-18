import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {initAccount} from '../public/account.js';

const flush=()=>new Promise(resolve=>setTimeout(resolve,20));
function setup(t){
  const win=new Window({url:'http://127.0.0.1:4173/profile.html'});
  const originals={};
  for(const [key,value] of Object.entries({window:win,document:win.document,localStorage:win.localStorage,sessionStorage:win.sessionStorage,location:win.location,confirm:()=>true,fetch:async()=>new Response(JSON.stringify({configured:true,url:'https://example.supabase.co',publishableKey:'sb_publishable_test'}))})){
    originals[key]=Object.getOwnPropertyDescriptor(globalThis,key);Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
  }
  t.after(()=>{for(const [key,descriptor]of Object.entries(originals)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}win.happyDOM.abort();});
  win.document.body.innerHTML='<section id="account-panel"></section>';
  let callback,draft={profile:{version:1,name:'Guest'},step:0,locale:'ru'},handler=async()=>({data:null,error:null});
  const client={auth:{onAuthStateChange(fn){callback=fn;},getSession:async()=>({data:{session:null},error:null}),signOut:async()=>({error:null})},from(){
    const request={filters:[],method:'read'};
    const query={select(){return query;},eq(key,value){request.filters.push([key,value]);return query;},insert(values){request.method='insert';request.values=values;return query;},update(values){request.method='update';request.values=values;return query;},maybeSingle(){return handler(request);}};return query;
  }};
  const account=initAccount({getDraft:()=>draft,setDraft:value=>{draft=value;},getLocale:()=>draft.locale,onChange:()=>{},clientFactory:()=>client});
  return {account,win,read:()=>draft,edit:name=>{draft.profile.name=name;account.changed();},login:id=>callback('SIGNED_IN',{user:{id,email:`${id}@example.test`}}),handle:fn=>{handler=fn;},click:action=>{const button=win.document.querySelector(`[data-account="${action}"]`);assert.ok(button,action);button.click();},text:()=>win.document.body.textContent};
}
test('login never overwrites a cloud profile, and logout restores only the guest draft',async t=>{
  const f=setup(t);await flush();let writes=0;
  f.handle(async request=>{if(request.method!=='read')writes++;return {data:{user_id:'A',revision:3,draft:{version:1,name:'Cloud A'},current_step:2,locale:'ru'},error:null};});
  f.login('A');await flush();assert.equal(writes,0);assert.equal(f.read().profile.name,'Guest');
  f.click('load');await flush();assert.equal(f.account.cloudActive,true);assert.equal(f.read().profile.name,'Cloud A');
  f.edit('Private unsaved A');f.click('logout');await flush();
  assert.equal(f.read().profile.name,'Guest');assert.equal(f.account.cloudActive,false);assert.equal(f.account.dirty,false);
});
test('late account A response cannot populate account B',async t=>{
  const f=setup(t);await flush();let resolveA;
  f.handle(request=>request.filters.some(([k,v])=>k==='user_id'&&v==='A')?new Promise(resolve=>{resolveA=resolve;}):Promise.resolve({data:null,error:null}));
  f.login('A');await flush();f.login('B');await flush();
  resolveA({data:{user_id:'A',revision:5,draft:{version:1,name:'Private A'}},error:null});await flush();
  assert.match(f.text(),/B@example.test/);assert.doesNotMatch(f.text(),/Открыть из аккаунта/);assert.equal(f.read().profile.name,'Guest');
});
test('edits during a pending cloud save remain dirty after that save completes',async t=>{
  const f=setup(t);await flush();f.login('A');await flush();let finish;
  f.handle(()=>new Promise(resolve=>{finish=resolve;}));f.click('import');await flush();
  f.edit('Changed while saving');finish({data:{revision:1},error:null});await flush();
  assert.equal(f.account.dirty,true);assert.equal(f.read().profile.name,'Changed while saving');assert.equal(f.win.document.querySelector('[data-account="save"]').disabled,false);
});
test('conflict retains unsaved answers and disables blind retry',async t=>{
  const f=setup(t);await flush();f.login('A');await flush();
  f.handle(async()=>({data:null,error:{code:'23505'}}));f.click('import');await flush();
  assert.equal(f.read().profile.name,'Guest');assert.equal(f.account.dirty,true);assert.match(f.text(),/другом устройстве/);assert.equal(f.win.document.querySelector('[data-account="save"]').disabled,true);
});
