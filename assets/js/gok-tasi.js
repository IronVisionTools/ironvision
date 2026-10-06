/* gok-tasi.js — urun ikonlari: parcaciklardan olusan kucuk gok taslari (assemble + havada salinim) */
(function(){'use strict';
var imgs=[].slice.call(document.querySelectorAll('img.urun-ikon'));if(!imgs.length)return;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,TAU=Math.PI*2,list=[],raf=0;
function rnd(s){return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function build(seed,tint){
 var R=rnd(seed),k=[],ph=[R()*TAU,R()*TAU,R()*TAU],am=[.16+R()*.1,.1+R()*.08,.06+R()*.06],ax=[R()*6,R()*6,R()*6];
 function rad(a){return .5*(1+am[0]*Math.sin(2*a+ph[0])+am[1]*Math.sin(3*a+ph[1])+am[2]*Math.sin(5*a+ph[2]))}
 var cr=[];for(var c=0;c<3;c++)cr.push([R()*TAU,R()*.3,.1+R()*.08]);
 var n=300;
 for(var i=0;i<n;i++){var a=R()*TAU,rr=Math.sqrt(R())*rad(a)*.82,x=Math.cos(a)*rr,y=Math.sin(a)*rr;
  var z=Math.sqrt(Math.max(0,.34-x*x-y*y)),sh=Math.max(0,(-x*.55-y*.6+z*.6)/.62);
  for(var q=0;q<cr.length;q++){var dx=x-Math.cos(cr[q][0])*cr[q][1],dy=y-Math.sin(cr[q][0])*cr[q][1],dd=Math.hypot(dx,dy);if(Math.abs(dd-cr[q][2])<.02)sh*=.35;else if(dd<cr[q][2])sh*=.75}
  k.push({x:x,y:y,sh:sh,sx:(R()-.5)*2.4,sy:(R()-.5)*2.4,tc:R()*.9,s:.7+R()*.7})}
 var shards=[],ns=3+Math.floor(R()*3);
 for(var j=0;j<ns;j++){var o=.58+R()*.2,sp=(.25+R()*.35)*(R()<.5?-1:1),a0=R()*TAU,pts=[];for(var m=0;m<7;m++)pts.push({x:(R()-.5)*.07,y:(R()-.5)*.07,sh:.4+R()*.6});shards.push({o:o,sp:sp,a0:a0,pts:pts,tc:.4+R()*.7})}
 return {k:k,sh:shards,tint:tint,ph:R()*TAU}}
var TINT=[[150,190,255],[170,205,240],[140,185,225],[190,200,225],[130,200,215]];
imgs.forEach(function(im,i){
 var cv=document.createElement('canvas'),cs=im.className,S=im.getBoundingClientRect().width||72;cv.className=cs;cv.setAttribute('aria-hidden','true');
 var dpr=Math.min(devicePixelRatio||1,2);cv.width=cv.height=Math.round(72*dpr);cv.style.cssText='';
 im.parentNode.replaceChild(cv,im);
 list.push({cv:cv,cx:cv.getContext('2d'),d:build(11+i*37,TINT[i%5]),t0:0,vis:false,dpr:dpr})});
function draw(o,tm){
 var c=o.cx,S=o.cv.width,d=o.d,t=(tm-o.t0)/1000,asm=reduce?1:Math.min(1,t/1.8);
 c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,S,S);
 var bob=reduce?0:Math.sin(tm/1400+d.ph)*S*.025,rot=reduce?0:tm/9000*(d.ph>3?-1:1)*0+Math.sin(tm/3600+d.ph)*.18;
 c.translate(S/2,S/2+bob);c.rotate(rot);var u=S*.95,t3=d.tint;
 for(var i=0;i<d.k.length;i++){var p=d.k[i],e=Math.min(1,Math.max(0,(asm-p.tc*.55)/.45));e=1-Math.pow(1-e,3);
  var x=(p.sx+(p.x-p.sx)*e)*u,y=(p.sy+(p.y-p.sy)*e)*u,l=.28+.72*p.sh,a=(.25+.75*e)*Math.min(1,.35+p.sh*1.1);
  c.fillStyle='rgba('+((t3[0]*l)|0)+','+((t3[1]*l+20*l)|0)+','+Math.min(255,(t3[2]*l+40*p.sh)|0)+','+a.toFixed(2)+')';
  var sz=p.s*o.dpr*1.1;c.fillRect(x-sz/2,y-sz/2,sz,sz)}
 for(var j=0;j<d.sh.length;j++){var s=d.sh[j],an=s.a0+(reduce?0:tm/1000*s.sp),e2=Math.min(1,Math.max(0,(asm-s.tc)/.5)),sx=Math.cos(an)*s.o*u*e2,sy=Math.sin(an)*s.o*u*.55*e2;
  for(var m=0;m<s.pts.length;m++){var q=s.pts[m];c.fillStyle='rgba('+(t3[0]*(.4+q.sh*.6)|0)+','+(t3[1]*(.4+q.sh*.6)|0)+','+(t3[2]*(.5+q.sh*.5)|0)+','+(.85*e2).toFixed(2)+')';
   var z=1.3*o.dpr;c.fillRect(sx+q.x*u-z/2,sy+q.y*u-z/2,z,z)}}
}
function loop(tm){raf=0;var any=false;for(var i=0;i<list.length;i++)if(list[i].vis){any=true;draw(list[i],tm)}if(any&&!reduce)raf=requestAnimationFrame(loop)}
function kick(){if(!raf)raf=requestAnimationFrame(loop)}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){var o=list.filter(function(l){return l.cv===e.target})[0];if(!o)return;o.vis=e.isIntersecting;if(o.vis&&!o.t0)o.t0=performance.now();if(o.vis)kick()});if(reduce)list.forEach(function(o){if(o.vis)draw(o,0)})},{threshold:.1});list.forEach(function(o){io.observe(o.cv)})}
else list.forEach(function(o){o.vis=true;o.t0=performance.now();kick()});
})();
