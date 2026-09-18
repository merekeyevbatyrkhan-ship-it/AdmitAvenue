import {FIELDS} from './profile-core.js';
export function validatePrograms(rows){
  if(!Array.isArray(rows)||!rows.length||rows.length>500)throw new Error('invalid_catalog');
  const ids=new Set(),str=(v,max=300)=>typeof v==='string'&&v.length>0&&v.length<=max;
  const url=v=>{try{return str(v,2000)&&new URL(v).protocol==='https:';}catch{return false;}};
  return rows.map(p=>{
    if(!p||!str(p.id,100)||!/^[a-z0-9-]+$/.test(p.id)||ids.has(p.id)||
       !str(p.uni,100)||!/^[a-z0-9-]+$/.test(p.uni)||!str(p.university)||!str(p.mark,12)||
       !['KZ','HU','IT'].includes(p.country)||!['violet','gold','green','rose'].includes(p.color)||
       !['title','city'].every(k=>Array.isArray(p[k])&&p[k].length===3&&p[k].every(v=>str(v)))||
       !Array.isArray(p.fields)||!p.fields.length||!p.fields.every(f=>FIELDS.includes(f))||
       !(p.years===null||(Number.isFinite(p.years)&&p.years>0&&p.years<=10))||
       !(p.tuition===null||(Number.isFinite(p.tuition)&&p.tuition>=0))||
       !['USD','KZT','EUR'].includes(p.currency)||!['grant','check'].includes(p.funding)||p.language!=='en'||
       !(p.feeYear===null||/^\d{4}\/\d{2}$/.test(p.feeYear))||
       !url(p.source)||!url(p.admissions)||!/^\d{4}-\d{2}-\d{2}$/.test(p.checkedAt))throw new Error('invalid_catalog');
    ids.add(p.id);
    return Object.fromEntries(['id','uni','university','mark','country','city','color','years','tuition','currency','feeYear','source','admissions','funding','language','title','fields','checkedAt'].map(k=>[k,p[k]]).concat([
      ['deadline',null],['note',['biology','nursing'].includes(p.note)?p.note:null],
      ['entry',['math','biology'].includes(p.entry)?p.entry:null],['englishLevel',p.englishLevel==='B2'?'B2':null]
    ]));
  });
}
