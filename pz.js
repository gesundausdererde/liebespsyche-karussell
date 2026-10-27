window.pz = { RAW:'https://raw.githubusercontent.com/gesundausdererde/liebespsyche-karussell/'+(window.LPSHA||'main')+'/', out:(window.pz&&window.pz.out)||{}, posted:(window.pz&&window.pz.posted)||{}, log:[], running:false, plan:null,
 sleep(ms){return new Promise(r=>setTimeout(r,ms))},
 async loadPlan(){this.plan=await (await fetch(this.RAW+'plan.json')).json(); return Object.keys(this.plan).length},
 async up(date,i){let b=null; for(let k=0;k<4;k++){ try{ const r=await fetch(this.RAW+'tt/'+date+'_'+i+'.jpg'); if(r.ok){ b=await r.blob(); break; } }catch(e){} await this.sleep(3000); }
   if(!b||b.size<20000) throw 'bild '+date+'_'+i;
   const fd=new FormData(); fd.append('file',new File([b],'lpk_'+date+'_'+i+'.jpg',{type:'image/jpeg'}));
   const r=await fetch('https://api.postiz.com/media/upload-simple',{method:'POST',body:fd,credentials:'include'}); if(r.status>=300) throw 'upload '+r.status; return (await r.json()).path;},
 html(t){const e=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); return t.split('\n').filter(l=>l.trim()).map(l=>'<p>'+e(l)+'</p>').join('');},
 rid(){return Math.random().toString(36).slice(2,12)},
 async post(date){ const d=this.plan[date], P=this.out[date]; if(!d||!P||P.length!==5) throw 'daten fehlen '+date;
   const iso=new Date(date+'T07:30:00').toISOString();
   const body={type:'schedule',shortLink:false,date:iso,tags:[],posts:[{integration:{id:'cmvpl26uj6ejypi1c96rwj863'},value:[{content:this.html(d.tt),id:this.rid(),image:P.map(p=>({id:this.rid(),path:p}))}],
     settings:{__type:'tiktok-business',title:d.tt_title.slice(0,90),privacy_level:'PUBLIC_TO_EVERYONE',duet:false,stitch:false,comment:true,autoAddMusic:'yes',brand_content_toggle:false,brand_organic_toggle:false,content_posting_method:'DIRECT_POST'}}]};
   const r=await fetch('https://api.postiz.com/posts',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
   if(r.status>=300) throw 'post '+r.status+' '+(await r.text()).slice(0,100); const j=await r.json(); this.posted[date]=j[0].postId; return j[0].postId;},
 async run(dates,doPost=true){this.running=true; for(const d of dates){ try{ if(!this.out[d]){const p=[];for(let i=1;i<=5;i++){p.push(await this.up(d,i));} this.out[d]=p;}
     if(doPost && !this.posted[d]) await this.post(d); }catch(e){this.log.push([d,String(e)]); await this.sleep(3000);} } this.running=false; return 'fertig';}
};
'pz ok'
