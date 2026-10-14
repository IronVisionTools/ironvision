/* IRON VISION tools — Taslak A "Yörünge"
   Kaydırmaya bağlı prosedürel gezegen + uydu sahnesi. Tüm kod/şaderlar bu projeye aittir. */
const root = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const COARSE = matchMedia('(pointer: coarse)').matches;
const isMobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
const LANG_KEY = 'ivt-a-lang';

/* ---------- dil ---------- */
const I18N = {
  tr: {
    title: 'IRON VISION tools — Yörünge',
    sats: ['VyroN Agents OS', 'Sesli Şef', 'MoyMote', 'Sosyal medya otomasyonu', 'Try-On'],
    status: ['Canlı', 'Canlı', 'Microsoft Store', 'Sipariş üzerine', 'Yakında'],
    nodes: [
      ['Tetikleyici', 'Ajan', 'Yapılan iş', 'Panel'],
      ['Siz (ses)', 'Yerel yazıya çevirme', 'Terminal ajanı', 'Sesli cevap'],
      ['Telefon / Windows', 'Panel (tarayıcı)', 'Harici monitör', 'Parlaklık', 'Mavi ışık', 'HDR'],
      ['Konu + marka sesi', 'Metin', 'Takvim', 'Yayın', '', 'Birden çok platform', ''],
      ['Müşteri fotoğrafı', 'Üzerinde dene', 'Ürün'],
    ],
    scroll: 'Kaydır', jump: 'Ürüne git: ',
  },
  en: {
    title: 'IRON VISION tools — Orbit',
    sats: ['VyroN Agents OS', 'Voice Chief', 'MoyMote', 'Social media automation', 'Try-On'],
    status: ['Live', 'Live', 'Microsoft Store', 'On request', 'Coming soon'],
    nodes: [
      ['Trigger', 'Agent', 'The work', 'Panel'],
      ['You (voice)', 'Local speech-to-text', 'Terminal agent', 'Spoken answer'],
      ['Phone / Windows', 'Panel (browser)', 'External monitor', 'Brightness', 'Blue light', 'HDR'],
      ['Topic + brand voice', 'Copy', 'Calendar', 'Publish', '', 'Several platforms', ''],
      ['Customer photo', 'Try it on', 'Item'],
    ],
    scroll: 'Scroll', jump: 'Go to product: ',
  },
};
let lang = root.getAttribute('data-lang') === 'en' ? 'en' : 'tr';
function setLang(l, save) {
  lang = l;
  root.lang = l; root.setAttribute('data-lang', l);
  document.title = I18N[l].title;
  $$('img[data-alt-tr]').forEach(i => { i.alt = i.getAttribute('data-alt-' + l); });
  const mm = $('#mmshot'); if (mm) mm.src = mm.getAttribute('data-src-' + l);
  if (save) { try { localStorage.setItem(LANG_KEY, l); } catch (e) {} }
  if (api.relabel) api.relabel();
}
const api = {};
setLang(lang, false);
$('#langbtn').addEventListener('click', () => setLang(lang === 'tr' ? 'en' : 'tr', true));

/* ---------- ortak: kaydırma yardımcıları ---------- */
const N = 7;
const track = $('#track');
const stageEls = $$('.stage');
function stageTop(i) {
  const r = track.getBoundingClientRect();
  const top = r.top + scrollY;
  return top + (i / (N - 1)) * (track.offsetHeight - innerHeight);
}
$('#toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: root.classList.contains('rm') ? 'auto' : 'smooth' }));
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href').slice(1);
  if (a.classList.contains('goto') && root.classList.contains('dyn')) {
    e.preventDefault(); scrollTo({ top: stageTop(1), behavior: 'smooth' });
  } else if (id === 'top') { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); }
}));

if (root.classList.contains('dyn')) boot(); /* reduced-motion / WebGL yok: düz içerik */

async function boot() {
  /* WebGL var mı */
  let ok = false;
  try {
    const c = document.createElement('canvas');
    ok = !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) {}
  if (!ok) return fallback();
  let THREE;
  try { THREE = await import('../vendor/three.module.min.js'); } catch (e) { return fallback(); }
  try { start(THREE); } catch (e) { console.warn('sahne başlatılamadı', e); fallback(); }
}
function fallback() {
  root.classList.remove('dyn'); root.classList.add('nogl');
  const c = $('#gl'); if (c) c.remove();
}

/* ======================================================================
   SAHNE
   ====================================================================== */
