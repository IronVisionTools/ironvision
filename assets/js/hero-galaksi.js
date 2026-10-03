/* hero-galaksi.js — "sonsuz goz" hero sahnesi (IRON VISION, 03.10.2026)
   YAPI: [SAHNE] prototipten BIREBIR kopyalanan blok + [MOTOR] siteye ozel kapsayici/performans kodu.
   Prototip yenilenince SADECE sahne blogu degisir:
     python3 ~/vyron/wt/hero-galaksi-sync.py   (sablon + prototip -> assets/js/hero-galaksi.js)
   Kaynak prototip: /home/erdemirigiz/vyron/site-fabrikasi-onizleme/hero-uzay-2026-10-03/sonsuz-goz.html  (degistirilme: 2026-10-03 21:22:12 TR (UTC+3))
   Sahne sozlesmesi: window.HERO_SCENE={init(E),step(dt,t),draw(ctx,E,t)}; E={W,H,dpr,mobile,cx,cy,R,N,put,gauss,PAL,...} */
(function(){
'use strict';
/* ====== SAHNE BASLA (prototipten birebir; elle DUZENLEME) ====== */
window.HERO_STILL={t:.001,steps:0};window.HERO_ADAPT=true;
window.HERO_SCENE=(function(){
const TAU=Math.PI*2,T=15,Q=new URLSearchParams(location.search),SCROLL=Q.get('scroll')==='1',FV=Q.get('v'),QF=5,RP=.28,SPK=84,LA=1.5;
function sm(x){x=x<0?0:x>1?1:x;return x*x*(3-2*x)}
function eo(x){x=x<0?0:x>1?1:x;return 1-(1-x)*(1-x)*(1-x)}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
let E,EY=[],GP=[],LID=[],vS=0,lastT=0;
function init(e){
 E=e;EY=[];GP=[];LID=[];
 for(let i=0;i<E.N;i++){
  const u=Math.random();let r,g,s,a,sp=0,ph2=0;
  if(u<.1){r=1+e.gauss()*.009;g=pick([10,10,0,12]);s=1.2+Math.random()*.6;a=.95}
  else if(u<.15){r=RP+.025+e.gauss()*.006;g=pick([10,0,10]);s=1.1+Math.random()*.5;a=.95;ph2=1}
  else if(u<.2){r=.62+e.gauss()*.018;g=pick([10,8,1]);s=1.1+Math.random()*.5;a=.6}
  else{const v=Math.pow(Math.random(),.8);r=RP+.05+(1-RP-.07)*v;const rn=(r-RP)/(1-RP);sp=1;
   g=rn<.3?pick([9,9,8,9]):rn<.65?pick([8,8,8,9,10]):pick([10,10,8,0]);
   s=Math.random()<.04?2.5:1+Math.random()*.8;a=.5+Math.random()*.5}
  const ar=Math.random()*TAU;
  EY.push({r1:r,g,s,a,ph2,ar,as:sp?Math.round(ar/TAU*SPK)/SPK*TAU+e.gauss()*.0065:ar,ph:Math.random()*TAU,k:1+Math.floor(Math.random()*3)});
 }
 EY.sort((a,b)=>a.g-b.g);
 // goz kapagi / badem cercevesi (celik gri parcacik)
 const nl=Math.round(E.N*.3);
 for(let i=0;i<nl;i++){
  const kind=i<nl*.45?0:i<nl*.8?1:2;
  const s=(Math.random()*2-1);const sa=Math.sign(s)*Math.pow(Math.abs(s),1.15);
  const ex=Math.abs(sa);const sh=1-Math.pow(ex,1.8);
  let x=sa*LA,y=(kind===1?1.05:1.18)*sh*(kind===1?1:-1);
  if(kind===2){x*=1.05;y=-1.18*1.14*sh;}
  const jn=e.gauss()*.011;
  LID.push({x:x+jn*.4,y:y+jn,g:pick(kind===2?[11,11,11]:[12,11,11,12,10]),s:kind===2?.9+Math.random()*.4:1+Math.random()*.6,a:(kind===2?.5:.9)*(.4+.6*sh)+.12,ph:Math.random()*TAU,k:1+Math.floor(Math.random()*2)});
 }
 LID.sort((a,b)=>a.g-b.g);
 const SH=[.22,.45,.78,1.2,1.75],SHO=SH.map(()=>[(Math.random()-.5)*.05,(Math.random()-.5)*.04,Math.random()*TAU]);
 for(let i=0;i<E.N*1.8;i++){
  const u=Math.random();let r,th,g,s,a,x0=0,y0=0;
  if(u>.88){r=Math.abs(e.gauss())*.16;th=Math.random()*TAU;g=pick([0,10,10,1,8]);s=Math.random()<.08?2.6:1+Math.random()*.8;a=.9+Math.random()*.3;
   GP.push({r,th,z:5+40*Math.pow(Math.random(),1.2),x0:0,y0:0,g,s,a,w:.012,ph:Math.random()*TAU});continue}
  if(u<.52){const k=Math.floor(Math.random()*5);
   th=Math.random()*TAU; /* spiral kol yok: acisal yogunluk dugun */
   r=SH[k]*(1+e.gauss()*.06+(Math.random()<.2?-Math.log(1-Math.random())*.08:0));x0=SHO[k][0];y0=SHO[k][1];
   g=pick([8,10,10,0,1,9,12,11,10]);s=Math.random()<.06?2.6:1.1+Math.random()*1;a=.95+Math.random()*.3}
  else{r=Math.sqrt(Math.random())*2.1;th=Math.random()*TAU;
   g=pick([9,8,8,11,5,10]);s=Math.random()<.04?2.6:1+Math.random()*.7;a=.6+Math.random()*.4}
  GP.push({r,th,z:1.5+43.5*Math.pow(Math.random(),1.4),x0,y0,g,s,a,w:.012,ph:Math.random()*TAU}); /* tek sabit dusuk acisal hiz: kesme/sarmal yok */
 }
 GP.sort((a,b)=>a.g-b.g);
 if(SCROLL){document.documentElement.style.overflowY='auto';document.body.style.overflowY='auto';
  const d=document.createElement('div');d.style.cssText='height:700vh;pointer-events:none';document.body.appendChild(d)}
}
function step(){}
function getV(t){
 if(FV!==null)return parseFloat(FV);
 if(SCROLL){const m=document.documentElement.scrollHeight-innerHeight,pr=m>0?scrollY/m:0;
  vS+=(pr*2.999-vS)*Math.min(1,(t-lastT)*4);lastT=t;
  const tx=document.querySelector('.txt');if(tx)tx.style.opacity=Math.max(0,1-pr*8);return vS}
 return ((t%T)/T)*3;
}
function disc(ctx,g,rad){ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,rad,0,TAU);ctx.fill()}
function draw(ctx,E,t){
 const v=getV(t),u=v/3,R=E.R,cx=E.cx,cy=E.cy;
 const wG=sm((v-.35)/.45)*(1-sm((v-1.75)/.45));
 let wE,mE,eta,ent,spin,fl,tilt;
 if(v<1){wE=1-sm((v-.35)/.45);mE=Math.pow(QF,v);eta=1;ent=1;spin=0}
 else{wE=sm((v-1.75)/.45);mE=Math.pow(QF,v-3);eta=sm((v-2.2)/.7);ent=eo((v-1.75)/1.1);spin=5*Math.pow(1-eo((v-1.75)/1.25),2)}
 fl=.5+.5*eta;tilt=-.3*(1-eta);
 const mG=2.4*Math.pow(QF,v-.55),br=1+.02*Math.sin(TAU*u*2);
 ctx.globalCompositeOperation='lighter';
 if(wE>.003){
  const ct=Math.cos(tilt),st=Math.sin(tilt),M=mE*R*br;
  // dolu iris diski
  ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt);ctx.scale(1,fl);
  if(M<9000){
   const ig=ctx.createRadialGradient(0,0,M*RP*.9,0,0,M*1.05);
   ig.addColorStop(0,`rgba(1,56,186,${.5*wE})`);ig.addColorStop(.4,`rgba(2,84,240,${.34*wE})`);ig.addColorStop(.8,`rgba(10,147,253,${.2*wE})`);
   ig.addColorStop(.93,`rgba(10,147,253,${.36*wE})`);ig.addColorStop(1,'rgba(10,147,253,0)');
   ctx.globalAlpha=1;disc(ctx,ig,M*1.05);
   const la=.1*wE*eta;
   if(la>.004){ctx.strokeStyle=`rgba(120,185,255,${la})`;ctx.lineWidth=.8;ctx.beginPath();
    for(let k=0;k<SPK;k+=1){const a=k/SPK*TAU+Math.sin(k*3.1)*.004;ctx.moveTo(Math.cos(a)*M*(RP+.03),Math.sin(a)*M*(RP+.03));ctx.lineTo(Math.cos(a)*M*.97,Math.sin(a)*M*.97)}ctx.stroke()}
  }
  if(eta>.01){ctx.strokeStyle=`rgba(120,128,142,${.38*wE*eta})`;ctx.lineWidth=1;
   for(const kd of [0,1,2]){ctx.beginPath();for(let i=0;i<=80;i++){const sa=i/40-1,sh=1-Math.pow(Math.abs(sa),1.8);let x=sa*LA,y=(kd===1?1.05:1.18)*sh*(kd===1?1:-1);if(kd===2){x*=1.05;y=-1.18*1.14*sh;ctx.strokeStyle=`rgba(93,99,110,${.18*wE*eta})`}
    if(i)ctx.lineTo(x*M,y*M);else ctx.moveTo(x*M,y*M)}ctx.stroke()}}
  ctx.restore();
  const sz=Math.min(Math.pow(mE,.45),2.2);
  for(const p of EY){
   const a0=p.ar+eta*(p.as-p.ar)+spin,rr=p.r1*(1+.7*(1-ent));
   const x=Math.cos(a0)*rr,y=Math.sin(a0)*rr*fl;
   const sx=cx+M*(x*ct-y*st),sy=cy+M*(x*st+y*ct);
   if(sx<-40||sx>E.W+40||sy<-40||sy>E.H+40)continue;
   E.putB(sx,sy,p.s*sz,p.a*(.8+.2*Math.sin(TAU*u*p.k+p.ph))*wE,p.g);
  }
  // goz kapagi
  if(eta>.01){const lz=Math.min(Math.pow(mE,.35),1.6);
   for(const p of LID){const x=p.x*(1+(1-eta)*.0),y=p.y*fl;
    const sx=cx+M*(x*ct-y*st),sy=cy+M*(x*st+y*ct);
    if(sx<-40||sx>E.W+40||sy<-40||sy>E.H+40)continue;
    E.putB(sx,sy,p.s*lz,p.a*(.85+.15*Math.sin(TAU*u*p.k+p.ph))*wE*eta,p.g)}}
  E.flush();
  // gozbebegi, foton halkasi, goz isigi
  ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt);ctx.scale(1,fl);
  const rp=M*RP;
  if(rp>.5&&rp<9000){
   const pg=ctx.createRadialGradient(0,0,0,0,0,rp);pg.addColorStop(0,'rgba(0,0,0,1)');pg.addColorStop(.88,'rgba(0,0,0,1)');pg.addColorStop(1,'rgba(0,0,0,0)');
   ctx.globalCompositeOperation='source-over';ctx.globalAlpha=wE;disc(ctx,pg,rp);ctx.globalCompositeOperation='lighter';
   const ra=M*(RP+.03),r0=Math.max(0,ra-M*.03),r1=ra+M*.05,ga=ctx.createRadialGradient(0,0,r0,0,0,r1);
   ga.addColorStop(0,'rgba(10,147,253,0)');ga.addColorStop(.42,`rgba(10,147,253,${.26*wE})`);ga.addColorStop(1,'rgba(2,84,240,0)');
   ctx.globalAlpha=1;disc(ctx,ga,r1);
   ctx.strokeStyle=`rgba(120,190,255,${.4*wE})`;ctx.lineWidth=1/Math.max(.4,fl);ctx.beginPath();ctx.arc(0,0,ra*.99,0,TAU);ctx.stroke();
   // goz isigi
   const ca=wE*eta;
   if(ca>.01){const c1=M*.09,g1=ctx.createRadialGradient(-M*.085,-M*.095,0,-M*.085,-M*.095,c1);
    g1.addColorStop(0,`rgba(240,248,255,${1*ca})`);g1.addColorStop(.4,`rgba(150,200,255,${.55*ca})`);g1.addColorStop(1,'rgba(10,147,253,0)');
    ctx.translate(-M*.085,-M*.095);disc(ctx,g1,c1);ctx.translate(M*.085,M*.095);
    const c2=M*.03,g2=ctx.createRadialGradient(M*.07,M*.09,0,M*.07,M*.09,c2);g2.addColorStop(0,`rgba(180,220,255,${.35*ca})`);g2.addColorStop(1,'rgba(10,147,253,0)');
    ctx.translate(M*.07,M*.09);disc(ctx,g2,c2)}
  }
  ctx.restore();
 }
 E.flush();
 if(wG>.003){
  const cz=9.5*Math.min(Math.max((v-.35)/1.85,0),1);
  /* odaklanma: parcaciklar yaricap yonunde (ease-out, yavaslayarak) disaridan halkaya oturur; acisal iz yok */
  const gp=eo((v-.35)/1.1),rin=1+.9*(1-gp),fo=.5+.5*gp;
  for(const p of GP){
   const zc=p.z-cz;if(zc<.15)continue;
   const l=p.z/zc,k=R*l,a=p.th+p.w*v,sx=cx+(p.x0+Math.cos(a)*p.r*rin)*k,sy=cy+(p.y0+Math.sin(a)*p.r*rin)*k*.96;
   if(sx<-40||sx>E.W+40||sy<-40||sy>E.H+40)continue;
   const fz=Math.min((zc-.15)/.5,1);
   E.putB(sx,sy,p.s*Math.min(Math.max(Math.pow(l,.45),.9),3.2),p.a*fo*(.8+.2*Math.sin(v*5+p.ph))*wG*fz,p.g);
  }
 }
 E.flush();
}
return{init,step,draw};
})();
/* ====== SAHNE BITIS ====== */

