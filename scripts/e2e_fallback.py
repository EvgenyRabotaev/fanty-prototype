import sys
from playwright.sync_api import sync_playwright
base=sys.argv[1].rstrip('/'); S='/workspace/fanty/shots/fallback_'; errs=[]
def answer(pg,vals):
    for i,v in enumerate(vals): pg.click(f'.opt[data-q="{i}"][data-k="{v}"]')
with sync_playwright() as p:
    b=p.chromium.launch()
    for lang,path in(('en','/'),('ru','/ru/')):
        c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,locale='en-US'); c.add_init_script("try{localStorage.setItem('adult','1')}catch(e){}")
        pg=c.new_page()
        pg.on('console',lambda m: errs.append((m.type,m.text)) if m.type in('error','warning') else None)
        pg.on('pageerror',lambda e: errs.append(('pageerror',str(e))))
        def low():
            pg.goto('about:blank'); pg.goto(base+path+'#survey'); pg.wait_for_timeout(700)
            answer(pg,['want']*8); pg.click('#svNext'); pg.wait_for_timeout(200)
            assert pg.locator('.opt.sel').count()==0, 'first answers leaked'
            answer(pg,['no']*7+['maybe']); pg.click('#svNext'); pg.wait_for_timeout(500)
            assert pg.locator('#v-fallback.active').count()==1
        low()
        body=pg.inner_text('#v-fallback'); print(lang,'fallback:',body.replace('\n',' | '))
        assert 'said no' not in body.lower() and 'сказал' not in body.lower()
        if lang=='en': pg.screenshot(path=S+'neutral_mobile.png')
        for o in('down','tod','date'):
            low(); pg.locator(f'.fbopt[data-o="{o}"]').click(); pg.wait_for_timeout(500)
            assert pg.locator('#v-game.active').count()==1
            txts=[]
            for k in range(14):
                pg.wait_for_timeout(450); txts.append(pg.inner_text('#cardFront .txt')[:40]+'|'+pg.inner_text('#cardFront .warmtag') if pg.locator('#cardFront .warmtag').count() else pg.inner_text('#cardFront .txt')[:40])
                pg.click('#skipBtn')
                if pg.locator('#v-end.active').count(): break
            print(lang,o,'cards',len(txts),'end',pg.locator('#v-end.active').count(),txts[:3])
        low()
        # retake from fallback
        pg.click('#fbRetake'); pg.wait_for_timeout(400); assert pg.locator('#v-survey.active').count()==1 and pg.locator('.opt.sel').count()==0
        # --- few matches (some): A want x3 others no ; B same -> expect warm-up cards
        answer(pg,['want']*3+['no']*5); pg.click('#svNext'); pg.wait_for_timeout(200); answer(pg,['want']*3+['no']*5); pg.click('#svNext'); pg.wait_for_timeout(400)
        print(lang,'result:',pg.inner_text('#survey').replace('\n',' | '))
        assert pg.locator('#svRetake').count()==1
        pg.click('#svPlay'); pg.wait_for_timeout(1000)
        warm=0
        for k in range(12):
            if pg.locator('#cardFront .warmtag').count():
                warm+=1
                if lang=='en' and warm==1: pg.wait_for_timeout(2000); pg.screenshot(path=S+'warmup_card_mobile.png'); 
            if k==2 and lang=='en': pg.wait_for_timeout(2000); pg.screenshot(path=S+'stop_button_mobile.png')
            pg.click('#skipBtn'); pg.wait_for_timeout(450)
            if pg.locator('#v-end.active').count(): break
        print(lang,'warm-up cards seen',warm,'deck end',pg.locator('#v-end.active').count())
        # stop button
        pg.click('#again'); pg.wait_for_timeout(900); pg.click('#stopBtn'); pg.wait_for_timeout(400)
        assert pg.locator('#v-end.active').count()==1
        print(lang,'stop end:',pg.inner_text('#v-end').replace('\n',' | '))
        if lang=='en': pg.screenshot(path=S+'stop_end_mobile.png')
        txt=pg.inner_text('body').lower(); assert 'alcohol' not in txt and 'алкогол' not in txt
        c.close()
    b.close()
print('ERRORS',errs)