function start(THREE) {
  const {
    Vector3, Color, Group, Mesh, Points, LineSegments, BufferGeometry, BufferAttribute, Float32BufferAttribute,
    ShaderMaterial, MeshStandardMaterial, MeshBasicMaterial, LineBasicMaterial, PointsMaterial, SpriteMaterial,
    Sprite, CanvasTexture, SphereGeometry, BoxGeometry, CylinderGeometry, ConeGeometry, TorusGeometry,
    IcosahedronGeometry, OctahedronGeometry, CapsuleGeometry, EdgesGeometry, Scene, PerspectiveCamera,
    WebGLRenderer, DirectionalLight, AmbientLight, HemisphereLight, AdditiveBlending, BackSide, DoubleSide, MathUtils,
  } = THREE;

  const canvas = $('#gl');
  const renderer = new WebGLRenderer({ canvas, antialias: !isMobile, powerPreference: 'high-performance' });
  let pr = Math.min(devicePixelRatio || 1, isMobile ? 1.5 : 2);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x02030a, 1);
  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.05, 400);
  const sticky = $('#sticky');
  function resize() {
    const w = sticky.clientWidth, h = sticky.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  const segs = isMobile ? 48 : 96;
  const FBM_OCT = isMobile ? 4 : 6;

  /* ---------- GLSL: gürültü ---------- */
  const NOISE = `
  float hash(vec3 p){ p=fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float noise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
  float fbm(vec3 p){ float a=.5,s=0.; for(int i=0;i<${FBM_OCT};i++){ s+=a*noise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=.5; } return s; }
  `;

  /* ---------- gezegen ---------- */
  const sunDir = new Vector3(0.15, 0.02, -1).normalize();
  const planetU = { sunDir: { value: sunDir }, uTime: { value: 0 } };
  const planetMat = new ShaderMaterial({
    uniforms: planetU, defines: isMobile ? {} : { BUMP: 1 },
    vertexShader: `
      varying vec3 vObj; varying vec3 vWP; varying vec3 vWN;
      void main(){ vObj=normalize(position); vec4 wp=modelMatrix*vec4(position,1.0); vWP=wp.xyz; vWN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: `
      precision highp float;
      uniform vec3 sunDir; uniform float uTime;
      varying vec3 vObj; varying vec3 vWP; varying vec3 vWN;
      ${NOISE}
      void main(){
        vec3 n0=normalize(vWN); vec3 V=normalize(cameraPosition-vWP); vec3 L=normalize(sunDir);
        vec3 p=vObj;
        float h=fbm(p*2.1+vec3(3.1,1.7,5.2));
        float sea=0.5;
        float land=smoothstep(sea-0.004,sea+0.012,h);
        float e=max(h-sea,0.0);
        float lat=abs(p.y);
        float ice=0.0; if(lat>0.6) ice=smoothstep(0.80,0.93,lat+(fbm(p*6.0)-0.5)*0.2);
        float dryN=fbm(p*3.7+vec3(9.0));
        vec3 deep=vec3(.006,.03,.1), shallow=vec3(.03,.22,.34);
        float depth=smoothstep(sea-0.16,sea,h);
        vec3 ocean=mix(deep,shallow,depth*depth);
        vec3 grass=vec3(.08,.19,.055), dry=vec3(.46,.36,.2), rock=vec3(.3,.26,.22);
        vec3 lc=mix(grass,dry,smoothstep(.46,.64,dryN)*smoothstep(.0,.55,1.0-lat*1.15));
        lc=mix(lc,rock,smoothstep(.04,.16,e));
        lc=mix(lc,vec3(.92),smoothstep(.15,.26,e));
        vec3 alb=mix(ocean,lc,land);
        alb=mix(alb,vec3(.88,.93,.98),ice);
        /* sahte tümsek: ışığa doğru ikinci örnek */
        vec3 Lt=normalize(L-n0*dot(L,n0));
        #ifdef BUMP
        float h2=fbm((p+Lt*0.014)*2.1+vec3(3.1,1.7,5.2));
        float slope=(h2-h)/0.014*land;
        #else
        float slope=0.0;
        #endif
        vec3 N=n0;
        float ndl0=dot(n0,L);
        float ndl=ndl0-slope*0.045;
        float dayK=smoothstep(-0.06,0.28,ndl0);
        vec3 col=alb*(max(ndl,0.0)*1.35)+alb*vec3(.015,.025,.05);
        /* okyanus parıltısı */
        vec3 H=normalize(L+V);
        float spec=pow(max(dot(n0,H),0.0),200.0)*(1.0-land)*(1.0-ice)*dayK;
        col+=vec3(.7,.85,1.0)*spec*0.8;
        /* terminatör sıcaklığı */
        float tw=exp(-pow(ndl0/0.14,2.0));
        col+=vec3(.95,.38,.12)*tw*0.16*(0.4+land*.6);
        /* gece şehir ışıkları */
        float night=smoothstep(0.10,-0.14,ndl0);
        if(night>0.01 && land>0.5){
          float cityN=fbm(p*20.0+vec3(2.0));
          float clust=smoothstep(.48,.7,fbm(p*4.2+vec3(7.0)));
          float cities=(1.0-ice)*(1.0-smoothstep(.1,.2,e))*smoothstep(.56,.7,cityN)*clust;
          cities+=(1.0-ice)*smoothstep(.72,.8,noise(p*70.0))*clust*.6;
          col+=vec3(1.0,.68,.32)*cities*night*1.7;
        }
        /* kenar atmosfer */
        float fr=pow(1.0-max(dot(n0,V),0.0),3.0);
        float lit=smoothstep(-0.35,0.55,ndl0);
        col+=vec3(.22,.5,1.0)*fr*(lit*0.95+0.05)*1.1;
        gl_FragColor=vec4(col,1.0);
      }`,
  });
  const planet = new Mesh(new SphereGeometry(1, segs, segs / 2 * 1), planetMat);
  scene.add(planet);

  const cloudU = { sunDir: { value: sunDir }, uTime: { value: 0 } };
  const clouds = new Mesh(new SphereGeometry(1.012, segs, segs / 2), new ShaderMaterial({
    uniforms: cloudU, transparent: true, depthWrite: false,
    vertexShader: `varying vec3 vObj; varying vec3 vWN; varying vec3 vWP;
      void main(){ vObj=normalize(position); vWN=normalize(mat3(modelMatrix)*normal); vec4 wp=modelMatrix*vec4(position,1.0); vWP=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: `precision highp float; uniform vec3 sunDir; uniform float uTime;
      varying vec3 vObj; varying vec3 vWN; varying vec3 vWP;
      ${NOISE}
      void main(){
        vec3 n=normalize(vWN); vec3 L=normalize(sunDir);
        vec3 p=vObj+vec3(uTime*0.004,0.0,0.0);
        float c=fbm(p*3.3+vec3(11.0))*0.85+fbm(p*9.0)*0.3;
        float d=smoothstep(.52,.8,c);
        float ndl=dot(n,L);
        float lit=smoothstep(-0.12,0.45,ndl);
        vec3 col=vec3(1.0)*(lit*1.0+0.03)+vec3(.95,.4,.15)*exp(-pow(ndl/0.14,2.0))*0.18;
        gl_FragColor=vec4(col,d*0.88*(0.35+0.65*smoothstep(-0.3,0.2,ndl)));
      }`,
  }));
  scene.add(clouds);

  const atmo = new Mesh(new SphereGeometry(1.2, 64, 32), new ShaderMaterial({
    uniforms: { sunDir: { value: sunDir } },
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    vertexShader: `varying vec3 vWP; void main(){ vec4 wp=modelMatrix*vec4(position,1.0); vWP=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: `precision highp float; uniform vec3 sunDir; varying vec3 vWP;
      void main(){
        vec3 ro=cameraPosition; vec3 rd=normalize(vWP-ro);
        float b=length(cross(vWP-ro,rd));          /* ışının merkeze uzaklığı */
        float R=1.0, Rs=1.2;
        float g;
        if(b<R){ g=pow(b,7.0)*0.9; } else { float t=(b-R)/(Rs-R); g=pow(clamp(1.0-t,0.0,1.0),3.2); }
        vec3 L=normalize(sunDir);
        vec3 ct=ro+rd*dot(-ro,rd);                  /* en yakın nokta */
        vec3 n=normalize(ct+0.0001);
        float lit=smoothstep(-0.45,0.6,dot(n,L));
        float sc=pow(max(dot(rd,L),0.0),6.0);       /* güneşe bakarken saçılma */
        vec3 c=vec3(.2,.5,1.0)*(0.08+lit*1.0)+vec3(1.0,.62,.3)*sc*2.2*(1.0-lit*.3);
        gl_FragColor=vec4(c*g,g);
      }`,
  }));
  scene.add(atmo);

  /* ---------- yıldızlar ---------- */
  const starGroup = new Group(); scene.add(starGroup);
  function dotTexture(sz = 64, soft = 0.0) {
    const c = document.createElement('canvas'); c.width = c.height = sz;
    const g = c.getContext('2d'); const r = sz / 2;
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25 + soft, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, sz, sz);
    return new CanvasTexture(c);
  }
  const dotTex = dotTexture(64);
  function makeStars(count, rmin, rmax, size, opacity) {
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = rmin + Math.random() * (rmax - rmin);
      const s = Math.sqrt(1 - u * u);
      pos[i * 3] = r * s * Math.cos(th); pos[i * 3 + 1] = r * u; pos[i * 3 + 2] = r * s * Math.sin(th);
      const t = Math.random(); const k = 0.55 + Math.random() * 0.45;
      col[i * 3] = k * (t < 0.2 ? 1 : 0.8 + t * 0.2); col[i * 3 + 1] = k * 0.92; col[i * 3 + 2] = k * (t > 0.7 ? 1 : 0.9);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3)); g.setAttribute('color', new BufferAttribute(col, 3));
    return new Points(g, new PointsMaterial({ size, map: dotTex, vertexColors: true, transparent: true, opacity, depthWrite: false, sizeAttenuation: false, blending: AdditiveBlending }));
  }
  const farStars = makeStars(isMobile ? 1400 : 3600, 120, 220, 2.2 * pr, 0.9);
  const nearStars = makeStars(isMobile ? 160 : 420, 40, 90, 3.4 * pr, 0.8);
  starGroup.add(farStars); const nearGroup = new Group(); nearGroup.add(nearStars); scene.add(nearGroup);

  /* ---------- güneş ---------- */
  function sunTexture() {
    const s = 256, c = document.createElement('canvas'); c.width = c.height = s; const g = c.getContext('2d');
    let gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.08, 'rgba(255,244,220,1)'); gr.addColorStop(0.2, 'rgba(255,200,130,.5)');
    gr.addColorStop(0.5, 'rgba(255,150,80,.12)'); gr.addColorStop(1, 'rgba(255,120,60,0)');
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
    g.globalCompositeOperation = 'lighter';
    const hz = g.createLinearGradient(0, 124, 0, 132); /* yatay çizgi */
    const lg = g.createLinearGradient(0, 0, s, 0);
    lg.addColorStop(0, 'rgba(160,200,255,0)'); lg.addColorStop(0.5, 'rgba(210,230,255,.55)'); lg.addColorStop(1, 'rgba(160,200,255,0)');
    g.fillStyle = lg; g.fillRect(0, 126, s, 4);
    return new CanvasTexture(c);
  }
  const sunSprite = new Sprite(new SpriteMaterial({ map: sunTexture(), blending: AdditiveBlending, transparent: true, depthWrite: false, depthTest: true }));
  sunSprite.scale.setScalar(40);
  scene.add(sunSprite);
  const sunLight = new DirectionalLight(0xfff1de, 3.2); scene.add(sunLight);
  scene.add(new AmbientLight(0x5a6a99, 0.55));
  scene.add(new HemisphereLight(0x9bbcff, 0x0a0c16, 0.6));
  const fill = new DirectionalLight(0x8fb7ff, 0.5); scene.add(fill);

  /* ---------- yörünge çizgileri + uydular ---------- */
  const ACC = new Color(0x8fd3ff), AMB = new Color(0xffb066);
  const bodyBase = () => new MeshStandardMaterial({ color: 0x9aa7ba, metalness: 0.55, roughness: 0.38, transparent: true });
  const panelBase = () => new MeshStandardMaterial({ color: 0x1a2c52, metalness: 0.4, roughness: 0.3, emissive: 0x0a1a40, emissiveIntensity: 0.7, transparent: true, side: DoubleSide });

  function mkPart(sat, geo, kind, pos, dir, opt = {}) {
    const g = new Group();
    const mat = kind === 'panel' ? panelBase() : bodyBase();
    if (opt.side) mat.side = DoubleSide;
    const mesh = new Mesh(geo, mat);
    const eg = new LineSegments(new EdgesGeometry(geo, 25), new LineBasicMaterial({ color: kind === 'panel' ? 0x6fa8ff : 0xc9e6ff, transparent: true, opacity: 0.6 }));
    g.add(mesh, eg);
    if (opt.rot) g.rotation.set(...opt.rot);
    const base = new Vector3(...pos);
    g.position.copy(base);
    sat.group.add(g);
    sat.parts.push({ g, mat, eg, base, dir: new Vector3(...dir), grow: opt.grow || 0, baseOpacity: opt.op ?? 1 });
  }

  const sats = [];
  function newSat(def) {
    const sat = { ...def, group: new Group(), parts: [], inner: new Group(), explode: 0, nodes: [], edges: [], pulses: [] };
    sat.holder = new Group(); sat.holder.add(sat.group); sat.group.scale.setScalar(0.3);
    sat.group.add(sat.inner);
    scene.add(sat.holder);
    return sat;
  }

  /* orbit çizgisi */
  function orbitLine(r, inc, node, color) {
    const pts = []; for (let i = 0; i <= 160; i++) { const a = i / 160 * Math.PI * 2; pts.push(Math.cos(a) * r, 0, Math.sin(a) * r); }
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(pts, 3));
    const l = new LineSegmentsLoop(g, color);
    l.rotation.order = 'YXZ'; l.rotation.y = node; l.rotation.x = inc;
    scene.add(l); return l;
  }
  function LineSegmentsLoop(g, color) {
    const THREE_Line = THREE.LineLoop;
    return new THREE_Line(g, new LineBasicMaterial({ color, transparent: true, opacity: 0.16 }));
  }

  /* --- 1 Agents OS --- */
  const S0 = newSat({ key: 'agentos', r: 2.35, inc: 0.42, node: 0.4, phase: 0.2, speed: 0.052 });
  mkPart(S0, new CylinderGeometry(0.34, 0.34, 0.5, 6, 1, true), 'body', [0, 0, 0], [0, 0, 0], { grow: 1.9, side: true, op: 0.7 });
  mkPart(S0, new CylinderGeometry(0.2, 0.34, 0.14, 6), 'body', [0, 0.32, 0], [0, 1, 0]);
  mkPart(S0, new CylinderGeometry(0.34, 0.2, 0.14, 6), 'body', [0, -0.32, 0], [0, -1, 0]);
  mkPart(S0, new BoxGeometry(0.95, 0.025, 0.44), 'panel', [-0.86, 0, 0], [-1.1, 0, 0]);
  mkPart(S0, new BoxGeometry(0.95, 0.025, 0.44), 'panel', [0.86, 0, 0], [1.1, 0, 0]);
  mkPart(S0, new ConeGeometry(0.18, 0.16, 16), 'body', [0, 0.52, 0], [0, 1.7, 0], { rot: [Math.PI, 0, 0] });
  S0.nodePos = [[-0.95, 0.2, 0], [-0.3, -0.25, 0.12], [0.35, 0.22, -0.1], [0.95, -0.12, 0]];
  S0.edgeList = [[0, 1], [1, 2], [2, 3]]; S0.cam = { dist: 2.1, ang: 0.5, up: 0.38 };

  /* --- 2 Sesli Şef --- */
  const S1 = newSat({ key: 'sef', r: 2.7, inc: -0.55, node: 2.1, phase: 1.7, speed: 0.046 });
  mkPart(S1, new SphereGeometry(0.38, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), 'body', [0, 0, 0], [0, 1, 0]);
  mkPart(S1, new SphereGeometry(0.38, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), 'body', [0, 0, 0], [0, -1, 0]);
  mkPart(S1, new TorusGeometry(0.6, 0.035, 8, 48), 'body', [0, 0, 0], [0, 0, 0], { rot: [Math.PI / 2, 0, 0], grow: 1.5 });
  mkPart(S1, new CylinderGeometry(0.012, 0.012, 0.5, 6), 'body', [0.25, 0.55, 0], [0.7, 1.2, 0], { rot: [0, 0, -0.3] });
  mkPart(S1, new CylinderGeometry(0.012, 0.012, 0.5, 6), 'body', [-0.25, 0.55, 0], [-0.7, 1.2, 0], { rot: [0, 0, 0.3] });
  mkPart(S1, new BoxGeometry(0.7, 0.02, 0.3), 'panel', [0, -0.05, 0.62], [0, 0, 1.2]);
  S1.nodePos = [[-0.9, 0.0, 0], [-0.3, 0.3, 0.1], [0.3, -0.15, -0.1], [0.9, 0.2, 0]];
  S1.edgeList = [[0, 1], [1, 2], [2, 3], [3, 0]]; S1.cam = { dist: 2.1, ang: -0.55, up: 0.3 };

  /* --- 3 MoyMote --- */
  const S2 = newSat({ key: 'moymote', r: 3.0, inc: 0.2, node: 4.0, phase: 3.0, speed: 0.04 });
  mkPart(S2, new BoxGeometry(1.0, 0.62, 0.05), 'body', [0, 0.1, 0.05], [0, 0, 1]);
  mkPart(S2, new BoxGeometry(1.0, 0.62, 0.05), 'body', [0, 0.1, -0.05], [0, 0, -1]);
  mkPart(S2, new BoxGeometry(0.12, 0.34, 0.1), 'body', [0, -0.4, -0.05], [0, -1, 0]);
  mkPart(S2, new BoxGeometry(0.52, 0.04, 0.3), 'body', [0, -0.6, -0.05], [0, -1.4, 0]);
  mkPart(S2, new BoxGeometry(0.6, 0.02, 0.3), 'panel', [-1.0, 0.1, 0], [-1.2, 0.2, 0]);
  mkPart(S2, new BoxGeometry(0.6, 0.02, 0.3), 'panel', [1.0, 0.1, 0], [1.2, 0.2, 0]);
  S2.nodePos = [[-0.85, 0.05, 0], [-0.2, 0.05, 0], [0.55, 0.05, 0], [0.9, 0.38, 0.05], [0.9, 0.05, 0.05], [0.9, -0.28, 0.05]];
  S2.edgeList = [[0, 1], [1, 2], [2, 3], [2, 4], [2, 5]]; S2.cam = { dist: 2.2, ang: 0.4, up: 0.28 };

  /* --- 4 Sosyal medya --- */
  const S3 = newSat({ key: 'sosyal', r: 2.55, inc: -0.25, node: 5.3, phase: 4.2, speed: 0.05 });
  mkPart(S3, new IcosahedronGeometry(0.36, 0), 'body', [0, 0, 0], [0, 0, 0], { grow: 1.7, op: 0.75 });
  for (let k = 0; k < 3; k++) {
    const a = k / 3 * Math.PI * 2 + 0.5, dx = Math.cos(a), dy = Math.sin(a);
    mkPart(S3, new OctahedronGeometry(0.13, 0), 'body', [dx * 0.72, dy * 0.72, 0], [dx * 1.2, dy * 1.2, 0]);
    mkPart(S3, new CylinderGeometry(0.018, 0.018, 0.5, 6), 'body', [dx * 0.45, dy * 0.45, 0], [dx * 0.8, dy * 0.8, 0], { rot: [0, 0, a - Math.PI / 2] });
  }
  mkPart(S3, new BoxGeometry(0.5, 0.02, 0.26), 'panel', [0, 0, 0.5], [0, 0, 1.3]);
  S3.nodePos = [[-0.95, 0.05, 0], [-0.35, 0.34, 0.05], [-0.35, -0.3, -0.05], [0.25, 0.02, 0], [0.9, 0.4, 0], [0.9, 0.02, 0], [0.9, -0.36, 0]];
  S3.edgeList = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [3, 6]]; S3.cam = { dist: 2.1, ang: -0.4, up: 0.34 };

  /* --- 5 Try-On --- */
  const S4 = newSat({ key: 'tryon', r: 3.3, inc: 0.62, node: 1.0, phase: 5.2, speed: 0.044, dashed: true });
  mkPart(S4, new TorusGeometry(0.62, 0.03, 4, 4), 'body', [0, 0, 0], [0, 0, -0.8], { rot: [0, 0, Math.PI / 4], grow: 1.3 });
  mkPart(S4, new CapsuleGeometry(0.17, 0.55, 4, 12), 'body', [0, 0, 0], [0, 0, 0.9], { op: 0.8 });
  mkPart(S4, new OctahedronGeometry(0.12, 0), 'body', [-0.75, 0, 0], [-1.2, 0, 0]);
  mkPart(S4, new OctahedronGeometry(0.12, 0), 'body', [0.75, 0, 0], [1.2, 0, 0]);
  mkPart(S4, new BoxGeometry(0.5, 0.02, 0.24), 'panel', [0, -0.78, 0], [0, -1.3, 0.2]);
  S4.nodePos = [[-0.85, 0.0, 0], [0, 0.12, 0.1], [0.85, -0.05, 0]];
  S4.edgeList = [[0, 1], [1, 2]]; S4.cam = { dist: 2.1, ang: 0.45, up: 0.3 };

  sats.push(S0, S1, S2, S3, S4);
  const orbitLines = sats.map((s, i) => orbitLine(s.r, s.inc, s.node, i === 4 ? 0xffb066 : 0x8fd3ff));

  /* iç yapı: çizgi + parçacık */
  const innerMatLine = () => new LineBasicMaterial({ color: 0x8fd3ff, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, depthTest: false });
  const pulseTex = dotTexture(64);
  sats.forEach(s => {
    const pts = s.nodePos.map(p => new Vector3(p[0] * 1.7, p[1] * 1.7, p[2] * 1.5));
    s.nodeV = pts;
    const lp = []; s.edgeList.forEach(([a, b]) => { lp.push(pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z); });
    const lg = new BufferGeometry(); lg.setAttribute('position', new Float32BufferAttribute(lp, 3));
    s.lineMat = innerMatLine();
    if (s.dashed) s.lineMat.color.set(0xffb066);
    s.lines = new LineSegments(lg, s.lineMat); s.lines.renderOrder = 5;
    s.inner.add(s.lines);
    /* düğümler */
    const ng = new BufferGeometry(); ng.setAttribute('position', new Float32BufferAttribute(pts.flatMap(p => [p.x, p.y, p.z]), 3));
    s.nodeMat = new PointsMaterial({ size: 16 * pr, map: pulseTex, color: s.dashed ? 0xffc88a : 0xbfe6ff, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, depthTest: false, sizeAttenuation: false });
    s.nodePts = new Points(ng, s.nodeMat); s.nodePts.renderOrder = 6; s.inner.add(s.nodePts);
    /* ışık darbeleri */
    const pc = s.edgeList.length * 2;
    const pg = new BufferGeometry(); pg.setAttribute('position', new Float32BufferAttribute(new Float32Array(pc * 3), 3));
    s.pulseMat = new PointsMaterial({ size: 11 * pr, map: pulseTex, color: 0xfff2d8, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, depthTest: false, sizeAttenuation: false });
    s.pulsePts = new Points(pg, s.pulseMat); s.pulsePts.renderOrder = 7; s.inner.add(s.pulsePts);
    s.pulses = Array.from({ length: pc }, (_, i) => ({ e: i % s.edgeList.length, t: Math.random(), v: 0.25 + Math.random() * 0.25 }));
    /* halo parçacıkları */
    const hc = isMobile ? 60 : 160, hp = new Float32Array(hc * 3), hv = [];
    for (let i = 0; i < hc; i++) {
      const a = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1, rr = 0.7 + Math.random() * 0.9, sn = Math.sqrt(1 - u * u);
      hv.push([rr * sn * Math.cos(a) * 1.25, rr * u * 0.9, rr * sn * Math.sin(a)]);
      hp.set(hv[i], i * 3);
    }
    const hg = new BufferGeometry(); hg.setAttribute('position', new Float32BufferAttribute(hp, 3));
    s.haloMat = new PointsMaterial({ size: 3.2 * pr, map: dotTex, color: s.dashed ? 0xffb066 : 0x8fd3ff, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, sizeAttenuation: false });
    s.halo = new Points(hg, s.haloMat); s.haloBase = hv; s.inner.add(s.halo);
  });

  /* ---------- HTML etiketler ---------- */
  const labelsEl = $('#labels'), nodeEl = $('#nodelabels');
  const satLabels = sats.map((s, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'satlabel' + (i === 4 ? ' soon' : '');
    b.addEventListener('click', () => scrollTo({ top: stageTop(i + 1), behavior: 'smooth' }));
    labelsEl.appendChild(b); return b;
  });
  const maxNodes = 7; const nodeLabels = Array.from({ length: maxNodes }, () => { const d = document.createElement('span'); d.className = 'nl'; nodeEl.appendChild(d); return d; });
  api.relabel = () => {
    const t = I18N[lang];
    satLabels.forEach((b, i) => { b.innerHTML = ''; b.append(document.createTextNode(t.sats[i])); b.setAttribute('aria-label', t.jump + t.sats[i] + ' — ' + t.status[i]); const em = document.createElement('em'); em.textContent = ' · ' + t.status[i]; em.style.cssText = 'font-style:normal;color:#8fa1c4;font-size:11px'; b.appendChild(em); });
    $$('.rail button').forEach((bt, i) => { bt.setAttribute('aria-label', i === 0 ? (lang === 'tr' ? 'Giriş' : 'Intro') : i === 6 ? (lang === 'tr' ? 'Tüm yörünge' : 'Full orbit') : t.jump + t.sats[i - 1]); });
  };
  const rail = $('#rail');
  for (let i = 0; i < N; i++) {
    const li = document.createElement('li'), bt = document.createElement('button'); bt.type = 'button';
    bt.addEventListener('click', () => scrollTo({ top: stageTop(i), behavior: 'smooth' }));
    li.appendChild(bt); rail.appendChild(li);
  }
  api.relabel(); const measure = () => satLabels.forEach(l => { l._w = l.offsetWidth; }); setTimeout(measure, 300); setTimeout(measure, 1500);
  const _rl = api.relabel; api.relabel = () => { _rl(); setTimeout(measure, 50); };

  /* ---------- girdi: imleç paralaksı + mıknatıs ---------- */
  const ptr = { x: 0, y: 0, px: 0, py: 0, cx: -999, cy: -999 };
  addEventListener('pointermove', e => {
    ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = (e.clientY / innerHeight) * 2 - 1; ptr.cx = e.clientX; ptr.cy = e.clientY;
  }, { passive: true });
  addEventListener('pointerleave', () => { ptr.cx = ptr.cy = -999; });
  /* dokunmatik: sürükleme hafif bakış açısı verir */
  let drag = null; const look = { x: 0, y: 0, tx: 0, ty: 0 };
  sticky.addEventListener('touchstart', e => { const t = e.touches[0]; drag = { x: t.clientX, y: t.clientY, lx: look.tx, ly: look.ty }; }, { passive: true });
  sticky.addEventListener('touchmove', e => {
    if (!drag) return; const t = e.touches[0];
    look.tx = MathUtils.clamp(drag.lx + (t.clientX - drag.x) / innerWidth * 1.4, -0.6, 0.6);
    look.ty = MathUtils.clamp(drag.ly + (t.clientY - drag.y) / innerHeight * 1.0, -0.4, 0.4);
  }, { passive: true });
  sticky.addEventListener('touchend', () => { drag = null; look.tx = look.ty = 0; }, { passive: true });

  /* ---------- kamera ---------- */
  const SNAP = location.search.includes('snap');
  const E = (a, b, x) => { const t = MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const baseP = new Vector3(0, 0.5, 5.6), baseT = new Vector3(), tgF = new Vector3(), camPos = new Vector3(0, 0.5, 5.6), camTgt = new Vector3(), tmpA = new Vector3(), tmpB = new Vector3();
  const upV = new Vector3(0, 1, 0);
  const SHIFT = [-1, -1, 1, -1, 1, -1, 0]; /* panel soldaysa nesne sağa: kamerayı sola kaydır */
  const posesPos = Array.from({ length: N }, () => new Vector3()), posesTgt = Array.from({ length: N }, () => new Vector3());
  function satWorld(s, out) { return s.holder.getWorldPosition(out); }
  function computePoses(aspect) {
    const portrait = aspect < 0.9;
    /* 0: giriş */
    posesPos[0].set(0, 0.45, portrait ? 6.6 : 5.0); posesTgt[0].set(0, 0, 0);
    sats.forEach((s, i) => {
      satWorld(s, tmpA);
      const dir = tmpB.copy(tmpA).normalize();
      const tan = new Vector3().crossVectors(upV, dir).normalize();
      const d = s.cam.dist * (portrait ? 1.65 : 1.0);
      posesPos[i + 1].copy(tmpA).addScaledVector(dir, d).addScaledVector(tan, d * 0.42 * Math.sign(s.cam.ang)).addScaledVector(upV, d * s.cam.up * 0.6);
      posesTgt[i + 1].copy(tmpA);
    });
    const dist = 12.5 * Math.max(1, (portrait ? 0.6 : 0.78) / aspect);
    posesPos[6].set(0, dist * 0.2, dist); posesTgt[6].set(0, portrait ? -0.6 : -1.5, 0);
  }

  /* ---------- açılış zaman çizgisi ---------- */
  const intro = $('#intro');
  const t0 = performance.now();
  const _it = new URLSearchParams(location.search).get('it'); const IT_FIX = _it === null ? -1 : parseFloat(_it);
  let introPhase = 0, introDone = false;
  const sunFinal = new Vector3(0.82, 0.3, 0.5).normalize(), sunStart = new Vector3(0.12, 0.03, -1).normalize();
  const flare = $('#flare');
  if (camera.aspect > 0.9) { intro.style.setProperty('--ix', '73%'); intro.style.setProperty('--iy', '50%'); } else { intro.style.setProperty('--ix', '50%'); intro.style.setProperty('--iy', '34%'); }
  function introStep(ti) {
    /* ti: saniye */
    if (introPhase < 1 && ti > 0.15) { introPhase = 1; intro.classList.add('s1'); root.classList.add('ready'); }
    if (introPhase < 2 && ti > 1.0) { introPhase = 2; intro.classList.add('s2'); }
    if (introPhase < 3 && ti > 1.55) {
      introPhase = 3;
      const hl = $('#hdrlogo').getBoundingClientRect(), il = $('.ilogo', intro).getBoundingClientRect();
      intro.style.setProperty('--dx', (hl.left + hl.width / 2 - (il.left + il.width / 2)) + 'px');
      intro.style.setProperty('--dy', (hl.top + hl.height / 2 - (il.top + il.height / 2)) + 'px');
      intro.style.setProperty('--sc', (hl.width / il.width).toFixed(3));
      intro.classList.add('s3'); root.classList.add('hdr');
    }
    if (!introDone && ti > 2.2) { introDone = true; root.classList.add('introdone'); }
  }
  const quickIntro = root.classList.contains('bare') || scrollY > 200;
  if (quickIntro) { root.classList.add('ready', 'hdr', 'introdone'); introPhase = 3; introDone = true; }
  const sRaw = () => { const r = track.getBoundingClientRect(); return MathUtils.clamp(-r.top / Math.max(1, track.offsetHeight - innerHeight), 0, 1) * (N - 1); };

  /* ---------- döngü ---------- */
  let last = performance.now(), tAcc = 0, ftAvg = 16, frames = 0, sSm = sRaw();
  const hudA = $('#hud-a'), hudB = $('#hud-b'), hudC = $('#hud-c'), hint = $('#scrollhint');
  const vTmp = new Vector3(), vN = new Vector3();
  let activeIdx = -1;
  const stageOn = new Array(N).fill(false);
  const cameraRight = new Vector3(), cameraUp = new Vector3();

  function project(v, out) {
    vN.copy(v).project(camera);
    out.x = (vN.x * 0.5 + 0.5) * sticky.clientWidth; out.y = (-vN.y * 0.5 + 0.5) * sticky.clientHeight; out.z = vN.z;
    return out;
  }
  const scr = { x: 0, y: 0, z: 0 };

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = SNAP ? 1 : Math.min(0.05, (now - last) / 1000); last = now; tAcc += SNAP ? 0.016 : dt;
    /* adaptif çözünürlük */
    ftAvg = ftAvg * 0.95 + dt * 1000 * 0.05; frames++;
    if (frames % 90 === 0 && ftAvg > 38 && pr > 1) { pr = Math.max(1, pr - 0.25); renderer.setPixelRatio(pr); resize(); }

    const ti = IT_FIX >= 0 ? IT_FIX : (now - t0) / 1000;
    if (!introDone) introStep(ti);
    /* güneş doğuşu */
    const u = quickIntro ? 1 : E(0.0, 2.1, ti);
    sunDir.copy(sunStart).lerp(sunFinal, u).normalize();
    sunLight.position.copy(sunDir).multiplyScalar(60); sunLight.intensity = 0.4 + 2.8 * E(0, 1, u + 0.05);
    fill.position.set(-sunDir.x, 0.2, -sunDir.z * -1).multiplyScalar(20); fill.intensity = 0.35;
    sunSprite.position.copy(sunDir).multiplyScalar(70); sunSprite.scale.setScalar(26 + 18 * (1 - u));
    planetU.uTime.value = cloudU.uTime.value = tAcc;
    planet.rotation.y = tAcc * 0.012; clouds.rotation.y = tAcc * 0.017 + 0.3;

    /* kaydırma */
    const sT = sRaw();
    sSm += (sT - sSm) * (1 - Math.exp(-dt * 7));
    const s = sSm;
    /* uydular yörüngede */
    sats.forEach(st => {
      const th = st.phase + st.speed * tAcc;
      st.holder.position.set(Math.cos(th) * st.r, 0, Math.sin(th) * st.r);
      st.holder.position.applyEuler(new THREE.Euler(st.inc, st.node, 0, 'YXZ'));
      { const dx = camera.position.x - st.holder.position.x, dz = camera.position.z - st.holder.position.z; const want = Math.atan2(dx, dz) + Math.sin(tAcc * 0.35 + st.phase) * 0.35 + 0.25; let d = want - st.group.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); st.group.rotation.y += d * Math.min(1, dt * 3); }
      st.group.scale.setScalar(0.3 * (1 + 1.5 * E(4.8, 6, sSm)));
    });
    /* pozları hesapla ve karıştır */
    const aspect = camera.aspect; computePoses(aspect);
    const i0 = Math.min(N - 2, Math.floor(s)), tt = E(0.22, 0.78, s - i0);
    camPos.lerpVectors(posesPos[i0], posesPos[i0 + 1], tt);
    camTgt.lerpVectors(posesTgt[i0], posesTgt[i0 + 1], tt);
    /* giriş: dolly */
    const dolly = quickIntro ? 0 : 1 - E(0.4, 2.6, ti);
    camPos.z += dolly * 1.8; camPos.y -= dolly * 0.5;
    /* gezegenin içinden geçme */
    if (camPos.length() < 2.4) camPos.setLength(2.4);
    const kf = 1 - Math.exp(-dt * 9);
    baseP.lerp(camPos, kf); baseT.lerp(camTgt, kf);
    camera.position.copy(baseP); camera.up.set(0, 1, 0); camera.lookAt(baseT);
    camera.updateMatrixWorld();
    cameraRight.setFromMatrixColumn(camera.matrixWorld, 0); cameraUp.setFromMatrixColumn(camera.matrixWorld, 1);
    /* panele göre yana kaydırma: panel soldaysa nesne sağda görünsün */
    const shiftSide = MathUtils.lerp(SHIFT[i0], SHIFT[i0 + 1], tt);
    const portrait = aspect < 0.9;
    const dd = baseP.distanceTo(baseT);
    const wH = 2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * dd;
    let offX = 0, offY = 0;
    if (portrait) offY = wH * (0.07 + 0.13 * Math.abs(shiftSide));
    else offX = shiftSide * wH * aspect * 0.22;
    ptr.px += (ptr.x - ptr.px) * (1 - Math.exp(-dt * 3)); ptr.py += (ptr.y - ptr.py) * (1 - Math.exp(-dt * 3));
    look.x += (look.tx - look.x) * (1 - Math.exp(-dt * 6)); look.y += (look.ty - look.y) * (1 - Math.exp(-dt * 6));
    const px = ptr.px + look.x * 1.5, py = ptr.py + look.y * 1.5;
    const ox = offX + px * 0.018 * dd, oy = -offY - py * 0.011 * dd;
    camera.position.addScaledVector(cameraRight, ox).addScaledVector(cameraUp, oy);
    tgF.copy(baseT).addScaledVector(cameraRight, offX).addScaledVector(cameraUp, -offY);
    camera.lookAt(tgF);
    starGroup.rotation.y = px * 0.03 + tAcc * 0.0015; starGroup.rotation.x = py * 0.02;
    nearGroup.rotation.y = px * 0.09 + tAcc * 0.003; nearGroup.rotation.x = py * 0.05;
    /* flare overlay: güneşin ekran konumu */
    {
      vTmp.copy(sunSprite.position).project(camera);
      const fx = (vTmp.x * 0.5 + 0.5) * 100, fy = (-vTmp.y * 0.5 + 0.5) * 100;
      const facing = vTmp.z < 1 ? 1 : 0;
      const hid = sunOccluded(sunSprite.position) ? 0.35 : 1;
      const k = (introDone ? 0.55 : 1) * facing * hid * (0.25 + 0.75 * (1 - u * 0.65));
      flare.style.opacity = Math.max(0, Math.min(1, k)).toFixed(3);
      flare.style.background = `radial-gradient(circle at ${fx}% ${fy}%, rgba(255,238,205,.55), rgba(255,170,90,.14) 9%, transparent 26%)`;
    }

    /* patlatılmış görünüm + iç yapı */
    sats.forEach((st, i) => {
      const x = 1 - E(0.1, 0.5, Math.abs(s - (i + 1)));
      const ex = s > 5.5 ? x * 0.0 + 0.0 : x;
      st.explode += (ex - st.explode) * (1 - Math.exp(-dt * 6));
      const e = E(0, 1, st.explode);
      st.parts.forEach(p => {
        p.g.position.copy(p.base).addScaledVector(p.dir, e * 0.9);
        const gscale = 1 + p.grow * e * 0.35; p.g.scale.setScalar(gscale);
        const op = p.baseOpacity * (1 - e * (p.grow ? 0.65 : 0.38));
        p.mat.opacity = op; p.eg.material.opacity = 0.6 * op;
      });
      const vis = E(0.2, 0.85, st.explode);
      st.lineMat.opacity = vis * (st.dashed ? 0.55 : 0.8);
      st.nodeMat.opacity = vis * 0.95; st.pulseMat.opacity = vis; st.haloMat.opacity = vis * 0.8;
      st.inner.visible = vis > 0.01;
      if (st.inner.visible) {
        const arr = st.pulsePts.geometry.attributes.position.array;
        st.pulses.forEach((p, k) => {
          p.t += dt * p.v * (st.dashed ? 0.5 : 1); if (p.t > 1) { p.t = 0; p.e = (p.e + 1 + Math.floor(Math.random() * 2)) % st.edgeList.length; }
          const [a, b] = st.edgeList[p.e], A = st.nodeV[a], B = st.nodeV[b];
          arr[k * 3] = A.x + (B.x - A.x) * p.t; arr[k * 3 + 1] = A.y + (B.y - A.y) * p.t; arr[k * 3 + 2] = A.z + (B.z - A.z) * p.t;
        });
        st.pulsePts.geometry.attributes.position.needsUpdate = true;
        const ha = st.halo.geometry.attributes.position.array;
        for (let k = 0; k < st.haloBase.length; k++) {
          const b = st.haloBase[k], w = tAcc * 0.35 + k;
          ha[k * 3] = b[0] * (1 + e * 0.5) + Math.sin(w) * 0.03; ha[k * 3 + 1] = b[1] * (1 + e * 0.5) + Math.cos(w * 1.3) * 0.03; ha[k * 3 + 2] = b[2] * (1 + e * 0.5);
        }
        st.halo.geometry.attributes.position.needsUpdate = true;
      }
    });

    /* aktif sahne + paneller */
    const nearest = Math.round(s);
    for (let i = 0; i < N; i++) {
      const d = Math.abs(s - i);
      const o = 1 - E(0.2, 0.42, d);
      const el = stageEls[i];
      el.style.opacity = o.toFixed(3); el.style.setProperty('--o', o.toFixed(3));
      const on = o > 0.02; if (on !== stageOn[i]) { stageOn[i] = on; el.classList.toggle('on', on); }
    }
    if (nearest !== activeIdx) {
      activeIdx = nearest;
      $$('.rail button').forEach((b, i) => b.setAttribute('aria-current', i === nearest ? 'true' : 'false'));
    }
    hint.style.opacity = s < 0.15 ? 1 : 0;

    /* etiketler */
    const T = I18N[lang];
    let anyMag = null, best = 1e9;
    sats.forEach((st, i) => {
      satWorld(st, vTmp); vTmp.y += 0.0;
      project(vTmp, scr);
      const lab = satLabels[i];
      const behind = scr.z > 1;
      const onScr = !behind && scr.x > -40 && scr.x < sticky.clientWidth + 40 && scr.y > -20 && scr.y < sticky.clientHeight + 20;
      const isActive = Math.abs(s - (i + 1)) < 0.35;
      /* gezegen arkasında mı */
      const occ = sphereOcc(vTmp);
      let show = onScr && !occ && !isActive && s > 0.35 || (s > 5.2 && onScr);
      if (s <= 0.35) show = false;
      let tx = scr.x + 16, ty = scr.y - 34;
      /* mıknatıs */
      const dx = ptr.cx - (tx + 50), dy = ptr.cy - (ty + 14), dist = Math.hypot(dx, dy);
      let mag = 0;
      if (show && dist < 150 && !COARSE) { mag = 1 - dist / 150; tx += dx * 0.45 * mag; ty += dy * 0.45 * mag; }
      lab.classList.toggle('mag', mag > 0.4);
      lab._x = tx; lab._y = ty; lab._show = show;
      lab.style.opacity = show ? '1' : '0'; lab.style.pointerEvents = show ? 'auto' : 'none'; lab.tabIndex = show ? 0 : -1;
    });
    /* çakışan uydu etiketlerini aşağı it */
    {
      const sh = satLabels.map((l, i) => ({ l, i, x: l._x, y: l._y, show: l._show })).filter(o => o.show).sort((a, b) => a.y - b.y);
      for (let a = 0; a < sh.length; a++) for (let b = a + 1; b < sh.length; b++) {
        if (Math.abs(sh[b].x - sh[a].x) < 230 && sh[b].y - sh[a].y < 30 && sh[b].y >= sh[a].y - 1) sh[b].y = sh[a].y + 30;
      }
      const W = sticky.clientWidth;
      sh.forEach(o => { o.x = Math.max(8, Math.min(o.x, W - (o.l._w || 190) - 14)); o.l.style.transform = `translate(${o.x.toFixed(1)}px,${o.y.toFixed(1)}px)`; });
    }
    /* düğüm etiketleri */
    const act = sats[Math.round(s) - 1];
    nodeLabels.forEach(d => d.style.opacity = 0);
    if (act && Math.abs(s - Math.round(s)) < 0.3) {
      const names = T.nodes[sats.indexOf(act)];
      const vis = E(0.55, 0.95, act.explode);
      const arr = [];
      act.nodeV.forEach((nv, k) => {
        const d = nodeLabels[k]; const nm = names[k] || '';
        if (d.textContent !== nm) d.textContent = nm;
        vTmp.copy(nv); act.inner.localToWorld(vTmp); project(vTmp, scr);
        arr.push({ d, nm, x: scr.x - 3, y: scr.y + (k % 2 ? 6 : -30), w: nm.length * 8 + 16 });
      });
      arr.filter(o => o.nm).sort((p, q) => p.y - q.y).forEach((o, i, all) => {
        for (let j = 0; j < i; j++) { const q = all[j]; if (Math.abs(o.x - q.x) < (o.w + q.w) / 2 && o.y - q.y < 20 && o.y >= q.y - 20) o.y = q.y + 20; }
      });
      arr.forEach(o => { o.d.style.transform = `translate(${o.x.toFixed(1)}px,${o.y.toFixed(1)}px)`; o.d.style.opacity = o.nm ? vis.toFixed(2) : '0'; });
    }
    /* HUD (dekoratif) */
    if (frames % 6 === 0) {
      const ref = act || null; const p = ref ? satWorld(ref, new Vector3()) : camera.position;
      const latd = Math.asin(p.y / (p.length() || 1)) * 57.2958, lond = Math.atan2(p.x, p.z) * 57.2958;
      hudA.textContent = ref ? `ORBIT · ${String(sats.indexOf(ref) + 1).padStart(2, '0')} / 05` : 'ORBIT · SIM';
      hudB.textContent = `LAT ${latd.toFixed(1).padStart(5)}° · LON ${lond.toFixed(1).padStart(6)}°`;
      const sec = Math.floor(tAcc); hudC.textContent = `T+ ${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    }
    renderer.render(scene, camera);
  }
  /* gezegen perdesi testleri */
  const _o = new Vector3(), _d = new Vector3();
  function sphereOcc(pt) {
    /* kamera → pt doğrusu birim küreyi kesiyor mu (ve pt kürenin arkasında mı) */
    _d.copy(pt).sub(camera.position); const L = _d.length(); _d.normalize();
    _o.copy(camera.position);
    const b = _o.dot(_d), c = _o.dot(_o) - 1.0, disc = b * b - c;
    if (disc < 0) return false; const t = -b - Math.sqrt(disc);
    return t > 0 && t < L;
  }
  function sunOccluded(pt) { return sphereOcc(pt); }

  requestAnimationFrame(frame);
  window.__ivt = { scene, camera, sats, renderer, setScroll: null };
}