/* ====== MOTOR (siteye ozel) ====== */
const hero=document.querySelector('.hero'),box=hero&&hero.querySelector('.hero-sahne');
if(!hero||!box)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv=document.createElement('canvas');cv.className='hero-galaksi';cv.setAttribute('aria-hidden','true');
const ctx=cv.getContext('2d');if(!ctx)return;
const PAL=[[232,243,255],[150,190,235],[74,125,190],[34,76,168],[20,44,120],[140,150,165],[255,238,200],[40,110,235],[2,84,240],[1,56,186],[10,147,253],[93,99,110],[156,159,168]];
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
 E.cx=E.mobile?E.W*.66:E.W*.74;E.cy=E.mobile?E.H*.22:E.H*.45;
 E.R=E.mobile?Math.min(E.W*.34,E.H*.2):Math.min(E.H*.4,E.W*.24)*.85;
}
function build(){
 E.mobile=innerWidth<768;
 E.N=(E.mobile?2800:5600)>>level; /* mobilde parcacik yarisi; yavas cihazda bir kademe daha */
 stars=[];const n=E.mobile?[50,25]:[100,50];
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
 acc+=Math.max(performance.now()-c0,Math.min(raw,.3)*1000*.7);
 if(++cnt===3){const av=acc/cnt;acc=cnt=0;
  if(av>32){halt();if(level<1&&av<70){level=1;build();run()}else{level=2;t=.001;scene.init(E);renderStill()}}}
}
function run(){if(reduce||raf||document.hidden||!inView)return;last=0;raf=requestAnimationFrame(loop)}
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
  if(pc>25&&pc<=60){level=1;build();renderStill()}
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
