import { T } from './i18n';
import { initRoom } from './room';
let started=false;
export function initApp(opts){
if(started)return;started=true;
'use strict';
var BRAND={ru:'YesYes',en:'YesYes'}; // <- change the name here (header wordmark is split into two 'Yes' in index.html)
var D=opts.deck, CARDS=D.cards, TAGS=D.survey_tags.filter(function(x){return x.level==='nezhno'});
var LANG=opts.lang;
var CAT={'разговор':{en:'Talk',i:'💬'},'прикосновение':{en:'Touch',i:'🤲'},'игра':{en:'Game',i:'🎲'},'флирт':{en:'Flirt',i:'😉'},'воспоминание':{en:'Memory',i:'🌙'},'поцелуи':{en:'Kisses',i:'💋'},'массаж':{en:'Massage',i:'💆'},'шёпот':{en:'Whisper',i:'🤫'},'ощущения':{en:'Sensations',i:'🪶'},'танец':{en:'Dance',i:'💃'},'ролевая':{en:'Role play',i:'🎭'},'приказы':{en:'Orders',i:'🗝️'},'фантазия':{en:'Fantasy',i:'💭'},'места':{en:'Places',i:'🏠'},'фото':{en:'Photo',i:'📷'},'опыт':{en:'New',i:'✨'}};
var LV=[{id:'nezhno',ru:'Нежно',en:'Gentle',i:'🌸',acc:'#e8a99a',pr:'Комплименты, объятия, разговоры о вас.',pe:'Compliments, hugs, talks about the two of you.',free:1},
{id:'teplo',ru:'Тепло',en:'Warm',i:'🔥',acc:'#ff9a6c',pr:'Поцелуи, массаж, флирт.',pe:'Kisses, massage, flirting.'},
{id:'goryacho',ru:'Горячо',en:'Hot',i:'♨️',acc:'#d1213f',pr:'Чувственные задания и ролевые сценки.',pe:'Sensual tasks and role-play scenes.'},
{id:'smelo',ru:'Смело',en:'Bold',i:'🖤',acc:'#d4af37',pr:'Фантазии, только при взаимном «хочу».',pe:'Fantasies, only when both say "want".'}];
var LVI={};LV.forEach(function(l,i){l.n=i;LVI[l.id]=l});
var WHO={'оба':{en:'both'},'один':{en:'one'}};
var LVX={nezhno:{dr:'Внимание, слова и объятия. Идеально для начала вечера или если вы давно не играли.',de:'Attention, words and hugs. Perfect to open the evening or if you haven\'t played in a while.'},
teplo:{dr:'Больше близости: поцелуи, шёпот, массаж и лёгкий флирт с таймером.',de:'More closeness: kisses, whispers, massage and light flirting with a timer.'},
goryacho:{dr:'Чувственные ощущения, ролевые сценки и игра во власть — только по взаимному согласию.',de:'Sensual sensations, role-play scenes and power play — only by mutual consent.'},
smelo:{dr:'Фантазии, новые места и смелый опыт. Карточки появятся, только если оба ответили «хочу».',de:'Fantasies, new places and bold experiences. Cards appear only if you both said "want".'}};
var RU_LABELS={want:'Хочу',maybe:'Может',no:'Нет',all:'Все'};
var EN_LABELS={want:'Want',maybe:'Maybe',no:'No',all:'All'};
var $=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ruText={};
$$('[data-i]').forEach(function(e){ruText[e.dataset.i]=e.textContent});
$$('[data-ph]').forEach(function(e){ruText['ph_'+e.dataset.ph]=e.placeholder});
function t(k){return LANG==='en'&&T.en[k]?T.en[k]:ruText[k]}
function txt(c){return LANG==='en'?c.text_en:c.text_ru}
function catName(c){return LANG==='en'?CAT[c].en:c}
function whoName(w){return LANG==='en'?WHO[w].en:w}
function lab(k){return (LANG==='en'?EN_LABELS:RU_LABELS)[k]}

function applyLang(){
  document.documentElement.lang=LANG;
  $$('[data-i]').forEach(function(e){e.textContent=t(e.dataset.i)});
  $$('[data-ph]').forEach(function(e){e.placeholder=LANG==='en'?T.en[e.dataset.ph]:ruText['ph_'+e.dataset.ph]});
  $('#brand2').textContent=BRAND[LANG];if(BRAND[LANG]!=='YesYes')$('#brand').textContent=BRAND[LANG];
  $('#langBtn').textContent=LANG==='en'?'EN / RU':'RU / EN';
  document.title=BRAND[LANG]+(LANG==='en'?' — say yes to each other. A couples game 18+':' — скажите «да» друг другу. Игра для пар 18+');
  renderStatic();renderLevels();renderFilters();if($('#v-gallery').classList.contains('active'))renderGrid();renderSurvey();
  if(game.list.length&&$('#v-game').classList.contains('active'))renderCard(true);
  if($('#v-end').classList.contains('active'))renderEnd();if($('#v-fallback').classList.contains('active'))renderFallback();
}
$('#langBtn').onclick=function(){var nl=LANG==='ru'?'en':'ru';localStorage.setItem('lang',nl);window.location.href=opts.base+(nl==='en'?'/':'/ru/')+location.hash};
$('#v-levels h2'); // noop

/* views */
function go(v){
  if(RM.active&&RM.leaveGuard&&RM.leaveGuard(v))return;
  $$('.view').forEach(function(e){e.classList.remove('active')});
  $('#v-'+v).classList.add('active');window.scrollTo(0,0);
  if(location.hash!=='#'+v)history.replaceState(null,'','#'+v);
  if(v==='game'&&!game.list.length)startGame();
  if(v==='gallery'){renderFilters();renderGrid()}else $('#grid').innerHTML='';
  if(v==='room'&&RM.onShow)RM.onShow();
}
document.addEventListener('click',function(e){var g=e.target.closest('[data-go]');if(g){e.preventDefault();go(g.dataset.go);return}
  var a=e.target.closest('a[href="#modes"]');if(a){e.preventDefault();if(!$('#v-home').classList.contains('active'))go('home');$('#modes').scrollIntoView({behavior:'smooth'})}});
/* mobile stacked-deck carousel */
(function(){var el=$('#examples'),mq=matchMedia('(max-width:760px)'),raf;
  function fx(){var cs=el.children,best=0,bd=1e9,mid=el.scrollLeft+el.clientWidth/2;
    for(var i=0;i<cs.length;i++){var c=cs[i];
      if(!mq.matches){c.style.transform=c.style.zIndex=c.style.filter='';continue}
      var d=(c.offsetLeft+c.offsetWidth/2-mid)/c.offsetWidth,a=Math.min(Math.abs(d),2);
      if(Math.abs(d)<bd){bd=Math.abs(d);best=i}
      c.style.transform='translateY('+(a*18)+'px) rotate('+(Math.max(-2,Math.min(2,d))*5)+'deg) scale('+(1-a*.09)+')';
      c.style.zIndex=String(100-Math.round(a*10));c.style.filter=a>.05?'brightness('+(1-a*.25)+')':''}
    $$('#exDots button').forEach(function(b,i){b.classList.toggle('on',i===best)})}
  window.deckFx=fx;
  el.addEventListener('scroll',function(){cancelAnimationFrame(raf);raf=requestAnimationFrame(fx)},{passive:true});
  window.addEventListener('resize',fx);fx()})();
window.addEventListener('scroll',function(){document.body.classList.toggle('scrolled',scrollY>10)},{passive:true});

/* age gate */
var gate=$('#gate');
if(localStorage.getItem('adult')!=='1'){gate.hidden=false}
$('#gateYes').onclick=function(){localStorage.setItem('adult','1');gate.hidden=true};

/* static cards */
function mini(c){return '<article class="mini"><span class="cat">'+catName(c.category)+'</span><p>'+txt(c)+'</p></article>'}
function pcard(c,i){var lv=LVI[c.level];
  return '<article class="pcard ex" style="--acc:'+lv.acc+';--r:'+((i-1.5)*2.2)+'deg"><div class="pc-head"><span class="pc-cat">'+catName(c.category)+'</span><span class="pc-ico">'+CAT[c.category].i+'</span></div><p class="pc-txt">'+txt(c)+'</p><div class="pc-foot"><span>'+lv.i+' '+(LANG==='en'?lv.en:lv.ru)+'</span><span>'+(LANG==='en'?'for ':'')+whoName(c.who)+(c.timer_sec?' · ⏱ '+fmt(c.timer_sec):'')+'</span></div></article>'}
function renderStatic(){
  var ok=CARDS.filter(function(c){return c.seo_ok&&c.level==='nezhno'});
  var want=['n-001','n-016','n-030','n-044'],pick=want.map(function(id){return ok.filter(function(c){return c.id===id})[0]}).filter(Boolean);
  if(pick.length<4)pick=[ok[0],ok[4],ok[8],ok[12]];
  $('#examples').innerHTML=pick.map(pcard).join('');
  $('#exDots').innerHTML=pick.map(function(_,i){return '<button data-d="'+i+'"'+(i===0?' class="on"':'')+' tabindex="-1"></button>'}).join('');
  $$('#exDots button').forEach(function(b){b.onclick=function(){var el=$('#examples'),c=el.children[+b.dataset.d];el.scrollTo({left:c.offsetLeft-(el.clientWidth-c.offsetWidth)/2,behavior:'smooth'})}});
  if(window.deckFx)requestAnimationFrame(window.deckFx);
  renderHomeLevels();
}
function renderHomeLevels(){
  var en=LANG==='en';
  $('#homeLevels').innerHTML=LV.map(function(l){
    var cards=CARDS.filter(function(c){return c.level===l.id}),cats={};cards.forEach(function(c){cats[c.category]=1});
    var badge=l.free?'<span class="tag free">'+(en?'free':'бесплатно')+'</span>':'<span class="tag paid">'+(en?'paid · open in the prototype':'платно · открыто в прототипе')+'</span>';
    var chips=Object.keys(cats).slice(0,5).map(function(c){return '<span class="hl-chip">'+CAT[c].i+' '+catName(c)+'</span>'}).join('');
    var heat='<span class="heat">'+[0,1,2,3].map(function(k){return '<i'+(k<=l.n?' class="on"':'')+'></i>'}).join('')+'</span>';
    var btn=l.n===0?'<button class="btn primary" data-b="single" data-l="0">'+(en?'Play "Gentle"':'Играть «Нежно»')+'</button>'
      :'<button class="btn primary" data-b="ceiling" data-l="'+l.n+'">'+(en?'Evening up to "'+l.en+'"':'Вечер до «'+l.ru+'»')+'</button>';
    return '<article class="hl" data-level="'+l.id+'" style="--acc:'+l.acc+'"><div class="hl-top"><span class="hl-ico">'+l.i+'</span>'+badge+'</div><h3>'+(en?l.en:l.ru)+'</h3><div class="hl-meta">'+heat+'<span>'+cards.length+(en?' cards':' карточек')+'</span></div><p>'+(en?LVX[l.id].de:LVX[l.id].dr)+'</p><div class="hl-chips">'+chips+'</div>'+btn+'</article>'}).join('');
  $$('#homeLevels [data-b]').forEach(function(b){b.onclick=function(){begin(b.dataset.b,+b.dataset.l)}});
}
/* game */
var RM={active:false}; // two-phone room hooks (lib/room.js)
var game={fixed:null,warm:{},tag:{},list:[],i:0,liked:{},turn:0,timer:null,sel:{mode:'ceiling',lvl:0},total:12,drop:0,streak:0,used:{}};
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var x=a[i];a[i]=a[j];a[j]=x}return a}
/* planned level for position p (0..11): first 4 gentle, then rises to the ceiling; single = fixed level */
function planned(p){
  var s=game.sel;if(s.mode==='single')return s.lvl;
  var n=game.total,w=Math.round(n/3);if(p<w)return 0;return Math.min(s.lvl,Math.ceil((p-w+1)*s.lvl/(n-w)));
}
function targetLevel(p){return Math.max(0,planned(p)-game.drop)}
function pickCard(p){
  if(game.fixed)return game.fixed[p];
  var want=targetLevel(p),order=[want],k;
  for(k=1;k<4;k++){if(want-k>=0)order.push(want-k);if(want+k<=3)order.push(want+k)}
  for(var o=0;o<order.length;o++){
    var pool=CARDS.filter(function(c){return c.level===LV[order[o]].id&&!game.used[c.id]});
    if(pool.length){var c=pool[Math.floor(Math.random()*pool.length)];game.used[c.id]=1;return c}
  }
}
function startGame(){
  game.list=[];game.i=0;game.liked={};game.turn=0;game.drop=0;game.streak=0;game.used={};
  game.list.push(pickCard(0));
  $('#namesBox').classList.toggle('hide',!!RM.active);renderCard(false);
}
function begin(mode,lvl){game.sel={mode:mode,lvl:lvl};game.fixed=null;game.warm={};game.tag={};game.total=LEN;game.list=[];go('game')}
function beginDeck(cards,warm,tag){game.fixed=cards;game.warm=warm||{};game.tag=tag||{};game.total=cards.length;game.list=[];go('game')}
$('#again').onclick=function(){if(RM.active){RM.act('again');return}game.list=[];go(game.fixed?'game':'game')};
function names(){if(RM.active)return RM.names();return [$('#n1').value.trim()||(LANG==='en'?'You':'Ты'),$('#n2').value.trim()||(LANG==='en'?'Partner':'Партнёр')]}
function hasNames(){return RM.active?true:!!($('#n1').value.trim()||$('#n2').value.trim())}
function escH(x){return String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
/* put the partner's name into a card: EN replaces "your partner", RU keeps the declined word and adds the name */
function personalize(text,pn){
  if(!pn)return text;var n='<b class="pname">'+escH(pn)+'</b>';
  if(LANG==='en')return text.replace(/\b([Yy])our partner's\b/g,function(){return n+"'s"}).replace(/\b([Yy])our partner\b/g,n).replace(/\bpartner's\b/g,n+"'s").replace(/\bthe partner\b/g,n);
  return text.replace(/([Пп]артн[её]р(?:а|у|ом|е)?)(?![а-яё])/g,'$1 '+n);
}
function renderCard(keep){
  clearInterval(game.timer);
  var c=game.list[game.i],n=names();
  $('#counter').textContent=(game.i+1)+' / '+game.total;
  var lv=LVI[c.level];$('#lvBadge').textContent=lv.i+' '+(LANG==='en'?lv.en:lv.ru);$('#v-game').style.setProperty('--acc',lv.acc);$('#v-game').dataset.level=c.level;
  var mine=RM.active?(RM.role==='host'?game.turn===0:game.turn===1):game.turn===0;
  var who=mine?(LANG==='en'?'Your turn':'Твой ход'):(LANG==='en'?'Partner\'s turn':'Ход партнёра');
  if(hasNames())who=(LANG==='en'?(n[game.turn]+'\'s turn'):('Ход: '+n[game.turn]))+(RM.active&&mine?(LANG==='en'?' (you)':' (ты)'):'');
  $('#turn').textContent=who;
  var tm=c.timer_sec?'<div class="timer"><button class="btn small ghost" id="tStart">'+(LANG==='en'?'Start timer':'Запустить таймер')+'</button><div class="ring"><svg width="56" height="56"><circle class="bg" cx="28" cy="28" r="24"/><circle class="fg" id="tFg" cx="28" cy="28" r="24" stroke-dasharray="150.8" stroke-dashoffset="0"/></svg><span id="tNum">'+fmt(c.timer_sec)+'</span></div></div>':'';
  $('#cardFront').innerHTML='<div class="head"><span class="cat">'+catName(c.category)+'</span><span class="cico">'+CAT[c.category].i+'</span></div><div class="txt"><span>'+personalize(escH(txt(c)),hasNames()?n[1-game.turn]:'')+'</span></div>'+tm+'<span class="who">'+(LANG==='en'?'for ':'')+whoName(c.who)+'</span>'+(game.warm[c.id]?'<span class="warmtag">'+(LANG==='en'?'for warm-up':'для разогрева')+'</span>':'')+(game.tag[c.id]?'<span class="warmtag">'+game.tag[c.id][LANG==='en'?1:0]+'</span>':'');
  var ts=$('#tStart');if(ts)ts.onclick=function(e){e.stopPropagation();runTimer(c.timer_sec)};
  $('#likeBtn').classList.toggle('on',!!game.liked[c.id]);$('#likeBtn').textContent=game.liked[c.id]?'♥':'♡';
  var card=$('#card');
  if(!keep){card.classList.remove('flipped');setTimeout(function(){card.classList.add('flipped')},350)}
}
function fmt(s){return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
function runTimer(total){
  var left=total,fg=$('#tFg'),num=$('#tNum');clearInterval(game.timer);
  game.timer=setInterval(function(){left--;num.textContent=fmt(Math.max(left,0));fg.style.strokeDashoffset=150.8*(1-left/total);if(left<=0){clearInterval(game.timer);if(navigator.vibrate)navigator.vibrate(200)}},1000);
}
$('#card').onclick=function(){this.classList.toggle('flipped')};
function next(skipped){
  if(skipped===true&&!game.fixed){game.streak++;if(game.streak>=2){game.drop++;game.streak=0}}else game.streak=0;
  game.i++;game.turn=1-game.turn;
  if(game.i>=game.total){end(false)}else{game.list.push(pickCard(game.i));$('#namesBox').classList.add('hide');renderCard(false)}
}
$('#doneBtn').onclick=function(){if(RM.active){RM.act('done');return}next(false)};$('#skipBtn').onclick=function(){if(RM.active){RM.act('skip');return}next(true)};
$('#likeBtn').onclick=function(){var c=game.list[game.i];if(game.liked[c.id])delete game.liked[c.id];else game.liked[c.id]=c;renderCard(true)};
$('#stopBtn').onclick=function(){if(RM.active){RM.act('stop');return}end(true)};
function end(stopped){clearInterval(game.timer);game.stopped=stopped;go('end');renderEnd()}
function renderEnd(){
  var l=Object.keys(game.liked).map(function(k){return game.liked[k]}),en=LANG==='en',st=!!game.stopped;
  $('#endP').textContent=st?(en?'The game is over. Thank you for the evening.':'Игра окончена. Спасибо за вечер.'):(en?'You went through all '+game.total+' cards.':'Вы прошли все '+game.total+' карточек.');
  $('#endSafe').hidden=!st;$('#endSafe').textContent=en?'If you need to, you can say your safe word at any time.':'Если нужно, в любой момент можно сказать стоп-слово.';
  if(RM.active&&RM.endNote)$('#endP').textContent+=' '+RM.endNote(st);
  $('#likedH').hidden=st;$('#likedList').hidden=st;
  $('#likedList').innerHTML=l.length?l.map(mini).join(''):'<p class="lead">'+(en?'No liked cards this time.':'В этот раз без отмеченных.')+'</p>';
}

/* gallery */
var filt='all',lfilt='all';
function renderFilters(){
  $('#lvFilters').innerHTML=['all'].concat(LV.map(function(l){return l.id})).map(function(id){return '<button class="chip lvchip'+(id===lfilt?' on':'')+'" data-l="'+id+'"'+(id!=='all'?' style="--acc:'+LVI[id].acc+'"':'')+'>'+(id==='all'?lab('all'):LVI[id].i+' '+(LANG==='en'?LVI[id].en:LVI[id].ru))+'</button>'}).join('');
  $$('#lvFilters .chip').forEach(function(b){b.onclick=function(){lfilt=b.dataset.l;filt='all';renderFilters();renderGrid()}});
  var cats={};CARDS.forEach(function(c){if(lfilt==='all'||c.level===lfilt)cats[c.category]=1});
  if(filt!=='all'&&!cats[filt])filt='all';
  $('#filters').innerHTML=['all'].concat(Object.keys(cats)).map(function(c){return '<button class="chip'+(c===filt?' on':'')+'" data-f="'+c+'">'+(c==='all'?lab('all'):CAT[c].i+' '+catName(c))+'</button>'}).join('');
  $$('#filters .chip').forEach(function(b){b.onclick=function(){filt=b.dataset.f;renderFilters();renderGrid()}});
}
function renderGrid(){
  $('#grid').innerHTML=CARDS.filter(function(c){return (lfilt==='all'||c.level===lfilt)&&(filt==='all'||c.category===filt)}).map(function(c){
    var lv=LVI[c.level];
    return '<article class="gcard" style="--acc:'+lv.acc+'" data-level="'+c.level+'"><span class="cat">'+CAT[c.category].i+' '+catName(c.category)+'</span><span class="lvdot">'+(LANG==='en'?lv.en:lv.ru)+'</span><p>'+txt(c)+'</p><div class="meta">'+(LANG==='en'?'for ':'')+whoName(c.who)+(c.timer_sec?' · ⏱ '+fmt(c.timer_sec):'')+'</div></article>'}).join('');
}
/* levels screen */
function renderLevels(){
  var en=LANG==='en';
  $('#levels').innerHTML=LV.map(function(l){
    var badge=l.free?'<span class="tag free">'+(en?'free':'бесплатно')+'</span>':'<span class="tag paid">'+(en?'paid · open in the prototype':'платно · открыто в прототипе')+'</span>';
    var btns=l.n===0?'<button class="btn primary" data-b="single" data-l="0">'+(en?'Start the evening':'Начать вечер')+'</button>'
      :'<button class="btn primary" data-b="ceiling" data-l="'+l.n+'">'+(en?'Evening up to "'+l.en+'"':'Вечер до уровня «'+l.ru+'»')+'</button><button class="btn ghost" data-b="single" data-l="'+l.n+'">'+(en?'Only "'+l.en+'"':'Только «'+l.ru+'»')+'</button>';
    return '<article class="level open" data-level="'+l.id+'" style="--acc:'+l.acc+'"><div class="ico">'+l.i+'</div><h3>'+(en?l.en:l.ru)+'</h3>'+badge+'<p>'+(en?l.pe:l.pr)+'</p><div class="lvbtns">'+btns+'</div></article>'}).join('');
  $$('#levels [data-b]').forEach(function(b){b.onclick=function(){begin(b.dataset.b,+b.dataset.l)}});
  renderLenPickers();
  $('#lvHint').textContent=en?'Two skips in a row bring the deck one level down. Skipping is always free.':'Два пропуска подряд — и колода опускается на уровень ниже. Пропускать можно без штрафа.';
}

/* survey demo: two people answer in turn on one screen; only SHARED yeses are ever shown */
var SV={step:0,a:[{},{}]};            // step 0: first partner, 1: second partner, 2: result
var SVN=8,MIN_MATCH=5,DECK_SIZE=12,LEN=12,LENS=[[12,'short'],[24,'medium'],[36,'long']];
var WARM_TAGS=['комплименты','массаж рук','массаж плеч и спины','объятия','держать за руки','благодарности'];
var TXT={
  pass:{ru:'Передайте телефон партнёру. Ответы первого не показываются.',en:'Pass the phone to your partner. The first answers stay hidden.'},
  p1:{ru:'Опрос · партнёр 1 из 2',en:'Survey · partner 1 of 2'},p2:{ru:'Опрос · партнёр 2 из 2',en:'Survey · partner 2 of 2'},
  next:{ru:'Готово — передать партнёру',en:'Done — pass to partner'},fin:{ru:'Готово — показать общее',en:'Done — show what we share'},
  shared:{ru:'Общее «да»: ',en:'Shared yeses: '},play:{ru:'Играть колодой',en:'Play this deck'},
  warmNote:{ru:'Совпадений немного, поэтому мы добавили мягкие карточки «для разогрева».',en:'There are only a few matches, so we added soft "for warm-up" cards.'},
  retake:{ru:'Пройти опрос заново вместе',en:'Retake together'},retakeNote:{ru:'Заново отвечают оба — по очереди, ответы не сохраняются.',en:'Both of you answer again, in turn. Answers are not saved.'},
  fbT:{ru:'Сегодня вы хотите разного — и это нормально.',en:'Tonight you want different things — and that\'s okay.'},
  fbP:{ru:'Выберите, как провести вечер дальше. Никто не узнает, кто что ответил.',en:'Choose how to spend the evening. Nobody will see who answered what.'},
  o1:{ru:'Уровень ниже',en:'One level down'},o1d:{ru:'Самые мягкие карточки, без спешки.',en:'The softest cards, no rush.'},
  o2:{ru:'Мягкая «Правда или действие»',en:'Soft Truth or Dare'},o2d:{ru:'Тёплые вопросы и ласковые задания.',en:'Warm questions and tender tasks.'},
  o3:{ru:'Свидание',en:'Date cards'},o3d:{ru:'Разговоры и романтика — без раздевания.',en:'Talk and romance — no undressing.'},
  truth:{ru:'Правда',en:'Truth'},dare:{ru:'Действие',en:'Dare'},
  short:{ru:'Коротко',en:'Short'},medium:{ru:'Средне',en:'Medium'},long:{ru:'Долго',en:'Long'},
  lenT:{ru:'Длина вечера',en:'Evening length'},cards:{ru:'карточек',en:'cards'},lenHost:{ru:'выбирает создатель комнаты',en:'the room creator picks'}};
/* game length chips (12 / 24 / 36); in a room only the host can change it, the choice syncs */
function renderLenPickers(){
  var ro=RM.active&&RM.role!=='host';
  $$('[data-lenpick]').forEach(function(el){
    el.innerHTML='<span class="lenlab">'+tx('lenT')+(ro?' · '+tx('lenHost'):'')+'</span><div class="lenrow">'+LENS.map(function(L){return '<button class="chip lenchip'+(L[0]===LEN?' on':'')+'" data-len="'+L[0]+'"'+(ro?' disabled':'')+'>'+tx(L[1])+' · '+L[0]+'</button>'}).join('')+'</div>';
    [].slice.call(el.querySelectorAll('[data-len]')).forEach(function(b){b.onclick=function(){if(ro)return;setLen(+b.dataset.len,true)}});
  });
}
function setLen(n,local){LEN=n;renderLenPickers();if(local&&RM.active&&RM.setLen)RM.setLen(n)}
function tx(k){return TXT[k][LANG==='en'?'en':'ru']}
function svTags(){return TAGS.slice(0,SVN)}
function renderSurvey(){
  var a=SV.a[SV.step]||{};
  if(SV.step>1){renderSvResult();return}
  $('#survey').innerHTML='<p class="svhint">'+tx(SV.step?'p2':'p1')+'</p>'+svTags().map(function(x,i){
    return '<div class="sq"><h3>'+(LANG==='en'?x.question_en:x.question_ru)+'</h3><div class="opts">'+['want','maybe','no'].map(function(k){return '<button class="opt'+(a[i]===k?' sel':'')+'" data-q="'+i+'" data-k="'+k+'">'+lab(k)+'</button>'}).join('')+'</div></div>'}).join('');
  $('#svCtl').innerHTML='<button class="btn primary" id="svNext">'+tx(SV.step?'fin':'next')+'</button>';
  $$('.opt').forEach(function(b){b.onclick=function(){SV.a[SV.step][b.dataset.q]=b.dataset.k;renderSurvey()}});
  $('#svNext').onclick=function(){
    svTags().forEach(function(x,i){if(!a[i])a[i]='no'});
    SV.step++;if(SV.step===1){window.scrollTo(0,0);renderSurvey()}else svDecide()};
}
function pickN(list,n){return shuffle(list).slice(0,n)}
function svDecide(){
  var tags=svTags(),shared=[];
  tags.forEach(function(x,i){var p=SV.a[0][i],q=SV.a[1][i];if(p!=='no'&&q!=='no')shared.push(x.tag)});
  var cards=CARDS.filter(function(c){return c.level==='nezhno'&&shared.indexOf(c.survey_tag)>=0});
  SV.shared=shared;SV.matched=cards;
  if(cards.length<MIN_MATCH){go('fallback');renderFallback();return}
  renderSvResult();
}
function warmUp(exclude,n,shared){
  var ids={},asked={};exclude.forEach(function(c){ids[c.id]=1});
  svTags().forEach(function(x){if(!shared||shared.indexOf(x.tag)<0)asked[x.tag]=1});  // never top up with a topic someone said no to
  var base=CARDS.filter(function(c){return c.level==='nezhno'&&!ids[c.id]&&!(shared&&asked[c.survey_tag])});
  var a=pickN(base.filter(function(c){return c.seo_ok&&WARM_TAGS.indexOf(c.survey_tag)>=0}),n);
  if(a.length<n){var got={};a.forEach(function(c){got[c.id]=1});a=a.concat(pickN(base.filter(function(c){return !got[c.id]&&c.seo_ok}),n-a.length))}
  if(a.length<n){var got2={};a.forEach(function(c){got2[c.id]=1});a=a.concat(pickN(base.filter(function(c){return !got2[c.id]}),n-a.length))}
  return a;
}
function svDeck(matched,shared,size){
  size=size||LEN;var deck=pickN(matched||SV.matched,size),warm={};
  if(deck.length<size){warmUp(deck,size-deck.length,shared||SV.shared).forEach(function(c){warm[c.id]=1;deck.push(c)})}
  return {cards:deck,warm:warm,hasWarm:Object.keys(warm).length>0};
}
function renderSvResult(){
  var names=svTags().filter(function(x){return SV.shared.indexOf(x.tag)>=0}).map(function(x){return LANG==='en'?x.tag_en:x.tag});
  var few=SV.matched.length<LEN;
  $('#survey').innerHTML='<div class="sq svres"><h3>'+tx('shared')+SV.matched.length+(LANG==='en'?' cards':' карточек')+'</h3><p class="svtopics">'+names.join(' · ')+'</p>'+(few?'<p class="muted">'+tx('warmNote')+'</p>':'')+'</div>';
  $('#svCtl').innerHTML='<div class="lenpick" data-lenpick></div><button class="btn primary" id="svPlay">'+tx('play')+'</button><button class="btn ghost" id="svRetake">'+tx('retake')+'</button><p class="muted">'+tx('retakeNote')+'</p>';
  renderLenPickers();
  $('#svPlay').onclick=function(){var d=svDeck();beginDeck(d.cards,d.warm)};
  $('#svRetake').onclick=retakeTogether;
}
function retakeTogether(){SV={step:0,a:[{},{}]};go('survey');renderSurvey()}
/* fallback screen: no per-person info, only a calm choice */
function softPool(tags){return CARDS.filter(function(c){return c.level==='nezhno'&&c.seo_ok&&tags.indexOf(c.survey_tag)>=0})}
function renderFallback(){
  renderLenPickers();
  $('#fbT').textContent=tx('fbT');$('#fbP').textContent=tx('fbP');
  $('#fbOpts').innerHTML=[['o1','o1d','down'],['o2','o2d','tod'],['o3','o3d','date']].map(function(o){return '<button class="fbopt" data-o="'+o[2]+'"><b>'+tx(o[0])+'</b><span>'+tx(o[1])+'</span></button>'}).join('');
  $('#fbRetake').textContent=tx('retake');$('#fbRetakeNote').textContent=tx('retakeNote');
  $('#fbRetake').onclick=function(){if(RM.active){RM.act('retake');return}retakeTogether()};
  $$('#fbOpts .fbopt').forEach(function(b){b.onclick=function(){
    var o=b.dataset.o;
    if(RM.active){RM.act('pick',o);return}
    if(o==='down'){begin('single',0);return}   // survey level is Gentle (0): the softest level that exists
    var d=fallbackDeck(o);beginDeck(d.cards,d.warm,d.tag);
  }});
}
/* fixed deck for a fallback option (used by one phone and by the room host) */
function fallbackDeck(o){
  var M=opts.modes;
  var half=Math.floor(LEN/2);
  if(o==='down')return {cards:pickN(CARDS.filter(function(c){return c.level==='nezhno'&&c.seo_ok}),LEN),warm:{},tag:{}};
  if(o==='tod'){
    var tr=pickN(M.truth_dare.filter(function(c){return c.mode==='truth'}),half),da=pickN(M.truth_dare.filter(function(c){return c.mode==='dare'}),half),deck=[],tg={};
    for(var i=0;i<Math.min(tr.length,da.length);i++){[tr[i],da[i]].forEach(function(c,j){deck.push(c);tg[c.id]=j?[TXT.dare.ru,TXT.dare.en]:[TXT.truth.ru,TXT.truth.en]})}
    return {cards:deck,warm:{},tag:tg}}
  return {cards:pickN(M.date,LEN),warm:{},tag:{}};
}
applyLang();
var BYID={};CARDS.concat(opts.modes.truth_dare,opts.modes.date).forEach(function(c){BYID[c.id]=c});
initRoom(RM,{lang:LANG,base:opts.base,$:$,$$:$$,go:go,game:game,beginDeck:beginDeck,end:end,next:next,renderCard:renderCard,renderFallback:renderFallback,
  svTags:svTags,setLen:setLen,getLen:function(){return LEN},renderLenPickers:renderLenPickers,escH:escH,cards:CARDS,byId:BYID,svDeck:svDeck,fallbackDeck:fallbackDeck,minMatch:MIN_MATCH,deckSize:DECK_SIZE,lab:lab,tx:tx});
var h=location.hash.slice(1);
if(h.indexOf('join=')===0)RM.openJoin(h.slice(5));
else if(h==='room'||(['game','end','fallback'].indexOf(h)>=0&&RM.canResume()))RM.openRoom();
else if(['levels','gallery','survey','game'].indexOf(h)>=0)go(h);
window.addEventListener('hashchange',function(){var h=location.hash.slice(1);
  if(h.indexOf('join=')===0){RM.openJoin(h.slice(5));return}
  if(['home','levels','gallery','survey','game','room'].indexOf(h)>=0&&!$('#v-'+h).classList.contains('active'))go(h)});
}
