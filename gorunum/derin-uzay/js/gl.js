/* IRON VISION — derin uzay gözlemevi: tek tam ekran fragment shader (kütüphanesiz, kendi kodumuz).
   Hacimsel bulutsu (fbm + toz şeritleri + yıldız oluşum bölgeleri), renk sıcaklıklı yıldızlar,
   difraksiyon çivileri, reticle büyüteç merceği, kara delik (kütleçekimsel mercekleme + yığılma diski). */
(function () {
  'use strict';

  var FRAG = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform vec2 uRes; uniform float uTime, uDepth, uFocus, uBH, uWarp, uLens, uBHR, uPal;',
    'uniform vec2 uMouse, uBHPos;',

    'float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }',
    'vec2 h22(vec2 p){ float a=h21(p); return vec2(a,h21(p+a+19.19)); }',
    'float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);',
    '  float a=h21(i), b=h21(i+vec2(1.,0.)), c=h21(i+vec2(0.,1.)), d=h21(i+vec2(1.,1.));',
    '  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }',
    'const mat2 M2=mat2(1.6,1.2,-1.2,1.6);',
    'float fbm4(vec2 p){ float s=0., a=.5; for(int i=0;i<4;i++){ s+=a*vn(p); p=M2*p; a*=.5; } return s; }',
    'float fbm3(vec2 p){ float s=0., a=.5; for(int i=0;i<3;i++){ s+=a*vn(p); p=M2*p; a*=.5; } return s; }',

    /* yıldız rengi: soğuk turuncu -> beyaz -> mavi-beyaz (renk sıcaklığı) */
    'vec3 sCol(float t){',
    '  vec3 c=mix(vec3(1.,.52,.30),vec3(1.,.80,.60),smoothstep(0.,.3,t));',
    '  c=mix(c,vec3(1.,.96,.92),smoothstep(.3,.55,t));',
    '  c=mix(c,vec3(.72,.83,1.),smoothstep(.55,.8,t));',
    '  return mix(c,vec3(.55,.69,1.),smoothstep(.8,1.,t)); }',

    'vec3 stars(vec2 p, float cell, float seed, float blur, float spikes){',
    '  vec2 g=p/cell; vec2 id=floor(g); vec2 f=fract(g);',
    '  vec3 col=vec3(0.); float css=1./900.; float px=1./uRes.y;',
    '  for(int y=-1;y<=1;y++){ for(int x=-1;x<=1;x++){',
    '    vec2 o=vec2(float(x),float(y)); vec2 c=id+o;',
    '    float h=h21(c+seed); if(h<.60) continue;',
    '    vec2 jp=h22(c*1.37+seed)*.8+.1;',
    '    vec2 d=(o+jp-f)*cell;',
    '    float mag=pow(h21(c*.71+seed+4.2),5.);',
    '    float tt=h21(c*.53+seed+9.1);',
    '    vec3 sc=sCol(tt);',
    '    float sig=max(css*(.55+mag*1.5)+blur*.022, .85*px);',
    '    float r2=dot(d,d);',
    '    float tw=1.+.14*sin(uTime*(1.5+h*4.)+h*40.);',
    '    float br=(.2+mag*2.8)*tw*(1.-.55*blur);',
    '    col+=sc*exp(-r2/(2.*sig*sig))*br;',
    '    col+=sc*mag*.10*exp(-sqrt(r2)/(css*16.+blur*.03));',
    '    if(spikes>0. && mag>.10){',
    '      float L=min(css*(26.+mag*120.), cell*.62); vec2 a=abs(d); float w=css*.8+blur*.01;',
    '      float sp=exp(-a.y/w)*exp(-a.x/L)+exp(-a.x/w)*exp(-a.y/L);',
    '      col+=sc*sp*mag*.9*(1.-blur)*(1.-smoothstep(cell*.5,cell*.95,max(a.x,a.y)));',
    '    }',
    '  }}',
    '  return col; }',

    /* hacimsel bulutsu: 4 derinlik dilimi, sonsuz tünel (kamera ilerledikçe dilimler yaklaşır) */
    'vec3 nebula(vec2 p, float depth){',
    '  vec3 acc=vec3(0.);',
    '  for(int i=0;i<4;i++){',
    '    float fi=float(i);',
    '    float raw=fi*.25+depth; float cyc=floor(raw); float f=fract(raw);',
    '    float seed=fi*11.7+cyc*5.3;',
    '    float z=exp(mix(-1.25,1.15,f));',
    '    float al=smoothstep(0.,.28,f)*(1.-smoothstep(.72,1.,f));',
    '    vec2 q=p/z*2.5+h22(vec2(seed,seed*.37))*40.;',
    '    float mask=smoothstep(.36,.74,fbm3(q*.42+seed));',
    '    if(mask*al<.01) continue;',
    '    vec2 w=vec2(fbm3(q*.9+seed), fbm3(q*.9+vec2(5.2,1.3)+seed));',
    '    float d=fbm4(q+1.9*(w-.5));',
    '    float body=smoothstep(.36,.76,d)*mask;',
    '    float mixc=fbm3(q*.55+seed+3.1);',
    '    vec3 ha=vec3(1.00,.16,.30), o3=vec3(.10,.55,.95), vi=vec3(.55,.20,.85);',
    '    vec3 base=mix(ha,o3,smoothstep(.3,.7,mixc+uPal*.35-.15));',
    '    base=mix(base,vi,.25+.2*sin(seed));',
    '    vec3 e=base*body*.8;\n    float fil=pow(1.-abs(2.*fbm4(q*1.9+w*2.2+seed)-1.),5.)*mask*smoothstep(.3,.6,d);\n    e+=mix(base,vec3(1.),.35)*fil*1.0;',
    '    float knot=smoothstep(.66,.95,d)*mask;',
    '    e+=vec3(1.,.82,.7)*knot*knot*1.15+vec3(.55,.75,1.)*knot*.35;',
    '    float ridge=1.-abs(2.*fbm4(q*1.35+7.+seed)-1.);',
    '    float dust=smoothstep(.62,.93,ridge)*smoothstep(.28,.55,d)*mask;',
    '    acc=acc*(1.-dust*.92*al)+e*al*.9;',
    '  }',
    '  return acc; }',

    'vec3 diskCol(float t, float dirx, vec2 nq, float rdn){',
    '  float rad=pow(1.-t,2.0)*smoothstep(0.,.05,t);',
    '  vec3 c=mix(vec3(.5,.14,.05),vec3(1.,.55,.18),smoothstep(0.,.55,1.-t));',
    '  c=mix(c,vec3(1.,.93,.80),smoothstep(.62,1.,1.-t));',
    '  float sw=fbm4(nq*2.1);',
    '  float dop=pow(clamp(1.-.32*dirx,.5,1.4),2.2);',
    '  return c*rad*(.25+1.5*sw)*(.9+.1*sin(rdn*38.))*dop*2.0; }',

    'void main(){',
    '  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;',
    '  vec2 pr=p/(1.+uWarp*5.5);',
    '  float cw=cos(uWarp*1.2), sw2=sin(uWarp*1.2); pr=mat2(cw,-sw2,sw2,cw)*pr;',
    /* reticle merceği: imlecin altı 2x büyür */
    '  float dm=length(p-uMouse); float R=.165;',
    '  float k=smoothstep(R,R*.55,dm)*uLens;',
    '  pr=uMouse+(pr-uMouse)*mix(1.,.5,k);',
    /* kara delik: nokta-kütle mercekleme  beta = theta - thetaE^2/theta */
    '  vec2 src=pr; vec2 bpr=pr-uBHPos; float rr=length(bpr);',
    '  if(uBH>.001){ float te=uBHR*2.05; float fl=1.-(te*te)/(rr*rr+uBHR*uBHR*.03); src=uBHPos+bpr*mix(1.,fl,uBH); }',
    '  float blur=(1.-uFocus); blur*=blur;',
    '  vec3 col=nebula(src, uDepth)*mix(.12,1.,smoothstep(.0,.75,uFocus));',
    '  float s1=1.+uDepth*.9, s2=1.+uDepth*.55, s3=1.+uDepth*.28;',
    '  col+=stars(src/(s1*1.3)+vec2(5.1,9.7), .045, 5.3, blur, 0.)*.7;\n  col+=stars(src/s1+vec2(3.1,1.7), .085, 17.3, blur, 0.)*.9;',
    '  col+=stars(src/s2+vec2(8.4,2.2), .140, 41.9, blur, 0.);',
    '  col+=stars(src/s3+vec2(1.9,6.6), .230, 77.1, blur, 1.);',
    /* kara delik gövdesi */
    '  if(uBH>.001){',
    '    vec2 bp=p-uBHPos; float r=length(bp); float rh=uBHR;',
    '    float ca=cos(-.17), sa=sin(-.17); vec2 bt=mat2(ca,-sa,sa,ca)*bp;',
    '    vec2 q=vec2(bt.x, bt.y/.27); float rd=length(q);',
    '    float rin=rh*1.55, rout=rh*4.3; float t=clamp((rd-rin)/(rout-rin),0.,1.);',
    '    float inD=step(rin,rd)*step(rd,rout);',
    '    float om=.9/pow(.25+t,1.5)*.5; float cs=cos(-uTime*om*.35), sn=sin(-uTime*om*.35);',
    '    vec2 nq=mat2(cs,-sn,sn,cs)*q/rh;',
    '    vec3 dc=diskCol(t,q.x/max(rd,1e-4),nq,rd/rh)*inD*smoothstep(0.,.03,t)*(1.-smoothstep(.9,1.,t));',
    '    float back=step(0.,bt.y); float front=1.-back;',
    '    float dopr=pow(clamp(1.-.3*bp.x/max(r,1e-4),.5,1.4),2.);',
    '    float halo=exp(-pow((r-rh*1.48)/(rh*.085),2.))*(.15+.85*pow(abs(bt.y)/max(r,1e-4),1.6))*dopr;',
    '    vec3 hc=vec3(1.,.72,.38)*halo*1.5+vec3(1.,.93,.82)*exp(-pow((r-rh*1.06)/(rh*.03),2.))*.5;',
    '    vec3 add=dc*back;',
    '    col+=add*uBH;',
    '    col+=vec3(1.,.55,.2)*exp(-r/(rh*2.6))*.16*uBH;',
    '    float sh=smoothstep(rh*.985,rh*1.0,r);',
    '    col*=mix(1.,sh,uBH);',
    '    col+=(hc*uBH)*smoothstep(rh*.99,rh*1.02,r);',
    '    col+=dc*front*uBH;',
    '  }',
    /* ton eşleme, vinyet, tane */
    '  col=1.-exp(-col*1.05);',
    '  col=pow(col,vec3(.93));',
    '  float vg=smoothstep(1.25,.3,length(p*vec2(.85,1.)));',
    '  col*=mix(.55,1.,vg);',
    '  col+=(h21(gl_FragCoord.xy+fract(uTime)*91.)-.5)*.018;',
    '  col=mix(col,vec3(1.),smoothstep(.55,1.,uWarp)*.6);',
    '  gl_FragColor=vec4(max(col,0.),1.);',
    '}'
  ].join('\n');

  var VERT = 'attribute vec2 a; void main(){ gl_Position=vec4(a,0.,1.); }';

  function compile(gl, type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(s); gl.deleteShader(s);
      throw new Error('shader: ' + log);
    }
    return s;
  }

  function create(canvas, opts) {
    opts = opts || {};
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false,
      powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.preserve }) ||
      canvas.getContext('experimental-webgl');
    if (!gl) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ['uRes', 'uTime', 'uDepth', 'uFocus', 'uBH', 'uWarp', 'uLens', 'uBHR', 'uPal', 'uMouse', 'uBHPos'].forEach(function (n) {
      U[n] = gl.getUniformLocation(prog, n);
    });
    var api = {
      gl: gl, canvas: canvas,
      resize: function (w, h) {
        w = Math.max(2, Math.floor(w)); h = Math.max(2, Math.floor(h));
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        gl.viewport(0, 0, w, h);
      },
      draw: function (s) {
        gl.uniform2f(U.uRes, canvas.width, canvas.height);
        gl.uniform1f(U.uTime, s.time); gl.uniform1f(U.uDepth, s.depth);
        gl.uniform1f(U.uFocus, s.focus); gl.uniform1f(U.uBH, s.bh);
        gl.uniform1f(U.uWarp, s.warp); gl.uniform1f(U.uLens, s.lens);
        gl.uniform1f(U.uBHR, s.bhr); gl.uniform1f(U.uPal, s.pal);
        gl.uniform2f(U.uMouse, s.mx, s.my); gl.uniform2f(U.uBHPos, s.bx, s.by);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };
    return api;
  }

  window.IVT_GL = { create: create };
})();
