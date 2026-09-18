import {createClient} from './vendor/supabase.js';
import {createProfileStore,ProfileConflict} from './cloud-store.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function initAccount({getDraft,setDraft,getLocale,onChange,testMode=false,clientFactory=createClient}){
  const t=(ru,kk,en)=>({ru,kk,en}[getLocale()]||ru);
  let client,store,user=null,epoch=0,available=false,initializing=true,loading=false,busy=false;
  let remote=null,revision,adopted=false,dirty=false,conflict=false,message='',guestBackup=null,editVersion=0;
  let mode='login',authBusy=false;
  const dialog=document.createElement('dialog');
  dialog.className='account-dialog';dialog.setAttribute('aria-labelledby','account-title');
  document.body.append(dialog);
  const notify=()=>{mount();onChange();};
  const button=(action,label,primary=false,disabled=false)=>`<button type="button" data-account="${action}" class="${primary?'button button-purple':'account-secondary'}" ${disabled?'disabled':''}>${label}</button>`;
  const errorText=error=>{
    if(error?.code==='invalid_credentials')return t('Неверный email или пароль.','Email немесе құпиясөз қате.','Incorrect email or password.');
    if(error?.code==='email_not_confirmed')return t('Подтверди email по ссылке из письма, затем войди.','Хаттағы сілтемемен email-ді растап, қайта кір.','Confirm your email using the link in your inbox, then sign in.');
    if(error?.status===429||error?.code?.includes('rate_limit'))return t('Слишком много попыток. Подожди немного и повтори.','Әрекет тым көп. Біраз күтіп, қайтала.','Too many attempts. Wait a little and retry.');
    if(error?.code==='weak_password')return t('Выбери более длинный пароль с буквами и цифрами.','Әріптер мен сандардан тұратын ұзағырақ құпиясөз таңда.','Choose a longer password with letters and numbers.');
    return t('Не удалось выполнить запрос. Проверь соединение и повтори. Ответы остаются на странице.','Сұрау орындалмады. Байланысты тексеріп, қайтала. Жауаптар бетте қалады.','The request failed. Check your connection and retry. Your answers remain on this page.');
  };
  function mount(){
    const panel=document.querySelector('#account-panel');if(!panel)return;
    const locked=busy||loading;
    const heading=user?t('Твой аккаунт','Сенің аккаунтың','Your account'):t('Твой путь — с любого устройства','Кез келген құрылғыдан жалғастыр','Your journey, on any device');
    let content='';
    if(initializing)content=`<p>${t('Подключаем аккаунт…','Аккаунтқа қосылуда…','Connecting your account…')}</p>`;
    else if(!available)content=`<p>${t('Аккаунты сейчас недоступны. Гостевой черновик работает.','Аккаунттар қазір қолжетімсіз. Қонақ нұсқасы жұмыс істейді.','Accounts are currently unavailable. Your guest draft still works.')}</p>${button('retry-connect',t('Повторить','Қайталау','Retry'))}`;
    else if(!user)content=`<p>${t('Войди, чтобы сохранять анкету в аккаунте. Без входа она остаётся в этом браузере.','Сауалнаманы аккаунтта сақтау үшін кір. Кірмесең, ол осы браузерде қалады.','Sign in to save your profile to your account. As a guest, it stays in this browser.')}</p><div class="account-actions">${button('login',t('Войти','Кіру','Sign in'),true)}${button('signup',t('Создать аккаунт','Аккаунт ашу','Create account'))}</div>`;
    else {
      content=`<p class="account-email">${escape(user.email)}</p>`;
      if(loading)content+=`<p>${t('Проверяем сохранённую анкету…','Сақталған сауалнама тексерілуде…','Checking your saved profile…')}</p>`;
      else if(revision===undefined)content+=button('refresh',t('Загрузить данные аккаунта','Аккаунт деректерін жүктеу','Load account data'),true,locked);
      else if(!adopted)content+=`<p>${remote?t('В аккаунте уже есть анкета. Выбери, с какой продолжить.','Аккаунтта сауалнама бар. Қайсысымен жалғастыратыныңды таңда.','Your account already has a profile. Choose which one to continue with.'):t('В аккаунте пока нет анкеты. Можно сохранить текущий гостевой черновик.','Аккаунтта сауалнама әлі жоқ. Қазіргі қонақ нұсқасын сақтауға болады.','Your account has no profile yet. You can save this guest draft.')}</p><div class="account-actions">${remote?button('load',t('Открыть из аккаунта','Аккаунттан ашу','Open account profile'),true,locked):''}${button('import',t('Сохранить гостевой черновик','Қонақ нұсқасын сақтау','Save guest draft'),!remote,locked)}</div>`;
      else content+=`<p>${conflict?t('Анкета изменилась на другом устройстве. Скачай свои ответы перед загрузкой версии из аккаунта.','Сауалнама басқа құрылғыда өзгерген. Аккаунт нұсқасын жүктемес бұрын жауаптарыңды жүктеп ал.','The profile changed on another device. Download your answers before loading the account version.'):dirty?t('Есть изменения. Нажми «Сохранить в аккаунт» перед выходом.','Өзгерістер бар. Шығар алдында «Аккаунтта сақтау» түймесін бас.','You have changes. Save to your account before leaving.'):t('Анкета сохранена в аккаунте.','Сауалнама аккаунтта сақталды.','Your profile is saved to your account.')}</p><div class="account-actions">${button('save',busy?t('Сохраняем…','Сақталуда…','Saving…'):t('Сохранить в аккаунт','Аккаунтта сақтау','Save to account'),true,locked||conflict||!dirty)}${button('load',t('Загрузить из аккаунта','Аккаунттан жүктеу','Load from account'),false,locked)}</div>`;
      content+=`<div class="account-actions account-bottom">${button('logout',t('Выйти','Шығу','Sign out'),false,locked)}</div>`;
    }
    panel.innerHTML=`<div class="account-mark" aria-hidden="true">↗</div><div class="account-content"><h2>${heading}</h2>${content}<p class="account-message" role="status">${escape(message)}</p></div>`;
  }
  async function refresh(){
    if(!user||loading||busy)return;
    const token=epoch,uid=user.id;loading=true;message='';notify();
    try{const row=await store.read(uid);if(token!==epoch)return;remote=row;revision=row?.revision??null;}
    catch(error){if(token===epoch){revision=undefined;message=errorText(error);}}
    finally{if(token===epoch){loading=false;notify();}}
  }
  function changeUser(next){
    if((next?.id||null)===(user?.id||null))return;
    epoch++;const restore=adopted?guestBackup:null;
    user=next;remote=null;revision=undefined;adopted=false;dirty=false;conflict=false;loading=false;busy=false;message='';guestBackup=null;
    if(restore)setDraft(restore);
    notify();if(user)void refresh();
  }
  async function connect(){
    initializing=true;message='';notify();
    try{
      const response=await fetch('/api/config',{cache:'no-store',signal:AbortSignal.timeout(15000)});
      if(!response.ok)throw new Error('config');
      const config=await response.json();if(!config.configured)throw new Error('config');
      if(!client){
      client=clientFactory(config.url,config.publishableKey,{auth:{storage:testMode?sessionStorage:localStorage,storageKey:testMode?'admitavenue.test.auth':'admitavenue.auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},global:{fetch:(url,options)=>fetch(url,{...options,signal:options?.signal?AbortSignal.any([options.signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000)})}});
      store=createProfileStore(client);available=true;
      client.auth.onAuthStateChange((event,session)=>{
        // SDK calls run outside its auth callback/lock.
        setTimeout(()=>{changeUser(session?.user||null);if(event==='PASSWORD_RECOVERY')openAuth('recovery');},0);
      });
      }
      available=true;
      const {data,error}=await client.auth.getSession();if(error)throw error;
      changeUser(data.session?.user||null);
    }catch{available=false;message=t('Не удалось подключиться. Можно продолжить без входа.','Қосылу мүмкін болмады. Кірмей жалғастыруға болады.','Could not connect. You can continue as a guest.');}
    finally{initializing=false;notify();}
  }
  async function load(){
    if(!user||busy||loading)return;
    if(adopted&&dirty&&!confirm(t('Заменить несохранённые ответы версией из аккаунта? Сначала можно скачать копию.','Сақталмаған жауаптарды аккаунт нұсқасымен ауыстыру керек пе? Алдымен көшірмесін жүктеп алуға болады.','Replace unsaved answers with the account version? You can download a copy first.')))return;
    const token=epoch;loading=true;message='';notify();
    try{
      const row=await store.read(user.id);if(token!==epoch)return;
      if(!row){remote=null;revision=null;message=t('Сохранённая анкета не найдена.','Сақталған сауалнама табылмады.','No saved profile found.');return;}
      if(!adopted)guestBackup=structuredClone(getDraft());
      remote=row;revision=row.revision;adopted=true;dirty=false;conflict=false;
      setDraft({profile:row.draft,step:row.current_step,locale:row.locale});
    }catch(error){if(token===epoch)message=errorText(error);}
    finally{if(token===epoch){loading=false;notify();}}
  }
  async function save(importGuest=false){
    if(!user||busy||loading||revision===undefined||conflict)return;
    if(importGuest&&remote&&!confirm(t('Заменить анкету в аккаунте текущим гостевым черновиком?','Аккаунттағы сауалнаманы қонақ нұсқасымен ауыстыру керек пе?','Replace your account profile with this guest draft?')))return;
    const token=epoch,version=editVersion,snapshot=structuredClone(getDraft());
    if(importGuest){guestBackup=snapshot;adopted=true;dirty=true;}
    busy=true;message='';notify();
    try{
      const row=await store.write(user.id,revision,snapshot);if(token!==epoch)return;
      remote=row;revision=row.revision;dirty=editVersion!==version;
      message=t('Сохранено. Можно продолжить на другом устройстве.','Сақталды. Басқа құрылғыдан жалғастыруға болады.','Saved. You can continue on another device.');
    }catch(error){if(token===epoch){if(error instanceof ProfileConflict){conflict=true;message='';}else message=errorText(error);}}
    finally{if(token===epoch){busy=false;notify();}}
  }
  async function logout(){
    if(dirty&&!confirm(t('Выйти без сохранения последних изменений?','Соңғы өзгерістерді сақтамай шығу керек пе?','Sign out without saving your latest changes?')))return;
    busy=true;notify();
    try{const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;changeUser(null);}
    catch(error){message=errorText(error);}finally{busy=false;notify();}
  }
  function openAuth(nextMode){
    mode=nextMode;
    const signup=mode==='signup',reset=mode==='reset',recovery=mode==='recovery';
    const title=recovery?t('Новый пароль','Жаңа құпиясөз','New password'):reset?t('Восстановить доступ','Қолжетімділікті қалпына келтіру','Reset password'):signup?t('Создай свой аккаунт','Өз аккаунтыңды аш','Create your account'):t('С возвращением','Қайта келгеніңе қуаныштымыз','Welcome back');
    dialog.innerHTML=`<button type="button" class="account-close" data-auth="close" aria-label="${t('Закрыть','Жабу','Close')}">×</button><span class="eyebrow">ADMITAVENUE</span><h2 id="account-title">${title}</h2><p>${reset?t('Отправим ссылку для смены пароля.','Құпиясөзді өзгерту сілтемесін жібереміз.','We will email you a password reset link.'):t('Сохрани анкету и продолжай свой путь с любого устройства.','Сауалнаманы сақтап, кез келген құрылғыдан жалғастыр.','Save your profile and continue on any device.')}</p><form id="account-form">${!recovery?`<label>Email<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label>`:''}${!reset?`<label>${t('Пароль','Құпиясөз','Password')}<input name="password" type="password" autocomplete="${signup||recovery?'new-password':'current-password'}" minlength="${signup||recovery?8:1}" required maxlength="128">${signup||recovery?`<small>${t('Не менее 8 символов','Кемінде 8 таңба','At least 8 characters')}</small>`:''}</label>`:''}<p id="auth-feedback" role="status"></p><button class="button button-purple" type="submit">${reset?t('Отправить ссылку','Сілтеме жіберу','Send reset link'):recovery?t('Сохранить пароль','Құпиясөзді сақтау','Save password'):signup?t('Создать аккаунт','Аккаунт ашу','Create account'):t('Войти','Кіру','Sign in')}</button></form><div class="account-switch">${!recovery?`<button type="button" data-auth="${signup||reset?'login':'signup'}">${signup||reset?t('Уже есть аккаунт? Войти','Аккаунтың бар ма? Кіру','Have an account? Sign in'):t('Нет аккаунта? Создать','Аккаунтың жоқ па? Ашу','New here? Create account')}</button>`:''}${mode==='login'?`<button type="button" data-auth="reset">${t('Забыл пароль','Құпиясөзді ұмыттым','Forgot password')}</button>`:''}</div>`;
    if(!dialog.open)dialog.showModal();
  }
  dialog.addEventListener('click',event=>{const action=event.target.closest('[data-auth]')?.dataset.auth;if(!action||authBusy)return;if(action==='close')dialog.close();else openAuth(action);});
  dialog.addEventListener('cancel',event=>{if(authBusy)event.preventDefault();});
  dialog.addEventListener('close',()=>{dialog.querySelector('form')?.reset();});
  dialog.addEventListener('submit',async event=>{
    event.preventDefault();if(authBusy)return;
    const form=event.target,fields=new FormData(form),email=String(fields.get('email')||'').trim(),password=String(fields.get('password')||'');
    const feedback=dialog.querySelector('#auth-feedback'),submit=form.querySelector('[type=submit]');
    authBusy=true;submit.disabled=true;feedback.textContent=t('Подожди немного…','Сәл күте тұр…','One moment…');
    try{
      let result;
      const redirect=location.origin+'/profile.html';
      if(mode==='signup')result=await client.auth.signUp({email,password,options:{emailRedirectTo:redirect}});
      else if(mode==='reset')result=await client.auth.resetPasswordForEmail(email,{redirectTo:redirect});
      else if(mode==='recovery')result=await client.auth.updateUser({password});
      else result=await client.auth.signInWithPassword({email,password});
      if(result.error)throw result.error;
      form.reset();
      if(mode==='reset'||(mode==='signup'&&!result.data.session))feedback.textContent=t('Проверь почту, включая «Спам». Если адрес подходит, придёт письмо со ссылкой. После подтверждения вернись сюда и войди.','Поштаны, соның ішінде спамды тексер. Мекенжай жарамды болса, сілтемесі бар хат келеді. Растаған соң осында кір.','Check your inbox, including spam. If the address is eligible, you will receive a link. After confirming, return here and sign in.');
      else{dialog.close();if(result.data?.user)changeUser(result.data.user);}
    }catch(error){feedback.textContent=errorText(error);}
    finally{authBusy=false;submit.disabled=false;}
  });
  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-account]')?.dataset.account;if(!action)return;
    if(action==='login'||action==='signup')openAuth(action);
    else if(action==='retry-connect')void connect();
    else if(action==='refresh')void refresh();
    else if(action==='load')void load();
    else if(action==='save')void save();
    else if(action==='import')void save(true);
    else if(action==='logout')void logout();
  });
  window.addEventListener('beforeunload',event=>{if(adopted&&dirty){event.preventDefault();event.returnValue='';}});
  void connect();
  return {
    mount,
    get cloudActive(){return adopted;},
    get identity(){return user?.id||'guest';},
    get loading(){return loading;},
    get dirty(){return dirty;},
    changed(){editVersion++;if(adopted){dirty=true;message='';notify();}},
    status(){return busy?t('Сохраняем в аккаунт…','Аккаунтта сақталуда…','Saving to account…'):dirty?t('Есть несохранённые изменения','Сақталмаған өзгерістер бар','Unsaved changes'):t('Сохранено в аккаунте','Аккаунтта сақталды','Saved to account');}
  };
}
