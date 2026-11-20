(function(){
'use strict';
var BRAND={ru:'Фанты для двоих',en:'Fanty for Two'}; // <- change the name here
var D=window.DECK, CARDS=D.cards, TAGS=[];['nezhno','teplo','goryacho','smelo'].forEach(function(l){TAGS=TAGS.concat(D.survey_tags.filter(function(x){return x.level===l}).slice(0,3))});
var LANG=localStorage.getItem('lang')||((navigator.language||'ru').indexOf('ru')===0?'ru':'en');
var CAT={'разговор':{en:'Talk',i:'💬'},'прикосновение':{en:'Touch',i:'🤲'},'игра':{en:'Game',i:'🎲'},'флирт':{en:'Flirt',i:'😉'},'воспоминание':{en:'Memory',i:'🌙'},'поцелуи':{en:'Kisses',i:'💋'},'массаж':{en:'Massage',i:'💆'},'шёпот':{en:'Whisper',i:'🤫'},'ощущения':{en:'Sensations',i:'🪶'},'танец':{en:'Dance',i:'💃'},'ролевая':{en:'Role play',i:'🎭'},'приказы':{en:'Orders',i:'🗝️'},'фантазия':{en:'Fantasy',i:'💭'},'места':{en:'Places',i:'🏠'},'фото':{en:'Photo',i:'📷'},'опыт':{en:'New',i:'✨'}};
var LV=[{id:'nezhno',ru:'Нежно',en:'Gentle',i:'🌸',acc:'#e8a99a',pr:'Комплименты, объятия, разговоры о вас.',pe:'Compliments, hugs, talks about the two of you.',free:1},
{id:'teplo',ru:'Тепло',en:'Warm',i:'🔥',acc:'#ff9a6c',pr:'Поцелуи, массаж, флирт.',pe:'Kisses, massage, flirting.'},
{id:'goryacho',ru:'Горячо',en:'Hot',i:'♨️',acc:'#d1213f',pr:'Чувственные задания и ролевые сценки.',pe:'Sensual tasks and role-play scenes.'},
{id:'smelo',ru:'Смело',en:'Bold',i:'🖤',acc:'#d4af37',pr:'Фантазии, только при взаимном «хочу».',pe:'Fantasies, only when both say "want".'}];
var LVI={};LV.forEach(function(l,i){l.n=i;LVI[l.id]=l});
var WHO={'оба':{en:'both'},'один':{en:'one'}};
var T={en:{eyebrow:'A game for couples · 18+',h1:'Find out what you both want — without asking out loud',lead:'Each of you secretly answers "want / maybe / no". Only the matches go into the deck. Then you draw cards like forfeits. Skip with no penalty, stop any time.',play:'Play',allCards:'All cards',howT:'How it works',s1t:'Secret survey',s1p:'Each answers on their own phone. Your partner can\'t see your answers.',s2t:'Matches',s2p:'We show only what you both marked "want" or "maybe".',s3t:'Draw cards',s3p:'Tasks in turn, from gentle to bolder. You can skip.',modesT:'Modes',m1t:'Together',m1p:'You\'re side by side, playing in turns on one or two phones.',soon:'soon',m2t:'Long distance',m2p:'A room by link, with tasks for chat and calls.',exT:'Example cards',faqT:'FAQ',q1:'Is it explicit?',a1:'No. Tasks are sensual but never graphic. "Gentle" is about attention, words and touch.',q2:'Does my partner see my answers?',a2:'Only matches. If you said "no", your partner never finds out.',q3:'Can I skip a card?',a3:'Yes, no penalty or explanation. "Stop" ends the evening any time.',q4:'How much does it cost?',a4:'"Gentle" is free. "Warm", "Hot" and "Bold" are paid; in the prototype they are open for testing.',lvT:'Choose a level',lvP:'Pick a ceiling: a 12-card evening starts gently and rises up to it. Or play just one level.',l1:'Gentle',l1p:'Compliments, hugs, talks about the two of you.',l2:'Warm',l2p:'Kisses, massage, flirting.',l3:'Hot',l3p:'Sensual tasks and role-play scenes.',l4:'Bold',l4p:'Fantasies, only when both say "want".',free:'free',paid:'soon · paid',start:'Start the evening',teaserT:'Coming next: "Warm"',demoS:'Survey demo',stop:'Stop',tap:'tap to open',skip:'Skip',done:'Done',endT:'Evening is over',likedT:'You liked',again:'Another evening',home:'Home',galT:'All cards',svT:'Survey demo',soon2:'coming soon on two phones',f18:'For adults only (18+).',fnote:'We don\'t store your answers. Every task is voluntary: saying no has no consequences.',gT:'Are you 18 or older?',gP:'This site has sensual tasks for adult couples.',gYes:'I\'m 18+',gNo:'Leave',n1ph:'Your name',n2ph:'Partner\'s name'}};

Object.assign(T.en,{h1a:'Find out what you both want —',h1b:'without asking out loud',lead:'Each of you secretly answers "want / maybe / no" on your own phone. Only the matches go into the deck. Then you draw cards like forfeits. Skip with no penalty, stop any time.',chooseMode:'Choose a level',s2t:'Only matches',s2p:'The deck gets only what you both marked "want" or "maybe". Nobody sees a "no".',s3p:'In turns, from gentle to bolder. 12 cards make one evening.',phYou:'You',phPartner:'Partner',phQ:'A slow dance in each other\'s arms?',phQ2:'A slow dance in each other\'s arms?',lWant:'Want',lMaybe:'Maybe',lNo:'No',lWant2:'Want',lMaybe2:'Maybe',lNo2:'No',phMatch:'It\'s a match!',phCat:'Game',phCard:'Put on a calm song and slow-dance in each other\'s arms for two minutes.',phLv:'🌸 Gentle',gamesT:'Games on one deck of tasks',gm1:'Forfeits',gm1s:'play now',gm2:'Dice',gm3:'Truth or dare',gm4:'Roulette',gm5:'Scripted date',soonA:'soon',soonB:'soon',soonC:'soon',soonD:'soon',soon3:'soon',lvEyebrow:'Levels',modesT:'Choose how hot the evening gets',modesP:'Four levels — from warm talks to bold fantasies. Pick a ceiling: the evening starts gently and slowly rises to it. Two skips in a row and the deck gets softer on its own.',m1p:'You\'re side by side, playing in turns on one or two phones. Timer, skips and "stop" are always at hand.',m2p:'A room by link and one-time code, a separate deck for video calls and chat, a shared timer.',m3t:'Themes for the bold',m3p:'Separate themes on top of the levels. On only if both agree, with a safe word and a "stop" button.',nowTag:'available',exEyebrow:'Cards',exT:'This is what the cards look like',exP:'Examples from the "Gentle" level. Short, clear tasks — never vulgar, always warm.',faqEyebrow:'FAQ',q5:'Do I need to sign up?',a5:'No. We don\'t store your answers — the survey and the deck live only on your phones.',finalT:'Ready for an evening for two?',play2:'Play',navModes:'Levels',navCards:'Cards',navPlay:'Play'});
Object.assign(T.en,{h1a:'A game for two —',h1b:'start in one tap',leadShort:'Pick a level — the first card opens right away. The secret "want / maybe / no" survey is optional.',lastT:'Same as last time',setT:'Settings',svLink:'Secret survey — optional',setTitle:'Evening settings',setCount:'Cards per evening',setTimer:'Timer',tOff:'Off',tManual:'On tap',tAuto:'Auto',setMode:'How the evening goes',mSingle:'Straight at the level',mCeil:'Warm-up from "Gentle"',setThemes:'Themes for the bold',soonT:'soon',setOk:'Done',svPlay:'Pick a level and play',svReset:'Reset answers',svT:'Secret survey',soon2:'optional · two phones coming soon'});
var QS={nezhno:{r:'Разговоры и объятия',e:'Talks and hugs'},teplo:{r:'Поцелуи и массаж',e:'Kisses and massage'},goryacho:{r:'Чувственно и смело',e:'Sensual and daring'},smelo:{r:'Фантазии',e:'Fantasies'}};
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
  $('#brand').textContent=$('#brand2').textContent=BRAND[LANG];
  $('#langBtn').textContent=LANG==='en'?'EN / RU':'RU / EN';
  document.title=BRAND[LANG]+(LANG==='en'?' — couples game 18+':' — игра с заданиями для пар 18+');
  renderStatic();renderQuick();renderLevels();renderFilters();if($('#v-gallery').classList.contains('active'))renderGrid();renderSurvey();
  if(game.list.length&&$('#v-game').classList.contains('active'))renderCard(true);
  if($('#v-end').classList.contains('active'))renderEnd();
}
$('#langBtn').onclick=function(){LANG=LANG==='ru'?'en':'ru';localStorage.setItem('lang',LANG);applyLang()};
$('#v-levels h2'); // noop

/* views */
function go(v){
  $$('.view').forEach(function(e){e.classList.remove('active')});
  $('#v-'+v).classList.add('active');window.scrollTo(0,0);
  if(location.hash!=='#'+v)history.replaceState(null,'','#'+v);
  if(v==='game'&&!game.list.length)startGame();
  if(v==='gallery'){renderFilters();renderGrid()}else $('#grid').innerHTML='';
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
/* fast start: settings, last choice, quick tiles */
function lsGet(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
var SET=Object.assign({total:12,timer:'off',mode:'single'},lsGet('fs_set',{}));
function saveSet(){localStorage.setItem('fs_set',JSON.stringify(SET))}
function renderQuick(){
  var en=LANG==='en';
  $('#quickLevels').innerHTML=LV.map(function(l){
    var badge=l.free?'<span class="tag free">'+(en?'free':'бесплатно')+'</span>':'<span class="tag paid">'+(en?'paid · open in the prototype':'платно · открыто в прототипе')+'</span>';
    return '<button class="qtile" data-q="'+l.n+'" data-level="'+l.id+'" style="--acc:'+l.acc+'"><span class="qt-ico">'+l.i+'</span><span class="qt-name">'+(en?l.en:l.ru)+'</span><span class="qt-sub">'+(en?QS[l.id].e:QS[l.id].r)+'</span>'+badge+'<span class="qt-go">→</span></button>'}).join('');
  $$('#quickLevels .qtile').forEach(function(b){b.onclick=function(){begin(SET.mode,+b.dataset.q)}});
  var last=lsGet('fs_last',null),lb=$('#lastBtn');
  if(last&&LV[last.lvl]){var l=LV[last.lvl];lb.hidden=false;lb.style.setProperty('--acc',l.acc);$('#lastIco').textContent=l.i;
    $('#lastName').textContent=(en?l.en:l.ru)+(last.mode==='ceiling'?(en?' · warm-up':' · с разогревом'):'')+' · '+(last.total||12)+(en?' cards':' карт.');
    lb.onclick=function(){if(last.total)SET.total=last.total;begin(last.mode,last.lvl)}}else lb.hidden=true;
  var tm={off:en?'timer off':'без таймера',manual:en?'timer on tap':'таймер по кнопке',auto:en?'auto timer':'авто-таймер'}[SET.timer];
  $('#setSum').textContent='· '+SET.total+(en?' cards · ':' карт. · ')+tm;
  var n=Object.keys(SURV).length;$('#svSum').textContent=n?('· '+(en?n+' answers':'ответов: '+n)):'';
}
function renderSheet(){$$('#sheet .seg[data-set]').forEach(function(g){[].forEach.call(g.children,function(b){b.classList.toggle('on',String(SET[g.dataset.set])===b.dataset.v)})})}
$$('#sheet .seg[data-set] button').forEach(function(b){b.onclick=function(){var k=b.parentNode.dataset.set;SET[k]=k==='total'?+b.dataset.v:b.dataset.v;saveSet();renderSheet();renderQuick()}});
$('#setBtn').onclick=function(){renderSheet();$('#sheet').hidden=false};
$('#sheetX').onclick=$('#sheetOk').onclick=function(){$('#sheet').hidden=true};
$('#sheet').onclick=function(e){if(e.target===this)this.hidden=true};
/* survey answers (optional): tag -> want/maybe/no */
var SURV=lsGet('fs_survey',{});

/* game */
var game={list:[],i:0,liked:{},turn:0,timer:null,sel:{mode:'ceiling',lvl:0},total:12,drop:0,streak:0,used:{}};
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var x=a[i];a[i]=a[j];a[j]=x}return a}
/* planned level for position p (0..11): first 4 gentle, then rises to the ceiling; single = fixed level */
function planned(p){
  var s=game.sel;if(s.mode==='single')return s.lvl;
  if(p<4)return 0;return Math.min(s.lvl,Math.ceil((p-3)*s.lvl/8));
}
function targetLevel(p){return Math.max(0,planned(p)-game.drop)}
function pickCard(p){
  var want=targetLevel(p),order=[want],k;
  for(k=1;k<4;k++){if(want-k>=0)order.push(want-k);if(want+k<=3)order.push(want+k)}
  for(var o=0;o<order.length;o++){
    var pool=CARDS.filter(function(c){return c.level===LV[order[o]].id&&!game.used[c.id]&&SURV[c.survey_tag]!=='no'});
    var fav=pool.filter(function(c){return SURV[c.survey_tag]==='want'});if(fav.length&&Math.random()<.6)pool=fav;
    if(pool.length){var c=pool[Math.floor(Math.random()*pool.length)];game.used[c.id]=1;return c}
  }
}
function startGame(){
  game.list=[];game.i=0;game.liked={};game.turn=0;game.drop=0;game.streak=0;game.used={};
  game.list.push(pickCard(0));
  $('#namesBox').classList.remove('hide');renderCard(false);
}
function begin(mode,lvl){game.sel={mode:mode,lvl:lvl};game.total=SET.total;game.list=[];localStorage.setItem('fs_last',JSON.stringify({mode:mode,lvl:lvl,total:SET.total}));go('game')}
$('#again').onclick=function(){game.list=[];go('game')};
function names(){return [$('#n1').value.trim()||(LANG==='en'?'You':'Ты'),$('#n2').value.trim()||(LANG==='en'?'Partner':'Партнёр')]}
function renderCard(keep){
  clearInterval(game.timer);
  var c=game.list[game.i],n=names();
  $('#counter').textContent=(game.i+1)+' / '+game.total;
  var lv=LVI[c.level];$('#lvBadge').textContent=lv.i+' '+(LANG==='en'?lv.en:lv.ru);$('#v-game').style.setProperty('--acc',lv.acc);$('#v-game').dataset.level=c.level;
  var who=game.turn===0?(LANG==='en'?'Your turn':'Твой ход'):(LANG==='en'?'Partner\'s turn':'Ход партнёра');
  if($('#n1').value||$('#n2').value)who=LANG==='en'?(n[game.turn]+'\'s turn'):('Ход: '+n[game.turn]);
  $('#turn').textContent=who;
  var tm=c.timer_sec&&SET.timer!=='off'?'<div class="timer"><button class="btn small ghost" id="tStart">'+(LANG==='en'?'Start timer':'Запустить таймер')+'</button><div class="ring"><svg width="56" height="56"><circle class="bg" cx="28" cy="28" r="24"/><circle class="fg" id="tFg" cx="28" cy="28" r="24" stroke-dasharray="150.8" stroke-dashoffset="0"/></svg><span id="tNum">'+fmt(c.timer_sec)+'</span></div></div>':'';
  $('#cardFront').innerHTML='<div class="head"><span class="cat">'+catName(c.category)+'</span><span class="cico">'+CAT[c.category].i+'</span></div><div class="txt">'+txt(c)+'</div>'+tm+'<span class="who">'+(LANG==='en'?'for ':'')+whoName(c.who)+'</span>';
  var ts=$('#tStart');if(ts)ts.onclick=function(e){e.stopPropagation();runTimer(c.timer_sec)};
  $('#tmrBtn').classList.toggle('on',SET.timer!=='off');$('#tmrBtn').title=LANG==='en'?'Timer':'Таймер';
  if(ts&&SET.timer==='auto'&&!keep)setTimeout(function(){if($('#tStart')===ts)runTimer(c.timer_sec)},900);
  $('#likeBtn').classList.toggle('on',!!game.liked[c.id]);$('#likeBtn').textContent=game.liked[c.id]?'♥':'♡';
  var card=$('#card');
  if(!keep){card.classList.remove('flipped');setTimeout(function(){card.classList.add('flipped')},350)}
}
function fmt(s){return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
function runTimer(total){
  var left=total,fg=$('#tFg'),num=$('#tNum');clearInterval(game.timer);
  game.timer=setInterval(function(){left--;num.textContent=fmt(Math.max(left,0));fg.style.strokeDashoffset=150.8*(1-left/total);if(left<=0){clearInterval(game.timer);if(navigator.vibrate)navigator.vibrate(200)}},1000);
}
$('#tmrBtn').onclick=function(){SET.timer=SET.timer==='off'?'manual':'off';saveSet();renderCard(true)};
$('#card').onclick=function(){this.classList.toggle('flipped')};
function next(skipped){
  if(skipped===true){game.streak++;if(game.streak>=2){game.drop++;game.streak=0}}else game.streak=0;
  game.i++;game.turn=1-game.turn;
  if(game.i>=game.total){end(false)}else{game.list.push(pickCard(game.i));$('#namesBox').classList.add('hide');renderCard(false)}
}
$('#doneBtn').onclick=function(){next(false)};$('#skipBtn').onclick=function(){next(true)};
$('#likeBtn').onclick=function(){var c=game.list[game.i];if(game.liked[c.id])delete game.liked[c.id];else game.liked[c.id]=c;renderCard(true)};
$('#stopBtn').onclick=function(){end(true)};
function end(stopped){clearInterval(game.timer);game.stopped=stopped;go('end');renderEnd()}
function renderEnd(){
  var l=Object.keys(game.liked).map(function(k){return game.liked[k]});
  $('#endP').textContent=game.stopped?(LANG==='en'?'Stopped — and that\'s completely fine. Thank you for the evening.':'Остановились — и это нормально. Спасибо за вечер.'):(LANG==='en'?'You went through all '+game.total+' cards.':'Вы прошли все '+game.total+' карточек.');
  $('#likedList').innerHTML=l.length?l.map(mini).join(''):'<p class="lead">'+(LANG==='en'?'No liked cards this time.':'В этот раз без отмеченных.')+'</p>';
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
  $('#lvHint').textContent=en?'Two skips in a row bring the deck one level down. Skipping is always free.':'Два пропуска подряд — и колода опускается на уровень ниже. Пропускать можно без штрафа.';
}

/* survey demo */
function renderSurvey(){
  var en=LANG==='en';
  $('#survey').innerHTML=TAGS.map(function(x){var lv=LVI[x.level];
    return '<div class="sq" style="--acc:'+lv.acc+'"><span class="sq-lv">'+lv.i+' '+(en?lv.en:lv.ru)+'</span><h3>'+(en?x.question_en:x.question_ru)+'</h3><div class="opts">'+['want','maybe','no'].map(function(k){return '<button class="opt'+(SURV[x.tag]===k?' sel':'')+'" data-q="'+x.tag+'" data-k="'+k+'">'+lab(k)+'</button>'}).join('')+'</div></div>'}).join('');
  $$('.opt').forEach(function(b){b.onclick=function(){SURV[b.dataset.q]=b.dataset.k;localStorage.setItem('fs_survey',JSON.stringify(SURV));renderSurvey();renderQuick()}});
  var no=Object.keys(SURV).filter(function(k){return SURV[k]==='no'}).length,w=Object.keys(SURV).filter(function(k){return SURV[k]==='want'}).length;
  $('#svNote').textContent=Object.keys(SURV).length?(en?'Saved on this phone. "Want" topics come up more often, "no" topics are left out ('+w+' want · '+no+' no).':'Сохранено на этом телефоне. Темы с «хочу» будут попадаться чаще, с «нет» — не попадутся ('+w+' хочу · '+no+' нет).'):(en?'Answer any questions you like — or skip the survey entirely.':'Ответьте на любые вопросы — или пропустите опрос совсем.');
}
$('#svReset').onclick=function(){SURV={};localStorage.removeItem('fs_survey');renderSurvey();renderQuick()};

applyLang();
var h=location.hash.slice(1);if(['levels','gallery','survey','game'].indexOf(h)>=0)go(h);
window.addEventListener('hashchange',function(){var h=location.hash.slice(1);if(['home','levels','gallery','survey','game'].indexOf(h)>=0&&!$('#v-'+h).classList.contains('active'))go(h)});
})();
