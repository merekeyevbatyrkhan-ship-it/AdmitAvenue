import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProfile,changeExamStatus,validateSection,normalizeProfile,orientationResults,completion} from '../public/profile-core.js';

test('not taken is distinct from zero and clears stale scores',()=>{
  const exam=changeExamStatus({type:'ielts',status:'taken',score:'7.5'},'not_taken');
  assert.equal(exam.score,'');
  const p=blankProfile();p.exams=[exam];assert.deepEqual(validateSection(p,'exams'),[]);
  p.exams=[{...exam,status:'taken',score:''}];assert.equal(validateSection(p,'exams')[0].code,'examScore');
});
test('numeric score ranges and increments are enforced',()=>{
  const p=blankProfile();p.exams=[{type:'ielts',name:'IELTS',status:'taken',score:'10'}];
  assert.equal(validateSection(p,'exams')[0].code,'scoreRange');
  p.exams[0].score='6.3';assert.equal(validateSection(p,'exams')[0].code,'scoreRange');
  p.exams[0].score='6.5';assert.deepEqual(validateSection(p,'exams'),[]);
});
test('custom results and TOEFL scale can be recorded without assuming a single format',()=>{
  const p=blankProfile();p.exams=[{type:'toefl',name:'TOEFL',status:'taken',score:'5 / 6'}];
  assert.deepEqual(validateSection(p,'exams'),[]);
  p.exams=[{type:'other',name:'',status:'taken',score:'A'}];assert.equal(validateSection(p,'exams')[0].code,'examName');
});
test('changing interests changes exploratory results',()=>{
  const p=blankProfile('explore');p.interests=['creative'];p.orientation={creative:5,technology:1};
  assert.equal(orientationResults(p)[0].field,'creative');
  p.interests=['technology'];p.orientation={creative:1,technology:5};assert.equal(orientationResults(p)[0].field,'technology');
});
test('unknown budget and no achievements are valid explicit answers',()=>{
  const p=blankProfile();p.noActivities=true;assert.deepEqual(validateSection(p,'activities'),[]);
  p.budgetUnknown=true;p.countryOpen=true;p.funding='required';assert.deepEqual(validateSection(p,'preferences'),[]);
  p.budgetUnknown=false;p.budget='';assert.equal(validateSection(p,'preferences')[0].code,'budget');
  p.budget='0';assert.deepEqual(validateSection(p,'preferences'),[]);
});
test('restoring a draft normalizes unsafe types and stale exam scores',()=>{
  const p=normalizeProfile({name:123,interests:['technology','injected'],exams:[null,{type:'sat',status:'not_taken',score:'1500'}],orientation:{creative:100}});
  assert.equal(p.name,'');assert.deepEqual(p.interests,['technology']);assert.equal(p.exams[0].score,'');assert.deepEqual(p.orientation,{});
});
test('activity source links must be HTTP or HTTPS',()=>{
  const p=blankProfile();p.activities=[{title:'Project',kind:'project',level:'school',result:'Completed',year:'2026',url:'javascript:alert(1)'}];
  assert.equal(validateSection(p,'activities')[0].code,'url');
});
test('a blank draft is never marked complete',()=>assert.ok(completion(blankProfile()).length<6));
