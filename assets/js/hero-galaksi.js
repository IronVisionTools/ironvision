/* [CILA 07.10: SAHNE bolumu elle yeniden yazildi; hero-galaksi-sync.py ile ezilmemeli]
   hero-galaksi.js — "sonsuz goz" hero sahnesi (IRON VISION, 03.10.2026)
   YAPI: [SAHNE] prototipten BIREBIR kopyalanan blok + [MOTOR] siteye ozel kapsayici/performans kodu.
   Prototip yenilenince SADECE sahne blogu degisir:
     python3 ~/vyron/wt/hero-galaksi-sync.py   (sablon + prototip -> assets/js/hero-galaksi.js)
   Kaynak prototip: /home/erdemirigiz/vyron/site-fabrikasi-onizleme/hero-uzay-2026-10-03/sonsuz-goz.html  (degistirilme: 2026-10-03 21:22:12 TR (UTC+3))
   Sahne sozlesmesi: window.HERO_SCENE={init(E),step(dt,t),draw(ctx,E,t)}; E={W,H,dpr,mobile,cx,cy,R,N,put,gauss,PAL,...} */
(function(){
'use strict';
/* ====== SAHNE BASLA (cila turu 07.10.2026: yildiz akisi -> parcaciklardan goz) ====== */
window.HERO_STILL={t:11,steps:0};window.HERO_ADAPT=true;
window.HERO_SCENE=(function(){
const TAU=Math.PI*2,RP=.28,SPK=84,LA=1.5,V0K=1.5,TAUV=2.3,V1K=.014;
function sm(x){x=x<0?0:x>1?1:x;return x*x*(3-2*x)}
function eo(x){x=x<0?0:x>1?1:x;return 1-Math.pow(1-x,3)}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
let E,P=[],NA=0,qs=0;
/* tur: 0 ambiyans, 1 iris, 2 kapak(metal), 3 halka */
function S(t){return E.W*(V0K*TAUV*(1-Math.exp(-t/TAUV))+V1K*t)}
function V(t){return E.W*(V0K*Math.exp(-t/TAUV)+V1K)}
function mk(kind,g,s,a,tx,ty,tc,dur){
 const d=.25+Math.random()*.75,sy=Math.random()*E.H,sx=Math.random()*E.W;
 P.push({kind,g,s,a,tx,ty,tc,dur,d,sy,x0:sx+S(tc)*d,ph:Math.random()*TAU,k:1+Math.floor(Math.random()*3),sw:(Math.random()<.5?-1:1)*(30+Math.random()*90),hue:Math.random()})
}
function init(e){
 E=e;P=[];const N=e.N;
 /* ambiyans: tum hero'yu kaplayan, hic toplanmayan yildiz akisi */
 NA=Math.round(N*.4);
 for(let i=0;i<NA;i++){const sy=Math.random()*e.H,sx=Math.random()*e.W,d=.12+Math.random()*.88,m=Math.random();
  P.push({kind:0,g:m<.5?pick([0,1,2]):m<.8?pick([5,3,8]):pick([6,10]),s:Math.random()<.05?2.5:.9+Math.random()*.9,a:.3+Math.random()*.6,tc:1e9,dur:1,d,sy,x0:sx,ph:Math.random()*TAU,k:1+Math.floor(Math.random()*3),sw:0,hue:Math.random(),tx:0,ty:0})}
 /* iris parcaciklari: logodaki goz iris/foton halkasi (onceki form korunur) */
 const NI=Math.round(N*.5);
 for(let i=0;i<NI;i++){
  const u=Math.random();let r,g,s,a,sp=0;
  if(u<.1){r=1+e.gauss()*.009;g=pick([10,10,0,12]);s=1.2+Math.random()*.6;a=.95}
  else if(u<.15){r=RP+.025+e.gauss()*.006;g=pick([10,0,10]);s=1.1+Math.random()*.5;a=.95}
  else if(u<.2){r=.62+e.gauss()*.018;g=pick([10,8,1]);s=1.1+Math.random()*.5;a=.6}
  else{const v=Math.pow(Math.random(),.8);r=RP+.05+(1-RP-.07)*v;const rn=(r-RP)/(1-RP);sp=1;
   g=rn<.3?pick([9,9,8,9]):rn<.65?pick([8,8,8,9,10]):pick([10,10,8,0]);s=Math.random()<.04?2.5:1+Math.random()*.8;a=.5+Math.random()*.5}
  let ar=Math.random()*TAU;if(sp)ar=Math.round(ar/TAU*SPK)/SPK*TAU+e.gauss()*.0065;
  /* once dis halka, sonra iceri: gozun akistan dogusu merkezden disa */
  const tc=2.4+(1-r)*1.2+Math.random()*2.3;
  mk(1,g,s,a,Math.cos(ar)*r,Math.sin(ar)*r,tc,1.9+Math.random()*1.6);
 }
 /* goz kapagi: gri metalik noktaciklar toplanip cerceveyi olusturur */
 const nl=Math.round(N*.4);
 for(let i=0;i<nl;i++){
  const kind=i<nl*.45?0:i<nl*.8?1:2;
  const sg=(Math.random()*2-1);const sa=Math.sign(sg)*Math.pow(Math.abs(sg),1.15);
  const ex=Math.abs(sa),sh=1-Math.pow(ex,1.8);
  let x=sa*LA,y=(kind===1?1.05:1.18)*sh*(kind===1?1:-1);
  if(kind===2){x*=1.05;y=-1.18*1.14*sh}
  const jn=e.gauss()*.011;
  mk(2,pick(kind===2?[11,11,14]:[12,13,14,13,11,12]),kind===2?.9+Math.random()*.4:1+Math.random()*.7,(kind===2?.55:.95)*(.45+.55*sh)+.1,x+jn*.4,y+jn,3.6+Math.random()*3.2,2+Math.random()*1.8);
 }
 P.sort((a,b)=>a.g-b.g);
}
function step(){}
function draw(ctx,E,t){
 const R=E.R,cx=E.cx,cy=E.cy,W=E.W,H=E.H;
 const zoom=1+1.15*sm((t-11.5)/9),M=R*zoom*(1+.014*Math.sin(t*.9));
 const v=V(t),St=S(t);
 ctx.globalCompositeOperation='lighter';
 /* hizli akis cizgileri: yalniz ilk saniyelerde, parlak parcaciklar sola dogru uzar */
 const sk=Math.min(1,v/(W*.35));
 if(sk>.03){ctx.lineWidth=1;ctx.strokeStyle='rgba(190,215,255,1)';
  for(let pass=0;pass<2;pass++){ctx.globalAlpha=(pass?.22:.5)*sk;ctx.beginPath();
   for(let i=0;i<P.length;i+=3){const p=P[i];if(p.kind&&t>p.tc)continue;if((i%2)!==pass)continue;
    let x=p.x0-St*p.d;if(p.kind===0||t<p.tc)x=((x%W)+W)%W;
    const L=Math.min(v*p.d*.05,170);if(L<4||x<-10||x>W+L)continue;
    ctx.moveTo(x,p.sy);ctx.lineTo(x+L,p.sy)}
   ctx.stroke()}}
 /* iris dolgusu + goz bebegi: parcaciklar yerlesince yavasca belirir (cat diye cikmaz) */
 const fi=sm((t-5.4)/3.2),fp=sm((t-6.2)/2.6),fl=sm((t-8)/2.2);
 if(fi>.003&&M<9000){ctx.save();ctx.translate(cx,cy);
  const ig=ctx.createRadialGradient(0,0,M*RP*.9,0,0,M*1.05);
  ig.addColorStop(0,`rgba(1,56,186,${.42*fi})`);ig.addColorStop(.4,`rgba(2,84,240,${.28*fi})`);ig.addColorStop(.8,`rgba(10,147,253,${.16*fi})`);ig.addColorStop(.93,`rgba(10,147,253,${.3*fi})`);ig.addColorStop(1,'rgba(10,147,253,0)');
  ctx.globalAlpha=1;ctx.fillStyle=ig;ctx.beginPath();ctx.arc(0,0,M*1.05,0,TAU);ctx.fill();ctx.restore()}
 /* parcaciklar */
 const eyeMetal=fl;
 for(const p of P){
  let x,y,a=p.a,sz=p.s;
  if(p.kind===0){x=((p.x0-St*p.d)%W+W)%W;y=p.sy;a*=.75+.25*Math.sin(t*.5*p.k+p.ph);sz*=.7+.5*p.d;
   const mx=x<W*.45?1:1;x+=0*mx}
  else{
   const e=eo((t-p.tc)/p.dur);
   let fx=p.x0-St*p.d;if(t<p.tc)fx=((fx%W)+W)%W;
   const fy=p.sy,gx=cx+M*p.tx,gy=cy+M*p.ty;
   if(e<=0){x=fx;y=fy;a*=.5;sz*=.7+.5*p.d}
   else{const sw=Math.sin(Math.PI*e)*p.sw,dx=gx-fx,dy=gy-fy,dl=Math.hypot(dx,dy)||1;
    x=fx+(gx-fx)*e+(-dy/dl)*sw;y=fy+(gy-fy)*e+(dx/dl)*sw;a*=.5+.5*e;sz*=(.7+.5*p.d)*(1-e)+e}
   if(p.kind===2&&e>.95){const bd=Math.exp(-Math.pow(p.tx*.75-(((t*.32)%5)-2),2)*5);a*=.72+.5*bd*eyeMetal;if(bd>.5&&p.g!==14)p.g=p.g}
   if(p.kind===1&&e>.95)a*=.85+.15*Math.sin(t*p.k+p.ph)}
  if(x<-20||x>W+20||y<-20||y>H+20)continue;
  E.putB(x,y,sz,a,p.g);
 }
 E.flush();
 /* goz bebegi (parcaciklarin ustunde, opak karanlik) + foton halkasi + goz isigi */
 if(fp>.003&&M<9000){ctx.save();ctx.translate(cx,cy);const rp=M*RP;
  const pg=ctx.createRadialGradient(0,0,0,0,0,rp);pg.addColorStop(0,'rgba(0,0,0,1)');pg.addColorStop(.88,'rgba(0,0,0,1)');pg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=fp;ctx.fillStyle=pg;ctx.beginPath();ctx.arc(0,0,rp,0,TAU);ctx.fill();ctx.globalCompositeOperation='lighter';
  const ra=M*(RP+.03),ga=ctx.createRadialGradient(0,0,Math.max(0,ra-M*.03),0,0,ra+M*.05);
  ga.addColorStop(0,'rgba(10,147,253,0)');ga.addColorStop(.42,`rgba(10,147,253,${.26*fp})`);ga.addColorStop(1,'rgba(2,84,240,0)');
  ctx.globalAlpha=1;ctx.fillStyle=ga;ctx.beginPath();ctx.arc(0,0,ra+M*.05,0,TAU);ctx.fill();
  ctx.strokeStyle=`rgba(120,190,255,${.4*fp})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,ra*.99,0,TAU);ctx.stroke();
  if(fl>.01){const c1=M*.09,g1=ctx.createRadialGradient(-M*.085,-M*.095,0,-M*.085,-M*.095,c1);
   g1.addColorStop(0,`rgba(240,248,255,${fl})`);g1.addColorStop(.4,`rgba(150,200,255,${.55*fl})`);g1.addColorStop(1,'rgba(10,147,253,0)');
   ctx.translate(-M*.085,-M*.095);ctx.fillStyle=g1;ctx.beginPath();ctx.arc(0,0,c1,0,TAU);ctx.fill()}
  ctx.restore()}
 E.flush();
}
return{init,step,draw};
})();
/* ====== SAHNE BITIS ====== */

/* ====== MOTOR (siteye ozel) ====== */
const hero=document.querySelector('.hero'),box=hero&&hero.querySelector('.hero-sahne');
if(!hero||!box)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,FORCE=new URLSearchParams(location.search).get('zorla')==='1';
const cv=document.createElement('canvas');cv.className='hero-galaksi';cv.setAttribute('aria-hidden','true');
const ctx=cv.getContext('2d');if(!ctx)return;
const PAL=[[232,243,255],[150,190,235],[74,125,190],[34,76,168],[20,44,120],[140,150,165],[255,238,200],[40,110,235],[2,84,240],[1,56,186],[10,147,253],[93,99,110],[156,159,168],[206,212,224],[120,128,142]];
const SPR=PAL.map(c=>{const s=document.createElement('canvas');s.width=s.height=32;const g=s.getContext('2d');
 const r=g.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,`rgba(${c},1)`);r.addColorStop(.25,`rgba(${c},.45)`);r.addColorStop(1,`rgba(${c},0)`);g.fillStyle=r;g.fillRect(0,0,32,32);return s;});
const FILL=PAL.map(c=>`rgb(${c})`);
const E={W:0,H:0,dpr:1,mobile:false,cx:0,cy:0,R:0,N:0,mx:0,my:0,PAL};
let level=0,acc=0,cnt=0,smx=0,smy=0,stars=[],shoot=null,nextShoot=0,scene=null,raf=0,last=0,t=0,lastG=-1,inView=true,started=false;
function rng(a,b){return a+Math.random()*(b-a)}
function gauss(){let u=0;for(let i=0;i<4;i++)u+=Math.random();return (u-2)/0.577}
E.rng=rng;E.gauss=gauss;
E.put=function(x,y,s,a,g){
 if(a<=0.01)return;ctx.globalAlpha=a>1?1:a;
 if(s>=2.4){const d=s*3;ctx.drawImage(SPR[g],x-d/2,y-d/2,d,d);return;}
 if(g!==lastG){ctx.fillStyle=FILL[g];lastG=g}
 ctx.fillRect(x-s/2,y-s/2,s,s);
};
/* toplu cizim (prototipteki putB/flush): sahne E.putB ile biriktirir, E.flush() ile tek yolda basar; diziler tembel ayrilir */
const NB=6,NS=3,BX=[],BY=[],BC=[],SZ=[1.05,1.6,2.1];
for(let i=0;i<PAL.length*NB*NS;i++){BX.push(null);BY.push(null);BC.push(0)}
E.putB=function(x,y,s,a,g){
 if(a<.02||s<.3)return;
 if(s>=2.4){E.put(x,y,s,a,g);return}
 let ab=(a*NB)|0;if(ab>=NB)ab=NB-1;const sb=s<1.25?0:s<1.85?1:2,k=(g*NB+ab)*NS+sb,n=BC[k];
 if(n>=16384)return;
 if(!BX[k]){BX[k]=new Float32Array(16384);BY[k]=new Float32Array(16384)}
 BX[k][n]=x;BY[k][n]=y;BC[k]=n+1;
};
E.flush=function(){
 const nk=BC.length;
 for(let k=0;k<nk;k++){const n=BC[k];if(!n)continue;BC[k]=0;
  const sb=k%NS,ab=((k/NS)|0)%NB,g=(k/(NS*NB))|0,sz=SZ[sb],h=sz/2,X=BX[k],Y=BY[k];
  ctx.globalAlpha=(ab+.5)/NB;ctx.fillStyle=FILL[g];ctx.beginPath();
  for(let i=0;i<n;i++)ctx.rect(X[i]-h,Y[i]-h,sz,sz);ctx.fill()}
 lastG=-1;
};
function geometry(){
 const r=box.getBoundingClientRect();
 E.W=Math.max(1,Math.round(r.width));E.H=Math.max(1,Math.round(r.height));
 E.dpr=level?1:Math.min(window.devicePixelRatio||1,2);
 cv.width=Math.round(E.W*E.dpr);cv.height=Math.round(E.H*E.dpr);
 /* sag-orta agirlikli; mobilde basligin arkasinda (ust yarida) */
 E.cx=E.mobile?E.W*.66:E.W*.76;E.cy=E.mobile?E.H*.22:E.H*.45;
 E.R=E.mobile?Math.min(E.W*.34,E.H*.2):Math.min(E.H*.4,E.W*.24)*.85;
}
function build(){
 E.mobile=innerWidth<768;
 E.N=(E.mobile?2800:5600)>>level; /* mobilde parcacik yarisi; yavas cihazda bir kademe daha */
 stars=[];const n=[0,0];
 for(let l=0;l<2;l++)for(let i=0;i<n[l];i++)stars.push({l,x:Math.random(),y:Math.random(),s:l?rng(1,1.5):rng(.6,.9),a:l?rng(.35,.7):rng(.2,.45),g:[0,0,1,5,2][Math.floor(Math.random()*5)],p:rng(0,6.28),f:rng(.2,.6)});
 geometry();scene=window.HERO_SCENE;scene.init(E);
}
addEventListener('mousemove',e=>{if(inView){E.mx=e.clientX/innerWidth-.5;E.my=e.clientY/innerHeight-.5}},{passive:true});
function drawStars(tt){
 ctx.globalCompositeOperation='lighter';
 for(const s of stars){
  const k=s.l?14:5;const x=s.x*E.W-smx*k,y=s.y*E.H-smy*k;
  E.put(x,y,s.s,s.a*(.8+.2*Math.sin(tt*s.f+s.p)),s.g);
 }
}
function drawShoot(dt,tt){
 if(!shoot&&tt>nextShoot){const a=rng(.3,.5);shoot={x:rng(.45,1)*E.W,y:rng(0,.35)*E.H,vx:-Math.cos(a)*E.W*.75,vy:Math.sin(a)*E.W*.75,age:0,life:.75};}
 if(!shoot)return;shoot.age+=dt;const k=shoot.age/shoot.life;
 if(k>=1){shoot=null;nextShoot=tt+rng(8,15);return}
 const x=shoot.x+shoot.vx*shoot.age,y=shoot.y+shoot.vy*shoot.age;const tl=.09;
 const al=Math.sin(Math.PI*k)*.7;
 const g=ctx.createLinearGradient(x,y,x-shoot.vx*tl,y-shoot.vy*tl);
 g.addColorStop(0,`rgba(225,240,255,${al})`);g.addColorStop(1,'rgba(225,240,255,0)');
 ctx.globalAlpha=1;ctx.strokeStyle=g;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-shoot.vx*tl,y-shoot.vy*tl);ctx.stroke();
}
/* ana cizim + guncelleme: prototipteki render/loop ile ayni akis; zemin saydam (nebula gorunsun) */
function render(dt,tt,still){
 ctx.setTransform(E.dpr,0,0,E.dpr,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.clearRect(0,0,E.W,E.H);
 lastG=-1;smx+=(E.mx-smx)*Math.min(1,dt*3);smy+=(E.my-smy)*Math.min(1,dt*3);
 drawStars(tt);
 ctx.save();ctx.translate(-smx*10,-smy*8);scene.draw(ctx,E,tt);ctx.restore();lastG=-1;
 ctx.globalCompositeOperation='lighter';
 if(!still)drawShoot(dt,tt);
}
function renderStill(){const s=window.HERO_STILL||{};for(let i=0;i<(s.steps||0);i++)scene.step(1/60,i/60);render(0,s.t||6,true)}
function loop(ts){
 raf=requestAnimationFrame(loop);
 if(!last){last=ts;return}
 let dt=(ts-last)/1000;last=ts;const raw=dt;if(dt>.05)dt=.05;
 t+=dt;const c0=performance.now();scene.step(dt,t);render(dt,t,false);
 /* uyarlanir: 3 karelik ortalama (cizim ms ya da kare araligi) >32ms ise once sadelestir (dpr 1, yari parcacik), cok ya da yine yavassa sabit goz karesine don */
 const ms=performance.now()-c0;window.__heroMs=(window.__heroMs||ms)*.92+ms*.08;if(FORCE)return;
 acc+=Math.max(ms,Math.min(raw,.3)*1000*.7);
 if(++cnt===3){const av=acc/cnt;acc=cnt=0;
  if(av>32){halt();if(level<1&&av<70){level=1;build();run()}else{level=2;t=.001;scene.init(E);renderStill()}}}
}
window.__heroSeek=function(tt){window.__heroSeekOn=1;halt();t=tt;render(.016,tt,true)};
function run(){if(window.__heroSeekOn||reduce||raf||document.hidden||!inView)return;last=0;raf=requestAnimationFrame(loop)}
function halt(){if(raf){cancelAnimationFrame(raf);raf=0}}
function start(){
 if(started)return;started=true;
 box.insertBefore(cv,box.querySelector('.hero-golge'));
 build();
 if(reduce)renderStill();
 else{
  /* tek kare olcumu: sabit goz karesini ciz, rasteri zorla, sureye gore baslangic kademesi sec (>25ms sade, >60ms sabit kal) */
  const p0=performance.now();renderStill();try{ctx.getImageData(0,0,1,1)}catch(e){}
  const pc=performance.now()-p0;
  if(FORCE){}
  else if(pc>25&&pc<=60){level=1;build();renderStill()}
  else if(pc>60){level=2}
  nextShoot=rng(3,6);
  document.addEventListener('visibilitychange',()=>{document.hidden?halt():run()});
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{inView=es[0].isIntersecting;inView?run():halt()},{threshold:0}).observe(hero);
  if(level<2)run()}
 requestAnimationFrame(()=>box.classList.add('hazir'));
 let rt=0,pw=innerWidth;
 addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{
  const wasM=E.mobile;E.mobile=innerWidth<768;
  if(wasM!==E.mobile||innerWidth!==pw){pw=innerWidth;build()}else geometry();
  if(reduce)renderStill()},150)});
}
/* sayfa yuklendikten sonra, bosta: LCP (h1) ve GSAP girisi etkilenmez */
function ready(){
 const go=()=>{
  if(innerWidth<768){ /* mobil: load + 2.5 sn ya da ilk scroll/dokunma, hangisi once */
   let done=false;const fire=()=>{if(done)return;done=true;['scroll','touchstart','pointerdown'].forEach(n=>removeEventListener(n,fire));start()};
   ['scroll','touchstart','pointerdown'].forEach(n=>addEventListener(n,fire,{passive:true,once:true}));setTimeout(fire,2500);return}
  setTimeout(()=>('requestIdleCallback' in window)?requestIdleCallback(start,{timeout:2000}):start(),400)};
 document.readyState==='complete'?go():addEventListener('load',go,{once:true})}
ready();
})();
