/* uzay-arka.js — tum sayfa icin uzaktan yildiz manzarasi (sabit, hero'dan bagimsiz) */
(function(){'use strict';
try{
var d=document,b=d.body,W=Math.max(innerWidth,320),H=Math.round(innerHeight*1.32),dpr=Math.min(devicePixelRatio||1,2),mob=innerWidth<768;
var c=d.createElement('canvas');c.id='uzay-arka';c.setAttribute('aria-hidden','true');c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);
var x=c.getContext('2d');x.scale(dpr,dpr);
function r(a,z){return a+Math.random()*(z-a)}
/* soluk samanyolu seridi: diyagonal, cok hafif */
var g=x.createLinearGradient(0,H*.15,W,H*.75);g.addColorStop(0,'rgba(20,40,100,0)');g.addColorStop(.5,'rgba(30,60,140,.10)');g.addColorStop(1,'rgba(20,40,100,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
var n=mob?520:1100,tint=['232,243,255','170,200,240','255,238,210','140,175,235'];
for(var i=0;i<n;i++){
 var px=Math.random()*W,py=Math.random()*H,band=Math.abs((py/H)-(.15+.6*px/W))<.12,s=Math.random()<.92?r(.4,.8):r(.9,1.4),a=r(.18,.6)*(band?1.5:1);
 x.fillStyle='rgba('+tint[(Math.random()*4)|0]+','+Math.min(a,.9)+')';x.fillRect(px,py,s,s)}
for(var k=0;k<(mob?6:14);k++){var sx=Math.random()*W,sy=Math.random()*H,rg=x.createRadialGradient(sx,sy,0,sx,sy,7);rg.addColorStop(0,'rgba(220,235,255,.85)');rg.addColorStop(.3,'rgba(150,190,255,.22)');rg.addColorStop(1,'rgba(150,190,255,0)');x.fillStyle=rg;x.fillRect(sx-7,sy-7,14,14)}
var k=d.createElement('div');k.id='uzay-kat';k.setAttribute('aria-hidden','true');
b.insertBefore(k,b.firstChild);b.insertBefore(c,b.firstChild);
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var t=0;addEventListener('scroll',function(){if(t)return;t=requestAnimationFrame(function(){t=0;c.style.transform='translate3d(0,'+(-scrollY*.04).toFixed(1)+'px,0)'})},{passive:true})}
/* [sis 08.10] 256px bloklu --duman gurultusu kaldirildi; yumusak doku artik assets/js/sis.js'te uretilir (eski kod: git gecmisi) */
}catch(e){}
})();
