export const EXAMS = [
  {id:'ielts',name:'IELTS Academic',min:0,max:9,step:0.5},
  {id:'toefl',name:'TOEFL iBT',text:true},
  {id:'duolingo',name:'Duolingo English Test',min:10,max:160,step:5},
  {id:'sat',name:'SAT',min:400,max:1600,step:10},
  {id:'act',name:'ACT',min:1,max:36,step:1},
  {id:'unt',name:'ЕНТ / ҰБТ',min:0,max:140,step:1},
  {id:'ib',name:'IB Diploma',min:0,max:45,step:1},
  {id:'ap',name:'AP',text:true},
  {id:'alevel',name:'A-levels',text:true},
  {id:'other',name:'',text:true}
];
export const FIELDS = ['technology','engineering','science','medicine','business','humanities','creative','social'];
export const STATUSES = ['not_taken','planned','taken'];
export const SECTIONS = ['goal','interests','academics','exams','activities','preferences'];

export function blankProfile(path = 'known') {
  return {version:1,path:path === 'explore'?'explore':'known',name:'',grade:'',year:'',field:'',interests:[],orientation:{},gradeScale:'unknown',gpa:'',subjects:'',languages:[],exams:[],activities:[],noActivities:false,countries:[],countryOpen:false,otherCountry:'',budget:'',currency:'USD',budgetUnknown:false,budgetScope:'total',funding:'',constraints:'',reviewed:[],journey:{saved:[],compare:[],target:'',completed:[],dates:{}},updatedAt:null};
}
export function normalizeProfile(raw) {
  const p = blankProfile(raw?.path);
  if (!raw || typeof raw !== 'object') return p;
  const strings=['name','grade','year','field','gradeScale','gpa','subjects','otherCountry','budget','currency','budgetScope','funding','constraints'];
  for (const key of strings) if(typeof raw[key]==='string') p[key]=raw[key].slice(0,key==='constraints'?2000:500);
  for(const key of ['noActivities','countryOpen','budgetUnknown'])p[key]=raw[key]===true;
  p.interests=Array.isArray(raw.interests)?raw.interests.filter(x=>FIELDS.includes(x)):[];
  p.reviewed=Array.isArray(raw.reviewed)?raw.reviewed.filter(x=>SECTIONS.includes(x)):[];
  p.countries=Array.isArray(raw.countries)?raw.countries.filter(x=>typeof x==='string').slice(0,20):[];
  for(const field of FIELDS)if(Number.isInteger(raw.orientation?.[field])&&raw.orientation[field]>=1&&raw.orientation[field]<=5)p.orientation[field]=raw.orientation[field];
  for(const key of ['languages','exams','activities'])if(Array.isArray(raw[key]))p[key]=raw[key].filter(x=>x&&typeof x==='object').slice(0,30).map(row=>Object.fromEntries(Object.entries(row).filter(([k,v])=>!['__proto__','constructor','prototype'].includes(k)&&typeof v==='string').map(([k,v])=>[k,v.slice(0,2000)])));
  const columns={languages:['id','name','level'],exams:['id','type','name','status','score','date'],activities:['id','title','kind','level','result','year','role','url']};
  for(const key of Object.keys(columns))p[key]=p[key].map(row=>Object.fromEntries(columns[key].map(column=>[column,typeof row[column]==='string'?row[column]:''])));
  for(const exam of p.exams){if(!STATUSES.includes(exam.status))exam.status='not_taken';if(exam.status!=='taken')exam.score='';}
  const safeId=value=>typeof value==='string'&&/^[a-z0-9-]{1,100}$/.test(value);
  const j=raw.journey;
  if(j&&typeof j==='object'){
    for(const [key,limit]of [['saved',50],['compare',3],['completed',150]])p.journey[key]=Array.isArray(j[key])?[...new Set(j[key].filter(safeId))].slice(0,limit):[];
    p.journey.target=safeId(j.target)?j.target:'';
    if(j.dates&&typeof j.dates==='object')for(const [key,value]of Object.entries(j.dates).slice(0,150))if(safeId(key)&&typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value)p.journey.dates[key]=value;
  }
  if(typeof raw.updatedAt==='string'&&Number.isFinite(Date.parse(raw.updatedAt)))p.updatedAt=raw.updatedAt;
  return p;
}
export function changeExamStatus(exam,status) {
  if(!STATUSES.includes(status))return exam;
  return {...exam,status,score:status==='taken'?exam.score:''};
}
export function validateSection(p, section) {
  const errors=[];
  const add=(field,code)=>errors.push({field,code});
  if(section==='goal'){
    if(!['9','10','11','12','graduate','gap'].includes(p.grade))add('grade','required');
    const y=Number(p.year);if(!p.year||!Number.isInteger(y)||y<new Date().getFullYear()||y>new Date().getFullYear()+8)add('year','year');
  }
  if(section==='interests'){
    if(!p.interests.length)add('interests','chooseInterest');
    if(p.path==='known'&&!FIELDS.includes(p.field))add('field','required');
    if(p.path==='explore'&&FIELDS.some(f=>!Number.isInteger(p.orientation[f])))add('orientation','answerAll');
  }
  if(section==='academics'){
    if(!['unknown','4','5','100'].includes(p.gradeScale))add('gradeScale','required');
    if(p.gradeScale!=='unknown'&&(!p.gpa.trim()||!Number.isFinite(Number(p.gpa))||Number(p.gpa)<0||Number(p.gpa)>Number(p.gradeScale)))add('gpa','scoreRange');
    p.languages.forEach((row,i)=>{if(!row.name.trim()||!row.level)add(`language-${i}`,'required');});
  }
  if(section==='exams')p.exams.forEach((row,i)=>{
    const rule=EXAMS.find(x=>x.id===row.type);
    if(!rule||!STATUSES.includes(row.status)){add(`exam-${i}`,'required');return;}
    if(row.type==='other'&&!row.name.trim())add(`exam-${i}`,'examName');
    if(row.status==='taken'){
      if(!row.score.trim()){add(`exam-${i}`,'examScore');return;}
      if(!rule.text){const value=Number(row.score);if(!Number.isFinite(value)||value<rule.min||value>rule.max||Math.abs((value-rule.min)/rule.step-Math.round((value-rule.min)/rule.step))>1e-7)add(`exam-${i}`,'scoreRange');}
    }
  });
  if(section==='activities'){
    if(!p.noActivities&&!p.activities.length)add('activities','activityChoice');
    p.activities.forEach((a,i)=>{
      if(!a.title.trim()||!a.kind||!a.level||!a.result.trim())add(`activity-${i}`,'activityRequired');
      if(a.year&&(!/^\d{4}$/.test(a.year)||Number(a.year)<2000||Number(a.year)>new Date().getFullYear()+1))add(`activity-${i}`,'activityYear');
      if(a.url){try{const u=new URL(a.url);if(!['https:','http:'].includes(u.protocol))throw new Error();}catch{add(`activity-${i}`,'url');}}
    });
  }
  if(section==='preferences'){
    if(!p.countryOpen&&!p.countries.length)add('countries','country');
    if(p.countries.includes('other')&&!p.otherCountry.trim())add('otherCountry','required');
    if(!p.budgetUnknown&&(!p.budget.trim()||!Number.isFinite(Number(p.budget))||Number(p.budget)<0||Number(p.budget)>1000000000))add('budget','budget');
    if(!['USD','KZT','EUR'].includes(p.currency))add('currency','required');
    if(!['total','tuition'].includes(p.budgetScope))add('budgetScope','required');
    if(!['required','preferred','not_needed'].includes(p.funding))add('funding','required');
  }
  return errors;
}
export function orientationResults(p) {
  return FIELDS.map((field,index)=>({field,score:(p.orientation[field]||0)+(p.interests.includes(field)?2:0)+(p.field===field?3:0),order:index})).sort((a,b)=>b.score-a.score||a.order-b.order).filter(x=>x.score>0).slice(0,3);
}
export function completion(p){return SECTIONS.filter(section=>p.reviewed.includes(section)&&validateSection(p,section).length===0);}
