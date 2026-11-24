"""Two-phone room (beta) end-to-end: two/three independent browser contexts talk over
WebRTC through the public PeerJS broker. Usage: python3 scripts/e2e_room.py BASE_URL [tag]"""
import sys, re, time
from playwright.sync_api import sync_playwright
base = sys.argv[1].rstrip('/'); tag = sys.argv[2] if len(sys.argv) > 2 else 'local'
S = '/workspace/fanty/shots/room_' + ('' if tag == 'live' else tag + '_')
errs = []; ok = []
def check(cond, msg):
    if not cond: raise AssertionError(msg)
    ok.append(msg); print('  ✓', msg)

MOBILE = dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
DESKTOP = dict(viewport={'width': 1440, 'height': 900}, device_scale_factor=1)

with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-features=WebRtcHideLocalIpsWithMdns'])
    def page(opts, name, locale='ru-RU'):
        c = b.new_context(locale=locale, **opts)
        c.add_init_script("try{localStorage.setItem('adult','1')}catch(e){}")
        c.grant_permissions(['clipboard-read', 'clipboard-write'])
        pg = c.new_page()
        pg.on('console', lambda m: errs.append((name, m.type, m.text)) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append((name, 'pageerror', str(e))))
        pg.on('dialog', lambda d: d.accept())
        return pg
    def answer(pg, vals):
        for i, v in enumerate(vals): pg.click(f'.ropt[data-rq="{i}"][data-rk="{v}"]')
    def counter(pg): return pg.inner_text('#counter').strip()
    def card(pg): return pg.inner_text('#cardFront .txt').strip()
    def same_card(h, g, n):
        h.wait_for_function(f"document.querySelector('#counter').textContent.trim().startsWith('{n} /')", timeout=10000)
        g.wait_for_function(f"document.querySelector('#counter').textContent.trim().startsWith('{n} /')", timeout=10000)
        return counter(h), counter(g)

    # ================= A: RU, phone host + phone guest =================
    print('A: RU · phone host + phone guest')
    h = page(MOBILE, 'hostA'); g = page(MOBILE, 'guestA')
    h.goto(base + '/ru/'); h.wait_for_timeout(800)
    h.click('#v-home .cta [data-go="levels"]'); h.click('#roomEntry'); h.wait_for_selector('#rCreate')
    h.fill('#rName', ''); h.click('#rCreate')
    check(h.is_visible('#rNameHint'), 'name is required before creating a room')
    h.screenshot(path=S + 'start_mobile.png')
    h.fill('#rName', 'Вика'); h.click('#rCreate')
    h.wait_for_selector('#rCodeBig', timeout=20000)
    code = ''.join(h.locator('#rCodeBig span').all_inner_texts())
    link = h.input_value('#rLink')
    check(re.fullmatch(r'[A-Z2-9]{5}', code) is not None, f'room code issued: {code}')
    check(link.endswith('/ru/#join=' + code) and '/fanty-prototype/' in link or base.endswith(':0'), f'join link respects base path + /ru/: {link}')
    check(h.locator('.rqr svg').count() == 1, 'QR code rendered client-side')
    h.wait_for_timeout(300); h.screenshot(path=S + 'host_wait_mobile.png')

    # wrong / malformed code
    g.goto(base + '/ru/#room'); g.wait_for_selector('#rCreate'); g.fill('#rName', 'Макс')
    g.fill('#rCode', 'ab'); g.click('#rJoin'); g.wait_for_selector('.rerr')
    check('5 символов' in g.inner_text('.rerr'), 'malformed code rejected locally')
    g.fill('#rName', 'Макс'); g.fill('#rCode', 'ZZZZ9' if code != 'ZZZZ9' else 'ZZZZ8'); g.click('#rJoin')
    g.wait_for_selector('.rerr.big', timeout=25000)
    check('не нашли' in g.inner_text('.rerr.big'), 'unknown code -> "room not found"')
    g.screenshot(path=S + 'wrong_code_mobile.png')

    # join by link
    g.goto('about:blank'); g.goto(link); g.wait_for_selector('#rJoinLink')
    check(code in g.inner_text('#room'), 'invite screen shows the room code')
    g.fill('#rName', 'Макс'); g.click('#rJoinLink')
    g.wait_for_selector('.rb-st.on', timeout=25000); h.wait_for_selector('.rb-st.on', timeout=10000)
    check('Макс' in h.inner_text('#roomBar') and 'Вика' in g.inner_text('#roomBar'), 'connected on both, names exchanged over P2P')
    g.screenshot(path=S + 'guest_survey_mobile.png'); h.screenshot(path=S + 'host_survey_mobile.png')

    # third person -> room full
    x = page(MOBILE, 'thirdA'); x.goto(link); x.wait_for_selector('#rJoinLink'); x.fill('#rName', 'Лишний'); x.click('#rJoinLink')
    x.wait_for_selector('.rerr.big', timeout=25000)
    check('уже двое' in x.inner_text('.rerr.big'), 'third phone gets "room is full"')
    x.screenshot(path=S + 'full_mobile.png'); x.context.close()

    # secret survey: host all want, guest want on first 4 topics only
    check(g.locator('.ropt.sel').count() == 0, 'guest starts with an empty survey')
    answer(h, ['want'] * 8); h.click('#rSubmit')
    g.wait_for_selector('#rPState.done', timeout=10000)
    check('уже ответил' in g.inner_text('#rPState') and g.locator('.ropt.sel').count() == 0, 'guest sees only "partner finished", never the answers')
    check(h.locator('.ropt').count() == 0 and 'Ждём' in h.inner_text('#room'), 'host waits for partner')
    answer(g, ['want', 'maybe', 'want', 'maybe', 'no', 'no', 'no', 'no']); g.click('#rSubmit')
    h.wait_for_selector('#rPlay', timeout=10000); g.wait_for_selector('#rPlay', timeout=10000)
    rh, rg = h.inner_text('.svres'), g.inner_text('.svres')
    check(rh == rg, 'both phones show the same match result')
    check('19' in rh, f'shared topics computed on host: {rh.splitlines()[0]}')
    check(not re.search(r'\bнет\b', g.inner_text('#room').lower()) and 'отказ' not in rg, 'no one is told who said no')
    # length: host picks 24, guest mirrors (read-only)
    h.click('#room .lenchip[data-len="24"]'); g.wait_for_selector('#room .lenchip.on[data-len="24"]', timeout=10000)
    check(g.locator('#room .lenchip[disabled]').count() == 3, 'length synced to guest (host picks)')
    h.screenshot(path=S + 'host_result_mobile.png'); g.screenshot(path=S + 'guest_result_mobile.png')

    # play in sync: the guest starts
    g.click('#rPlay'); h.wait_for_selector('#v-game.active', timeout=10000); g.wait_for_selector('#v-game.active', timeout=10000)
    a = same_card(h, g, 1)
    check(a == ('1 / 24', '1 / 24') and card(h) == card(g), 'same first card on both phones, deck of 24')
    check(h.inner_text('#turn') == 'Ход: Вика (ты)' and g.inner_text('#turn') == 'Ход: Вика', 'turn labels use names, "(ты)" on own phone')
    h.wait_for_timeout(600); h.screenshot(path=S + 'host_game_mobile.png'); g.screenshot(path=S + 'guest_game_mobile.png')
    g.click('#doneBtn'); same_card(h, g, 2)
    check(card(h) == card(g) and h.inner_text('#turn').startswith('Ход: Макс'), '"Done" on guest moves both')
    h.wait_for_timeout(1100); h.click('#skipBtn'); same_card(h, g, 3); check(card(h) == card(g), '"Skip" on host moves both')
    # simultaneous taps on both phones move only one card
    h.wait_for_timeout(1100); h.evaluate("document.querySelector('#doneBtn').click()"); g.evaluate("document.querySelector('#doneBtn').click()")
    h.wait_for_timeout(1500)
    check(counter(h) == counter(g) == '4 / 24', f'double tap from both phones moves one card ({counter(h)})')
    # personalised card text: find a card naming the partner
    named = False
    for i in range(10):
        if h.locator('#cardFront .pname').count():
            named = True; break
        h.click('#doneBtn'); same_card(h, g, 5 + i)
    check(named, 'partner name is inserted into card text: ' + (card(h)[:70] if named else ''))
    # reconnect: guest reloads the page and resumes on the same card
    n_before = counter(h)
    g.reload(); h.wait_for_selector('.rb-st.off', timeout=15000)
    check(True, 'host sees "connection lost" while guest is away')
    g.wait_for_selector('#v-game.active', timeout=30000); h.wait_for_selector('.rb-st.on', timeout=20000)
    g.wait_for_function(f"document.querySelector('#counter').textContent.trim()=='{n_before}'", timeout=10000)
    check(card(h) == card(g), f'guest reload -> auto rejoin on the same card ({n_before})')
    # stop from guest ends for both
    g.click('#stopBtn'); h.wait_for_selector('#v-end.active', timeout=10000); g.wait_for_selector('#v-end.active', timeout=10000)
    eh = h.inner_text('#v-end')
    check('остановлена для обоих' in eh and 'стоп-слово' in eh and 'остановлена для обоих' in g.inner_text('#v-end'), 'Stop ends the game on both phones, calm screen')
    h.screenshot(path=S + 'host_stop_mobile.png')
    g.click('#again'); h.wait_for_selector('#rPlay', timeout=10000); g.wait_for_selector('#rPlay', timeout=10000)
    check(True, '"Another evening" returns both to the result screen')
    h.context.close(); g.context.close()

    # ================= B: EN, desktop host + phone guest via QR =================
    print('B: EN · desktop host + phone guest (QR)')
    h = page(DESKTOP, 'hostB', 'en-US'); g = page(MOBILE, 'guestB', 'en-US')
    h.goto(base + '/#room'); h.wait_for_selector('#rCreate'); h.fill('#rName', 'Anna'); h.click('#rCreate')
    h.wait_for_selector('#rCodeBig', timeout=20000); h.wait_for_timeout(400)
    qbox = h.locator('.rqr').bounding_box()
    check(qbox['width'] >= 380, f'desktop shows a large QR ({int(qbox["width"])}px)')
    h.click('#rCopy'); h.wait_for_timeout(300)
    clip = h.evaluate('navigator.clipboard.readText()')
    check(clip == h.input_value('#rLink') and '#join=' in clip and '/ru/' not in clip, f'copy link works: {clip}')
    h.screenshot(path=S + 'host_wait_desktop.png')
    # decode the QR from the screenshot like a phone camera would
    import cv2
    h.locator('.rqr').screenshot(path='/tmp/qr.png')
    data, _, _ = cv2.QRCodeDetector().detectAndDecode(cv2.imread('/tmp/qr.png'))
    check(data == clip, f'QR decodes to the join link: {data}')
    g.goto(data); g.wait_for_selector('#rJoinLink'); g.fill('#rName', 'Ben'); g.click('#rJoinLink')
    g.wait_for_selector('.rb-st.on', timeout=25000); h.wait_for_selector('.rb-st.on', timeout=10000)
    check('Ben' in h.inner_text('#roomBar'), 'desktop host + phone guest connected')
    # few matches -> neutral fallback screen on both
    answer(g, ['no'] * 8); g.click('#rSubmit'); answer(h, ['want'] * 8); h.click('#rSubmit')
    h.wait_for_selector('#v-fallback.active', timeout=10000); g.wait_for_selector('#v-fallback.active', timeout=10000)
    check(h.inner_text('#fbT') == g.inner_text('#fbT') and 'different' in h.inner_text('#fbT'), 'few matches -> same neutral fallback on both')
    check('Ben' not in h.inner_text('#v-fallback') and 'Anna' not in g.inner_text('#v-fallback'), 'fallback never names who said no')
    h.screenshot(path=S + 'host_fallback_desktop.png'); g.screenshot(path=S + 'guest_fallback_mobile.png')
    g.click('.fbopt[data-o="tod"]'); h.wait_for_selector('#v-game.active', timeout=10000); g.wait_for_selector('#v-game.active', timeout=10000)
    same_card(h, g, 1); check(card(h) == card(g) and counter(h) == '1 / 12', 'guest picks Truth-or-Dare, both get the same 12-card deck')
    h.wait_for_timeout(600); h.screenshot(path=S + 'host_game_desktop.png'); g.screenshot(path=S + 'guest_game_mobile_en.png')
    for i in range(12):
        h.wait_for_timeout(1100); (h if i % 2 else g).click('#doneBtn')
        if i < 11: same_card(h, g, i + 2)
    h.wait_for_selector('#v-end.active', timeout=10000); g.wait_for_selector('#v-end.active', timeout=10000)
    check('all 12' in h.inner_text('#endP') and 'all 12' in g.inner_text('#endP'), 'played the whole deck in sync to the end')
    # partner leaves -> the other phone is told calmly
    g.once('dialog', lambda d: d.accept())
    g.evaluate("document.querySelector('#rbLeave').click()")
    h.wait_for_selector('.rerr.big', timeout=10000)
    check('left the room' in h.inner_text('.rerr.big'), 'leaving notifies the other phone')
    h.click('#rOne'); check(h.locator('#v-survey.active').count() == 1, 'fallback to the one-phone mode works')
    h.context.close(); g.context.close()

    # ================= C: broker unreachable -> honest error + one-phone fallback =================
    print('C: broker unreachable')
    c = page(MOBILE, 'offline', 'en-US')
    c.context.route(re.compile(r'.*peerjs\.com.*'), lambda r: r.abort())
    c.goto(base + '/#room'); c.wait_for_selector('#rCreate'); c.fill('#rName', 'Ann'); c.fill('#rCode', 'K7QXM'); c.click('#rJoin')
    c.wait_for_selector('.rerr.big', timeout=30000); msg = c.inner_text('.rerr.big')
    check('unavailable' in msg or "Couldn't connect" in msg, 'broker blocked -> clear error: ' + msg[:60])
    c.screenshot(path=S + 'broker_down_mobile.png')
    c.click('#rOne'); check(c.locator('#v-survey.active').count() == 1, '"Play on one phone" from the error screen')
    c.context.close()

    # ================= D: one phone: names + length =================
    print('D: one phone · names + length')
    o = page(MOBILE, 'single')
    o.goto(base + '/ru/#levels'); o.wait_for_timeout(700)
    o.click('#v-levels .lenchip[data-len="36"]'); o.click('#levels [data-b="single"][data-l="0"]'); o.wait_for_timeout(500)
    check(counter(o) == '1 / 36', 'one-phone: "Долго" gives 36 cards')
    o.fill('#n1', 'Аня'); o.fill('#n2', 'Макс'); o.click('#doneBtn'); o.wait_for_timeout(500)
    check(o.inner_text('#turn') == 'Ход: Макс', 'one-phone: both names, «Ход: Макс»')
    named = False
    for i in range(20):
        if o.locator('#cardFront .pname').count():
            named = o.inner_text('#cardFront .pname') == ('Аня' if o.inner_text('#turn') == 'Ход: Макс' else 'Макс'); break
        o.click('#doneBtn'); o.wait_for_timeout(250)
    check(named, 'one-phone: card names the other partner: ' + card(o)[:70])
    o.screenshot(path=S + 'single_names_mobile.png')
    # survey demo with 5..11 matches and "Средне" -> top-up to 24
    o.goto('about:blank'); o.goto(base + '/ru/#survey'); o.wait_for_timeout(600)
    for i, v in enumerate(['want'] * 8): o.click(f'.opt[data-q="{i}"][data-k="{v}"]')
    o.click('#svNext')
    for i, v in enumerate(['want', 'no', 'no', 'no', 'no', 'no', 'no', 'want']): o.click(f'.opt[data-q="{i}"][data-k="{v}"]')
    o.click('#svNext'); o.wait_for_selector('#svPlay')
    o.click('#svCtl .lenchip[data-len="24"]'); o.click('#svPlay'); o.wait_for_timeout(500)
    check(counter(o) == '1 / 24', 'one-phone survey: few matches topped up with warm-up to 24')
    warm = 0
    for i in range(24):
        if o.locator('#v-end.active').count(): break
        if 'разогрева' in o.inner_text('#cardFront'): warm += 1
        o.click('#doneBtn'); o.wait_for_timeout(120)
    check(warm >= 13 and o.locator('#v-end.active').count() == 1, f'warm-up cards fill the deck ({warm} of 24)')
    o.context.close()
    b.close()

errs = [e for e in errs if 'favicon' not in e[2] and e[0] != 'offline']  # test C blocks the broker on purpose
print(f'\n{len(ok)} checks passed ·', tag)
print('ERRORS', errs)
