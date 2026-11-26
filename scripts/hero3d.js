/* ============================================================
   DreamSleeve — hero 3D scene
   A realistic X-ray / engineering-schematic arm (shoulder → forearm →
   hand) wearing the sleeve, with the four circuit arrays (11-14), TENS
   signal pulses, and electrode emitters — in the glowing ghost style of
   the DreamSleeve schematic.
   Imperative Three.js (r169), transparent canvas, additive Fresnel-rim
   "ghost" look — no lights, no post-processing. Built per the threejs-*
   skills: cap pixel ratio, setAnimationLoop, dispose on teardown, no
   per-frame allocation, prefers-reduced-motion aware, pauses off-screen.
   ============================================================ */
import {
  Scene, PerspectiveCamera, WebGLRenderer, Group, Mesh, SphereGeometry, CylinderGeometry,
  BufferGeometry, BufferAttribute, Float32BufferAttribute, CatmullRomCurve3, Vector3,
  Points, ShaderMaterial, LineSegments, LineLoop, LineBasicMaterial, AdditiveBlending,
  DoubleSide, Color, CanvasTexture, Fog, NoToneMapping, SRGBColorSpace,
} from "three";

const canvas = document.getElementById("heroGL");
if (canvas && canvas.getContext) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SIGNAL = new Color("#2FE4E4");
  const PULSE  = new Color("#FF3DD8");
  const PASS   = new Color("#38E88A");
  const AMBER  = new Color("#F5C542");
  const VOID   = new Color("#05070E");

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  scene.fog = new Fog(VOID.getHex(), 8, 20);

  const camera = new PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.1, 9);
  camera.lookAt(0, 0, 0);

  const world = new Group();
  world.position.set(1.1, -0.1, 0);
  world.scale.setScalar(0.8);
  scene.add(world);

  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };

  /* ---------- soft radial sprite texture ---------- */
  function radialTexture(inner) {
    const s = 64, c = document.createElement("canvas"); c.width = c.height = s;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(inner, "rgba(255,255,255,0.5)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
    const tex = new CanvasTexture(c); tex.colorSpace = SRGBColorSpace; return track(tex);
  }
  const dotTex = radialTexture(0.35);

  /* ---------- Fresnel "ghost" material (X-ray look) ---------- */
  function ghostMat(color, inner, rim, power) {
    return track(new ShaderMaterial({
      transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide,
      uniforms: { uColor: { value: color }, uInner: { value: inner }, uRim: { value: rim }, uPower: { value: power } },
      vertexShader: `
        varying vec3 vN; varying vec3 vWP;
        void main(){
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWP = wp.xyz; vN = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        uniform vec3 uColor; uniform float uInner; uniform float uRim; uniform float uPower;
        varying vec3 vN; varying vec3 vWP;
        void main(){
          vec3 V = normalize(cameraPosition - vWP);
          float f = pow(1.0 - abs(dot(normalize(vN), V)), uPower);
          gl_FragColor = vec4(uColor, uInner + f * uRim);
        }`,
    }));
  }
  const skinMat   = ghostMat(SIGNAL, 0.03,  0.70, 2.9);  // the arm / body
  const sleeveMat = ghostMat(SIGNAL, 0.055, 1.05, 1.9);  // the fabric sleeve band (brighter)

  /* ---------- the arm centreline (shoulder → wrist) ---------- */
  const curve = new CatmullRomCurve3([
    new Vector3(-1.40, 2.55, -0.30),  // shoulder top
    new Vector3(-1.08, 1.95,  0.00),  // deltoid
    new Vector3(-0.86, 0.85,  0.18),  // mid upper-arm (biceps)
    new Vector3(-0.55,-0.15,  0.12),  // elbow
    new Vector3( 0.12,-0.55,  0.52),  // forearm start (kicks forward)
    new Vector3( 0.98,-1.20,  0.52),  // mid forearm
    new Vector3( 1.78,-1.88,  0.26),  // wrist
  ], false, "catmullrom", 0.5);

  const SEG = 140, RADIAL = 20;
  const frames = curve.computeFrenetFrames(SEG, false);

  // radius profile along the limb (u 0 = shoulder, 1 = wrist)
  const rCtrl = [[0,0.52],[0.06,0.60],[0.18,0.45],[0.30,0.37],[0.47,0.28],[0.52,0.28],[0.66,0.41],[0.82,0.27],[1,0.18]];
  function radiusAt(u) {
    for (let i = 1; i < rCtrl.length; i++) {
      if (u <= rCtrl[i][0]) {
        const a = rCtrl[i-1], b = rCtrl[i], k = (u - a[0]) / (b[0] - a[0]);
        return a[1] + (b[1] - a[1]) * k;
      }
    }
    return rCtrl[rCtrl.length-1][1];
  }

  // generalized swept tube with variable radius + normals
  const _P = new Vector3();
  function buildTube(uStart, uEnd, rScale) {
    const pos = [], nrm = [], idx = [], rv = RADIAL + 1;
    const n0 = Math.round(uStart * SEG), n1 = Math.round(uEnd * SEG), rings = n1 - n0;
    for (let i = 0; i <= rings; i++) {
      const si = n0 + i, u = si / SEG;
      curve.getPointAt(u, _P);
      const N = frames.normals[si], B = frames.binormals[si], r = radiusAt(u) * rScale;
      for (let j = 0; j <= RADIAL; j++) {
        const a = (j / RADIAL) * Math.PI * 2, cx = Math.cos(a), sy = Math.sin(a);
        const nx = cx*N.x + sy*B.x, ny = cx*N.y + sy*B.y, nz = cx*N.z + sy*B.z;
        pos.push(_P.x + r*nx, _P.y + r*ny, _P.z + r*nz); nrm.push(nx, ny, nz);
      }
    }
    for (let i = 0; i < rings; i++) for (let j = 0; j < RADIAL; j++) {
      const a = i*rv + j, b = (i+1)*rv + j, c = (i+1)*rv + j+1, d = i*rv + j+1;
      idx.push(a, b, d, b, c, d);
    }
    const g = track(new BufferGeometry());
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new Float32BufferAttribute(nrm, 3));
    g.setIndex(idx);
    return g;
  }

  // the arm itself
  world.add(new Mesh(buildTube(0.02, 1.0, 1.0), skinMat));
  // the sleeve: two fabric bands over biceps + forearm (slightly larger, brighter)
  world.add(new Mesh(buildTube(0.12, 0.40, 1.1), sleeveMat));
  world.add(new Mesh(buildTube(0.55, 0.86, 1.1), sleeveMat));

  /* ---------- shoulder / body hint ---------- */
  const shoulder = new Mesh(track(new SphereGeometry(0.46, 24, 18)), skinMat);
  curve.getPointAt(0.03, shoulder.position);
  world.add(shoulder);
  const torso = new Mesh(track(new SphereGeometry(0.9, 20, 16)), ghostMat(SIGNAL, 0.012, 0.22, 3.4));
  torso.position.set(-2.45, 1.35, -1.2); torso.scale.set(1.0, 1.2, 0.6);
  world.add(torso);

  /* ---------- hand (palm + fingers) ---------- */
  const hand = new Group();
  curve.getPointAt(1.0, hand.position);
  const T = curve.getTangentAt(1.0, new Vector3());
  hand.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), T); // local +Y points out of the wrist
  const palm = new Mesh(track(new SphereGeometry(0.22, 18, 14)), skinMat);
  palm.position.set(0, 0.26, 0); palm.scale.set(1.0, 0.62, 0.72);
  hand.add(palm);
  const fingerGeo = track(new CylinderGeometry(0.03, 0.055, 0.34, 8, 1, true));
  for (let i = 0; i < 4; i++) {
    const f = new Mesh(fingerGeo, skinMat);
    f.position.set(-0.165 + i * 0.11, 0.52, 0.02);
    f.rotation.z = (-0.18 + i * 0.12);
    hand.add(f);
  }
  const thumb = new Mesh(track(new CylinderGeometry(0.035, 0.055, 0.26, 8, 1, true)), skinMat);
  thumb.position.set(-0.24, 0.33, 0.05); thumb.rotation.z = 0.8;
  hand.add(thumb);
  world.add(hand);

  /* ---------- four circuit arrays on the sleeve surface ---------- */
  const CIRCUITS = [
    { u: 0.24, side:  1, color: SIGNAL }, // 11 Biceps/Deltoid (front)
    { u: 0.30, side: -1, color: AMBER  }, // 12 Triceps (back)
    { u: 0.66, side: -1, color: SIGNAL }, // 13 Posterior forearm extensors
    { u: 0.78, side:  1, color: SIGNAL }, // 14 Anterior forearm flexors
  ];
  const nodePos = [], nodeCol = [], linePos = [], lineCol = [];
  CIRCUITS.forEach(({ u, side, color }) => {
    const si = Math.round(u * SEG);
    const C = curve.getPointAt(u, new Vector3());
    const N = frames.normals[si], B = frames.binormals[si], Tg = frames.tangents[si];
    const out = new Vector3(N.x*side, N.y*side, N.z*side);
    const base = C.clone().add(out.clone().multiplyScalar(radiusAt(u) * 1.16));
    const tan = new Vector3(Tg.x, Tg.y, Tg.z);
    const bi  = new Vector3(B.x*side, B.y*side, B.z*side);
    const tri = [
      base.clone().add(tan.clone().multiplyScalar(0.42)),
      base.clone().add(tan.clone().multiplyScalar(-0.3)).add(bi.clone().multiplyScalar(0.3)),
      base.clone().add(tan.clone().multiplyScalar(-0.3)).add(bi.clone().multiplyScalar(-0.3)),
    ];
    const nodes = [];
    for (let i = 0; i < 3; i++) { nodes.push(tri[i]); nodes.push(tri[i].clone().add(tri[(i+1)%3]).multiplyScalar(0.5)); }
    nodes.push(base);
    nodes.forEach((p) => { nodePos.push(p.x, p.y, p.z); nodeCol.push(color.r, color.g, color.b); });
    for (let i = 0; i < 3; i++) {
      const p = tri[i], q = tri[(i+1)%3];
      linePos.push(p.x,p.y,p.z, q.x,q.y,q.z);
      lineCol.push(color.r,color.g,color.b, color.r,color.g,color.b);
    }
  });

  const pointVert = `
    attribute vec3 color; varying vec3 vColor; uniform float uSize;
    void main(){ vColor=color; vec4 mv=modelViewMatrix*vec4(position,1.0);
      gl_PointSize=uSize*(1.0/-mv.z); gl_Position=projectionMatrix*mv; }`;
  const pointFrag = `
    uniform sampler2D uTex; varying vec3 vColor;
    void main(){ float a=texture2D(uTex,gl_PointCoord).a; if(a<0.01)discard; gl_FragColor=vec4(vColor,a); }`;

  const nodeGeo = track(new BufferGeometry());
  nodeGeo.setAttribute("position", new Float32BufferAttribute(nodePos, 3));
  nodeGeo.setAttribute("color", new Float32BufferAttribute(nodeCol, 3));
  world.add(new Points(nodeGeo, track(new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uTex: { value: dotTex }, uSize: { value: 36 * Math.min(window.devicePixelRatio, 2) } },
    vertexShader: pointVert, fragmentShader: pointFrag,
  }))));

  const lineGeo = track(new BufferGeometry());
  lineGeo.setAttribute("position", new Float32BufferAttribute(linePos, 3));
  lineGeo.setAttribute("color", new Float32BufferAttribute(lineCol, 3));
  world.add(new LineSegments(lineGeo, track(new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8, blending: AdditiveBlending, depthWrite: false }))));

  /* ---------- flowing TENS signal pulses along the limb ---------- */
  const N_PULSE = 80;
  const pulsePos = new Float32Array(N_PULSE * 3), pulseCol = new Float32Array(N_PULSE * 3), pulseU = new Float32Array(N_PULSE);
  const _p = new Vector3();
  for (let i = 0; i < N_PULSE; i++) {
    pulseU[i] = Math.random();
    const col = i % 3 === 0 ? PULSE : SIGNAL;
    pulseCol[i*3]=col.r; pulseCol[i*3+1]=col.g; pulseCol[i*3+2]=col.b;
    curve.getPointAt(pulseU[i], _p); pulsePos[i*3]=_p.x; pulsePos[i*3+1]=_p.y; pulsePos[i*3+2]=_p.z;
  }
  const pulseGeo = track(new BufferGeometry());
  pulseGeo.setAttribute("position", new BufferAttribute(pulsePos, 3));
  pulseGeo.setAttribute("color", new BufferAttribute(pulseCol, 3));
  world.add(new Points(pulseGeo, track(new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uTex: { value: dotTex }, uSize: { value: 16 * Math.min(window.devicePixelRatio, 2) } },
    vertexShader: pointVert, fragmentShader: pointFrag,
  }))));

  /* ---------- electrode emitter rings ---------- */
  const rings = [];
  function addRing(u, side, color) {
    const si = Math.round(u * SEG), C = curve.getPointAt(u, new Vector3());
    const N = frames.normals[si];
    C.add(new Vector3(N.x*side, N.y*side, N.z*side).multiplyScalar(radiusAt(u) * 1.2));
    const seg = 48, arr = new Float32Array(seg * 3), geo = track(new BufferGeometry());
    for (let i = 0; i < seg; i++) { const a = (i/seg)*Math.PI*2; arr[i*3]=Math.cos(a); arr[i*3+1]=Math.sin(a); arr[i*3+2]=0; }
    geo.setAttribute("position", new BufferAttribute(arr, 3));
    const mat = track(new LineBasicMaterial({ color, transparent: true, blending: AdditiveBlending, depthWrite: false }));
    const ring = new LineLoop(geo, mat); ring.position.copy(C);
    world.add(ring); rings.push({ ring, mat, phase: Math.random() });
  }
  addRing(0.24, 1, SIGNAL); addRing(0.78, 1, PULSE); addRing(0.30, -1, PASS);

  /* ---------- engineering grid floor ---------- */
  const gpos = [], gN = 18, gStep = 0.95, gExt = (gN * gStep) / 2;
  for (let i = 0; i <= gN; i++) { const o = -gExt + i*gStep; gpos.push(-gExt,0,o, gExt,0,o, o,0,-gExt, o,0,gExt); }
  const gGeo = track(new BufferGeometry());
  gGeo.setAttribute("position", new Float32BufferAttribute(gpos, 3));
  const grid = new LineSegments(gGeo, track(new LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.06, depthWrite: false })));
  grid.position.set(0, -3.3, -1); grid.rotation.x = -0.08;
  world.add(grid);

  /* ---------- sizing (responsive reframing) ---------- */
  function resize() {
    const r = canvas.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const portrait = (w / h) < 0.85;
    world.position.x = portrait ? 0.05 : 1.1;
    world.scale.setScalar(portrait ? 0.6 : 0.8);
    camera.position.z = portrait ? 10.6 : 9;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* ---------- parallax ---------- */
  const target = { x: 0, y: 0 };
  if (!reduce) window.addEventListener("pointermove", (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ---------- animation ---------- */
  const _pp = new Vector3();
  let rx = 0.05, ry = -0.42, running = false;
  function frame(ms) {
    const t = ms * 0.001;
    const swayY = -0.42 + Math.sin(t * 0.16) * 0.2;
    ry += ((target.x * 0.32 + swayY) - ry) * 0.05;
    rx += ((-target.y * 0.2 + 0.05 + Math.sin(t * 0.12) * 0.035) - rx) * 0.05;
    world.rotation.y = ry; world.rotation.x = rx;
    const pa = pulseGeo.attributes.position;
    for (let i = 0; i < N_PULSE; i++) {
      let u = pulseU[i] + 0.0015 + (i % 3 === 0 ? 0.0006 : 0); if (u > 1) u -= 1; pulseU[i] = u;
      curve.getPointAt(u, _pp); pa.array[i*3]=_pp.x; pa.array[i*3+1]=_pp.y; pa.array[i*3+2]=_pp.z;
    }
    pa.needsUpdate = true;
    for (let i = 0; i < rings.length; i++) {
      const r = rings[i], k = (t * 0.5 + r.phase) % 1;
      r.ring.scale.setScalar(0.12 + k * 0.95);
      r.mat.opacity = Math.max(0, 0.7 * (1 - k));
    }
    renderer.render(scene, camera);
  }
  function loop(ms) { if (running) frame(ms); }
  function start() { if (!running && !reduce) { running = true; renderer.setAnimationLoop(loop); } }
  function stop() { running = false; renderer.setAnimationLoop(null); }

  resize(); frame(0);
  if (reduce) { /* static frame only */ }
  else if ("IntersectionObserver" in window) new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? start() : stop())), { threshold: 0 }).observe(canvas);
  else start();
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  window.addEventListener("pagehide", () => { stop(); disposables.forEach((o) => o.dispose && o.dispose()); renderer.dispose(); }, { once: true });
}
