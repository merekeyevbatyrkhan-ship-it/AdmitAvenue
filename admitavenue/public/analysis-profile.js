import {normalizeProfile} from './profile-core.js';
// Exclude names, account identifiers, evidence URLs and local task state.
export function analysisProfile(raw){
  const p=normalizeProfile(raw);
  const result=Object.fromEntries(['path','grade','year','field','interests','orientation','gradeScale','gpa','subjects','noActivities','countries','countryOpen','otherCountry','budget','currency','budgetUnknown','budgetScope','funding','constraints'].map(k=>[k,p[k]]));
  result.languages=p.languages.map(({name,level})=>({name,level}));
  result.exams=p.exams.map(({type,name,status,score,date})=>({type,name,status,score,date}));
  result.activities=p.activities.map(({title,kind,level,result,year,role})=>({title,kind,level,result,year,role}));
  return result;
}
export const analysisContext=(profile,locale)=>JSON.stringify({locale,profile:analysisProfile(profile)});
