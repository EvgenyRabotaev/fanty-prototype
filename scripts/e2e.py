import sys
from playwright.sync_api import sync_playwright
base=sys.argv[1].rstrip('/'); tag=sys.argv[2]; S='/workspace/fanty/shots/en_primary_'
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    def ctx(w,h,mobile=False):
        c=b.new_context(viewport={'width':w,'height':h},is_mobile=mobile,device_scale_factor=1,locale='en-US')
        c.add_init_script("localStorage.setItem('adult','1')")
        pg=c.new_page()
        pg.on('console',lambda m: errs.append((tag,m.type,m.text)) if m.type in('error','warning') else None)
        pg.on('pageerror',lambda e: errs.append((tag,'pageerror',str(e))))
        pg.on('requestfailed',lambda r: errs.append((tag,'reqfail',r.url)))
        pg.on('response',lambda r: errs.append((tag,'http%d'%r.status,r.url)) if r.status>=400 else None)
        return pg
    for w,h,m,n in((1440,900,False,'desktop'),(390,844,True,'mobile')):
        pg=ctx(w,h,m)
        pg.goto(base+'/ru/'); pg.wait_for_timeout(1200); pg.screenshot(path=f'{S}{tag}_ru_home_{n}.png'); print(tag,n,'RU h1:',pg.inner_text('h1').replace('\n',' '),'| lang',pg.get_attribute('html','lang'))
        if n=='mobile':
            pg.locator('#examples').scroll_into_view_if_needed(); pg.wait_for_timeout(500); pg.screenshot(path=f'{S}{tag}_carousel_mobile.png')
        pg.goto(base+'/'); pg.wait_for_timeout(1200); pg.screenshot(path=f'{S}{tag}_en_home_{n}.png')
        print(tag,n,'EN h1:',pg.inner_text('h1').replace('\n',' '),'| lang',pg.get_attribute('html','lang'),'| title',pg.title())
        pg.close()
    pg=ctx(390,844,True); pg.goto(base+'/'); pg.wait_for_timeout(800)
    pg.click('.navplay'); pg.wait_for_timeout(300); pg.click('#levels [data-b="single"][data-l="0"]'); pg.wait_for_timeout(300)
    pg.fill('#n1','Аня'); pg.fill('#n2','Макс'); pg.click('#card'); pg.wait_for_timeout(900)
    pg.screenshot(path=f'{S}{tag}_game_mobile.png')
    seen=[]
    for i in range(30):
        if pg.locator('#v-end.active').count(): break
        seen.append(pg.inner_text('#cardFront .txt')[:30]); 
        pg.click('#likeBtn' if i==0 else '#skipBtn' if i==1 else '#doneBtn'); pg.wait_for_timeout(450)
        pg.click('#doneBtn') if False else None
    print(tag,'cards drawn',len(seen),'end reached',pg.locator('#v-end.active').count()==1, 'liked in end:',pg.locator('#likedList .mini').count())
    pg.screenshot(path=f'{S}{tag}_end_mobile.png')
    pg.goto(base+'/#survey'); pg.wait_for_timeout(600); print(tag,'survey view',pg.locator('#v-survey.active').count(), pg.locator('#survey > *').count())
    pg.goto(base+'/#gallery'); pg.wait_for_timeout(600); print(tag,'gallery cards',pg.locator('#grid > *').count())
    # lang switch
    pg.goto(base+'/'); pg.wait_for_timeout(500); pg.click('#langBtn'); pg.wait_for_timeout(1000); print(tag,'switched url',pg.url,'lang',pg.get_attribute('html','lang')); pg.click('#langBtn'); pg.wait_for_timeout(1000); print(tag,'back url',pg.url,'lang',pg.get_attribute('html','lang'))
    pg.goto(base+'/en/#levels'); pg.wait_for_timeout(1500); print(tag,'/en/ redirect ->',pg.url)
    b.close()
print(tag,'ERRORS',errs)
