// Original trilingual landing page. Profile storage lives in profile.js.
const translations = {
en: {
skip:'Skip to content', nav:'Main navigation', navHow:'How it works', navTools:'Features', navFaq:'Questions', begin:'Start',
eyebrow:'A big future starts with you', heroOne:'Your potential.', heroTwo:'Your own path.',
heroDescription:'From “what do I want to become?” to a clear admission plan. Find your direction and a university where your story begins.',
buildRoute:'Build my roadmap', seeHow:'How it works', noAccount:'Start without an account. At your own pace.', tagKz:'Kazakhstan', tagWorld:'A world of possibilities',
routeExample:'Illustrative personal roadmap', yourRules:'Your goals. Your rules.', personalRoute:'PERSONAL ROADMAP', fromDream:'From a dream to a first step', journeyBegins:'It all begins with your interests',
stepOne:'STEP 01 · DISCOVER YOURSELF', yourDirection:'A direction that feels like you', directionNote:'Interests, strengths and ambitions',
stepTwo:'STEP 02 · EXPLORE OPPORTUNITIES', yourUniversity:'A university for your goals', universityNote:'Compare programs, budget and requirements', whyFits:'Understand why it could fit',
stepThree:'STEP 03 · TAKE ACTION', yourPlan:'A plan that makes sense', planNote:'Exams, documents and activities', nextStep:'One clear next step', canDo:'You can make a start', stepAtTime:'Not all at once. One step at a time.', illustrative:'An illustration of your future journey',
stripPersonal:'Built around your interests', stripBudget:'Mindful of your budget', stripClear:'With a clear plan', stripPace:'At your own pace',
startEyebrow:'YOUR STARTING POINT', startTitle:'You don’t need all the answers yet.', startDescription:'Start with what you already know about yourself.<br>We’ll explore the rest along the way.',
haveGoal:'I HAVE A GOAL', knowDirection:'I know my direction', knowDescription:'Find programs and build a plan around your chosen field.', looking:'STILL EXPLORING', findDirection:'Help me find my path', findDescription:'Explore your interests and discover fields that feel right for you.',
toolsEyebrow:'LESS CONFUSION. MORE CLARITY.', toolsTitle:'It all connects to your journey.', toolsDescription:'Your interests, opportunities and actions —<br>in one connected story.',
featureDirection:'First, understand yourself', featureDirectionText:'Career exploration connects what you enjoy with possible fields of study.', interestCreate:'Create', interestExplore:'Explore', interestSolve:'Solve problems ✧', interestHelp:'Help others',
featureUniversities:'Choose with confidence', featureUniversitiesText:'Compare tuition, language and requirements. See the reasoning alongside each recommendation.', programA:'Program A', programB:'Program B', comparisonCaption:'Your criteria, not someone else’s ranking',
featureActivities:'Strengthen your profile', featureActivitiesText:'Record olympiads, competitions, projects and volunteering. Your plan helps you document your contribution or start a meaningful activity.', activityTitle:'From an interest to an achievement', activitySubtitle:'City · national · international',
featureAi:'Talk through your questions', featureAiText:'An AI assistant for questions about your choices, preparation and personal plan.', sampleQuestion:'What if I haven’t taken IELTS yet?', sampleReply:'That’s a starting point, not a dead end.<br>Your roadmap can include preparation.', aiPlanned:'AI chat — coming in the next stage',
howEyebrow:'FROM YOUR FIRST QUESTION TO ACTION', howTitle:'A big goal. Clear steps.', startWithMe:'Start with yourself', howOne:'Tell us about yourself', howOneText:'Interests, grades, exams, achievements and budget. “Not taken yet” is an answer too.', howTwo:'Explore your options', howTwoText:'Review recommendations and compare programs. Understand what fits and what needs preparation.', howThree:'Take your first step', howThreeText:'Get a plan with concrete tasks. Track your progress and work towards your goal.',
faqEyebrow:'LET’S FIGURE IT OUT', faqTitle:'Have questions?<br>That’s normal.', faqDescription:'Applying can feel complicated.<br>Questions are a good place to start.',
faqQ1:'What if I haven’t chosen a career?', faqA1:'Start with “Help me find my path”. Career exploration helps you discover interests and possible fields. The result is a starting point for reflection, not a verdict on your future.',
faqQ2:'What if I haven’t taken any exams?', faqA2:'Every exam will have a “Not taken” option. A missing result should not be treated as a zero score: the plan should account for preparation and checking program requirements.',
faqQ3:'Can I consider Kazakhstan and other countries?', faqA3:'Yes. The available countries will depend on the programs included in the service. Check requirements, tuition and deadlines on each university’s official website.',
faqQ4:'Does this guarantee admission?', faqA4:'No. Universities make admission decisions. AdmitAvenue helps organize your choices and preparation; recommendations do not replace official requirements or guarantee admission or scholarships.',
account:'My journey', faqQ5:'What works in this version?', faqA5:'The landing page, profile and interest exploration work in three languages. Guest profiles stay in this browser; after signing in, you can save to your account. Program matching, favorites, comparison and a personal task plan are available. The catalog links to university sources. AI feedback is the next stage.',
finalEyebrow:'THIS IS JUST THE BEGINNING', finalTitle:'Your future doesn’t have to feel unclear.', finalDescription:'Let’s start with one clear step.', chooseStart:'Choose your starting point', footerTag:'Your journey starts with you.',
title:'AdmitAvenue — your admission journey', description:'Discover your direction, compare universities and build your personal admission roadmap with AdmitAvenue.'
},
kk: {
skip:'Мазмұнға өту', nav:'Негізгі мәзір', navHow:'Қалай жұмыс істейді', navTools:'Мүмкіндіктер', navFaq:'Сұрақтар', begin:'Бастау',
eyebrow:'Үлкен болашақ өзіңнен басталады', heroOne:'Сенің әлеуетің.', heroTwo:'Сенің жолың.',
heroDescription:'«Кім болғым келеді?» деген сұрақтан оқуға түсудің нақты жоспарына дейін. Өзіңе сай бағыт пен болашағың басталатын университетті тап.',
buildRoute:'Өз жолымды құру', seeHow:'Қалай жұмыс істейді', noAccount:'Тіркелмей баста. Өзіңе ыңғайлы қарқынмен.', tagKz:'Қазақстан', tagWorld:'Алдыңда — бүкіл әлем',
routeExample:'Жеке жол картасының үлгісі', yourRules:'Өз мақсатың. Өз таңдауың.', personalRoute:'ЖЕКЕ ЖОЛ КАРТАСЫ', fromDream:'Арманнан алғашқы қадамға', journeyBegins:'Бәрі сенің қызығушылықтарыңнан басталады',
stepOne:'01-ҚАДАМ · ӨЗІҢДІ ТАНУ', yourDirection:'Өзіңе сай бағыт', directionNote:'Қызығушылықтар, қабілеттер және мақсаттар',
stepTwo:'02-ҚАДАМ · МҮМКІНДІКТЕРДІ ТАБУ', yourUniversity:'Мақсатыңа сай университет', universityNote:'Бағдарламаларды, бюджетті және талаптарды салыстыр', whyFits:'Неліктен сәйкес келетінін түсін',
stepThree:'03-ҚАДАМ · ӘРЕКЕТ ЕТУ', yourPlan:'Түсінікті жоспар', planNote:'Емтихандар, құжаттар және іс-шаралар', nextStep:'Келесі бір нақты қадам', canDo:'Сен алғашқы қадамды жасай аласың', stepAtTime:'Бәрін бірден емес. Біртіндеп.', illustrative:'Сенің жолың осындай болуы мүмкін',
stripPersonal:'Қызығушылықтарыңа сай', stripBudget:'Бюджетіңді ескереді', stripClear:'Түсінікті жоспармен', stripPace:'Өз қарқыныңмен',
startEyebrow:'СЕНІҢ БАСТАУ НҮКТЕҢ', startTitle:'Барлық жауапты білу міндетті емес.', startDescription:'Өзің туралы білетініңнен бастайық.<br>Қалғанын жол-жөнекей анықтаймыз.',
haveGoal:'МАҚСАТЫМ БАР', knowDirection:'Бағытымды білемін', knowDescription:'Таңдаған бағытыңа сай бағдарламалар мен дайындық жоспарын табамыз.', looking:'ӘЛІ ІЗДЕНІСТЕМІН', findDirection:'Өз жолымды тапқым келеді', findDescription:'Қызығушылықтарыңды зерттеп, өзіңе жақын бағыттарды анықтаймыз.',
toolsEyebrow:'АЗ АЛАҢДАУ. КӨП АЙҚЫНДЫҚ.', toolsTitle:'Бәрі сенің жолыңа ұласады.', toolsDescription:'Қызығушылықтарың, мүмкіндіктерің және әрекеттерің —<br>біртұтас жоспарда.',
featureDirection:'Алдымен — өзіңді түсіну', featureDirectionText:'Кәсіби бағдар ұнататын істеріңді оқу бағыттарымен байланыстыруға көмектеседі.', interestCreate:'Жасау', interestExplore:'Зерттеу', interestSolve:'Мәселе шешу ✧', interestHelp:'Көмектесу',
featureUniversities:'Саналы таңдау жасау', featureUniversitiesText:'Бағдарламаларды оқу ақысы, тілі және талаптары бойынша салыстыр. Әр ұсыныстың себебі көрсетіледі.', programA:'A бағдарламасы', programB:'B бағдарламасы', comparisonCaption:'Біреудің рейтингі емес, сенің өлшемдерің',
featureActivities:'Жетістіктеріңді толықтыру', featureActivitiesText:'Олимпиада, жарыс, жоба және еріктілікті тірке. Жоспар үлесіңді рәсімдеуге не жаңа белсенділікті бастауға көмектеседі.', activityTitle:'Қызығушылықтан жетістікке', activitySubtitle:'Қалалық · ұлттық · халықаралық',
featureAi:'Мазалаған сұрақтарды талқылау', featureAiText:'Таңдау, дайындық және жеке жоспарың туралы сұрақтарға арналған AI-көмекші.', sampleQuestion:'IELTS-ті әлі тапсырмасам ше?', sampleReply:'Бұл кедергі емес, бастау нүктесі.<br>Дайындықты жоспарыңа енгіземіз.', aiPlanned:'AI-чат — келесі кезеңде',
howEyebrow:'АЛҒАШҚЫ СҰРАҚТАН ӘРЕКЕТКЕ ДЕЙІН', howTitle:'Үлкен мақсат. Нақты қадамдар.', startWithMe:'Өзіңнен баста', howOne:'Өзің туралы айтып бер', howOneText:'Қызығушылықтарың, бағаларың, емтихандарың, жетістіктерің және бюджетің. «Әлі тапсырмадым» — бұл да жауап.', howTwo:'Мүмкіндіктерді қарастыр', howTwoText:'Ұсыныстарды зерттеп, нұсқаларды салыстыр. Не сәйкес келетінін және нені жақсарту керегін түсін.', howThree:'Алғашқы қадамыңды жаса', howThreeText:'Нақты тапсырмалары бар жоспар ал. Орындалғанын белгілеп, мақсатыңа қарай жылжы.',
faqEyebrow:'БІРГЕ АНЫҚТАЙЫҚ', faqTitle:'Сұрақтарың бар ма?<br>Бұл қалыпты жағдай.', faqDescription:'Оқуға түсу күрделі көрінуі мүмкін.<br>Сұрақ қоюдан бастау — дұрыс қадам.',
faqQ1:'Мамандық таңдамаған болсам ше?', faqA1:'«Өз жолымды тапқым келеді» жолынан баста. Кәсіби бағдар қызығушылықтарың мен ықтимал бағыттарды зерттеуге көмектеседі. Нәтиже болашағың туралы кесімді шешім емес, ойлануға негіз болады.',
faqQ2:'Емтихандарды әлі тапсырмасам ше?', faqA2:'Әр емтиханда «Тапсырмадым» нұсқасы болады. Нәтиженің жоқтығы нөл балл болып есептелмеуі керек: жоспар дайындықты және бағдарлама талаптарын тексеруді ескеруі тиіс.',
faqQ3:'Қазақстан мен шетелді қатар қарастыруға бола ма?', faqA3:'Иә. Қолжетімді елдер сервистегі бағдарламаларға байланысты болады. Әр бағдарламаның талаптарын, оқу ақысын және мерзімдерін университеттің ресми сайтынан тексеру маңызды.',
faqQ4:'Сервис оқуға түсуге кепілдік бере ме?', faqA4:'Жоқ. Қабылдау туралы шешімді университет қабылдайды. AdmitAvenue таңдау мен дайындықты реттеуге көмектеседі. Ұсыныстар ресми талаптарды алмастырмайды, оқуға түсуге немесе шәкіртақыға кепілдік бермейді.',
account:'Менің жолым', faqQ5:'Осы нұсқада не жұмыс істейді?', faqA5:'Басты бет, сауалнама және қызығушылықтарды зерттеу үш тілде жұмыс істейді. Қонақ профилі браузерде сақталады; кіргеннен кейін аккаунтта сақтауға болады. Бағдарламаларды іріктеу, таңдаулылар, салыстыру және жеке тапсырма жоспары қолжетімді. Каталогта ресми дереккөздер бар. AI-пікір — келесі кезеңде.',
finalEyebrow:'БҰЛ — ТЕК БАСТАМАСЫ', finalTitle:'Болашағың айқын бола алады.', finalDescription:'Бір түсінікті қадамнан бастайық.', chooseStart:'Бастау нүктесін таңдау', footerTag:'Сенің жолың өзіңнен басталады.',
title:'AdmitAvenue — оқуға түсу жолың', description:'AdmitAvenue арқылы өз бағытыңды тап, университеттерді салыстыр және оқуға түсудің жеке жоспарын құр.'
}
};

