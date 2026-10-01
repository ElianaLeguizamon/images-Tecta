// Grid and math utility functions
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (min, max, value) => {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
};
const getPointID = (j, i, gridH) => i * gridH + j;
const hash = (n) => (Math.sin(n) * 43758.5453123) % 1;
const getPointsForGridId = () => [];
const getEdgeIdsForGridId = () => [];

console.clear();

let fullCode = 'Architecture Roof Myths TECTA 建筑 结构 历史 传说 中式 瓦 梁 飞檐 斗拱 传统 文化 魅力 ';
let updateCurtainText = (newText) => {
  if (typeof window !== 'undefined' && window.updateCurtainText) {
    window.updateCurtainText(newText);
  }
};

const w = 449;
const h = 557;
const dpr = Math.min((typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1, 2);

// Configuración original y estándar de Liam Egan (compartida para todas las pantallas)
const CONFIG = {
  awidth: w,
  aheight: h,
  gridW: 44,
  gridH: 42,
  gravity: 0.2,
  damping: 0.99,
  iterationsPerFrame: 5,
  compressFactor: 0.02,
  stretchFactor: 1.1,
  mouseSize: 6000,
  mouseStrength: 4,
  contain: false,
  randomSolve: false,
  paddingLeft: 0,
  preset: ''
};
CONFIG.cellWidth = CONFIG.awidth / (CONFIG.gridW - 1);
CONFIG.cellHeight = CONFIG.aheight / (CONFIG.gridH - 1);

function sizeCanvas() {
  if (!c) return;
  const containerEl = document.getElementById('container');
  const canvasWidth = containerEl && containerEl.clientWidth ? containerEl.clientWidth : (window.innerWidth || 1440);
  const canvasHeight = 600;
  c.style.width = canvasWidth + 'px';
  c.style.height = canvasHeight + 'px';
  c.style.position = 'relative';
  c.style.left = '0px';
  c.style.top = '0px';
  c.width = Math.round(canvasWidth * dpr);
  c.height = Math.round(canvasHeight * dpr);
}

window.addEventListener('resize', () => {
  if (c && c.width) sizeCanvas();
});

let rafID, input, c;
function main() {
  if (rafID) cancelAnimationFrame(rafID);
  if (input) input.unbind();

  const containerEl = document.getElementById('container');
  if (!containerEl) {
    console.warn("Element #container not found yet, retrying...");
    setTimeout(main, 100);
    return;
  }

  fullCode = 'Architecture Roof Myths TECTA 建筑 结构 历史 传说 中式 瓦 梁 飞檐 斗拱 传统 文化 魅力 ';
  const {
    awidth: width,
    aheight: height,
    gridW,
    gridH,
    gravity,
    damping,
    iterationsPerFrame,
    compressFactor,
    stretchFactor,
    cellWidth,
    cellHeight
  } = CONFIG;

  const charCanvases = {};
  const fontSize = Math.max(13, Math.round(cellHeight * 1.08));
  const box = Math.ceil(fontSize * 1.6);

  function createCharCanvas(ch) {
    if (charCanvases[ch] || ch === ' ') return;
    const off = document.createElement('canvas');
    off.width = off.height = box * dpr;
    const octx = off.getContext('2d');
    octx.scale(dpr, dpr);
    octx.font = `300 ${fontSize}px 'Outfit', 'Noto Sans Thai', 'Noto Sans Arabic', 'Noto Sans JP', 'Noto Sans SC', 'Microsoft YaHei', 'Meiryo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillStyle = 'rgba(24, 28, 32, 0.85)'; // Tipografía limpia y color negro carbón elegante
    octx.fillText(ch, box / 2, box / 2);
    off.logicalSize = box;
    charCanvases[ch] = off;
  }

  function getGlyphList(text) {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      return Array.from(seg.segment(text), s => s.segment);
    }
    return Array.from(text);
  }

  const initialGlyphs = getGlyphList(fullCode);
  for (const ch of new Set(initialGlyphs)) {
    createCharCanvas(ch);
  }

  c = document.createElement('canvas');
  containerEl.innerHTML = '';
  containerEl.appendChild(c);
  sizeCanvas();
  const ctx = c.getContext('2d');

  const particles = [];
  const constraints = [], horizontalConstraints = [];
  const pinnedParticles = [];

  input = new Input({ c, particles });

  // Creación de partículas de la cuadrícula
  for (let i = 0; i < gridW; i++) {
    for (let j = 0; j < gridH; j++) {
      let x = i * cellWidth;
      let y = j * cellHeight;
      const id = getPointID(j, i, gridH);
      const pinned = j === 0; // Fila superior anclada justo bajo el alero
      const charIndex = (i + j * gridW) % initialGlyphs.length;
      const char = initialGlyphs[charIndex] || ' ';
      const particle = new Particle({ x, y, pinned, id, char });
      particles.push(particle);
      if (pinned) pinnedParticles.push(particle);
    }
  }

  // Exponer función dinámica para actualizar la textura tipográfica de la tela sin reiniciar el motor de física
  window.updateCurtainText = function(newText) {
    if (!newText || !particles || !particles.length) return;
    fullCode = newText;
    const glyphs = getGlyphList(newText);
    for (const ch of new Set(glyphs)) {
      createCharCanvas(ch);
    }
    for (let idx = 0; idx < particles.length; idx++) {
      const i = Math.floor(idx / gridH);
      const j = idx % gridH;
      const charIndex = (i + j * gridW) % glyphs.length;
      particles[idx].char = glyphs[charIndex] || ' ';
    }
  };
  updateCurtainText = window.updateCurtainText;

  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      for (const k of Object.keys(charCanvases)) {
        delete charCanvases[k];
      }
      if (typeof updateCurtainText === 'function') {
        updateCurtainText(fullCode);
      }
    });
  }

  // Creación de restricciones verticales y espaciadores horizontales de Liam Egan
  for (let i = 0; i < gridW; i++) {
    for (let j = 0; j < gridH; j++) {
      const id = getPointID(j, i, gridH);
      const p = particles[id];

      // Restricción vertical
      if (j < gridH - 1) {
        const bottomP = particles[getPointID(j + 1, i, gridH)];
        const constraint = new Constraint({
          p1: p,
          p2: bottomP,
          length: cellHeight,
          id: id + gridW * gridH,
          compressFactor,
          stretchFactor,
        });
        constraints.push(constraint);
        p.downConstraint = constraint;
      }

      // Restricción horizontal espaciadora elástica para dar coherencia de cortina fluida
      if (i < gridW - 1) {
        const rightP = particles[getPointID(j, i + 1, gridH)];
        const hc = new Constraint({
          p1: p,
          p2: rightP,
          length: cellWidth,
          id: id + gridW * gridH * 2,
          compressFactor: 0.6,
          stretchFactor: 4,
          isSpacer: true,
        });
        constraints.push(hc);
        horizontalConstraints.push(hc);
      }
    }
  }

  function drawCode() {
    const paddingLeft = CONFIG.paddingLeft || 0;
    const offsetX = (c.width / dpr - width) / 2 + paddingLeft;
    const offsetY = 0; // Posición exacta justo bajo el techo
    particles.forEach((p) => {
      if (!p.char || p.char === ' ') return;
      const img = charCanvases[p.char];
      if (!img) return;

      let cos = 1, sin = 0;
      const constraint = p.downConstraint;
      if (constraint) {
        const dx = constraint.p2.pos.x - constraint.p1.pos.x;
        const dy = constraint.p2.pos.y - constraint.p1.pos.y;
        const angle = Math.atan2(dy, dx) - Math.PI / 2;
        cos = Math.cos(angle);
        sin = Math.sin(angle);
      }

      const tx = p.pos.x + offsetX;
      const ty = p.pos.y + offsetY;
      ctx.setTransform(dpr * cos, dpr * sin, -dpr * sin, dpr * cos, dpr * tx, dpr * ty);
      const half = img.logicalSize / 2;
      ctx.drawImage(img, -half, -half, img.logicalSize, img.logicalSize);
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  let lastDelta = 0;
  function runloop(delta) {
    rafID = requestAnimationFrame(runloop);

    ctx.save();
    ctx.clearRect(0, 0, c.width, c.height);

    const rawDelta = lastDelta ? Math.min(delta - lastDelta, 32) : 16;
    particles.forEach((p) => p.update(rawDelta));
    lastDelta = delta;

    if (CONFIG.randomSolve) shuffleArray(constraints);
    for (let i = 0; i < iterationsPerFrame; i++) {
      for (let j = 0; j < constraints.length; j++) constraints[j].solve();
    }

    if (CONFIG.contain) particles.forEach((p) => p.contain());

    drawCode();

    ctx.restore();
  }
  rafID = requestAnimationFrame(runloop);
}

class Input {
  constructor({ c, particles }) {
    this.c = c;
    this.particles = particles;
    this.mousePos = new Vec2();
    this.grabRadius = 20;
    this.bind();
  }
  setMouse(e) {
    const rect = this.c.getBoundingClientRect();
    const scaleX = (this.c.width / dpr) / (rect.width || 1);
    const scaleY = (this.c.height / dpr) / (rect.height || 1);
    const offsetX = (this.c.width / dpr - CONFIG.awidth) / 2;
    const offsetY = 0;
    this.mousePos.x = (e.clientX - rect.left) * scaleX - offsetX;
    this.mousePos.y = (e.clientY - rect.top) * scaleY - offsetY;
  }
  pointerdown(e) {
    this.setMouse(e);
    for (const p of this.particles) {
      if (this.mousePos.subtractNew(p.pos).length < this.grabRadius) {
        this.grabbedParticle = p;
        this.grabbedParticle.originalPinnedState = this.grabbedParticle.pinned;
        this.grabbedParticle.pinned = true;
        break;
      }
    }
    if (!this.grabbedParticle) {
      this.pointerIsDown = true;
    }
  }
  pointerup(e) {
    if (this.grabbedParticle) {
      this.grabbedParticle.pinned = this.grabbedParticle.originalPinnedState;
      this.grabbedParticle = null;
    }
    clearTimeout(this.pointerUpTimer);
    this.pointerUpTimer = setTimeout(() => {
      this.pointerIsDown = false;
    }, 1000);
  }
  pointermove(e) {
    this.setMouse(e);
    if (this.grabbedParticle) {
      this.grabbedParticle.pos.reset(this.mousePos.x, this.mousePos.y);
      this.grabbedParticle.oldPos.reset(this.mousePos.x, this.mousePos.y);
    }
    for (const p of this.particles) {
      const diff = this.mousePos.subtractNew(p.pos);
      const ls = diff.lengthSquared;
      if (ls < CONFIG.mouseSize) {
        const a = diff.angle - Math.PI;
        const strength =
          (smoothstep(CONFIG.mouseSize, -2000, ls) * CONFIG.mouseStrength) / 300;
        const force = new Vec2(Math.cos(a) * strength, Math.sin(a) * strength);
        p.applyForce(force);
      }
    }
  }
  contextmenu(e) {
    e.preventDefault();
  }
  bind() {
    this.pointerdown = this.pointerdown.bind(this);
    this.pointerup = this.pointerup.bind(this);
    this.pointermove = this.pointermove.bind(this);
    this.contextmenu = this.contextmenu.bind(this);
    document.addEventListener('pointerdown', this.pointerdown);
    document.addEventListener('pointerup', this.pointerup);
    document.addEventListener('pointermove', this.pointermove);
    document.addEventListener('contextmenu', this.contextmenu);
  }
  unbind() {
    document.removeEventListener('pointerdown', this.pointerdown);
    document.removeEventListener('pointerup', this.pointerup);
    document.removeEventListener('pointermove', this.pointermove);
    document.removeEventListener('contextmenu', this.contextmenu);
  }
}

class Vec2 {
  constructor(x = 0, y = 0) {
    this.reset(x, y);
  }
  zero() {
    this.reset(0, 0);
  }
  reset(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  clone() {
    return new Vec2(this.x, this.y);
  }
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  addNew(v) {
    return this.clone().add(v);
  }
  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  subtractNew(v) {
    return this.clone().subtract(v);
  }
  multiply(v) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }
  multiplyNew(v) {
    return this.clone().multiply(v);
  }
  scale(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  scaleNew(scalar) {
    return this.clone().scale(scalar);
  }
  get array() {
    return [this.x, this.y];
  }
  get lengthSquared() {
    return this.x ** 2 + this.y ** 2;
  }
  get length() {
    return Math.hypot(this.x, this.y);
  }
  get angle() {
    return Math.atan2(this.y, this.x);
  }
  [Symbol.iterator]() {
    let values = this.array;
    let i = 0;
    return {
      next() {
        if (i < values.length) {
          let value = values[i];
          i++;
          return { value, done: false };
        } else return { done: true };
      },
    };
  }
}

class Particle {
  constructor({ x, y, pinned, id, char } = {}) {
    this.pos = new Vec2(x, y);
    this.oldPos = new Vec2(x, y);
    this.velocity = new Vec2();
    this.acceleration = new Vec2();
    this.pinned = pinned;
    this.id = id;
    this.char = char;
    this.gravityVec = new Vec2();
  }
  contain() {
    if (this.pinned) return;
    const radius = 5;
    if (this.pos.x < radius) {
      this.pos.x = radius;
      this.oldPos.x = this.pos.x + Math.abs(this.oldPos.x - this.pos.x) * 0.8;
    } else if (this.pos.x > CONFIG.awidth - radius) {
      this.pos.x = CONFIG.awidth - radius;
      this.oldPos.x = this.pos.x - Math.abs(this.oldPos.x - this.pos.x) * 0.8;
    }
    if (this.pos.y < radius) {
      this.pos.y = radius;
      this.oldPos.y = this.pos.y + Math.abs(this.oldPos.y - this.pos.y) * 0.8;
    } else if (this.pos.y > CONFIG.aheight - radius) {
      this.pos.y = CONFIG.aheight - radius;
      this.oldPos.y = this.pos.y - Math.abs(this.oldPos.y - this.pos.y) * 0.8;
    }
  }
  update(delta) {
    if (this.pinned) {
      this.acceleration.zero();
      return;
    }

    this.velocity.reset(
      (this.pos.x - this.oldPos.x) * CONFIG.damping,
      (this.pos.y - this.oldPos.y) * CONFIG.damping,
    );

    this.oldPos.reset(...this.pos);

    const dd = delta ** 2;
    this.gravityVec.reset(0, CONFIG.gravity / dd);

    this.applyForce(this.gravityVec);

    this.pos.x += this.velocity.x + this.acceleration.x * dd;
    this.pos.y += this.velocity.y + this.acceleration.y * dd;

    this.acceleration.reset();
  }
  applyForce(v) {
    this.acceleration.add(v);
  }
}

class Constraint {
  constructor({
    p1,
    p2,
    length,
    id,
    compressFactor,
    stretchFactor,
    isSpacer,
  }) {
    this.p1 = p1;
    this.p2 = p2;
    this.length = length;
    this.id = id;
    this.isSpacer = isSpacer;
    this.minLength = length * (compressFactor !== undefined ? compressFactor : 0.02);
    this.maxLength = length * (stretchFactor !== undefined ? stretchFactor : 1.1);
  }
  solve() {
    const dx = this.p2.pos.x - this.p1.pos.x;
    const dy = this.p2.pos.y - this.p1.pos.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) return;

    let targetLength = this.length;
    if (distance < this.minLength) targetLength = this.minLength;
    else if (distance > this.maxLength) targetLength = this.maxLength;
    else return;

    const difference = targetLength - distance;
    const percent = difference / distance / 2;

    const offsetX = dx * percent;
    const offsetY = dy * percent;

    if (!this.p1.pinned) {
      this.p1.pos.x -= offsetX;
      this.p1.pos.y -= offsetY;
    }
    if (!this.p2.pinned) {
      this.p2.pos.x += offsetX;
      this.p2.pos.y += offsetY;
    }
  }
}

// Inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(main, 100));
} else {
  setTimeout(main, 100);
}

// Texto enriquecido con caligrafía y arquitectura marroquí tradicional formateado a 44 columnas para wrap simétrico perfecto
const moroccanCurtainText = 
  "TECTA السقوف المغربية العمارة الإسلامية فاس " +
  "خشب الأرز المنحوت والزليج التقليدي الأصيل   " +
  "فاس ومراكش تراث الأندلس وهندسة المغرب TECTA " +
  "Moroccan Architecture TECTA فن العمارة فاس  " +
  "أصالة وتاريخ زليج ونقش وتراث عريق خالد TECTA";

// Texto enriquecido con caligrafía y arquitectura rusa tradicional formateado a 44 columnas para wrap simétrico perfecto
const russianCurtainText = 
  "TECTA Русские купола луковичные главы TECTA " +
  "Деревянное зодчество и кокошники Руси TECTA " +
  "Traditional Russian Architecture TECTA Русь " +
  "Золотые купола и маковки старинных храмов   " +
  "Узорочье и великая история Древней Руси     ";

// Texto enriquecido con caligrafía y arquitectura tailandesa tradicional formateado a 44 columnas denso, parejo y uniforme de extremo a extremo
const thaiCurtainText = 
  "TECTA สถาปัตยกรรมไทย ช่อฟ้า ใบระกา หางหงส์ วัดไทย" +
  "หลังคาระดับ สถาปัตยกรรมไทย ช่อฟ้า วัดไทย ศิลปะโบราณ" +
  "Traditional Thai Architecture หลังคาระดับ ช่อฟ้า" +
  "ยอดพระปรางค์ โครงสร้างไม้งาม ใบระกา หางหงส์ วิจิตร" +
  "สถาปัตยกรรมไทย หลังคาระดับ ช่อฟ้า ศิลปะโบราณ TECTA";

const roofsData = {
  chinese: {
    mainSrc: './images/Copilot-20260917-103956-1@2x.png',
    title: 'The myths of Chinese roofs',
    desc: 'Featuring the iconic double-eaved xieshan hip-and-gable roof, glazed golden tiles, and red-painted wooden brackets. Every curve and upturned corner was designed to ward off evil spirits and shelter imperial majesty.',
    leftThumb: './images/Frame 1367 (1).png',
    rightThumb: './images/Frame 1365 (1).png',
    curtainText: 'Architecture Roof Myths TECTA 建筑 结构 历史 传说 中式 瓦 梁 飞檐 斗拱 传统 文化 魅力 '
  },
  japanese: {
    mainSrc: './images/image 36 (1).png',
    title: 'The myths of Japanese roofs',
    desc: 'Rooted in tradition, Japanese temple architecture reflects a deep structural harmony with nature, utilizing meticulous timber joinery and curved ceramic tiles designed to withstand time.',
    leftThumb: './images/Frame 1366.png',
    rightThumb: './images/Frame 1372.png',
    roofClass: 'is-japanese',
    curtainText: 'TECTA 屋根 建築 伝統 神社 寺院 歴史 美学 木造 瓦 構造 Architecture Roof Myths TECTA 日本建築 文化 格式 継手 調和 自然 '
  },
  moroccan: {
    mainSrc: './images/image 37.png',
    title: 'The myths of Moroccan roofs',
    desc: 'A masterclass in geometry and color, traditional Moroccan architecture integrates vibrant zellige mosaic tiles and intricately carved cedar woodwork designed to capture light and filter the North African sun.',
    leftThumb: './images/Frame 1349.png',
    rightThumb: './images/Frame 1370.png',
    roofClass: 'is-moroccan',
    curtainText: moroccanCurtainText,
    scaleX: 1.20, // Incremento condicional de ~25px por lado exclusivo para cubrir perfectamente los extremos del techo marroquí
    paddingLeft: 0
  },
  russian: {
    mainSrc: './images/image 35.png', // Imagen de cúpulas rusas grandes (Desktop - 5)
    title: 'The myths of Russian roofs',
    desc: 'Defined by iconic bulbous onion domes and intricate wooden kokoshnik gables, traditional Russian sacred architecture reflects a celestial aspiration, blending vibrant metallic colors with timeless Orthodox craftsmanship.',
    leftThumb: './images/Frame 1350.png', // Miniatura lateral izquierda (techo marroquí según diseño anterior Desktop - 5)
    rightThumb: './images/Frame 1369.png', // Miniatura lateral derecha con techo dorado escalonado
    roofClass: 'is-russian',
    curtainText: russianCurtainText,
    scaleX: 1.20, // Incremento condicional de ~25px por lado exclusivo para cubrir la estructura de madera del techo ruso
    translateX: 8, // Desplazamiento horizontal de +8px hacia la derecha para alinear con simetría milimétrica ambas puntas del techo ruso
    paddingLeft: 0
  },
  thai: {
    mainSrc: './images/image 36 (2).png', // Techo dorado principal tailandés
    title: 'The myths of Thai roofs',
    desc: 'Characterized by multi-tiered sloping roofs, glittering golden tiles, and soaring chofah finials pointing toward the heavens, traditional Thai temple architecture symbolizes sacred Mount Meru and divine ascent.',
    leftThumb: './images/Frame 1351.png',  // Miniatura cúpulas rusas
    rightThumb: './images/Frame 1368.png', // Miniatura techo oscuro escalonado
    roofClass: 'is-thai',
    curtainText: thaiCurtainText,
    scaleX: 1.20, // Ajuste simétrico para cubrir la base del alero de madera
    paddingLeft: 0
  }
};

let currentRoof = 'chinese';

function setRoofState(stateKey) {
  console.log('Switching roof state to:', stateKey);
  const data = roofsData[stateKey];
  if (!data) return;

  const mainRoof = document.getElementById('main-roof');
  const title = document.getElementById('article-title');
  const desc = document.getElementById('article-desc');
  const leftImg = document.querySelector('#btn-roof-left img');
  const rightImg = document.querySelector('#btn-roof-right img');
  const curtainCanvas = document.querySelector('#container canvas');
  const containerEl = document.getElementById('container');
  const heroStage = document.querySelector('.hero-center-stage');

  // Fade out
  if (mainRoof) mainRoof.style.opacity = '0';
  if (title) title.style.opacity = '0';
  if (desc) desc.style.opacity = '0';
  if (curtainCanvas) {
    curtainCanvas.style.transition = 'opacity 0.25s ease';
    curtainCanvas.style.opacity = '0.35';
  }

  setTimeout(() => {
    if (mainRoof) {
      mainRoof.src = data.mainSrc;
      // Remueve las clases previas y añade únicamente la clase correspondiente al estado activo
      mainRoof.classList.remove('is-japanese', 'is-moroccan', 'is-russian', 'is-thai');
      if (data.roofClass) {
        mainRoof.classList.add(data.roofClass);
      }
      mainRoof.style.opacity = '1';
    }
    if (containerEl) {
      containerEl.classList.remove('is-japanese', 'is-moroccan', 'is-russian', 'is-thai');
      if (data.roofClass) {
        containerEl.classList.add(data.roofClass);
      }
    }
    if (curtainCanvas) {
      curtainCanvas.classList.remove('is-japanese', 'is-moroccan', 'is-russian', 'is-thai');
      if (data.roofClass) {
        curtainCanvas.classList.add(data.roofClass);
      }
      if (data.scaleX) {
        const tx = data.translateX ? `translateX(${data.translateX}px) ` : '';
        curtainCanvas.style.transform = `${tx}scaleX(${data.scaleX})`;
        curtainCanvas.style.transformOrigin = 'center top';
      } else {
        curtainCanvas.style.transform = 'none';
      }
    }
    if (heroStage) {
      heroStage.classList.remove('state-japanese', 'state-moroccan', 'state-russian', 'state-chinese', 'state-thai');
      heroStage.classList.add('state-' + stateKey);
    }
    if (title) {
      title.textContent = data.title;
      title.style.opacity = '1';
    }
    if (desc) {
      desc.textContent = data.desc;
      desc.style.opacity = '1';
    }
    if (leftImg) leftImg.src = data.leftThumb;
    if (rightImg) rightImg.src = data.rightThumb;

    // Ajuste condicional exclusivo sin alterar el ancho global del canvas
    if (data.paddingLeft !== undefined) {
      CONFIG.paddingLeft = data.paddingLeft;
    } else {
      CONFIG.paddingLeft = 0;
    }
    if (data.curtainText && typeof updateCurtainText === 'function') {
      updateCurtainText(data.curtainText);
    }
    if (curtainCanvas) {
      curtainCanvas.style.opacity = '1';
      curtainCanvas.style.filter = 'none';
    }

    currentRoof = stateKey;
    console.log('Roof state successfully switched to:', currentRoof);
  }, 250);
}

function initRoofTransitions() {
  const mainRoof = document.getElementById('main-roof');
  const btnLeft = document.getElementById('btn-roof-left');
  const btnRight = document.getElementById('btn-roof-right');

  console.log('Main roof element:', mainRoof);
  console.log('Left button:', btnLeft);
  console.log('Right button:', btnRight);

  // Navegación secuencial ampliada (chinese -> japanese -> moroccan -> russian -> thai)
  btnRight?.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Right button clicked! currentRoof:', currentRoof);
    if (currentRoof === 'chinese') {
      setRoofState('japanese');
    } else if (currentRoof === 'japanese') {
      setRoofState('moroccan');
    } else if (currentRoof === 'moroccan') {
      setRoofState('russian');
    } else if (currentRoof === 'russian') {
      setRoofState('thai');
    } else if (currentRoof === 'thai') {
      setRoofState('chinese');
    }
  });

  btnLeft?.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Left button clicked! currentRoof:', currentRoof);
    if (currentRoof === 'thai') {
      setRoofState('russian');
    } else if (currentRoof === 'russian') {
      setRoofState('moroccan');
    } else if (currentRoof === 'moroccan') {
      setRoofState('japanese');
    } else if (currentRoof === 'japanese') {
      setRoofState('chinese');
    } else if (currentRoof === 'chinese') {
      setRoofState('thai');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRoofTransitions);
} else {
  initRoofTransitions();
}

window.moroccanCurtainText = moroccanCurtainText;
window.russianCurtainText = russianCurtainText;
window.thaiCurtainText = thaiCurtainText;
window.roofsData = roofsData;
window.setRoofState = setRoofState;
