/* YesYes · two-phone room (beta).
   Peer-to-peer over WebRTC (PeerJS + its free public signalling broker, no accounts).
   The host phone is the source of truth: it keeps both answer sets in memory only long
   enough to compute the shared topics, then drops them. Nothing is stored anywhere. */
import qrcode from 'qrcode-generator';

var PFX = 'yesyes-room-v1-';
var ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L
var CODE_LEN = 5;
var OPEN_TIMEOUT = 15000, JOIN_TIMEOUT = 20000, HB_EVERY = 3000, HB_LOST = 12000, RETRY_EVERY = 3000, RETRY_MAX = 40;

var TX = {
  beta: ['бета', 'beta'],
  title: ['Игра на двух телефонах', 'Play on two phones'],
  intro: ['Каждый отвечает на своём телефоне — тайно. Партнёр никогда не увидит твоих ответов: мы покажем только совпадения, а потом вы тянете одни и те же карточки синхронно.', 'Each of you answers on your own phone, in secret. Your partner never sees your answers: we only show the matches, then you draw the same cards in sync.'],
  yourName: ['Твоё имя', 'Your name'],
  nameNeed: ['Напиши своё имя — так партнёр увидит, чей ход.', 'Enter your name so your partner can see whose turn it is.'],
  create: ['Создать комнату', 'Create a room'],
  or: ['или войди по коду', 'or join with a code'],
  codePh: ['Код, например K7QXM', 'Code, e.g. K7QXM'],
  join: ['Войти', 'Join'],
  onePhone: ['Играть на одном телефоне', 'Play on one phone'],
  invited: ['Тебя пригласили в комнату', 'You\'re invited to room'],
  joinBtn: ['Войти в комнату', 'Join the room'],
  creating: ['Создаём комнату…', 'Creating a room…'],
  joining: ['Подключаемся к комнате…', 'Connecting to the room…'],
  waitT: ['Комната готова', 'Your room is ready'],
  waitP: ['Пусть партнёр отсканирует QR-код камерой телефона. Или откроет сайт и введёт код. Или отправь ему ссылку.', 'Let your partner scan the QR code with their phone camera. Or open the site and type the code. Or send them the link.'],
  code: ['Код комнаты', 'Room code'],
  copy: ['Скопировать', 'Copy'], copied: ['Скопировано', 'Copied'], share: ['Поделиться', 'Share'],
  waiting: ['Ждём партнёра…', 'Waiting for your partner…'],
  privacy: ['Ответы живут только в памяти ваших телефонов и пропадают, когда вы закрываете страницу.', 'Answers live only in your phones\' memory and are gone when you close the page.'],
  svT: ['Тайный опрос', 'Secret survey'],
  svP: ['Отвечай честно — {p} не увидит твоих ответов. Покажем только то, что совпало.', 'Answer honestly — {p} won\'t see your answers. We only show what matches.'],
  pAnswering: ['{p} отвечает…', '{p} is answering…'],
  pDone: ['{p} уже ответил(а)', '{p} has finished'],
  submit: ['Готово', 'Done'],
  waitPT: ['Твои ответы приняты', 'Your answers are in'],
  waitPP: ['Ждём, пока {p} закончит. Чужие ответы никто не увидит.', 'Waiting for {p} to finish. Nobody sees anyone\'s answers.'],
  resT: ['Общее «да»: {n} карточек', 'Shared yeses: {n} cards'],
  few: ['Совпадений немного — доберём колоду мягкими карточками «для разогрева».', 'Only a few matches — we\'ll top up the deck with soft "for warm-up" cards.'],
  play: ['Играть колодой', 'Play this deck'],
  retake: ['Пройти опрос заново вместе', 'Retake together'],
  retakeNote: ['Заново отвечают оба, каждый на своём телефоне.', 'Both of you answer again, each on your own phone.'],
  online: ['{p} на связи', '{p} is connected'],
  lost: ['Нет связи с партнёром — переподключаемся…', 'Lost the connection — reconnecting…'],
  lostHost: ['Связь с партнёром потеряна. Ждём, пока он(а) вернётся…', 'Lost your partner. Waiting for them to come back…'],
  noNet: ['Нет связи — действие не отправлено', 'No connection — action not sent'],
  leave: ['Выйти', 'Leave'],
  leaveQ: ['Выйти из комнаты? Игра закончится для обоих.', 'Leave the room? The game ends for both of you.'],
  room: ['Комната', 'Room'],
  eNotFound: ['Комнату не нашли. Проверь код — или создатель комнаты закрыл страницу.', 'Room not found. Check the code — or the room creator closed the page.'],
  eBadCode: ['Код из 5 символов: латинские буквы и цифры.', 'The code has 5 characters: letters and digits.'],
  eFull: ['В этой комнате уже двое. Попроси партнёра создать новую.', 'This room already has two people. Ask your partner to create a new one.'],
  eTimeout: ['Не получилось соединиться. Бывает в некоторых сетях: попробуйте ещё раз, переключитесь на мобильный интернет или играйте на одном телефоне.', 'Couldn\'t connect. This happens on some networks: try again, switch to mobile data, or play on one phone.'],
  eBroker: ['Сервер соединения сейчас недоступен. Попробуйте чуть позже или играйте на одном телефоне.', 'The connection server is unavailable right now. Try again later or play on one phone.'],
  eClosed: ['Комната закрылась: связь с создателем потеряна.', 'The room has closed: lost the connection to its creator.'],
  eLeft: ['{p} вышел(а) из комнаты.', '{p} left the room.'],
  again: ['Попробовать ещё раз', 'Try again'],
  newRoom: ['Новая комната', 'New room'],
  stopNote: ['Игра остановлена для обоих.', 'The game stopped for both of you.'],
  partner: ['Партнёр', 'Partner'], you: ['Ты', 'You']
};

