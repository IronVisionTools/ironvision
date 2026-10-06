/* uzay-arka.js — tum sayfa icin uzaktan yildiz manzarasi (sabit, hero'dan bagimsiz) + sis dokusu */
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
/* sis dokusu: 256px fbm (deger gurultusu, 4 oktav), alfa kanali maske olarak */
var N=256,nc=d.createElement('canvas');nc.width=nc.height=N;var nx=nc.getContext('2d'),im=nx.createImageData(N,N),G=[],O=[8,16,32,64];
O.forEach(function(o){var a=[];for(var i=0;i<o*o;i++)a.push(Math.random());G.push(a)});
function vn(gr,o,u,v){var fx=u*o,fy=v*o,x0=Math.floor(fx),y0=Math.floor(fy),tx=fx-x0,ty=fy-y0;tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);
 function q(i,j){return gr[((j%o+o)%o)*o+((i%o+o)%o)]}
 return (q(x0,y0)*(1-tx)+q(x0+1,y0)*tx)*(1-ty)+(q(x0,y0+1)*(1-tx)+q(x0+1,y0+1)*tx)*ty}
for(var j=0;j<N;j++)for(var i=0;i<N;i++){var u=i/N,v=j/N,s=0,w=.5;
 for(var l=0;l<4;l++){s+=vn(G[l],O[l],u,v)*w;w*=.5}
 s=Math.max(0,Math.min(1,(s-.28)*1.9));var p=(j*N+i)*4;im.data[p]=im.data[p+1]=im.data[p+2]=255;im.data[p+3]=Math.round(s*255)}
nx.putImageData(im,0,0);d.documentElement.style.setProperty('--duman','url('+nc.toDataURL('image/png')+')');
}catch(e){}
})();
