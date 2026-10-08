/* sis.js — [data-sis] bolumlerine yumusak duman katmanlari (08.10.2026). Tek doku, YALNIZ transform animasyonu.
   Doku parca parca (<=8 ms/gorev) uretilir: ana is parcacigini bloklamaz. */
(function(){'use strict';
try{
var d=document,R=d.documentElement,N=112,s0=20261008;
function rnd(){s0|=0;s0=s0+0x6D2B79F5|0;var t=Math.imul(s0^s0>>>15,1|s0);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
function grid(o){var a=new Float32Array(o*o);for(var i=0;i<a.length;i++)a[i]=rnd();return a}
/* periyodik deger gurultusu (karo olarak da tekrar eder) */
function vn(g,o,u,v){var fx=u*o,fy=v*o,x0=Math.floor(fx),y0=Math.floor(fy),tx=fx-x0,ty=fy-y0,xa=((x0%o)+o)%o,ya=((y0%o)+o)%o,xb=(xa+1)%o,yb=(ya+1)%o;
 tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);
 return(g[ya*o+xa]*(1-tx)+g[ya*o+xb]*tx)*(1-ty)+(g[yb*o+xa]*(1-tx)+g[yb*o+xb]*tx)*ty}
function tex(done){
 var c=d.createElement('canvas');c.width=c.height=N;var x=c.getContext('2d'),im=x.createImageData(N,N),
 O=[3,6,12],G=O.map(grid),W1=grid(4),W2=grid(4),j=0;
 (function row(){var t0=performance.now();
  while(j<N&&performance.now()-t0<8){
   for(var i=0;i<N;i++){
    var u=i/N,v=j/N,u2=u+(vn(W1,4,u,v)-.5)*.42,v2=v+(vn(W2,4,u+.37,v+.21)-.5)*.42,s=0,w=.55;
    for(var l=0;l<3;l++){s+=vn(G[l],O[l],u2,v2)*w;w*=.5}
    s=Math.max(0,Math.min(1,(s/.9625-.25)/.5));s=s*s*(3-2*s);
    var p=(j*N+i)*4;im.data[p]=im.data[p+1]=im.data[p+2]=255;im.data[p+3]=Math.round((.1+.9*s)*255)}
   j++}
  if(j<N)return setTimeout(row,0);
  x.putImageData(im,0,0);
  if(c.toBlob)c.toBlob(function(b){done('url('+URL.createObjectURL(b)+')')});else done('url('+c.toDataURL('image/png')+')')})()}
var els=d.querySelectorAll('[data-sis]');
els.forEach(function(e){var k=d.createElement('div');k.className='sis-k';k.setAttribute('aria-hidden','true');k.innerHTML='<i class="sis-a"></i><i class="sis-b"></i><i class="sis-c"></i>';e.insertBefore(k,e.firstChild);e.classList.add('sis-off')});
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(en){en.target.classList.toggle('sis-on',en.isIntersecting);en.target.classList.toggle('sis-off',!en.isIntersecting)})},{rootMargin:'160px 0px'});els.forEach(function(e){io.observe(e)})}
else els.forEach(function(e){e.classList.add('sis-on');e.classList.remove('sis-off')});
/* [perf 08.10] degiskenler :root'a degil ilgili elemanlara yazilir: :root'ta custom property degisimi tum agacta stil yeniden hesabi (477 eleman, ~60 ms gercek / ~240 ms 4x yavas CPU) tetikliyordu */
var mob=window.matchMedia&&matchMedia('(max-width:767px)').matches;
/* [perf 08.10] telefon: doku (112x112 gurultu + Blob + mask katmanlari) uretilmez; sis = yalniz radial-gradient (sis.css mobil blogu), anlik hazir */
if(mob){d.querySelectorAll('.sis-k').forEach(function(k){k.classList.add('sis-hazir')});d.querySelectorAll('.rozet,.hero-serit b').forEach(function(e){e.style.setProperty('--duman','none')})}
else tex(function(t){d.querySelectorAll('.sis-k').forEach(function(k){k.style.setProperty('--sis-tex',t);k.classList.add('sis-hazir')});
 d.querySelectorAll('.rozet,.hero-serit b').forEach(function(e){e.style.setProperty('--duman',t)}) /* --duman: rozet tozu bu yumusak dokuyu kullanir */
});
}catch(e){}
})();