export function initRoom(RM, A) {
  var $ = A.$, en = A.lang === 'en';
  function t(k, v) { var s = TX[k][en ? 1 : 0]; if (v) Object.keys(v).forEach(function (x) { s = s.split('{' + x + '}').join(v[x]); }); return s; }
  function esc(x) { return A.escH(x == null ? '' : x); }
  var box = function () { return $('#room'); };
  var S = null;           // current session
  var flash = null;       // last error shown on the start screen

  function rnd(n) { var a = new Uint32Array(n), s = ''; crypto.getRandomValues(a); for (var i = 0; i < n; i++) s += ALPH[a[i] % ALPH.length]; return s; }
  function cleanCode(c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function validCode(c) { return c.length === CODE_LEN && c.split('').every(function (ch) { return ALPH.indexOf(ch) >= 0; }); }
  function joinUrl(code) { return location.origin + A.base + (en ? '/' : '/ru/') + '#join=' + code; }
  function savedName() { try { return localStorage.getItem('yy_name') || ''; } catch (e) { return ''; } }
  function saveName(n) { try { localStorage.setItem('yy_name', n); } catch (e) {} }
  function pname() { return (S && S.partnerName) || t('partner'); }
  function loadPeer() { return import('peerjs').then(function (m) { return m.Peer || m.default; }); }

  /* ---------- hooks used by legacy-app.js ---------- */
  RM.names = function () { if (!S) return [t('you'), t('partner')]; var me = S.myName, pn = pname(); return S.role === 'host' ? [me, pn] : [pn, me]; };
  RM.act = function (k, arg) { act(k, arg); };
  RM.setLen = function (n) { if (S && S.role === 'host') { S.H.len = n; push(); } };
  RM.endNote = function (stopped) { return stopped ? t('stopNote') : ''; };
  RM.leaveGuard = function (v) {
    if (['game', 'end', 'fallback', 'room'].indexOf(v) >= 0) return false;
    if (!window.confirm(t('leaveQ'))) return true;
    leave(true); return false;
  };
  RM.canResume = function () { try { var st = JSON.parse(sessionStorage.getItem('yy_guest') || 'null'); return !!(st && Date.now() - st.ts < 3 * 3600e3 && st.name); } catch (e) { return false; } };
  RM.onShow = function () { if (!S) renderStart(); };
  RM.openJoin = function (code) {
    code = cleanCode(code);
    if (S && S.code === code) { A.go('room'); return; }
    if (S) leave(true);
    S = null; A.go('room'); renderStart(code);
  };
  RM.openRoom = function () {
    A.go('room');
    var st = null; try { st = JSON.parse(sessionStorage.getItem('yy_guest') || 'null'); } catch (e) {}
    if (!S && st && Date.now() - st.ts < 3 * 3600e3 && st.name) { join(st.code, st.name); return; }
    if (!S) renderStart();
  };

  /* ---------- screens ---------- */
  function head(sub) {
    return '<p class="eyebrow"><span class="dot"></span>YesYes · <span class="betatag">' + t('beta') + '</span></p><h1>' + t('title') + '</h1>' + (sub ? '<p class="lead">' + sub + '</p>' : '');
  }
  function renderStart(code) {
    var err = flash ? '<p class="rerr" role="alert">' + esc(flash) + '</p>' : ''; flash = null;
    var nm = '<label class="rlab" for="rName">' + t('yourName') + '</label><input id="rName" class="rinput" maxlength="20" autocomplete="given-name" value="' + esc(savedName()) + '"><p class="rhint" id="rNameHint" hidden>' + t('nameNeed') + '</p>';
    if (code) {
      box().innerHTML = '<div class="rcard narrow">' + head() + '<p class="lead">' + t('invited') + ' <b class="rcode-inline">' + esc(code) + '</b></p>' + err + nm +
        '<div class="cta"><button class="btn primary big" id="rJoinLink">' + t('joinBtn') + '</button></div><button class="linkbtn" id="rOne">' + t('onePhone') + '</button><p class="muted small">' + t('privacy') + '</p></div>';
      $('#rJoinLink').onclick = function () { var n = needName(); if (n) join(code, n); };
    } else {
      box().innerHTML = '<div class="rcard narrow">' + head(t('intro')) + err + nm +
        '<div class="cta"><button class="btn primary big" id="rCreate">' + t('create') + '</button></div>' +
        '<p class="ror">' + t('or') + '</p><div class="rjoin"><input id="rCode" class="rinput code" maxlength="8" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="' + t('codePh') + '"><button class="btn ghost" id="rJoin">' + t('join') + '</button></div>' +
        '<button class="linkbtn" id="rOne">' + t('onePhone') + '</button><p class="muted small">' + t('privacy') + '</p></div>';
      $('#rCreate').onclick = function () { var n = needName(); if (n) create(n); };
      $('#rJoin').onclick = function () {
        var c = cleanCode($('#rCode').value);
        if (!validCode(c)) { flash = t('eBadCode'); renderStart(); return; }
        var n = needName(); if (n) join(c, n);
      };
      $('#rCode').onkeydown = function (e) { if (e.key === 'Enter') $('#rJoin').click(); };
    }
    $('#rOne').onclick = function () { A.go('survey'); };
  }
  function needName() {
    var el = $('#rName'), n = el.value.trim();
    if (!n) { $('#rNameHint').hidden = false; el.classList.add('bad'); el.focus(); return ''; }
    saveName(n); return n;
  }
  function renderBusy(k) { box().innerHTML = '<div class="rcard narrow">' + head() + '<p class="rstatus"><span class="spin"></span>' + t(k) + '</p></div>'; }
  function renderError(k) {
    var code = S && S.role === 'guest' ? S.code : '';
    var v = {}; v.p = esc(pname());
    if (['eLeft', 'eClosed', 'eFull', 'eNotFound'].indexOf(k) >= 0) { try { sessionStorage.removeItem('yy_guest'); } catch (e) {} }
    teardown();
    show('room'); // (with no session this renders the start screen first; we overwrite it below)
    box().innerHTML = '<div class="rcard narrow">' + head() + '<p class="rerr big" role="alert">' + t(k, v) + '</p><div class="cta">' +
      (code && k !== 'eFull' ? '<button class="btn primary" id="rRetry">' + t('again') + '</button>' : '<button class="btn primary" id="rNew">' + t('newRoom') + '</button>') +
      '<button class="btn ghost" id="rOne">' + t('onePhone') + '</button></div></div>';
    if ($('#rRetry')) $('#rRetry').onclick = function () { join(code, savedName() || t('partner')); };
    if ($('#rNew')) $('#rNew').onclick = function () { renderStart(); };
    $('#rOne').onclick = function () { A.go('survey'); };
  }
  function renderWait() {
    var url = joinUrl(S.code), qr = qrcode(0, 'M'); qr.addData(url); qr.make();
    box().innerHTML = '<div class="rcard wide"><div class="rwait">' +
      '<div class="rqr" aria-label="QR">' + qr.createSvgTag({ cellSize: 8, margin: 2, scalable: true }) + '</div>' +
      '<div class="rinfo"><p class="eyebrow"><span class="dot"></span>' + t('title') + ' · <span class="betatag">' + t('beta') + '</span></p><h1>' + t('waitT') + '</h1><p class="lead">' + t('waitP') + '</p>' +
      '<p class="rlab">' + t('code') + '</p><div class="rcode" id="rCodeBig">' + S.code.split('').map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</div>' +
      '<div class="rlink"><input id="rLink" class="rinput" readonly value="' + esc(url) + '"><button class="btn ghost" id="rCopy">' + t('copy') + '</button>' +
      (navigator.share ? '<button class="btn ghost" id="rShare">' + t('share') + '</button>' : '') + '</div>' +
      '<p class="rstatus"><span class="spin"></span>' + t('waiting') + '</p><p class="muted small">' + t('privacy') + '</p></div></div></div>';
    $('#rCopy').onclick = function () {
      var b = this, ok = function () { b.textContent = t('copied'); setTimeout(function () { b.textContent = t('copy'); }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, function () { $('#rLink').select(); document.execCommand('copy'); ok(); });
      else { $('#rLink').select(); document.execCommand('copy'); ok(); }
    };
    if ($('#rShare')) $('#rShare').onclick = function () { navigator.share({ title: 'YesYes', url: url }).catch(function () {}); };
  }
  function renderSurvey(st) {
    var tags = A.svTags(), a = S.my, p = esc(pname());
    box().innerHTML = '<div class="rcard">' + '<h1>' + t('svT') + '</h1><p class="lead">' + t('svP', { p: p }) + '</p>' +
      '<p class="rpchip ' + (st.pd ? 'done' : '') + '" id="rPState">' + (st.pd ? '✓ ' + t('pDone', { p: p }) : t('pAnswering', { p: p })) + '</p>' +
      '<div class="survey">' + tags.map(function (x, i) {
        return '<div class="sq"><h3>' + (en ? x.question_en : x.question_ru) + '</h3><div class="opts">' + ['want', 'maybe', 'no'].map(function (k) {
          return '<button class="opt ropt' + (a[i] === k ? ' sel' : '') + '" data-rq="' + i + '" data-rk="' + k + '">' + A.lab(k) + '</button>'; }).join('') + '</div></div>';
      }).join('') + '</div><div class="svctl"><button class="btn primary" id="rSubmit">' + t('submit') + '</button></div></div>';
    [].slice.call(box().querySelectorAll('.ropt')).forEach(function (b) {
      b.onclick = function () {
        a[b.dataset.rq] = b.dataset.rk;
        [].slice.call(box().querySelectorAll('.ropt[data-rq="' + b.dataset.rq + '"]')).forEach(function (o) { o.classList.toggle('sel', o === b); });
      };
    });
    $('#rSubmit').onclick = function () {
      var ans = {}; tags.forEach(function (x, i) { ans[i] = a[i] || 'no'; });
      S.myDone = true;
      if (S.role === 'host') { S.hostAns = ans; S.H.hd = true; maybeMatch(); push(); }
      else { S.lastAns = ans; send({ t: 'answers', a: ans, r: S.round }); applyState(S.H); }
      window.scrollTo(0, 0);
    };
  }
  function renderWaitPartner() {
    var p = esc(pname());
    box().innerHTML = '<div class="rcard narrow"><div class="rbig">✓</div><h1>' + t('waitPT') + '</h1><p class="lead">' + t('waitPP', { p: p }) + '</p><p class="rstatus"><span class="spin"></span>' + t('pAnswering', { p: p }) + '</p></div>';
  }
  function renderResult(st) {
    var tags = A.svTags().filter(function (x) { return st.res.shared.indexOf(x.tag) >= 0; }).map(function (x) { return esc(en ? x.tag_en : x.tag); });
    box().innerHTML = '<div class="rcard narrow"><div class="sq svres"><h3>' + t('resT', { n: st.res.n }) + '</h3><p class="svtopics">' + tags.join(' · ') + '</p>' +
      (st.res.n < st.len ? '<p class="muted">' + t('few') + '</p>' : '') + '</div><div class="lenpick" data-lenpick></div>' +
      '<div class="svctl"><button class="btn primary" id="rPlay">' + t('play') + '</button><button class="btn ghost" id="rRetake">' + t('retake') + '</button><p class="muted">' + t('retakeNote') + '</p></div></div>';
    A.renderLenPickers();
    $('#rPlay').onclick = function () { act('play'); };
    $('#rRetake').onclick = function () { act('retake'); };
  }
  function renderBar() {
    var bar = $('#roomBar');
    if (!S || !S.everConnected) { bar.hidden = true; document.body.classList.remove('inroom'); return; }
    bar.hidden = false; document.body.classList.add('inroom');
    bar.innerHTML = '<span class="betatag">' + t('beta') + '</span><span class="rb-code">' + t('room') + ' ' + S.code + '</span><span class="rb-st ' + (S.connected ? 'on' : 'off') + '" id="rbState">' +
      (S.connected ? t('online', { p: esc(pname()) }) : (S.role === 'host' ? t('lostHost') : t('lost'))) + '</span><button class="rb-leave" id="rbLeave">' + t('leave') + '</button>';
    $('#rbLeave').onclick = function () { if (window.confirm(t('leaveQ'))) { leave(true); A.go('room'); renderStart(); } };
  }
  function toast(msg) {
    var el = document.createElement('div'); el.className = 'rtoast'; el.textContent = msg; document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2200);
  }

  /* ---------- state (host is authoritative, guest mirrors it) ---------- */
  function show(v) { if (!document.querySelector('#v-' + v + '.active')) A.go(v); }
  function freshState(len) { return { ph: 'survey', round: 1, hd: false, gd: false, len: len, res: null, deck: null, did: 0, i: 0, turn: 0, stopped: false }; }
  function view(st, forRole) { // what a phone may know: never the other person's answers
    return { ph: st.ph, round: st.round, pd: forRole === 'host' ? st.gd : st.hd, md: forRole === 'host' ? st.hd : st.gd, len: st.len, res: st.res, deck: st.deck, did: st.did, i: st.i, turn: st.turn, stopped: st.stopped };
  }
  function push() { if (!S) return; applyState(view(S.H, 'host')); send({ t: 'state', s: view(S.H, 'guest') }); }

  function applyState(st) {
    if (!S) return;
    S.H = S.role === 'host' ? S.H : st;
    if (st.round !== S.round) { S.round = st.round; S.my = {}; S.myDone = false; S.lastAns = null; S.shownDid = -1; S.shownEnd = -1; }
    if (st.md) S.myDone = true;
    else if (S.role === 'guest' && st.ph === 'survey' && S.myDone && S.lastAns) send({ t: 'answers', a: S.lastAns, r: st.round }); // resend after a reconnect
    if (A.getLen() !== st.len) A.setLen(st.len, false);
    renderBar();
    if (st.ph === 'survey') {
      if (S.myDone) renderWaitPartner(); else if (!box().querySelector('#rSubmit') || S.lastPh !== 'survey') renderSurvey(st);
      else { var c = $('#rPState'), p = esc(pname()); if (c) { c.classList.toggle('done', !!st.pd); c.textContent = st.pd ? '✓ ' + t('pDone', { p: p }) : t('pAnswering', { p: p }); } }
      show('room');
    } else if (st.ph === 'result') { renderResult(st); show('room'); }
    else if (st.ph === 'fallback') { show('fallback'); A.renderFallback(); }
    else if (st.ph === 'game') {
      var g = A.game;
      if (S.shownDid !== st.did || !document.querySelector('#v-game.active')) {
        S.shownDid = st.did;
        A.beginDeck(st.deck.ids.map(function (id) { return A.byId[id]; }), st.deck.warm, st.deck.tag);
        S.shownI = 0;
      }
      if (S.shownI !== st.i || g.turn !== st.turn) {
        g.i = st.i; g.turn = st.turn; g.list = g.fixed.slice(0, st.i + 1); S.shownI = st.i;
        $('#namesBox').classList.add('hide'); A.renderCard(false);
      }
    } else if (st.ph === 'end') {
      if (S.shownEnd !== st.did + ':' + st.round) { S.shownEnd = st.did + ':' + st.round; A.end(!!st.stopped); }
    }
    S.lastPh = st.ph;
  }

  function maybeMatch() {
    var H = S.H; if (!(H.hd && H.gd)) return;
    var tags = A.svTags(), shared = [];
    tags.forEach(function (x, i) { if (S.hostAns[i] !== 'no' && S.guestAns[i] !== 'no') shared.push(x.tag); });
    S.hostAns = S.guestAns = null; // answers are dropped right after matching
    S.matched = A.cards.filter(function (c) { return c.level === 'nezhno' && shared.indexOf(c.survey_tag) >= 0; });
    S.shared = shared;
    H.res = { n: S.matched.length, shared: shared };
    H.ph = S.matched.length < A.minMatch ? 'fallback' : 'result';
  }
  function setDeck(d) {
    var H = S.H; H.did++; H.i = 0; H.turn = 0; H.stopped = false; H.ph = 'game';
    H.deck = { ids: d.cards.map(function (c) { return c.id; }), warm: d.warm || {}, tag: d.tag || {} };
  }
  function hostAct(k, arg, i, from) {
    var H = S.H;
    if ((k === 'done' || k === 'skip') && H.ph === 'game') {
      if (i != null && i !== H.i) return; // a double tap from both phones moves only one card
      if (S.lastMover && S.lastMover !== from && Date.now() - S.lastMove < 1000) return; // …even when the second tap already saw the new card
      S.lastMover = from; S.lastMove = Date.now();
      H.i++; H.turn = 1 - H.turn;
      if (H.i >= H.deck.ids.length) { H.i = H.deck.ids.length - 1; H.ph = 'end'; H.stopped = false; }
    } else if (k === 'stop' && (H.ph === 'game' || H.ph === 'end')) { H.ph = 'end'; H.stopped = true; }
    else if (k === 'play' && H.ph === 'result') { setDeck(A.svDeck(S.matched, S.shared, H.len)); }
    else if (k === 'pick' && H.ph === 'fallback') { var d = A.fallbackDeck(arg); setDeck(d); }
    else if (k === 'again' && H.ph === 'end') { H.ph = H.res && H.res.n >= A.minMatch ? 'result' : 'fallback'; }
    else if (k === 'retake') { var r = H.round + 1, len = H.len; S.H = freshState(len); S.H.round = r; S.H.did = H.did; S.hostAns = S.guestAns = null; }
    else return;
    push();
  }
  function act(k, arg) {
    if (!S) return;
    var i = A.game.i;
    if (S.role === 'host') { hostAct(k, arg, i, 'host'); return; }
    if (!send({ t: 'act', k: k, arg: arg, i: i })) toast(t('noNet'));
  }

  /* ---------- transport ---------- */
  function send(m) { if (S && S.conn && S.conn.open) { try { S.conn.send(m); return true; } catch (e) {} } return false; }
  function startHeartbeat() {
    clearInterval(S.hb);
    S.hb = setInterval(function () {
      if (!S) return;
      send({ t: 'ping' });
      if (S.connected && Date.now() - S.seen > HB_LOST) { lost(); }
    }, HB_EVERY);
  }
  function connected() {
    S.connected = true; S.everConnected = true; S.seen = Date.now(); RM.active = true; RM.role = S.role;
    clearTimeout(S.to); clearTimeout(S.retryT); S.retries = 0; renderBar();
  }
  function lost() {
    if (!S || !S.connected) return;
    S.connected = false; renderBar();
    if (S.role === 'guest') scheduleRetry();
  }
  function onData(d) {
    if (!S || !d || typeof d !== 'object') return;
    S.seen = Date.now();
    if (!S.connected && S.everConnected && d.t !== 'full') connected();
    if (d.t === 'ping') return;
    if (d.t === 'gone') { if (S.role === 'host') lost(); else renderError('eClosed'); return; }
    if (d.t === 'bye') { var p = pname(); flash = null; S.partnerName = p; renderError('eLeft'); return; }
    if (S.role === 'host') {
      if (d.t === 'answers' && d.r === S.H.round && S.H.ph === 'survey') { S.guestAns = d.a; S.H.gd = true; maybeMatch(); push(); }
      else if (d.t === 'act') hostAct(d.k, d.arg, d.i, 'guest');
    } else {
      if (d.t === 'full') { renderError('eFull'); return; }
      if (d.t === 'welcome') { S.partnerName = d.name; connected(); try { sessionStorage.setItem('yy_guest', JSON.stringify({ code: S.code, gid: S.gid, name: S.myName, ts: Date.now() })); } catch (e) {} applyState(d.s); }
      else if (d.t === 'state') applyState(d.s);
    }
  }

  function create(name) {
    teardown();
    S = { role: 'host', myName: name, my: {}, round: 1, tries: 0 };
    S.H = freshState(A.getLen());
    renderBusy('creating');
    loadPeer().then(function (Peer) { if (S && S.role === 'host') openHost(Peer); }, function () { renderError('eBroker'); });
  }
  function openHost(Peer) {
    var me = S;
    me.code = rnd(CODE_LEN);
    var peer = me.peer = new Peer(PFX + me.code, { debug: 0 });
    clearTimeout(me.to);
    me.to = setTimeout(function () { if (S === me && !me.opened) renderError('eBroker'); }, OPEN_TIMEOUT);
    peer.on('open', function () { if (S !== me) return; me.opened = true; clearTimeout(me.to); renderWait(); });
    peer.on('error', function (e) {
      if (S !== me) return;
      if (e.type === 'unavailable-id' && me.tries++ < 3) { try { peer.destroy(); } catch (x) {} openHost(Peer); return; }
      if (!me.opened) { renderError('eBroker'); return; }
      // after the room is open: transient broker/network trouble — keep the P2P link, try to re-register
    });
    peer.on('disconnected', function () { if (S === me && !peer.destroyed) setTimeout(function () { if (S === me && !peer.destroyed && peer.disconnected) try { peer.reconnect(); } catch (x) {} }, 2000); });
    peer.on('connection', function (c) {
      c.on('data', function (d) {
        if (S !== me) return;
        if (d && d.t === 'hello') {
          var busy = me.gid && me.gid !== d.gid && ((me.conn && me.conn.open && me.connected) || Date.now() - (me.seen || 0) < 60000);
          if (busy) { try { c.send({ t: 'full' }); } catch (x) {} setTimeout(function () { c.close(); }, 800); return; }
          if (me.gid && me.gid !== d.gid) { me.H.gd = false; me.guestAns = null; } // a new person takes an abandoned seat
          if (me.conn && me.conn !== c) { try { me.conn.close(); } catch (x) {} }
          me.gid = d.gid; me.conn = c; me.partnerName = String(d.name || '').slice(0, 20) || t('partner');
          var first = !me.everConnected;
          connected(); startHeartbeat();
          c.send({ t: 'welcome', name: me.myName, s: view(me.H, 'guest') });
          if (first) applyState(view(me.H, 'host')); else renderBar();
          return;
        }
        if (c === me.conn) onData(d);
      });
      c.on('close', function () { if (S === me && c === me.conn) lost(); });
      c.on('error', function () { if (S === me && c === me.conn) lost(); });
    });
  }

  function join(code, name) {
    code = cleanCode(code);
    if (!validCode(code)) { teardown(); flash = t('eBadCode'); A.go('room'); renderStart(); return; }
    teardown();
    var gid = null; try { var st = JSON.parse(sessionStorage.getItem('yy_guest') || 'null'); if (st && st.code === code) gid = st.gid; } catch (e) {}
    S = { role: 'guest', code: code, myName: name, my: {}, round: 0, gid: gid || rnd(12), retries: 0 };
    S.H = null;
    A.go('room'); renderBusy('joining');
    var me = S;
    me.to = setTimeout(function () { if (S === me && !me.everConnected) renderError('eTimeout'); }, JOIN_TIMEOUT);
    loadPeer().then(function (Peer) {
      if (S !== me) return;
      var peer = me.peer = new Peer({ debug: 0 });
      peer.on('open', function () { if (S === me) dial(); });
      peer.on('error', function (e) {
        if (S !== me) return;
        if (e.type === 'peer-unavailable') { if (!me.everConnected) renderError('eNotFound'); else scheduleRetry(); return; }
        if (!me.everConnected && ['network', 'server-error', 'socket-error', 'socket-closed', 'browser-incompatible', 'ssl-unavailable'].indexOf(e.type) >= 0) { renderError(e.type === 'browser-incompatible' ? 'eTimeout' : 'eBroker'); return; }
        if (me.everConnected) scheduleRetry();
      });
      peer.on('disconnected', function () { if (S === me && !peer.destroyed) setTimeout(function () { if (S === me && !peer.destroyed && peer.disconnected) try { peer.reconnect(); } catch (x) {} }, 1500); });
    }, function () { renderError('eBroker'); });
  }
  function dial() {
    var me = S, c = me.peer.connect(PFX + me.code, { reliable: true, serialization: 'json' });
    me.conn = c;
    c.on('open', function () { if (S === me && c === me.conn) { c.send({ t: 'hello', gid: me.gid, name: me.myName }); startHeartbeat(); } });
    c.on('data', function (d) { if (S === me && c === me.conn) onData(d); });
    c.on('close', function () { if (S === me && c === me.conn) { if (me.connected) lost(); else if (me.everConnected) scheduleRetry(); } });
    c.on('error', function () { if (S === me && c === me.conn && me.everConnected) scheduleRetry(); });
  }
  function scheduleRetry() {
    var me = S; if (!me || me.role !== 'guest' || me.retryT) return;
    if (me.connected) { me.connected = false; renderBar(); }
    me.retryT = setTimeout(function () {
      me.retryT = null; if (S !== me || me.connected) return;
      if (++me.retries > RETRY_MAX) { renderError('eClosed'); return; }
      if (me.peer.disconnected && !me.peer.destroyed) { try { me.peer.reconnect(); } catch (x) {} }
      if (me.conn) { try { me.conn.close(); } catch (x) {} }
      if (!me.peer.disconnected) dial();
      scheduleRetry();
    }, RETRY_EVERY);
  }

  function teardown() {
    if (!S) return;
    var me = S; S = null; RM.active = false; RM.role = null;
    clearTimeout(me.to); clearTimeout(me.retryT); clearInterval(me.hb);
    try { me.peer && me.peer.destroy(); } catch (e) {}
    renderBar();
  }
  function leave(notify) {
    if (!S) { renderBar(); return; }
    var me = S;
    if (notify) send({ t: 'bye' });
    try { sessionStorage.removeItem('yy_guest'); } catch (e) {}
    S = null; RM.active = false; RM.role = null;
    clearTimeout(me.to); clearTimeout(me.retryT); clearInterval(me.hb);
    setTimeout(function () { try { me.peer && me.peer.destroy(); } catch (e) {} }, 400); // let "bye" leave first
    renderBar();
  }
  // closing/reloading the page is not the same as pressing «Выйти»: the guest may come back
  window.addEventListener('pagehide', function () { if (S) send({ t: 'gone' }); });
}
