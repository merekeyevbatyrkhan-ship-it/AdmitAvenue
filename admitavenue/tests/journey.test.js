import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {blankProfile,normalizeProfile,FIELDS,SECTIONS} from '../public/profile-core.js';
import {PROGRAMS,programById} from '../public/programs.js';
import {rankPrograms,suggestedPrograms,makePlan,planProgress,budgetCheck,englishEvidence} from '../public/journey-core.js';
import {journeyUI,VIEWS} from '../public/journey-ui.js';

function profile(){return {...blankProfile(),grade:'11',year:'2026',field:'technology',interests:['technology'],noActivities:true,countries:['KZ'],budget:'3000000',currency:'KZT',funding:'required',reviewed:[...SECTIONS]};}
const task=(p,key)=>makePlan(p).find(t=>t.id.includes('-'+key+'-'));

test('old profiles migrate and journey survives storage round-trip',()=>{
  assert.deepEqual(normalizeProfile({version:1}).journey,blankProfile().journey);
  const p=profile();p.journey={saved:['aitu-cs'],compare:['aitu-cs','nu-cs'],target:'aitu-cs',completed:[],dates:{}};
  const id=task(p,'documents').id;p.journey.completed=[id];p.journey.dates[id]='2026-10-01';
  assert.deepEqual(normalizeProfile(JSON.parse(JSON.stringify(p))).journey,p.journey);
});
test('restoration limits comparisons and rejects unsafe IDs and impossible dates',()=>{
  const p=normalizeProfile({journey:{compare:['a','a','b','c','d','<script>'],target:'" onclick="bad',dates:{a:'2026-02-30',b:'2026-10-01',c:'no date'}}});
  assert.deepEqual(p.journey.compare,['a','b','c']);assert.equal(p.journey.target,'');assert.deepEqual(p.journey.dates,{b:'2026-10-01'});
});
test('each supported field has at least three sourced relevant suggestions',()=>{
  for(const field of FIELDS){const p=profile();p.field=field;p.interests=[field];p.countryOpen=true;
    const rows=suggestedPrograms(p);assert.equal(rows.length,3,field);assert.equal(new Set(rows.map(r=>r.program.id)).size,3);assert.ok(rows.every(r=>r.fieldMatch));
  }
  for(const p of PROGRAMS){assert.equal(new URL(p.source).protocol,'https:');assert.equal(p.title.length,3);assert.equal(p.deadline,null);}
});
test('changing field and country changes suggestions, without silently claiming eligibility',()=>{
  const p=profile();assert.ok(suggestedPrograms(p).every(r=>r.program.country==='KZ'));
  p.countries=['HU'];assert.equal(suggestedPrograms(p)[0].program.country,'HU');
  p.field='business';p.interests=['business'];assert.equal(rankPrograms(p)[0].program.id,'ud-business');
  p.countries=['US'];assert.ok(suggestedPrograms(p).every(r=>r.gaps.includes('country')));
});
test('budget comparison never converts currencies, invents fees or assumes future fees',()=>{
  const p=profile(),aitu=programById('aitu-cs');assert.equal(budgetCheck(p,aitu),'tuition-covered');
  p.budget='0';assert.equal(budgetCheck(p,aitu),'gap');p.currency='USD';assert.equal(budgetCheck(p,aitu),'currency');
  p.year='2027';assert.equal(budgetCheck(p,aitu),'future');assert.equal(budgetCheck(p,programById('nu-cs')),'unverified');
  p.budgetUnknown=true;assert.equal(budgetCheck(p,aitu),'unknown');
});
test('not-taken or planned exams are never results',()=>{
  const p=profile();p.exams=[{type:'ielts',status:'not_taken',score:'7'}];assert.equal(englishEvidence(p).status,'missing');
  p.exams[0].status='planned';assert.equal(englishEvidence(p).status,'planned');
  p.exams[0].status='taken';assert.equal(englishEvidence(p).status,'taken');
});
test('profile edits invalidate affected tasks while preserving unrelated progress',()=>{
  const p=profile();p.journey.target='aitu-cs';const docs=task(p,'documents'),english=task(p,'english');
  p.journey.completed=[docs.id,english.id];assert.equal(planProgress(p).done.length,2);
  p.exams=[{type:'ielts',status:'planned',score:'',date:'2026-11-01'}];
  assert.equal(task(p,'documents').id,docs.id);assert.notEqual(task(p,'english').id,english.id);assert.equal(planProgress(p).done.length,1);
  p.journey.target='nu-cs';assert.equal(planProgress(p).done.length,0);
});
test('plan contains a next action and progress reaches 100 only for current tasks',()=>{
  const p=profile();p.journey.target='aitu-cs';const before=planProgress(p);assert.ok(before.next);assert.equal(before.percent,0);
  p.journey.completed=before.tasks.map(t=>t.id);const after=planProgress(p);assert.equal(after.percent,100);assert.equal(after.next,undefined);
  p.journey.target='missing-program';assert.ok(makePlan(p).some(t=>t.id.startsWith('general-target-')));
});
test('all views and details render in three languages and escape profile input',()=>{
  const window=new Window();const p=profile();p.name='<img src=x onerror=alert(1)>';p.journey.compare=['aitu-cs','nu-cs'];p.journey.target='aitu-cs';
  const filters={query:'',country:'all',field:'all',saved:false};
  for(const locale of ['ru','kk','en'])for(const view of VIEWS){
    const ui=journeyUI({profile:p,locale,view,filters,notice:'',cloudActive:false});
    window.document.body.innerHTML=ui.html;assert.ok(window.document.querySelector('h1'));assert.equal(window.document.querySelector('[onerror]'),null);assert.ok(!ui.html.includes('undefined'),locale+view);
    window.document.body.innerHTML=ui.detail('aitu-cs');assert.ok(window.document.querySelector('[data-target="aitu-cs"]'));
  }
  window.close();
});