const copyNodes = [...document.querySelectorAll('[data-i18n]')];
const ariaNodes = [...document.querySelectorAll('[data-i18n-aria]')];
const ru = Object.fromEntries(copyNodes.map(node => [node.dataset.i18n, node.innerHTML]));
for (const node of ariaNodes) ru[node.dataset.i18nAria] = node.getAttribute('aria-label');
ru.title = document.title;
ru.description = document.querySelector('meta[name="description"]').content;
translations.ru = ru;
let currentLanguage = 'ru';
const language = document.querySelector('#language');
function setLanguage(locale) {
  currentLanguage = Object.hasOwn(translations, locale) ? locale : 'ru';
  const copy = translations[currentLanguage];
  document.documentElement.lang = currentLanguage;
  language.value = currentLanguage;
  for (const node of copyNodes) node.innerHTML = copy[node.dataset.i18n] ?? ru[node.dataset.i18n];
  for (const node of ariaNodes) node.setAttribute('aria-label', copy[node.dataset.i18nAria] ?? ru[node.dataset.i18nAria]);
  document.title = copy.title;
  document.querySelector('meta[name="description"]').content = copy.description;
  try { localStorage.setItem('admitavenue.language', currentLanguage); } catch { /* Local storage is optional. */ }
}
language.addEventListener('change', event => setLanguage(event.target.value));
let savedLanguage = 'ru';
try { savedLanguage = localStorage.getItem('admitavenue.language') || 'ru'; } catch { /* Keep Russian default. */ }
setLanguage(savedLanguage);

for (const button of document.querySelectorAll('[data-path]')) {
  button.addEventListener('click', () => {
    location.href = `/profile.html?path=${encodeURIComponent(button.dataset.path)}`;
  });
}
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.05 });
  document.documentElement.classList.add('motion-ready');
  for (const section of document.querySelectorAll('.reveal')) observer.observe(section);
}
