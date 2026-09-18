// Curated factual snapshot. Null means unverified, never zero/free/no requirement.
// Subject tags are our editorial classification, not an admissions eligibility rule.
export const CHECKED_AT='2026-09-18';
export const COUNTRIES={KZ:['Казахстан','Қазақстан','Kazakhstan'],HU:['Венгрия','Венгрия','Hungary'],IT:['Италия','Италия','Italy']};
export const FIELD_NAMES={technology:['Технологии и IT','Технологиялар және IT','Technology & IT'],engineering:['Инженерия','Инженерия','Engineering'],science:['Естественные науки','Жаратылыстану ғылымдары','Natural sciences'],medicine:['Медицина и здоровье','Медицина және денсаулық','Medicine & health'],business:['Бизнес и экономика','Бизнес және экономика','Business & economics'],humanities:['Языки и гуманитарные науки','Тілдер және гуманитарлық ғылымдар','Languages & humanities'],creative:['Дизайн и творчество','Дизайн және шығармашылық','Design & creativity'],social:['Общество и право','Қоғам және құқық','Society & law']};
const aitu='https://astanait.edu.kz/en/bachelor';
const nu='https://nu.edu.kz/admissions/how-to-apply/foundation-undergraduate/regular-admissions/';
const ssh='https://ssh.nu.edu.kz/ugprograms';
const ud='https://edu.unideb.hu/p/tuition-fee-application-entrance-fee';
const universities={
  aitu:{university:'Astana IT University',mark:'AITU',country:'KZ',city:['Астана','Астана','Astana'],color:'violet',years:3,tuition:2500000,currency:'KZT',feeYear:'2026/27',source:aitu,admissions:aitu,funding:'grant',language:'en'},
  nu:{university:'Nazarbayev University',mark:'NU',country:'KZ',city:['Астана','Астана','Astana'],color:'gold',years:4,tuition:null,currency:'USD',feeYear:null,source:ssh,admissions:nu,funding:'grant',language:'en'},
  debrecen:{university:'University of Debrecen',mark:'UD',country:'HU',city:['Дебрецен','Дебрецен','Debrecen'],color:'green',years:null,tuition:null,currency:'USD',feeYear:'2026/27',source:ud,admissions:ud,funding:'check',language:'en'},
  bologna:{university:'University of Bologna',mark:'UB',country:'IT',city:['Болонья','Болонья','Bologna'],color:'rose',years:3,tuition:null,currency:'EUR',feeYear:null,source:'https://www.unibo.it/en/study/first-and-single-cycle-degree/programme/2026/6646',admissions:'https://corsi.unibo.it/1cycle/EconomicsAndFinance',funding:'check',language:'en'}
};
const p=(id,uni,title,fields,extra={})=>({id,uni,...universities[uni],title,fields,deadline:null,checkedAt:CHECKED_AT,...extra});
export let PROGRAMS=[
  p('aitu-software','aitu',['Разработка программного обеспечения','Бағдарламалық инженерия','Software Engineering'],['technology']),
  p('aitu-cs','aitu',['Компьютерные науки','Компьютерлік ғылымдар','Computer Science'],['technology']),
  p('aitu-data','aitu',['Анализ больших данных','Үлкен деректерді талдау','Big Data Analysis'],['technology','science']),
  p('aitu-electronics','aitu',['Электронная инженерия','Электрондық инженерия','Electronic Engineering'],['engineering']),
  p('aitu-iot','aitu',['Промышленный интернет вещей','Заттардың өнеркәсіптік интернеті','Industrial Internet of Things'],['engineering','technology']),
  p('aitu-management','aitu',['IT-менеджмент','IT-менеджмент','IT Management'],['business','technology']),
  p('aitu-media','aitu',['Медиатехнологии','Медиатехнологиялар','Media Technologies'],['creative','technology']),
  p('aitu-journalism','aitu',['Цифровая журналистика','Цифрлық журналистика','Digital Journalism'],['creative','humanities','social']),
  p('nu-cs','nu',['Компьютерные науки','Компьютерлік ғылымдар','Computer Science'],['technology'],{source:'https://nu.edu.kz/sprogram/bachelor-of-science-in-computer-science/'}),
  p('nu-biology','nu',['Биологические науки','Биология ғылымдары','Biological Sciences'],['science','medicine'],{source:'https://nu.edu.kz/sprogram/bachelor-of-science-in-biological-sciences/',note:'biology'}),
  p('nu-politics','nu',['Политология и международные отношения','Саясаттану және халықаралық қатынастар','Political Science & International Relations'],['social'],{source:'https://ssh.nu.edu.kz/bapsir'}),
  p('nu-sociology','nu',['Социология','Әлеуметтану','Sociology'],['social']),
  p('nu-linguistics','nu',['Лингвистика и мировая литература','Лингвистика және әлем әдебиеті','Linguistics & World Literature'],['humanities']),
  p('nu-chemistry','nu',['Химия','Химия','Chemistry'],['science']),
  p('ud-cs','debrecen',['Компьютерные науки','Компьютерлік ғылымдар','Computer Science'],['technology'],{years:3,tuition:7000}),
  p('ud-business','debrecen',['Управление бизнесом','Бизнесті басқару','Business Administration & Management'],['business'],{years:3.5,tuition:7000,source:'https://edu.unideb.hu/p/business-administration-and-management-bsc',admissions:'https://edu.unideb.hu/p/business-administration-and-management-bsc',englishLevel:'B2',entry:'math'}),
  p('ud-nursing','debrecen',['Сестринское дело','Мейіргер ісі','Nursing'],['medicine'],{years:4,tuition:7500,entry:'biology',note:'nursing'}),
  p('ud-biology','debrecen',['Биология','Биология','Biology'],['science','medicine'],{years:3,tuition:6500,note:'biology'}),
  p('ud-english','debrecen',['Английский язык и американистика','Ағылшын тілі және америкатану','English & American Studies'],['humanities'],{source:'https://edu.unideb.hu/p/faculty-of-humanities',admissions:ud}),
  p('ud-media','debrecen',['Коммуникация и медиаисследования','Коммуникация және медиа зерттеулері','Communication and Media Studies'],['creative','social'],{feeYear:null}),
  p('ud-civil','debrecen',['Гражданское строительство','Азаматтық құрылыс','Civil Engineering'],['engineering'],{years:4,tuition:7500}),
  p('ub-economics','bologna',['Экономика и финансы','Экономика және қаржы','Economics & Finance'],['business'])
];
export const programById=id=>PROGRAMS.find(p=>p.id===id);
export function replacePrograms(programs){PROGRAMS=programs;}
