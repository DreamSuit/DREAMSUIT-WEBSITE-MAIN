/* ============================================================
   DreamSleeve — hero 3D scene
   A TENS neuro-signal field: a stylized bent-arm sleeve carrying the
   four circuit arrays (11-14), signal pulses, and electrode emitters.
   Imperative Three.js (r169), transparent canvas, unlit additive "HUD"
   look — no lights, no post-processing. Built per the threejs-* skills:
   cap pixel ratio, setAnimationLoop, dispose on teardown, no per-frame
   allocation, prefers-reduced-motion aware, pauses when off-screen.
   ============================================================ */
import {
  Scene, PerspectiveCamera, WebGLRenderer, Group, Mesh, CylinderGeometry,
  MeshBasicMaterial, BufferGeometry, BufferAttribute, Float32BufferAttribute,
  Points, ShaderMaterial, LineSegments, LineLoop, LineBasicMaterial, AdditiveBlending,
  Color, Vector3, CanvasTexture, Fog, DoubleSide, NoToneMapping, SRGBColorSpace,
} from "three";

const canvas = document.getElementById("heroGL");
if (canvas && canvas.getContext) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // brand palette
  const SIGNAL = new Color("#2FE4E4"); // cyan
  const PULSE  = new Color("#FF3DD8"); // magenta
  const PASS   = new Color("#38E88A"); // green
  const AMBER  = new Color("#F5C542"); // amber
  const VOID   = new Color("#05070E");

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping; // unlit neon — keep colors punchy
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  scene.fog = new Fog(VOID.getHex(), 7, 17);

  const camera = new PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.2, 8.4);
  camera.lookAt(0, 0, 0);

  const world = new Group();        // everything that rotates / parallaxes
  world.position.set(0.9, -0.1, 0); // shift the device toward the right of the headline
  world.scale.setScalar(0.92);
  scene.add(world);

  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };

  /* ---------- soft radial sprite textures ---------- */
  function radialTexture(inner) {
    const s = 64, c = document.createElement("canvas");
    c.width = c.height = s;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(inner, "rgba(255,255,255,0.55)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;
    return track(tex);
  }
  const dotTex = radialTexture(0.35);

  /* ---------- the arm / sleeve path ---------- */
  const shoulder = new Vector3(-0.45, 2.55, 0.10);
  const elbow    = new Vector3( 0.10, 0.10, 0.50);
  const wrist    = new Vector3( 1.95, -1.05, -0.20);

  // point along the two-segment centreline, u in [0,1]
  const _a = new Vector3(), _b = new Vector3();
  function armPoint(u, out) {
    if (u < 0.5) return out.copy(shoulder).lerp(_a.copy(elbow), u / 0.5);
    return out.copy(elbow).lerp(_b.copy(wrist), (u - 0.5) / 0.5);
  }

  // place a tapered tube between two points (axis Y -> direction)
  const UP = new Vector3(0, 1, 0);
  function tube(from, to, rTop, rBot, mat) {
    const h = from.distanceTo(to);
    const geo = track(new CylinderGeometry(rTop, rBot, h, 18, 7, true));
    const m = new Mesh(geo, mat);
    m.position.copy(from).add(to).multiplyScalar(0.5);
    const dir = _a.copy(to).sub(from).normalize();
    m.quaternion.setFromUnitVectors(UP, dir);
    return m;
  }

  // translucent sleeve shell + wireframe skin
  const shellMat = track(new MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.05, side: DoubleSide, depthWrite: false }));
  const wireMat  = track(new MeshBasicMaterial({ color: SIGNAL, wireframe: true, transparent: true, opacity: 0.11, depthWrite: false }));
  const sleeve = new Group();
  [[shoulder, elbow, 0.34, 0.50], [elbow, wrist, 0.24, 0.36]].forEach(([f, t, rt, rb]) => {
    sleeve.add(tube(f, t, rt, rb, shellMat));
    sleeve.add(tube(f, t, rt * 1.01, rb * 1.01, wireMat));
  });
  world.add(sleeve);

  /* ---------- four circuit arrays (11-14) ---------- */
  // each: a small triangle of actuator nodes on the sleeve surface
  const CIRCUITS = [
    { u: 0.26, side:  1, z:  0.55, color: SIGNAL }, // 11 Biceps/Deltoid (anterior)
    { u: 0.34, side: -1, z: -0.55, color: AMBER  }, // 12 Triceps (posterior)
    { u: 0.68, side: -1, z: -0.42, color: SIGNAL }, // 13 Posterior forearm extensors
    { u: 0.80, side:  1, z:  0.42, color: SIGNAL }, // 14 Anterior forearm flexors
  ];
  const nodePos = [], nodeCol = [], linePos = [], lineCol = [];
  const _c = new Vector3(), _t = new Vector3();
  CIRCUITS.forEach(({ u, side, z, color }) => {
    armPoint(u, _c);
    armPoint(u + 0.001, _t);
    const axis = _t.sub(_c).normalize();           // local "down the arm"
    const nrm = new Vector3(side * 0.5, 0, z).normalize(); // out to the surface
    const tan = new Vector3().crossVectors(axis, nrm).normalize();
    const base = _c.clone().add(nrm.clone().multiplyScalar(0.42));
    // triangle vertices
    const tri = [
      base.clone().add(axis.clone().multiplyScalar(0.44)),
      base.clone().add(axis.clone().multiplyScalar(-0.3)).add(tan.clone().multiplyScalar(0.34)),
      base.clone().add(axis.clone().multiplyScalar(-0.3)).add(tan.clone().multiplyScalar(-0.34)),
    ];
    // actuator nodes: vertices + edge midpoints (gold-chip feel)
    const nodes = [];
    for (let i = 0; i < 3; i++) {
      nodes.push(tri[i]);
      nodes.push(tri[i].clone().add(tri[(i + 1) % 3]).multiplyScalar(0.5));
    }
    nodes.push(base); // center lock
    nodes.forEach((p) => { nodePos.push(p.x, p.y, p.z); nodeCol.push(color.r, color.g, color.b); });
    // triangle outline
    for (let i = 0; i < 3; i++) {
      const p = tri[i], q = tri[(i + 1) % 3];
      linePos.push(p.x, p.y, p.z, q.x, q.y, q.z);
      lineCol.push(color.r, color.g, color.b, color.r, color.g, color.b);
    }
  });

  // circuit node points
  const nodeGeo = track(new BufferGeometry());
  nodeGeo.setAttribute("position", new Float32BufferAttribute(nodePos, 3));
  nodeGeo.setAttribute("color", new Float32BufferAttribute(nodeCol, 3));
  const nodeMat = track(new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uTex: { value: dotTex }, uSize: { value: 34 * Math.min(window.devicePixelRatio, 2) } },
    vertexShader: `
      attribute vec3 color; varying vec3 vColor; uniform float uSize;
      void main(){ vColor=color; vec4 mv=modelViewMatrix*vec4(position,1.0);
        gl_PointSize=uSize*(1.0/-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `
      uniform sampler2D uTex; varying vec3 vColor;
      void main(){ float a=texture2D(uTex,gl_PointCoord).a; if(a<0.01)discard;
        gl_FragColor=vec4(vColor,a); }`,
  }));
  world.add(new Points(nodeGeo, nodeMat));

  // circuit outlines
  const lineGeo = track(new BufferGeometry());
  lineGeo.setAttribute("position", new Float32BufferAttribute(linePos, 3));
  lineGeo.setAttribute("color", new Float32BufferAttribute(lineCol, 3));
  const lineMat = track(new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.65, blending: AdditiveBlending, depthWrite: false }));
  world.add(new LineSegments(lineGeo, lineMat));

  /* ---------- flowing TENS signal pulses ---------- */
  const N_PULSE = 70;
  const pulsePos = new Float32Array(N_PULSE * 3);
  const pulseCol = new Float32Array(N_PULSE * 3);
  const pulseU = new Float32Array(N_PULSE);     // param along arm
  const _p = new Vector3();
  for (let i = 0; i < N_PULSE; i++) {
    pulseU[i] = Math.random();
    const col = i % 3 === 0 ? PULSE : SIGNAL;
    pulseCol[i * 3] = col.r; pulseCol[i * 3 + 1] = col.g; pulseCol[i * 3 + 2] = col.b;
    armPoint(pulseU[i], _p);
    pulsePos[i * 3] = _p.x; pulsePos[i * 3 + 1] = _p.y; pulsePos[i * 3 + 2] = _p.z;
  }
  const pulseGeo = track(new BufferGeometry());
  pulseGeo.setAttribute("position", new BufferAttribute(pulsePos, 3));
  pulseGeo.setAttribute("color", new BufferAttribute(pulseCol, 3));
  const pulseMat = track(new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uTex: { value: dotTex }, uSize: { value: 15 * Math.min(window.devicePixelRatio, 2) } },
    vertexShader: nodeMat.vertexShader, fragmentShader: nodeMat.fragmentShader,
  }));
  world.add(new Points(pulseGeo, pulseMat));

  /* ---------- electrode emitter rings ---------- */
  const rings = [];
  function addRing(u, side, z, color) {
    armPoint(u, _c);
    const nrm = new Vector3(side * 0.5, 0, z).normalize();
    const pos = _c.add(nrm.multiplyScalar(0.5));
    const seg = 48, arr = new Float32Array(seg * 3);
    const geo = track(new BufferGeometry());
    for (let i = 0; i < seg; i++) { const a = (i / seg) * Math.PI * 2; arr[i*3]=Math.cos(a); arr[i*3+1]=Math.sin(a); arr[i*3+2]=0; }
    geo.setAttribute("position", new BufferAttribute(arr, 3));
    const mat = track(new LineBasicMaterial({ color, transparent: true, blending: AdditiveBlending, depthWrite: false }));
    const ring = new LineLoop(geo, mat);
    ring.position.copy(pos);
    world.add(ring);
    rings.push({ ring, mat, phase: Math.random() });
  }
  addRing(0.26, 1, 0.55, SIGNAL);
  addRing(0.80, 1, 0.42, PULSE);
  addRing(0.34, -1, -0.55, PASS);

  /* ---------- engineering grid floor ---------- */
  const gpos = [], gN = 18, gStep = 0.9, gExt = (gN * gStep) / 2;
  for (let i = 0; i <= gN; i++) {
    const o = -gExt + i * gStep;
    gpos.push(-gExt, 0, o, gExt, 0, o, o, 0, -gExt, o, 0, gExt);
  }
  const gGeo = track(new BufferGeometry());
  gGeo.setAttribute("position", new Float32BufferAttribute(gpos, 3));
  const gMat = track(new LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.06, depthWrite: false }));
  const grid = new LineSegments(gGeo, gMat);
  grid.position.set(0, -3.1, -1);
  grid.rotation.x = -0.08;
  world.add(grid);

  /* ---------- sizing ---------- */
  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // reframe for narrow / portrait viewports so the device stays on-screen
    const portrait = (w / h) < 0.85;
    world.position.x = portrait ? 0.15 : 0.9;
    world.scale.setScalar(portrait ? 0.7 : 0.92);
    camera.position.z = portrait ? 9.8 : 8.4;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* ---------- mouse parallax ---------- */
  const target = { x: 0, y: 0 };
  if (!reduce) {
    window.addEventListener("pointermove", (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  /* ---------- animation ---------- */
  const _pp = new Vector3();
  let rx = 0.05, ry = -0.38, running = false;  // composed 3/4 start pose
  function frame(ms) {
    const t = ms * 0.001;
    // parallax + gentle 3/4 sway (no full spin — keeps circuits facing us)
    const swayY = -0.38 + Math.sin(t * 0.18) * 0.22;
    ry += ((target.x * 0.35 + swayY) - ry) * 0.05;
    rx += ((-target.y * 0.22 + 0.05 + Math.sin(t * 0.13) * 0.04) - rx) * 0.05;
    world.rotation.y = ry;
    world.rotation.x = rx;
    // advance pulses down the arm
    const pa = pulseGeo.attributes.position;
    for (let i = 0; i < N_PULSE; i++) {
      let u = pulseU[i] + 0.0016 + (i % 3 === 0 ? 0.0006 : 0);
      if (u > 1) u -= 1;
      pulseU[i] = u;
      armPoint(u, _pp);
      pa.array[i*3] = _pp.x; pa.array[i*3+1] = _pp.y; pa.array[i*3+2] = _pp.z;
    }
    pa.needsUpdate = true;
    // pulse electrode rings
    for (let i = 0; i < rings.length; i++) {
      const r = rings[i];
      const k = (t * 0.5 + r.phase) % 1;
      const s = 0.12 + k * 0.9;
      r.ring.scale.setScalar(s);
      r.mat.opacity = Math.max(0, 0.7 * (1 - k));
    }
    renderer.render(scene, camera);
  }

  function loop(ms) { if (running) frame(ms); }
  function start() { if (!running && !reduce) { running = true; renderer.setAnimationLoop(loop); } }
  function stop() { running = false; renderer.setAnimationLoop(null); }

  // first paint (also the only paint under reduced motion)
  resize();
  frame(0);

  if (reduce) {
    // static frame only
  } else if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? start() : stop())), { threshold: 0 }).observe(canvas);
  } else {
    start();
  }
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  /* ---------- teardown ---------- */
  window.addEventListener("pagehide", () => {
    stop();
    disposables.forEach((o) => o.dispose && o.dispose());
    renderer.dispose();
  }, { once: true });
}
