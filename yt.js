window.lp = {
 RAW:'https://raw.githubusercontent.com/gesundausdererde/liebespsyche-karussell/'+(window.LPSHA||'main')+'/',
 log:[], plan:null,
 sleep(ms){return new Promise(r=>setTimeout(r,ms))},
 norm(s){return (s||'').replace(/[\s  ]+/g,' ').trim()},
 box(){return document.querySelector('ytd-backstage-post-dialog-renderer')},
 btns(){return [...this.box().querySelectorAll('button,[role=button]')].filter(b=>b.offsetParent)},
 btn(label){return this.btns().find(b=>this.norm(b.getAttribute('aria-label')||b.innerText)===label)},
 async loadPlan(){this.plan=await (await fetch(this.RAW+'plan.json?v='+Date.now())).json(); return Object.keys(this.plan).length},
 async waitFor(fn,ms=15000){const t=Date.now();while(Date.now()-t<ms){const v=fn();if(v)return v;await this.sleep(300)}return null},
 async open(){const pa=this.box().querySelector('#placeholder-area'); if(pa && pa.offsetParent){pa.click(); await this.sleep(800);} const ed=this.box().querySelector('#contenteditable-root'); ed.click(); ed.focus(); await this.sleep(300); return ed;},
 async setText(t){const ed=await this.open(); const r=document.createRange(); r.selectNodeContents(ed); const s=getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('insertText',false,t); await this.sleep(400); return this.norm(ed.innerText).length;},
 async addImgs(date){ this.btn('Bild hinzufügen')?.click(); await this.sleep(1200);
   const files=[]; for(let i=1;i<=5;i++){let r=null; for(let k=0;k<4;k++){ try{ r=await fetch(this.RAW+'yt/'+date+'_'+i+'.jpg'); if(r.ok) break; }catch(e){} await this.sleep(3000); } if(!r||!r.ok) throw 'fetch '+i; const b=await r.blob(); files.push(new File([b],date+'_'+i+'.jpg',{type:'image/jpeg'}));}
   const inp=[...this.box().querySelectorAll('input[type=file]')].find(i=>i.multiple); const dt=new DataTransfer(); files.forEach(f=>dt.items.add(f)); inp.files=dt.files; inp.dispatchEvent(new Event('change',{bubbles:true}));
   await this.sleep(6000); return files.length;},
 picker(){return this.box().querySelector('ytd-date-time-picker-renderer')},
 async openMenu(){ for(let i=0;i<30 && !this.menuItem();i++){ const a=this.btns().filter(b=>this.norm(b.getAttribute('aria-label'))==='Aktionsmenü').pop(); a.scrollIntoView({block:'center'}); await this.sleep(300);
   if(i%2==0){ a.click(); } else { const r=a.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2, o={bubbles:true,cancelable:true,clientX:x,clientY:y,view:window}; const t=document.elementFromPoint(x,y)||a; ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(ev=>t.dispatchEvent(new (ev.startsWith('pointer')?PointerEvent:MouseEvent)(ev,o))); }
   for(let k=0;k<8 && !this.menuItem();k++) await this.sleep(250); } this.menuTries=(this.menuTries||0); return !!this.menuItem(); },
 menuItem(){return [...document.querySelectorAll('ytd-menu-service-item-renderer')].filter(e=>e.offsetParent && this.norm(e.innerText)==='Beitrag planen')[0]},
 async setSchedule(dateLabel,timeLabel){
  await this.openMenu();
  const it=this.menuItem(); if(!it) throw 'Menü fehlt'; it.click(); await this.sleep(1200);
  const p=this.picker(); if(!p) throw 'Picker fehlt';
  p.querySelector('#date-picker').click(); await this.sleep(700);
  const inp=[...document.querySelectorAll('ytd-calendar-date-picker input#textbox, tp-yt-paper-dialog input')].filter(i=>i.offsetParent)[0] || p.querySelector('input');
  inp.focus(); inp.value=dateLabel; inp.dispatchEvent(new Event('input',{bubbles:true})); inp.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',keyCode:13,bubbles:true})); inp.dispatchEvent(new Event('change',{bubbles:true})); await this.sleep(700);
  p.querySelector('#time-picker').click(); await this.sleep(700);
  const item=[...p.querySelectorAll('tp-yt-paper-item')].find(i=>this.norm(i.innerText)===timeLabel); if(!item) throw 'Zeit-Item fehlt'; item.click(); await this.sleep(700);
  return [this.norm(p.querySelector('#date-picker').innerText), this.norm(p.querySelector('#time-picker').innerText)];},
 async doDay(date,now=false){
   const d=this.plan[date]; if(!d) throw 'kein Plan '+date;
   const n=await this.setText(d.yt); if(n<50) throw 'Text fehlt '+n;
   await this.addImgs(date);
   const thumbs=this.box().querySelectorAll('#dropzone ~ * img, img').length;
   if(now){ const b=this.btns().find(b=>this.norm(b.innerText)==='Posten'); b.click(); }
   else { const s=await this.setSchedule(d.label,'7:30 AM'); if(s[0]!==d.label||s[1]!=='7:30 AM') throw 'Zeit falsch '+s;
     const b=this.btn('Veröffentlichungszeitpunkt festlegen'); b.click(); }
   await this.sleep(6000);
   const toast=this.norm([...document.querySelectorAll('tp-yt-paper-toast, yt-notification-action-renderer')].map(t=>t.innerText).join(' | '));
   const ed=this.box().querySelector('#contenteditable-root');
   const ok=this.norm(ed.innerText).length<5;
   this.log.push([date,ok,toast.slice(0,80)]); return [date,ok,toast.slice(0,120)];},
 running:false,
 async discard(){ const b=this.btns().filter(b=>this.norm(b.innerText)==='Abbrechen').pop(); if(b){b.click(); await this.sleep(2000);} },
 async run(dates){this.running=true; for(const dt of dates){ if(!this.running) break; let done=false;
   for(let at=0; at<3 && !done; at++){ try{ const r=await this.doDay(dt); done=r[1]===true; if(!done) throw 'nicht leer'; }catch(e){ this.log.push([dt,'ERR',String(e)]); await this.discard(); await this.sleep(4000);} }
   if(!done){ this.running=false; break; } await this.sleep(2000);} this.running=false; return 'fertig';}
};
'lp ok'
