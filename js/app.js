(function(){
'use strict';
var BRAND={ru:'Фанты для двоих',en:'Fanty for Two'}; // <- change the name here
var D=window.DECK, CARDS=D.cards, TAGS=D.survey_tags;
var LANG=localStorage.getItem('lang')||((navigator.language||'ru').indexOf('ru')===0?'ru':'en');
var CAT={'разговор':{en:'Talk',i:'💬'},'прикосновение':{en:'Touch',i:'🤲'},'игра':{en:'Game',i:'🎲'},'флирт':{en:'Flirt',i:'😉'},'воспоминание':{en:'Memory',i:'🌙'}};
var WHO={'оба':{en:'both'},'один':{en:'one'}};
var T={en:{eyebrow:'A game for couples · 18+',h1:'Find out what you both want — without asking out loud',lead:'Each of you secretly answers "want / maybe / no". Only the matches go into the deck. Then you draw cards like forfeits. Skip with no penalty, stop any time.',play:'Play',allCards:'All level cards',howT:'How it works',s1t:'Secret survey',s1p:'Each answers on their own phone. Your partner can\'t see your answers.',s2t:'Matches',s2p:'We show only what you both marked "want" or "maybe".',s3t:'Draw cards',s3p:'Tasks in turn, from gentle to bolder. You can skip.',modesT:'Modes',m1t:'Together',m1p:'You\'re side by side, playing in turns on one or two phones.',soon:'soon',m2t:'Long distance',m2p:'A room by link, with tasks for chat and calls.',exT:'Example cards',faqT:'FAQ',q1:'Is it explicit?',a1:'No. Tasks are sensual but never graphic. "Gentle" is about attention, words and touch.',q2:'Does my partner see my answers?',a2:'Only matches. If you said "no", your partner never finds out.',q3:'Can I skip a card?',a3:'Yes, no penalty or explanation. "Stop" ends the evening any time.',q4:'How much does it cost?',a4:'"Gentle" is free. More levels come later.',lvT:'Choose a level',lvP:'The deck builds up: gentle first, then higher — up to your ceiling.',l1:'Gentle',l1p:'Compliments, hugs, talks about the two of you.',l2:'Warm',l2p:'Kisses, massage, flirting.',l3:'Hot',l3p:'Sensual tasks and role-play scenes.',l4:'Bold',l4p:'Fantasies, only when both say "want".',free:'free',paid:'soon · paid',start:'Start the evening',teaserT:'Coming next: "Warm"',demoS:'Survey demo',stop:'Stop',tap:'tap to open',skip:'Skip',done:'Done',endT:'Evening is over',likedT:'You liked',again:'Another evening',home:'Home',galT:'All "Gentle" cards',svT:'Survey demo',soon2:'coming soon on two phones',f18:'For adults only (18+).',fnote:'We don\'t store your answers. Every task is voluntary: saying no has no consequences.',gT:'Are you 18 or older?',gP:'This site has sensual tasks for adult couples.',gYes:'I\'m 18+',gNo:'Leave',n1ph:'Your name',n2ph:'Partner\'s name'}};
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
  renderStatic();renderFilters();renderGrid();renderSurvey();
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
}
document.addEventListener('click',function(e){var g=e.target.closest('[data-go]');if(g){e.preventDefault();go(g.dataset.go)}});

/* age gate */
var gate=$('#gate');
if(localStorage.getItem('adult')!=='1'){gate.hidden=false}
$('#gateYes').onclick=function(){localStorage.setItem('adult','1');gate.hidden=true};

/* static cards */
function mini(c){return '<article class="mini"><span class="cat">'+catName(c.category)+'</span><p>'+txt(c)+'</p></article>'}
var TEASE=[{ru:'Подарите партнёру долгий поцелуй в самое неожиданное место на руке.',en:'Give your partner a slow kiss somewhere unexpected on the hand.'},{ru:'Сделайте друг другу массаж плеч под любимую музыку.',en:'Give each other a shoulder massage to a favourite song.'},{ru:'Пофлиртуйте так, будто вы только что познакомились.',en:'Flirt as if you\'d only just met.'}];
function renderStatic(){
  var ok=CARDS.filter(function(c){return c.seo_ok});
  var pick=[ok[0],ok[Math.floor(ok.length/3)],ok[Math.floor(ok.length*2/3)]];
  $('#examples').innerHTML=pick.map(mini).join('');
  $('#teasers').innerHTML=TEASE.map(function(x){return '<div class="teaserwrap"><article class="mini"><span class="cat">'+(LANG==='en'?'Warm':'Тепло')+'</span><p>'+x[LANG]+'</p></article></div>'}).join('');
}

/* game */
var game={list:[],i:0,liked:{},turn:0,timer:null};
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var x=a[i];a[i]=a[j];a[j]=x}return a}
function startGame(){
  game.list=shuffle(CARDS).slice(0,12);game.i=0;game.liked={};game.turn=0;
  $('#namesBox').classList.remove('hide');renderCard(false);
}
$('#startNezhno').onclick=function(){game.list=[];go('game')};
$('#again').onclick=function(){game.list=[];go('game')};
function names(){return [$('#n1').value.trim()||(LANG==='en'?'You':'Ты'),$('#n2').value.trim()||(LANG==='en'?'Partner':'Партнёр')]}
function renderCard(keep){
  clearInterval(game.timer);
  var c=game.list[game.i],n=names();
  $('#counter').textContent=(game.i+1)+' / '+game.list.length;
  var who=game.turn===0?(LANG==='en'?'Your turn':'Твой ход'):(LANG==='en'?'Partner\'s turn':'Ход партнёра');
  if($('#n1').value||$('#n2').value)who=LANG==='en'?(n[game.turn]+'\'s turn'):('Ход: '+n[game.turn]);
  $('#turn').textContent=who;
  var tm=c.timer_sec?'<div class="timer"><button class="btn small ghost" id="tStart">'+(LANG==='en'?'Start timer':'Запустить таймер')+'</button><div class="ring"><svg width="56" height="56"><circle class="bg" cx="28" cy="28" r="24"/><circle class="fg" id="tFg" cx="28" cy="28" r="24" stroke-dasharray="150.8" stroke-dashoffset="0"/></svg><span id="tNum">'+fmt(c.timer_sec)+'</span></div></div>':'';
  $('#cardFront').innerHTML='<div class="head"><span class="cat">'+catName(c.category)+'</span><span class="cico">'+CAT[c.category].i+'</span></div><div class="txt">'+txt(c)+'</div>'+tm+'<span class="who">'+(LANG==='en'?'for ':'')+whoName(c.who)+'</span>';
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
function next(){
  game.i++;game.turn=1-game.turn;
  if(game.i>=game.list.length){end(false)}else{$('#namesBox').classList.add('hide');renderCard(false)}
}
$('#doneBtn').onclick=next;$('#skipBtn').onclick=next;
$('#likeBtn').onclick=function(){var c=game.list[game.i];if(game.liked[c.id])delete game.liked[c.id];else game.liked[c.id]=c;renderCard(true)};
$('#stopBtn').onclick=function(){end(true)};
function end(stopped){clearInterval(game.timer);game.stopped=stopped;go('end');renderEnd()}
function renderEnd(){
  var l=Object.keys(game.liked).map(function(k){return game.liked[k]});
  $('#endP').textContent=game.stopped?(LANG==='en'?'Stopped — and that\'s completely fine. Thank you for the evening.':'Остановились — и это нормально. Спасибо за вечер.'):(LANG==='en'?'You went through all '+game.list.length+' cards.':'Вы прошли все '+game.list.length+' карточек.');
  $('#likedList').innerHTML=l.length?l.map(mini).join(''):'<p class="lead">'+(LANG==='en'?'No liked cards this time.':'В этот раз без отмеченных.')+'</p>';
}

/* gallery */
var filt='all';
function renderFilters(){
  var cats=['all'].concat(Object.keys(CAT));
  $('#filters').innerHTML=cats.map(function(c){return '<button class="chip'+(c===filt?' on':'')+'" data-f="'+c+'">'+(c==='all'?lab('all'):CAT[c].i+' '+catName(c))+'</button>'}).join('');
  $$('#filters .chip').forEach(function(b){b.onclick=function(){filt=b.dataset.f;renderFilters();renderGrid()}});
}
function renderGrid(){
  $('#grid').innerHTML=CARDS.filter(function(c){return filt==='all'||c.category===filt}).map(function(c){
    return '<article class="gcard"><span class="cat">'+CAT[c.category].i+' '+catName(c.category)+'</span><p>'+txt(c)+'</p><div class="meta">'+(LANG==='en'?'for ':'')+whoName(c.who)+(c.timer_sec?' · ⏱ '+fmt(c.timer_sec):'')+'</div></article>'}).join('');
}

/* survey demo */
var ans={};
function renderSurvey(){
  $('#survey').innerHTML=TAGS.slice(0,5).map(function(x,i){
    return '<div class="sq"><h3>'+(LANG==='en'?x.question_en:x.question_ru)+'</h3><div class="opts">'+['want','maybe','no'].map(function(k){return '<button class="opt'+(ans[i]===k?' sel':'')+'" data-q="'+i+'" data-k="'+k+'">'+lab(k)+'</button>'}).join('')+'</div></div>'}).join('');
  $$('.opt').forEach(function(b){b.onclick=function(){ans[b.dataset.q]=b.dataset.k;renderSurvey()}});
}

applyLang();
var h=location.hash.slice(1);if(['levels','gallery','survey','game'].indexOf(h)>=0)go(h);
})();
