/* Kurulum videosu kutusu: .kurulum-slot[data-video] doldurur. Vanilla, bağımlılıksız.
   Video gelince: mp4'ü assets/video/kurulum/<id>.mp4'e koy, id'yi assets/video/kurulum/hazir.json'a ekle ({"hazir":["agentos"]}). */
(function(){
var L=(document.documentElement.lang||"tr").slice(0,2)==="en"?"en":"tr",
B="/assets/video/kurulum/",
N={agentos:["AgentOS","AgentOS"],"sesli-sef":["Sesli Şef","Sesli Şef (Voice Chief)"],moymote:["MoyMote","MoyMote"],"sosyal-medya":["Sosyal medya otomasyonu","Social media automation"],"video-otomasyonu":["Video otomasyonu","Video automation"]},
T={tr:{h:"Kurulum videosu",s:"Kurulum videosu yakında",p:function(n){return n+" kurulum videosunu oynat"}},en:{h:"Setup video",s:"Setup video coming",p:function(n){return"Play "+n+" setup video"}}}[L],
P='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4.5v15l13-7.5z"/></svg>';
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x)e.textContent=x;return e}
var M=null;
function hazir(f){
 if(M)return M.then(f);
 M=window.fetch?fetch(B+"hazir.json",{cache:"no-cache"}).then(function(r){return r.ok?r.json():{}}).then(function(j){return j&&j.hazir instanceof Array?j.hazir:[]}).catch(function(){return[]}):Promise.resolve([]);
 return M.then(f)
}
function kur(s){
 if(s.getAttribute("data-ks"))return;s.setAttribute("data-ks","1");
 var id=s.getAttribute("data-video"),n=(N[id]||[id,id])[L==="en"?1:0],
 g=el("div"),h=el("div","ks-bas",T.h),c=el("div","ks-cerceve"),k=new Image();
 h.id="ks-"+id;g.setAttribute("role","group");g.setAttribute("aria-labelledby",h.id);
 k.className="ks-kapak";k.alt="";k.loading="lazy";k.decoding="async";k.width=1280;k.height=720;
 k.onerror=function(){k.remove();c.className+=" ks-bos"};
 k.srcset=B+id+"-kapak-640.webp 640w, "+B+id+"-kapak.webp 1280w";k.sizes="(min-width:1024px) 553px, 92vw";k.src=B+id+"-kapak.webp";c.appendChild(k);g.appendChild(h);g.appendChild(c);s.appendChild(g);
 function yok(){c.setAttribute("aria-disabled","true");c.appendChild(el("div","ks-yok",T.s))}
 function var_(){
  var b=el("button","ks-oynat");b.type="button";b.setAttribute("aria-label",T.p(n));b.innerHTML=P;
  b.onclick=function(){
   var v=el("video");v.controls=true;v.setAttribute("playsinline","");v.preload="none";v.poster=B+id+"-kapak.webp";v.src=B+id+".mp4";
   v.setAttribute("aria-label",n+" – "+T.h);
   ["tr","en"].forEach(function(l){var t=el("track");t.kind="subtitles";t.srclang=l;t.label=l==="tr"?"Türkçe":"English";t.src=B+id+"."+l+".vtt";if(l===L)t.default=true;v.appendChild(t)});
   c.replaceChild(v,b);k.remove();v.focus();var p=v.play();if(p&&p.catch)p.catch(function(){})
  };
  c.appendChild(b)
 }
 function git(){hazir(function(l){l.indexOf(id)>-1?var_():yok()})}
 if("IntersectionObserver"in window){var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){io.disconnect();git()}},{rootMargin:"300px"});io.observe(s)}else git()
}
function basla(){[].forEach.call(document.querySelectorAll(".kurulum-slot[data-video]"),kur)}
window.kurulumBasla=basla;
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",basla);else basla()
})();
