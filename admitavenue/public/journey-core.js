import {PROGRAMS,programById} from './programs.js';
import {orientationResults,completion} from './profile-core.js';

export function englishEvidence(profile){
  const exam=profile.exams.find(e=>['ielts','toefl','duolingo'].includes(e.type)&&e.status==='taken'&&e.score.trim());
  const planned=profile.exams.find(e=>['ielts','toefl','duolingo'].includes(e.type)&&e.status==='planned');
  const language=profile.languages.find(l=>/^(english|английский|ағылшын|ағылшынша|английский язык|ағылшын тілі)$/i.test(l.name.trim()));
  return {exam,planned,language,status:exam?'taken':planned?'planned':'missing'};
}
export function budgetCheck(profile,program){
  if(profile.budgetUnknown||profile.budget===''||!Number.isFinite(Number(profile.budget)))return 'unknown';
  if(program.tuition===null)return 'unverified';
  // No stale currency conversions or unconfirmed future-year prices.
  if(profile.year&&profile.year!==program.feeYear?.split('/')[0])return 'future';
  if(profile.currency!==program.currency)return 'currency';
  return Number(profile.budget)>=program.tuition?'tuition-covered':'gap';
}
export function rankPrograms(profile,programs=PROGRAMS){
  const interests=orientationResults(profile).map(x=>x.field);
  const primary=profile.path==='known'?profile.field:interests[0];
  const english=englishEvidence(profile);
  return programs.map(program=>{
    const reasons=[],gaps=[];let score=0;
    const fieldMatch=program.fields.some(f=>interests.includes(f));
    if(primary&&program.fields.includes(primary)){score+=100;reasons.push('primary');}
    else if(fieldMatch){score+=60;reasons.push('interest');}
    const chosen=profile.countries.includes(program.country);
    const countryMatch=chosen||profile.countryOpen||!profile.countries.length;
    if(chosen){score+=35;reasons.push('country');}
    else if(profile.countryOpen){score+=8;reasons.push('open');}
    else if(profile.countries.length)gaps.push('country');
    if(english.exam){score+=5;reasons.push('english-result');}else gaps.push(english.planned?'english-planned':'english-missing');
    const budget=budgetCheck(profile,program);
    if(budget==='tuition-covered'){score+=12;reasons.push('tuition');if(profile.budgetScope==='total')gaps.push('living');}
    else gaps.push('budget-'+budget);
    if(profile.funding==='required'){gaps.push('funding');if(program.funding==='grant')score+=5;}
    return {program,score,reasons,gaps,budget,fieldMatch,countryMatch};
  }).sort((a,b)=>b.score-a.score||a.program.id.localeCompare(b.program.id));
}
export function suggestedPrograms(profile,limit=3){
  const all=rankPrograms(profile),hasInterest=orientationResults(profile).length>0;
  const relevant=hasInterest?all.filter(x=>x.fieldMatch):all;
  const chosen=[];
  // Prefer requested countries, then diversify institutions within each group.
  for(const pool of [relevant.filter(x=>x.countryMatch),relevant.filter(x=>!x.countryMatch)]){
    const seen=new Set();
    for(const row of pool){if(chosen.length===limit)break;if(!seen.has(row.program.uni)){chosen.push(row);seen.add(row.program.uni);}}
    for(const row of pool){if(chosen.length===limit)break;if(!chosen.includes(row))chosen.push(row);}
  }
  return chosen.sort((a,b)=>Number(b.countryMatch)-Number(a.countryMatch)||b.score-a.score);
}
function signature(value){let hash=2166136261;for(const c of JSON.stringify(value)){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(36);}
export function makePlan(profile){
  const target=programById(profile.journey.target),tasks=[];
  const add=(key,group,title,body,depends=[],source=null)=>tasks.push({id:`${target?.id||'general'}-${key}-${signature(depends)}`,group,title,body,source});
  if(completion(profile).length<6)add('profile','start',['Заверши свой профиль','Профиліңді аяқта','Complete your profile'],['Проверь пропущенные разделы: так подбор и план будут точнее.','Өткізілген бөлімдерді тексер: іріктеу мен жоспар дәлірек болады.','Review the missing sections so your matches and plan have enough context.'],[profile.grade,profile.year,profile.field,profile.interests]);
  if(!target){add('target','start',['Выбери программу для плана','Жоспарға бағдарлама таңда','Choose a target program'],['Сравни варианты и нажми «Мой выбор» у программы, которую хочешь изучить глубже.','Нұсқаларды салыстырып, тереңірек зерттегің келген бағдарламада «Менің таңдауым» түймесін бас.','Compare your options, then choose the program you want to explore further.']);return tasks;}
  add('deadlines','start',['Проверь сроки и путь поступления','Мерзімдер мен түсу жолын тексер','Check deadlines and your admission route'],['Открой официальный сайт. Найди набор своего года и категории, сроки заявки, экзаменов и стипендий. Запиши личную дату проверки ниже.','Ресми сайттан өз жылың мен санатың үшін өтінім, емтихан және шәкіртақы мерзімдерін тап. Төменде тексеру күнін белгіле.','Find your entry year and applicant category on the official site. Check application, exam and funding deadlines. Set your own check date below.'],[profile.year],target.admissions);
  if(profile.funding==='required'||budgetCheck(profile,target)==='gap')add('funding','finance',['Составь план финансирования','Қаржыландыру жоспарын құр','Build a funding plan'],['Стипендия пока не получена. Проверь доступность грантов для своей категории и запасной вариант; учитывай проживание и сборы.','Шәкіртақы әлі алынған жоқ. Өз санатың үшін гранттарды және қосалқы нұсқаны тексер; тұру мен алымдарды ескер.','No scholarship is secured yet. Check eligibility and alternatives, including living costs and fees.'],[profile.funding,profile.budget,profile.currency,profile.year],target.admissions);
  const english=englishEvidence(profile);
  add('english','exams',english.status==='taken'?['Проверь применимость результата по английскому','Ағылшын нәтижесінің жарамдылығын тексер','Check your English result']:english.status==='planned'?['Подготовься к запланированному экзамену','Жоспарланған емтиханға дайындал','Prepare for your planned exam']:['Выбери способ подтвердить английский','Ағылшын тілін растау жолын таңда','Choose how to prove your English'],english.status==='taken'?['Результат есть. Сверь принимаемый тест, срок действия и требования по каждому разделу — общий балл не доказывает выполнение всех условий.','Нәтиже бар. Қабылданатын тестті, жарамдылық мерзімін және әр бөлім талабын салыстыр. Жалпы балл жеткіліксіз болуы мүмкін.','You have a result. Verify the accepted test, validity and section requirements; the overall score alone is not enough.']:['Уточни принимаемые тесты или интервью. Затем выбери дату и составь график подготовки под требования программы.','Қабылданатын тесттерді не сұхбатты нақтыла. Сосын күнін таңдап, бағдарламаға сай дайындық кестесін құр.','Check accepted tests or interviews, then choose a date and a preparation schedule for this program.'],[profile.exams,profile.languages],target.admissions);
  add('academic','academics',target.entry==='math'?['Подготовься к вступительной математике','Қабылдау математикасына дайындал','Prepare for the mathematics entrance exam']:target.entry==='biology'?['Подготовься к биологии и интервью','Биология мен сұхбатқа дайындал','Prepare for biology and the interview']:['Сверь академические требования','Академиялық талаптарды салыстыр','Review academic requirements'],['Проверь обязательные предметы, принимаемый аттестат и вступительные испытания. Сопоставь их со своими оценками и экзаменами.','Міндетті пәндерді, қабылданатын аттестатты және сынақтарды тексер. Оларды бағаларыңмен және емтихандарыңмен салыстыр.','Check subjects, accepted school qualifications and entrance assessments against your grades and exams.'],[profile.grade,profile.gpa,profile.gradeScale,profile.exams,profile.subjects],target.admissions);
  add('documents','documents',['Собери список документов','Құжаттар тізімін жина','Build your document checklist'],['По официальному списку отметь аттестат или справку, выписку оценок, результаты тестов и переводы. Проверь необходимость эссе и рекомендаций.','Ресми тізім бойынша аттестат не анықтама, бағалар, тест нәтижелері мен аудармаларды белгіле. Эссе және ұсыным қажеттігін тексер.','Use the official list to check school records, test results and translations. Verify whether essays and references are required.'],[profile.grade,profile.year],target.admissions);
  add('activities','activities',profile.activities.length?['Оформи вклад и достижения','Үлес пен жетістіктерді рәсімде','Document your achievements']:['Запланируй одну содержательную активность','Бір мазмұнды іс-шара жоспарла','Plan one meaningful activity'],profile.activities.length?['Выбери наиболее значимые достижения: укажи уровень, результат и личный вклад, приложи подтверждение. Не все программы оценивают портфолио.','Ең маңызды жетістіктерді таңдап, деңгейін, нәтижесін, жеке үлесіңді және дәлелін көрсет. Барлық бағдарлама портфолионы бағаламайды.','Select meaningful achievements and record the level, outcome, personal contribution and evidence. Not every program assesses a portfolio.']:['Выбери проект, исследование, волонтёрство или соревнование по интересам. Определи конкретный результат; проверь, учитывает ли программа активности.','Қызығушылығыңа сай жоба, зерттеу, еріктілік не жарыс таңда. Нақты нәтиже белгіле; бағдарлама белсенділікті ескере ме, тексер.','Choose a project, research, volunteering or competition you care about. Define a concrete outcome and check whether the program considers activities.'],[profile.activities,profile.field,profile.interests]);
  add('budget','finance',['Уточни полную стоимость','Толық шығынды нақтыла','Confirm the total cost'],['Сложи обучение, жильё, питание, страховку, дорогу и сборы. Сверь валюту и год набора; стоимость из каталога может относиться к предыдущему году.','Оқу, тұру, тамақ, сақтандыру, жол және алымдарды қос. Валюта мен қабылдау жылын тексер; каталог бағасы өткен жылға қатысты болуы мүмкін.','Add tuition, housing, meals, insurance, travel and fees. Check currency and intake year; catalog fees may belong to an earlier intake.'],[profile.budget,profile.currency,profile.budgetScope,profile.year],target.source);
  return tasks;
}
export function planProgress(profile){const tasks=makePlan(profile),done=tasks.filter(t=>profile.journey.completed.includes(t.id));return {tasks,done,next:tasks.find(t=>!profile.journey.completed.includes(t.id)),percent:tasks.length?Math.round(done.length/tasks.length*100):0};}
