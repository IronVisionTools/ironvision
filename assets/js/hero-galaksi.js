/* [CILA 07.10: SAHNE bolumu elle yeniden yazildi; hero-galaksi-sync.py ile ezilmemeli]
   hero-galaksi.js — "sonsuz goz" hero sahnesi (IRON VISION, 03.10.2026)
   YAPI: [SAHNE] prototipten BIREBIR kopyalanan blok + [MOTOR] siteye ozel kapsayici/performans kodu.
   Prototip yenilenince SADECE sahne blogu degisir:
     python3 ~/vyron/wt/hero-galaksi-sync.py   (sablon + prototip -> assets/js/hero-galaksi.js)
   Kaynak prototip: /home/erdemirigiz/vyron/site-fabrikasi-onizleme/hero-uzay-2026-10-03/sonsuz-goz.html  (degistirilme: 2026-10-03 21:22:12 TR (UTC+3))
   Sahne sozlesmesi: window.HERO_SCENE={init(E),step(dt,t),draw(ctx,E,t)}; E={W,H,dpr,mobile,cx,cy,R,N,put,gauss,PAL,...} */
(function(){
'use strict';
/* ====== SAHNE BASLA (cila turu 2, 07.10.2026: z-ekseni kavisli yildiz akisi -> logodan olculen goz; kara delik gozbebegi) ======
   TUM AYARLAR CP icinde; eski (cila 1) degerler yanlarinda yorumda. */
window.HERO_STILL={t:15,steps:0};window.HERO_ADAPT=true;
window.HERO_SCENE=(function(){
const TAU=Math.PI*2,RP=.28,SPK=84;
const CP={
 EYE_R_K:.84,      /* [mad.3] goz bir tik kucuk: iris yaricapi carpani (cila1: 1) */
 EYE_HW:1.7,       /* [cila3 mad.3] 1.7: cerceve ekran disina/basligin altina tasmasin (cila2: 1.95) */
 /*EYE_HW_ESKI:1.95,*/      /* [mad.2] logo dis hattinin yari genisligi (iris yaricapi biriminde; cila1 LA=1.5 parametrik kapak) */
 EYE_VS_M:1.05,   /* [cila3 mad.5] mobilde dikey gerilme (kapaklar basliga inmesin) */
 EYE_VS:1.45,      /* [mad.2] logo hattinin dikey gerilmesi: 1 = birebir oran; iris kapaklarin altinda kalmasin diye 1.45 */
 LOGO_CX:124,LOGO_CY:134, /* logo (goz-logo.png 240px) iris halkasi merkezi (olculdu) */
 EDGE_W:12,      /* plaka kenar hucresi agirligi (dis hat belirginligi) */
 LID_N:0,          /* [goz 08.10] eski: .95 -- GOZ CERCEVESI YOK (Demir karari): kapak/metal parcaciklari kapali. Geri almak icin .95 yap + LID_TO_IRIS/LID_TO_AMB'yi 0 yap, SPEC_A:1 */
 LID_TO_IRIS:.55,  /* [goz 08.10] eski: yok -- kapak payindan irise giden pay (N carpani) */
 LID_TO_AMB:.4,    /* [goz 08.10] eski: yok -- kapak payindan ambiyans/yildiz akisina giden pay (N carpani); toplam yogunluk korunur (.55+.4=.95) */
 SPEC_A:0,         /* [goz 08.10] eski: 1 (gozbebegi ustunde metal parlama beyaz noktasi) */
 RING_A:.5,RING_W:.032, /* [goz 08.10] iris dis halkasi (logodaki parlak elektrik mavisi halka): opaklik, kalinlik (M carpani); eski: yok */
 MV_ZETA:.75,      /* [goz 08.10] toplanma yayi sonumleme orani: asma ~%2.8 (eski: eo() easeOutCubic, asma yok) */
 MV_X:5.6,         /* [goz 08.10] yayin yerlesme olcegi (buyuk = daha cabuk oturur) */
 MV_SM:.8,         /* [goz 08.10] yumusak baslangic: e -> mix(e,smoothstep(e),MV_SM) (0 = dogrusal) */
 MV_MOM:.35,MV_MOMMAX:.1, /* [goz 08.10] akistan ayrilirken ivme korunumu: sonum suresi (sn), en cok surukleme (W carpani) */
 MV_SW0:.45,MV_SW1:1.1,MV_SWB:.75, /* [goz 08.10] girdaba spiral: donus acisi (rad) = SW0+rand*SW1, %SWB ayni yon (eski: sw=+-(30..120)px duz yay) */
 MV_WOB:4.2,       /* [goz 08.10] yol boyu dusuk frekansli sapma genligi (px, R/246 ile olceklenir) */
 EYE_CLEAR:14,     /* [goz 08.10] masaustu: goz (son zoom'da) h1 satir kutularina en az bu kadar px yaklasir; carparsa once saga kayar, sigmazsa kuculur (0 = kapali; eski: yok) */
 MV_OSCAP:.045,    /* [goz 08.10] asma ust siniri (R carpani, px) -- uzak parcacik 30px asmasin */
 AMB_N:.9,        /* [cila3 mad.2] ilk saniye dolu gorunsun (cila2: .6) */
 FLOW_SZ:1.6,FLOW_A:1.0, /* [cila3 mad.2] akis asamasi parcacik boyut/parlaklik carpani (cila2: 1 / .6 pay) */
 AMB_A:2.0,       /* [cila3 mad.2] ambiyans parlakligi carpani (cila2: 1) */        /* ambiyans yildiz payi (cila1: .4) */
 V_MIN:.05,V_MAX:.42,T_ACC:2.8,   /* [mad.4] z hizi: yavas baslar (V_MIN), T_ACC sn'de V_MAX'a hizlanir (cila1: yatay hiz 1.5*W/sn'den inip) */
 T_G0:2.9,T_G1:5.6,V_END:.014,   /* [cila3 mad.1] cila2: V_MIN .018, T_ACC 4.4, T_G0 4.6, T_G1 9.2 */
 TC_SPAN:1.3,TL_SPAN:1.7,DUR_A:1.6,DUR_B:1.4, /* [goz 08.10] DUR_B eski: 1.2 */ /* [cila3 mad.1] parcacik yerlesme yayilimi: iris rand*TC_SPAN, kapak rand*TL_SPAN, sure DUR_A+rand*DUR_B (cila2: 2 / 2.8 / 2+rand*1.6) */    /* [mad.1/4] toplanma: hiz T_G0..T_G1 arasi V_END'e iner */
 CURVE:.34,        /* [mad.3] ekrana gelirken sola kavis (W cinsinden, yakinda en fazla) */
 SPREAD:.5,         /* [cila3 mad.2] z acilimi, sol/orta de dolsun (cila2: .34) */        /* z ekseni acilimi */
 VPX:.64,VPY:.46,  /* kacis noktasi (hero oranlari); goz sagda */
 SZ_POW:3,SZ_MAX:3.4,   /* [mad.4] boyut dagilimi: .6+rand^SZ_POW*SZ_MAX (cila1: .9+rand*.9) */
 SF_MIN:.35,SF_MAX:1.7, /* [mad.4] parcacik basina bagimsiz hiz carpani (cila1: .25-1 paralaks) */
 SHIMMER:1.7,      /* [mad.5] goz olustuktan sonra yerinde salinim (px) */
 VORT_N:240,VORT_SPD:.22,VORT_TW:3.2, /* [mad.1] kara delik girdabi: parcacik sayisi, akis hizi, burulma */
 T_IRIS:3.9,T_PUPIL:4.7,T_METAL:6.2, /* [cila3 mad.1] cila2: 6.4/7.4/9.4 */
 ZOOM_G:.22,       /* [cila3 mad.3] irise yakinlasma payi: zoom=1+ZOOM_G (cila2: 1.15; cerceve tasiyordu) */
 PAR:.16,          /* [cila3 mad.6] scroll'da goz/akis parallax (hero'dan yavas kayar) */ /* iris dolgusu / gozbebegi / metal parlama baslangiclari (cila1: 5.4/6.2/8) */
 T_ZOOM:8.6       /* irise yakinlasma baslangici (cila2: 13.2) */
};
const LOGO_MASK=""+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002333332"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000333333333300"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000232332222333330000"+
"000000000000000000000000000000000000000000000000000000000000000000000000022222222222223333300000"+
"000000000000000000000000000000000000000000000000000000000000000000012222211112222222333330000000"+
"000000000000000000000000000000000000000000000000000000000000002222222212222222222223333300000000"+
"000000000000000000000000000000000000000000000000000000001212111111111112222222222233330000000000"+
"000000000000000000000000000000000000000000000000000211111111111111111122222222223333000000000000"+
"000000000000000000000000000000000000000000000000031111111111111111112222222222333330000000000000"+
"000000000000000000000000000000000000000000000002211111111111111111122222222333333000000000000000"+
"000000000000000000000000000000000000000000000023111111111111111111222222223333320000000000000000"+
"000000000000000000000000000000000000000000000331111111111111111112122222333333000000000000000000"+
"000000000000000000000000000000000000000000023211111111111111111111222222333300000000000000000000"+
"000000000000000000000000000000000000000000232211111111111111111111122223333000000000000000000000"+
"000000000000000000000000000000000000000002321111111111111111111112222223300000000000000000000000"+
"000000000000000000000000000000000000000233222111111111111111111111222233000000000000000000000000"+
"000000000000000000000000000000000000002332222111111111111111111111222300000000000000000000000000"+
"000000000000000000000000000000000000023322222111111111111111111122222000000000000000000000000000"+
"000000000000000000000000000000000002233322221111111111111111111222000000000000000000000000000000"+
"000000000000000000000000000000000013333322222222211111111111122200000000000000000000000000000000"+
"000000000000000000000000000000000233333222222221111111111112200000000000030000000000000000000000"+
"000000000000000000000000000000012333333222222212111111111100000000000000033300000000000000000000"+
"000000000000000000000000000000123333333333222222221111100000000000000000003333000000000000000000"+
"000000000000000000000000000001333333333322222222221120000000000000000000002323330000000000000000"+
"000000000000000000000000000013333333333322222222220000000000000000000000000322233300000000000000"+
"000000000000000000000000001233333333333332222222000000000000000000000000000032222333000000000000"+
"000000000000000000000000012323333333333333222000000000000000000000000000000032222222330000000000"+
"000000000000000000000000133222333333333333200000000000000000000000000000000002222222223300000000"+
"000000000000000000000001322222223333333300000000000000000000000000000000000003222221111233000000"+
"000000000000000000000123211222223333330000000000000000000000000000000000000000211121111112230000"+
"000000000000000000001221211122223330000000000000000000000000000000000000000000221111111111113200"+
"000000000000000000012111111122233000000000000000000000000000000000000000000000021111111111111122"+
"000000000000000001121111111212100000000000000000000000000000000000000000000000021111111111111111"+
"000000000000000022211111111200000000000000000000000000000000000000000000000000021111111110001100"+
"000000000000000133111111110000000000000000000000000000000000000000000000000000211111110000000000"+
"000000000000001333111111000000000000000000000000000000000000000000000000000002111111000000000000"+
"000000000000012323211000000000000000000000000000000000000000000000000000000002100000000000000000"+
"000000000000123322300000000000000000000000000000000000000000000000000000000021000000000000000220"+
"000000000001133320000000000000000000000000000000000000000000000000000000000010000000000000022100"+
"000000000002333200000000000000000000000000000000000000000000000000000000000200000000000002211000"+
"000000000023332000000000000000000000000000000000000000000000000000000000003100000000000021110000"+
"000000000233330000000020000000000000000000000000000000000000000000000000002000000000022111100000"+
"000000001333000000002200000000000000000000000000000000000000000000000000020000000000211110000000"+
"000000013330000000221200000000000000000000000000000000000000000000000000020000000022110011000000"+
"000000133300000002111200000000000000000000000000000000000000000000000000200000002211110010000000"+
"000001333000000111112000000000000000000000000000000000000000000000000002000000321111000000000000"+
"000003300000001111112000000000000000000000000000000000000000000000000000000022111100000000000000"+
"000033000000111111110000000000000000000000000000000000000000000000000000002221111000000000000000"+
"000230000011101111000000000000000000000000000000000000000000000000000000221111110000000000000000"+
"002200000100010000000000000000000000000000000000000000000000000000000232111111100000000000000000"+
"020000010000000000000013320000000000000000000000000000000000000000123211111100000000000000000000"+
"200000000000000002211222233000000000000000000000000000000000000123322111111000000000000000000000"+
"000000000001211111111112222310000000000000000000000000000000113332211111110000000010000000000000"+
"000000111111111111111111222332000000000000000000000000000002322221111111000000000000000000000000"+
"000012111111111111111111222233200002333333000000000000000112212111111100000000001000000000000000"+
"000000000111111111111111122233331000111111222222222200000000001111111000000000010000000000000000"+
"000000000000111111111111222233333100001111111111111112220000000001110000000000000000000000000000"+
"000000000000000011111111122223333330000111111111111111111122000000001000000000000000000000000000"+
"000000000000000000001111122223333333000011111111110101000111222000000000000000000000000000000000"+
"000000000000000000000001222222233333300001111110000000000000000222000000000010000000000000000000"+
"000000000000000000000000001223333233332000011110000000000000000000121000000000000000000000000000"+
"000000000000000000000000000000222222222200001100000000000000000000000011000000000000000000000000"+
"000000000000000000000000000000000012222220000100000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000011211200000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000011110001000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
function sm(x){x=x<0?0:x>1?1:x;return x*x*(3-2*x)}
function eo(x){x=x<0?0:x>1?1:x;return 1-Math.pow(1-x,3)}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
let E,P=[],NA=0,ZT=null,VT=null;
/* tur: 0 ambiyans, 1 iris, 2 kapak(metal) */
function rate(t){const a=CP.V_MIN+(CP.V_MAX-CP.V_MIN)*sm(t/CP.T_ACC);return CP.V_END+(a-CP.V_END)*(1-sm((t-CP.T_G0)/(CP.T_G1-CP.T_G0)))*1+0}
/* kumulatif z-ilerlemesi tablosu (deterministik; __heroSeek ile atlanabilir) */
function tab(){ZT=new Float32Array(2401);let z=0;for(let i=0;i<2401;i++){ZT[i]=z;z+=rate(i/60)/60}}
function Z(t){const f=t*60,i=Math.min(2399,f|0);if(f>=2400)return ZT[2400]+(t-40)*CP.V_END;return ZT[i]+(ZT[i+1]-ZT[i])*(f-i)}
function mk(kind,g,s,a,tx,ty,tc,dur){
 P.push({kind,g,s,a,tx,ty,tc,dur,z0:Math.random(),sf:CP.SF_MIN+Math.random()*(CP.SF_MAX-CP.SF_MIN),ax:Math.random()*2-1,ay:Math.random()*2-1,wob:.5+Math.random()*1.5,ph:Math.random()*TAU,k:1+Math.floor(Math.random()*3),sw:(Math.random()<CP.MV_SWB?1:-1)*(CP.MV_SW0+Math.random()*CP.MV_SW1)/* [goz 08.10] eski: +-(30..120)px */,f1:.7+Math.random()*.9,f2:1.7+Math.random()*1.3,ph2:Math.random()*TAU,wa:.5+Math.random()*.7,sx:0,sy:0,vx:0,vy:0,fa0:1,fs0:1,oc:1,sz:1})
}
/* [goz 08.10] yay tablosu: e (0..ST_MAX, 1 = sure sonu) -> ilerleme (alt sonumlu yay, ~%3 asma); tek seferlik, sicak dongude exp/cos yok */
const ST_N=256,ST_MAX=1.6,ST=new Float32Array(ST_N+1);
(function(){const z=CP.MV_ZETA,wd=Math.sqrt(1-z*z);
 for(let i=0;i<=ST_N;i++){const e=i/ST_N*ST_MAX,ee=e<1?e*(1-CP.MV_SM)+CP.MV_SM*(e*e*(3-2*e)):e,x=CP.MV_X*ee;
  ST[i]=e>=ST_MAX?1:1-Math.exp(-z*x)*(Math.cos(wd*x)+z/wd*Math.sin(wd*x))}
 ST[ST_N]=1})();
function spr(e){if(e<=0)return 0;if(e>=ST_MAX)return 1;const q=e/ST_MAX*ST_N,i=q|0;return ST[i]+(ST[i+1]-ST[i])*(q-i)}
function psize(){return .6+Math.pow(Math.random(),CP.SZ_POW)*CP.SZ_MAX}
function init(e){
 E=e;P=[];tab();const N=e.N;
 NA=Math.round(N*(CP.AMB_N+CP.LID_TO_AMB)); /* [goz 08.10] eski: N*CP.AMB_N */
 for(let i=0;i<NA;i++){const m=Math.random();
  mk(0,m<.5?pick([0,1,2]):m<.8?pick([5,3,8]):pick([6,10]),psize(),.35+Math.random()*.6,0,0,1e9,1)}
 /* iris parcaciklari: logodaki goz iris/foton halkasi (cila1 formu korunur) */
 const NI=Math.round(N*(.5+CP.LID_TO_IRIS)); /* [goz 08.10] eski: N*.5 */
 for(let i=0;i<NI;i++){
  const u=Math.random();let r,g,s,a,sp=0;
  if(u<.16){r=1+e.gauss()*.011;g=pick([10,10,0,8]);s=1.2+Math.random()*.6;a=.95} /* [goz 08.10] eski: u<.1, gauss .009, g [10,10,0,12] (12 = metal gri) */
  else if(u<.21){r=RP+.025+e.gauss()*.006;g=pick([10,0,10]);s=1.1+Math.random()*.5;a=.95}
  else if(u<.26){r=.62+e.gauss()*.018;g=pick([10,8,1]);s=1.1+Math.random()*.5;a=.6}
  else{const v=Math.pow(Math.random(),.8);r=RP+.05+(1-RP-.07)*v;const rn=(r-RP)/(1-RP);sp=1;
   g=rn<.3?pick([9,9,8,9]):rn<.65?pick([8,8,8,9,10]):pick([10,10,8,0]);s=Math.random()<.04?2.5:1+Math.random()*.8;a=.5+Math.random()*.5}
  let ar=Math.random()*TAU;if(sp)ar=Math.round(ar/TAU*SPK)/SPK*TAU+e.gauss()*.0065;
  const tc=CP.T_G0-.3+(1-r)*1.1+Math.random()*CP.TC_SPAN;
  mk(1,g,s,a,Math.cos(ar)*r,Math.sin(ar)*r,tc,CP.DUR_A+Math.random()*CP.DUR_B);depart(P[P.length-1]);
 }
 /* goz cercevesi: logo dosyasindan olculen dis hat/plakalar (96x96 maske, 3 parlaklik kademesi); gri metalik noktaciklar toplanip olusturur */
 const nl=Math.round(N*CP.LID_N),cells=[]; /* [goz 08.10] LID_N=0 -> hucre/kapak uretimi atlanir */
 const mk0=(i,j)=>(i<0||j<0||i>95||j>95)?0:LOGO_MASK.charCodeAt(j*96+i)-48;
 for(let j=0;j<(nl>0?96:0);j++)for(let i=0;i<96;i++){const c=mk0(i,j);if(!c)continue;const ed=(!mk0(i-1,j)||!mk0(i+1,j)||!mk0(i,j-1)||!mk0(i,j+1))?CP.EDGE_W:1;for(let q=0;q<ed;q++)cells.push([i,j,c])} /* kenar hucreleri 4x: plaka dis hatti belirgin */
 const sx=CP.EYE_HW/120,sy=sx*(e.mobile?CP.EYE_VS_M:CP.EYE_VS);
 for(let i=0;i<nl;i++){
  const c=cells[Math.floor(Math.random()*cells.length)];
  const X=(c[0]+Math.random())*2.5,Y=(c[1]+Math.random())*2.5;
  const tx=(X-CP.LOGO_CX)*sx,ty=(Y-CP.LOGO_CY)*sy;
  const lv=c[2],g=lv===1?pick([11,14,11,12]):lv===2?pick([12,13,14,12]):pick([13,13,0,12]);
  mk(2,g,1.05+Math.random()*.9,(lv===3?1:.9)*(.7+.3*Math.random()),tx,ty,CP.T_G0+.4+Math.random()*CP.TL_SPAN,CP.DUR_A+Math.random()*CP.DUR_B);depart(P[P.length-1]);
 }
 /* kara delik girdabi parcaciklari: gozbebegine dogru donerek akar */
 for(let i=0;i<CP.VORT_N;i++)P.vort=(P.vort||[]),P.vort.push({u:Math.random(),th:Math.random()*TAU,sp:.6+Math.random()*.8,s:.7+Math.random()*.9});
 P.sort((a,b)=>a.g-b.g);
}
function step(){}
/* z-akisi konumu: (x,y,olcek,seffaflik carpani) -- kavisli (sola) ekrana dogru */
const FP=[0,0,1,1];
function flow(p,t,zeta){
 const W=E.W,H=E.H;let z=(p.z0-zeta*p.sf)%1;if(z<0)z+=1;z=.07+z*.93;
 const iz=1/z,wob=Math.sin(t*.4*p.wob+p.ph)*.012;
 FP[0]=W*CP.VPX+(p.ax+wob)*W*CP.SPREAD*iz-CP.CURVE*W*Math.pow(1-z,1.7);
 FP[1]=H*CP.VPY+p.ay*H*CP.SPREAD*1.6*iz;
 FP[2]=1+Math.min(iz-1,6)*.28;
 FP[3]=(z>.9?(1-z)*10:1)*(z<.16?(z-.07)/.09:1)*(.45+.55*(1-z));
}
/* [goz 08.10] parcacigin akistan ayrildigi nokta/hiz/alfa (bir kez, init'te): yol akisla surekli baslar; ekran disindan cok uzaktaysa ayrilis zamani kaydirilir */
function depart(p){
 const W=E.W,H=E.H;let tc=p.tc;
 for(let k=0;k<6;k++){flow(p,tc,Z(tc));if(FP[0]>-.15*W&&FP[0]<1.15*W&&FP[1]>-.15*H&&FP[1]<1.15*H&&FP[3]>.25)break;tc=p.tc+(Math.random()-.5)*1.2}
 p.tc=tc;const x0=FP[0],y0=FP[1];p.sx=x0/W;p.sy=y0/H;p.fa0=FP[3];p.fs0=FP[2];
 flow(p,tc+.03,Z(tc+.03));let vx=(FP[0]-x0)/.03,vy=(FP[1]-y0)/.03;
 if(Math.abs(vx)>.5*W/.03||Math.abs(vy)>.5*H/.03){vx=0;vy=0}
 const d=Math.hypot(vx,vy)*CP.MV_MOM,mx=CP.MV_MOMMAX*W;if(d>mx){vx*=mx/d;vy*=mx/d}
 p.vx=vx/W;p.vy=vy/H;
 const gx=E.cx+E.R*p.tx,gy=E.cy+E.R*p.ty,dl=Math.hypot(x0-gx,y0-gy)||1;
 p.oc=Math.min(1,CP.MV_OSCAP*E.R/(dl*.03));
}
function draw(ctx,E,t){
 const R=E.R,cx=E.cx,cy=E.cy,W=E.W,H=E.H;
 const zoom=1+CP.ZOOM_G*sm((t-CP.T_ZOOM)/9),M=R*zoom*(1+.014*Math.sin(t*.9));
 const zeta=Z(t),rt=rate(t);
 ctx.globalCompositeOperation='lighter';
 /* hiz cizgileri: hizlanirken yakin parcaciklar z-yonunde (disa, sola kivrilarak) uzar */
 const sk=Math.max(0,Math.min(1,(rt-.08)/.3));
 if(sk>.03){ctx.lineWidth=1;ctx.strokeStyle='rgba(190,215,255,1)';ctx.globalAlpha=.42*sk;ctx.beginPath();
  for(let i=0;i<P.length;i+=3){const p=P[i];if(p.kind&&t>p.tc)continue;
   flow(p,t,zeta);const x1=FP[0],y1=FP[1],sc=FP[2],al=FP[3];if(sc<1.8||al<.3)continue;
   flow(p,t,zeta-rt*.05);const x0=FP[0],y0=FP[1];if(x1<-20||x1>W+20||y1<-20||y1>H+20)continue;
   ctx.moveTo(x0,y0);ctx.lineTo(x1,y1)}
  ctx.stroke()}
 /* iris dolgusu: parcaciklar yerlesince yavasca belirir */
 const fi=sm((t-CP.T_IRIS)/3.2),fp=sm((t-CP.T_PUPIL)/2.6),fl=sm((t-CP.T_METAL)/2.2);
 if(fi>.003&&M<9000){ctx.save();ctx.translate(cx,cy);
  const ig=ctx.createRadialGradient(0,0,M*RP*.9,0,0,M*1.05);
  ig.addColorStop(0,`rgba(1,56,186,${.42*fi})`);ig.addColorStop(.4,`rgba(2,84,240,${.28*fi})`);ig.addColorStop(.8,`rgba(10,147,253,${.16*fi})`);ig.addColorStop(.93,`rgba(10,147,253,${.3*fi})`);ig.addColorStop(1,'rgba(10,147,253,0)');
  ctx.globalAlpha=1;ctx.fillStyle=ig;ctx.beginPath();ctx.arc(0,0,M*1.05,0,TAU);ctx.fill();
  if(CP.RING_A>0){ctx.lineWidth=Math.max(1.5,M*CP.RING_W);ctx.strokeStyle=`rgba(10,147,253,${Math.min(1,CP.RING_A*(E.mobile?1.7:1))*fi})`;ctx.beginPath();ctx.arc(0,0,M*.985,0,TAU);ctx.stroke();
   ctx.lineWidth=1;ctx.strokeStyle=`rgba(170,215,255,${.45*fi})`;ctx.beginPath();ctx.arc(0,0,M*.99,0,TAU);ctx.stroke()} /* [goz 08.10] parlak elektrik mavisi iris halkasi */
  ctx.restore()}
 const J=CP.SHIMMER,wob=CP.MV_WOB*Math.max(.6,R/246); /* [goz 08.10] eyeMetal kaldirildi */
 for(const p of P){
  let x,y,a=p.a,sz=p.s;
  flow(p,t,zeta);const fx=FP[0],fy=FP[1],fs=FP[2],fa=FP[3];
  if(p.kind===0){x=fx;y=fy;a*=fa*(.8+.2*Math.sin(t*.5*p.k+p.ph))*CP.AMB_A;sz*=fs*CP.FLOW_SZ}
  else{
   /* [goz 08.10] eski: lerp(akis_konumu, hedef, easeOutCubic) + duz yay + metal parlama. Yeni: bagimsiz gecikme/sure, yay ilerlemesi (hafif asma),
      akis ivmesini koruyan ayrilis, hedefe donerek spiral, dusuk frekansli sapma; hepsi t'nin saf fonksiyonu (__heroSeek uyumlu) */
   const e=(t-p.tc)/p.dur,gx=cx+M*p.tx,gy=cy+M*p.ty;
   if(e<=0){flow(p,t,zeta);x=FP[0];y=FP[1];a*=FP[3]*.6*CP.FLOW_A*1.4;sz*=FP[2]*CP.FLOW_SZ}
   else if(e>=ST_MAX){x=gx;y=gy}
   else{
    const k=CP.MV_MOM*(1-Math.exp(-(t-p.tc)/CP.MV_MOM)),bx=(p.sx+p.vx*k)*W,by=(p.sy+p.vy*k)*H;
    let f=spr(e);if(f>1)f=1+(f-1)*p.oc;
    const g=1-f,gp=g>0?g:0,ph=p.sw*gp,c=Math.cos(ph),sn=Math.sin(ph),dx=(bx-gx)*g,dy=(by-gy)*g,env=Math.sin(Math.PI*(e<1?e:1))*wob;
    x=gx+dx*c-dy*sn+(Math.sin(t*p.f1+p.ph)+.6*Math.sin(t*p.f2+p.ph2))*p.wa*env;
    y=gy+dx*sn+dy*c+(Math.cos(t*p.f1+p.ph2)+.6*Math.cos(t*p.f2+p.ph))*p.wa*env;
    const ee=f<1?f:1;a=(a*p.fa0*.6*CP.FLOW_A*1.4)*(1-ee)+a*ee;sz=sz*(p.fs0*CP.FLOW_SZ*(1-ee)+ee)}
   if(e>.9){const m=sm((e-.9)/.45)*J;x+=Math.cos(t*(.8+.5*p.k)+p.ph)*m;y+=Math.sin(t*(.7+.4*p.k)+p.ph*1.7)*m}
   if(p.kind===2&&e>.95){const bd=Math.exp(-Math.pow(p.tx*.75-(((t*.32)%5)-2),2)*5);a*=.72+.5*bd*fl}
   if(p.kind===1&&e>.95)a*=.85+.15*Math.sin(t*p.k+p.ph)}
  if(x<-20||x>W+20||y<-20||y>H+20)continue;
  E.putB(x,y,sz,a,p.g);
 }
 E.flush();
 /* goz bebegi = kara delik: opak karanlik + surekli iceri akan girdap + foton halkasi + goz isigi */
 if(fp>.003&&M<9000){ctx.save();ctx.translate(cx,cy);const rp=M*RP;
  const pg=ctx.createRadialGradient(0,0,0,0,0,rp);pg.addColorStop(0,'rgba(0,0,0,1)');pg.addColorStop(.88,'rgba(0,0,0,1)');pg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=fp;ctx.fillStyle=pg;ctx.beginPath();ctx.arc(0,0,rp,0,TAU);ctx.fill();ctx.globalCompositeOperation='lighter';
  /* girdap kollari: logaritmik spiral, yavasca doner, merkeze dogru solar (olay ufku siyah kalir) */
  const rot=t*CP.VORT_SPD*TAU*.35;ctx.lineWidth=Math.max(1,rp*.018);
  for(let arm=0;arm<3;arm++){
   for(let seg=0;seg<2;seg++){ctx.beginPath();
    for(let k=0;k<=26;k++){const q=k/26,r=rp*(.96-.7*q)*(1-seg*.06),th=rot+arm*TAU/3+seg*.07+CP.VORT_TW*Math.pow(q,.8)*TAU*.5;
     const X=Math.cos(th)*r,Y=Math.sin(th)*r;k?ctx.lineTo(X,Y):ctx.moveTo(X,Y)}
    ctx.strokeStyle=seg?'rgba(150,200,255,1)':'rgba(10,147,253,1)';ctx.globalAlpha=fp*(seg?.07:.13);ctx.stroke()}}
  /* iceri akan parcaciklar: yaricap kuculurken aci hizlanir */
  ctx.fillStyle='rgba(190,225,255,1)';
  for(const v of P.vort){const u=(v.u+t*CP.VORT_SPD*v.sp)%1,q=1-u,r=rp*(.97*q+.02),th=v.th+rot*.4+CP.VORT_TW*TAU*.4*Math.pow(u,1.4);
   const al=Math.sin(Math.PI*Math.min(1,u*1.15))*(.2+.8*q)*.9*(r/rp>.2?1:(r/rp)/.2);
   ctx.globalAlpha=fp*Math.max(0,al);const s=v.s*(.6+.6*q);ctx.fillRect(Math.cos(th)*r-s/2,Math.sin(th)*r-s/2,s,s)}
  const ra=M*(RP+.03),ga=ctx.createRadialGradient(0,0,Math.max(0,ra-M*.03),0,0,ra+M*.05);
  ga.addColorStop(0,'rgba(10,147,253,0)');ga.addColorStop(.42,`rgba(10,147,253,${.26*fp})`);ga.addColorStop(1,'rgba(2,84,240,0)');
  ctx.globalAlpha=1;ctx.fillStyle=ga;ctx.beginPath();ctx.arc(0,0,ra+M*.05,0,TAU);ctx.fill();
  ctx.strokeStyle=`rgba(120,190,255,${.4*fp})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,ra*.99,0,TAU);ctx.stroke();
  if(CP.SPEC_A>0&&fl>.01){const c1=M*.09,g1=ctx.createRadialGradient(-M*.085,-M*.095,0,-M*.085,-M*.095,c1);
   g1.addColorStop(0,`rgba(240,248,255,${fl})`);g1.addColorStop(.4,`rgba(150,200,255,${.55*fl})`);g1.addColorStop(1,'rgba(10,147,253,0)');
   ctx.translate(-M*.085,-M*.095);ctx.fillStyle=g1;ctx.beginPath();ctx.arc(0,0,c1,0,TAU);ctx.fill()}
  ctx.restore()}
 E.flush();
}
return{init,step,draw,EYE_R_K:CP.EYE_R_K,PAR:CP.PAR,EYE_HW:CP.EYE_HW,ZOOM_G:CP.ZOOM_G,EYE_CLEAR:CP.EYE_CLEAR};
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
const PARK=(window.HERO_SCENE&&window.HERO_SCENE.PAR)||0; /* [cila3 mad.6] scroll parallax */
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
const MOB_CY=196,MOB_RK=.225; /* [cila3 mad.5] mobil goz merkezi (px, ust) ve R=MOB_RK*W; cila.css --mob-goz-ust ile ayni bolgeyi acar */
function geometry(){
 const r=box.getBoundingClientRect();
 E.W=Math.max(1,Math.round(r.width));E.H=Math.max(1,Math.round(r.height));
 E.dpr=level?1:Math.min(window.devicePixelRatio||1,2);
 cv.width=Math.round(E.W*E.dpr);cv.height=Math.round(E.H*E.dpr);
 /* sag-orta agirlikli; mobilde basligin arkasinda (ust yarida) */
 E.cx=E.mobile?E.W*.5:E.W*.775;E.cy=E.mobile?MOB_CY:E.H*.45; /* [cila3 mad.3/5] masaustu cx .77->.775; mobil: goz basligin USTUNDE ortada (cila2: .66W/.22H basligin arkasinda) */
 E.R=(E.mobile?E.W*MOB_RK:Math.min(E.H*.4,E.W*.24)*.85)*((window.HERO_SCENE&&window.HERO_SCENE.EYE_R_K)||1); /* cila2: goz bir tik kucuk, EYE_R_K sahne CP'sinden (cila1: *1) */
 /* [goz 08.10] masaustu: goz basligin altina girmesin (cerceve kalkinca iris yaricapi = R*zoom; h1 satir kutularina gore sag/kucult) */
 const SC=window.HERO_SCENE,gap=(SC&&SC.EYE_CLEAR)||0,h1=hero.querySelector('h1');
 if(!E.mobile&&gap>0&&h1){
  const rg=document.createRange();rg.selectNodeContents(h1);const L=[];
  for(const q of rg.getClientRects()){if(q.width>2)L.push([q.left-r.left,q.right-r.left,q.top-r.top,q.bottom-r.top])}
  const Z=(1+((SC&&SC.ZOOM_G)||0))*1.034,R0=E.R;let best=R0,bcx=E.cx;
  for(let s=1;s>=.5;s-=.03){const M=R0*s*Z;let need=E.cx;
   for(const q of L){const dy=E.cy<q[2]?q[2]-E.cy:E.cy>q[3]?E.cy-q[3]:0;if(dy<M+gap){const hw=Math.sqrt(Math.max(0,(M+gap)*(M+gap)-dy*dy));need=Math.max(need,q[1]+hw)}}
   best=R0*s;bcx=need;if(need+M<=E.W*.95)break} /* [goz 08.10] sag sinir .95W (maske .92W sonrasi solar); eski: yok */
  E.R=best;E.cx=bcx}
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
 ctx.save();ctx.translate(-smx*10,-smy*8+Math.min(window.scrollY||0,E.H)*PARK);scene.draw(ctx,E,tt);ctx.restore();lastG=-1;
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
window.__heroEye=function(){return[E.cx,E.cy,E.R]}; /* [goz 08.10] test/olcum: goz merkezi ve yaricapi */
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
  if(level<2){render(0,0,true);run()}} /* [cila3 mad.2] ilk gorunen kare t=0 akisi (cila2: sabit goz karesi) */
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
  setTimeout(()=>('requestIdleCallback' in window)?requestIdleCallback(start,{timeout:250}):start(),0)}; /* [cila3 mad.2] cila2: 400ms / timeout 2000 */
 document.readyState==='complete'?go():addEventListener('load',go,{once:true})}
ready();
})();
