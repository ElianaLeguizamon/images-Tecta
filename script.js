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

const ASSIGNED_WIDTH = 449;
const w = ASSIGNED_WIDTH;
const h = 557;
const dpr = Math.min((typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1, 2);

// Configuración original y estándar de Liam Egan (compartida para todas las pantallas)
const CONFIG = {
  awidth: w,
  aheight: h,
  gridW: 44,
  gridH: 42,
  gravity: 0.65,
  damping: 0.990,
  iterationsPerFrame: 5,
  compressFactor: 0.62,
  stretchFactor: 1.10,
  mouseSize: 5000,
  mouseStrength: 4,
  contain: false,
  randomSolve: false,
  paddingLeft: 0,
  preset: '',
  trimColsLeft: 0,
  trimColsRight: 0,
  doorChimes: true,
  chimeVolume: 0.28
};
if (typeof window !== 'undefined') window.CONFIG = CONFIG;
CONFIG.cellWidth = ASSIGNED_WIDTH / (CONFIG.gridW - 1);
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
let activeParticles = [];
let activeConstraints = [];
let currentRoof = 'chinese';

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

// Texto enriquecido con vocabulario arquitectónico noruego tradicional y marca TECTA
const norwegianCurtainText = "TECTA Stavkirke TECTA Norsk trearkitektur TECTA Urnes Drakehode TECTA Tradisjonell laftetverk TECTA Spontekke TECTA Middelalder trearkitektur TECTA ";

// Texto enriquecido con terminología arquitectónica tradicional transilvana y marca TECTA
const romanianCurtainText = "TECTA Transilvania TECTA Ochi de pisica TECTA Tigla solzi TECTA Arhitectura vernaculara TECTA Ochi de bou TECTA Ferestre ochi de bou TECTA ";

const roofsData = {
  chinese: {
    mainSrc: './images/Copilot-20260917-103956-1@2x.png',
    title: 'The myths of Chinese roofs',
    desc: 'Featuring the iconic double-eaved xieshan hip-and-gable roof, glazed golden tiles, and red-painted wooden brackets. Every curve and upturned corner was designed to ward off evil spirits and shelter imperial majesty.',
    leftThumb: './images/Frame 1367 (1).png',
    rightThumb: './images/Frame 1365 (1).png',
    curtainText: 'Architecture Roof Myths TECTA 建筑 结构 历史 传说 中式 瓦 梁 飞檐 斗拱 传统 文化 魅力 ',
    baseFrequency: 528
  },
  japanese: {
    mainSrc: './images/image 36 (1).png',
    title: 'The myths of Japanese roofs',
    desc: 'Rooted in tradition, Japanese temple architecture reflects a deep structural harmony with nature, utilizing meticulous timber joinery and curved ceramic tiles designed to withstand time.',
    leftThumb: './images/Frame 1366.png',
    rightThumb: './images/Frame 1372.png',
    roofClass: 'is-japanese',
    curtainText: 'TECTA 屋根 建築 伝統 神社 寺院 歴史 美学 木造 瓦 構造 Architecture Roof Myths TECTA 日本建築 文化 格式 継手 調和 自然 ',
    baseFrequency: 392
  },
  moroccan: {
    mainSrc: './images/image 37.png',
    title: 'The myths of Moroccan roofs',
    desc: 'A masterclass in geometry and color, traditional Moroccan architecture integrates vibrant zellige mosaic tiles and intricately carved cedar woodwork designed to capture light and filter the North African sun.',
    leftThumb: './images/Frame 1349.png',
    rightThumb: './images/Frame 1370.png',
    roofClass: 'is-moroccan',
    curtainText: moroccanCurtainText,
    scaleX: 1.20,
    paddingLeft: 0,
    baseFrequency: 293
  },
  russian: {
    mainSrc: './images/image 35.png',
    title: 'The myths of Russian roofs',
    desc: 'Defined by iconic bulbous onion domes and intricate wooden kokoshnik gables, traditional Russian sacred architecture reflects a celestial aspiration, blending vibrant metallic colors with timeless Orthodox craftsmanship.',
    leftThumb: './images/Frame 1350.png',
    rightThumb: './images/Frame 1369.png',
    roofClass: 'is-russian',
    curtainText: russianCurtainText,
    scaleX: 1.20,
    translateX: 8,
    paddingLeft: 0,
    baseFrequency: 220
  },
  thai: {
    mainSrc: './images/image 36 (2).png',
    title: 'The myths of Thai roofs',
    desc: 'Characterized by multi-tiered sloping roofs, glittering golden tiles, and soaring chofah finials pointing toward the heavens, traditional Thai temple architecture symbolizes sacred Mount Meru and divine ascent.',
    leftThumb: './images/Frame 1351.png',
    rightThumb: './images/Frame 1368.png',
    roofClass: 'is-thai',
    curtainText: thaiCurtainText,
    scaleX: 1.20,
    paddingLeft: 0,
    baseFrequency: 659
  },
  norwegian: {
    mainSrc: './images/norwegian-roof.png',
    title: 'The myths of Norwegian roofs',
    desc: 'Built with medieval engineering and overlapping layers of dark tarred wooden shingles, traditional Norwegian stave church roofs feature striking dragon-head finials, combining fierce Norse mythology with sacred Christian architecture.',
    leftThumb: './images/Frame 1352.png',
    rightThumb: './images/Frame 1367 (1).png',
    roofClass: 'is-norwegian',
    curtainText: norwegianCurtainText,
    scaleX: 1.20,
    trimColsLeft: 2,
    trimColsRight: 2,
    paddingLeft: 0,
    baseFrequency: 110
  },
  romanian: {
    mainSrc: './images/image 39.png',
    title: 'The myths of Romanian roofs',
    desc: 'Famous for their distinctive "buffalo-eye" dormer windows built directly into weathered terracotta tiles, traditional Transylvanian farmhouse roofs give life and a watchful expression to vernacular European architecture.',
    leftThumb: './images/Frame 1353.png',
    rightThumb: './images/Frame 1366.png',
    roofClass: 'is-romanian',
    curtainText: romanianCurtainText,
    scaleX: 1.00,
    paddingLeft: 0,
    baseFrequency: 349
  }
};

// Perfiles acústicos con identidades sonoras radicalmente diferentes por cultura
const CULTURAL_AUDIO_PROFILES = {
  chinese: {
    baseFreq: 528,
    oscType: 'sine', // Senoidal pura y cristalina
    decay: 1.0,
    attack: 0.012,
    ratios: [1, 9/8, 5/4, 3/2, 5/3, 2], // Escala pentatónica brillante
    sparkleHarmonic: { ratio: 2.0, decay: 0.22, gain: 0.4 } // Armónico agudo rápido: campana oriental brillante y delicada
  },
  japanese: {
    baseFreq: 392, // 392 Hz (Nota Sol)
    oscType: 'square', // Onda cuadrada densa y rica en armónicos (cuerda frotada / madera resonante)
    decay: 1.3, // Timbre tradicional, sobrio y profundo de templo de madera
    attack: 0.02,
    ratios: [1, 9/8, 4/3, 3/2, 16/9, 2], // Escala Insen tradicional de templo japonés
    filter: { type: 'lowpass', freq: 1100, Q: 1.8 }, // Filtro paso-bajo que suaviza y da calidez amaderada
    warmthHarmonic: { ratio: 1.5, decay: 0.9, gain: 0.25 } // Armónico a la quinta de resonancia estructural
  },
  norwegian: {
    baseFreq: 110, // Muy grave (110 Hz, Nota La de octava baja)
    oscType: 'triangle', // Onda triangular cálida y profunda
    decay: 1.6,
    attack: 0.035,
    ratios: [1, 9/8, 5/4, 4/3, 3/2],
    filter: { type: 'lowpass', freq: 420, Q: 1.8 }, // Filtro paso-bajo que realza la resonancia en madera antigua
    subHarmonic: { ratio: 0.5, decay: 1.4, gain: 0.45 } // Subarmónico profundo a 55 Hz
  },
  romanian: {
    baseFreq: 349, // 349 Hz (Nota Fa)
    oscType: 'sawtooth', // Onda en diente de sierra suavizada
    decay: 0.85,
    attack: 0.018,
    ratios: [1, 9/8, 5/4, 4/3, 3/2, 5/3],
    filter: { type: 'lowpass', freq: 880, Q: 2.4 } // Filtro paso-bajo para timbre rústico y terroso de arcilla/terracota
  },
  russian: {
    baseFreq: 220, // 220 Hz (Nota La central grave)
    oscType: 'sine',
    decay: 2.2, // Resonancia majestuosa y solemne prolongada
    attack: 0.02,
    ratios: [1, 6/5, 4/3, 3/2, 8/5, 2],
    bellFM: {
      modRatio: 2.76, // Inarmónico metálico de campana ortodoxa
      modDepth: 75,
      detuneHz: 4.2,  // Doble oscilador con batimiento catedralicio solemne
      decay: 1.9
    }
  },
  moroccan: {
    baseFreq: 293, // 293 Hz (Nota Re)
    oscType: 'triangle', // Triangular cálida
    decay: 1.6, // Decay más largo para acústica envolvente
    attack: 0.025,
    ratios: [1, 9/8, 5/4, 4/3, 3/2, 7/4],
    warmthHarmonic: { ratio: 2.0, decay: 1.3, gain: 0.3 } // Armónico envolvente de patios
  },
  thai: {
    baseFreq: 659, // 659 Hz (Nota Mi alta)
    oscType: 'sine',
    decay: 0.65, // Campanillas ligeras, flotantes y cristalinas
    attack: 0.005, // Ataque muy rápido y agudo
    ratios: [1, 9/8, 5/4, 3/2, 5/3, 2, 9/4],
    sparkleHarmonic: { ratio: 2.5, decay: 0.2, gain: 0.5 } // Campanilla dorada aguda y brillante
  }
};

// Memoria activa del sintetizador Web Audio (precargada por defecto con Chinese)
const SynthMemory = {
  activeCulture: 'chinese',
  baseFrequency: 528,
  oscType: 'sine',
  decay: 1.0,
  attack: 0.012,
  ratios: [1, 9/8, 5/4, 3/2, 5/3, 2],
  filter: null,
  bellFM: null,
  sparkleHarmonic: { ratio: 2.0, decay: 0.22, gain: 0.4 },
  subHarmonic: null,
  warmthHarmonic: null
};

let audioCtx = null;
let lastChimeStamp = 0;

function getAudioContext() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  return audioCtx;
}

function setupAudioUnlock() {
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && (ctx.state === 'suspended' || ctx.state === 'interrupted')) {
      ctx.resume().catch(() => {});
    }
  };

  ['pointerdown', 'mousedown', 'touchstart', 'click', 'keydown'].forEach((evt) => {
    window.addEventListener(evt, unlock, { capture: true, passive: true });
    document.addEventListener(evt, unlock, { capture: true, passive: true });
  });

  window.addEventListener('focus', unlock, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') unlock();
  }, { passive: true });
}

function applyAudioCulture(cultureKey) {
  const key = cultureKey || 'chinese';
  currentRoof = key;
  SynthMemory.activeCulture = key;

  const profile = CULTURAL_AUDIO_PROFILES[key] || CULTURAL_AUDIO_PROFILES.chinese;
  const roof = (typeof roofsData !== 'undefined' && roofsData[key]) ? roofsData[key] : null;
  const baseFreq = (roof && roof.baseFrequency) ? roof.baseFrequency : (profile.baseFreq || 528);

  SynthMemory.baseFrequency = baseFreq;
  SynthMemory.oscType = profile.oscType || 'sine';
  SynthMemory.decay = profile.decay || 1.0;
  SynthMemory.attack = profile.attack || 0.012;
  SynthMemory.ratios = profile.ratios || [1, 9/8, 5/4, 3/2, 2];
  SynthMemory.filter = profile.filter || null;
  SynthMemory.bellFM = profile.bellFM || null;
  SynthMemory.sparkleHarmonic = profile.sparkleHarmonic || null;
  SynthMemory.subHarmonic = profile.subHarmonic || null;
  SynthMemory.warmthHarmonic = profile.warmthHarmonic || null;

  const countrySelect = document.getElementById('select-country');
  if (countrySelect && countrySelect.value !== key) {
    countrySelect.value = key;
  }
}

function initAudioModule(initialCulture = 'chinese') {
  // 1. Cargar explícitamente la configuración sonora del estado inicial en la memoria del sintetizador
  applyAudioCulture(initialCulture);

  // 2. Vincular y pre-instanciar el AudioContext desde el primer renderizado
  getAudioContext();

  // 3. Registrar desbloqueo automático reactivo para que la primera interacción encienda el audio
  setupAudioUnlock();
}

function executeChimeSound(ctx, force = 1) {
  if (!ctx || ctx.state === 'closed') return;
  if (!SynthMemory.baseFrequency || SynthMemory.activeCulture !== currentRoof) {
    applyAudioCulture(currentRoof || 'chinese');
  }

  const ratios = SynthMemory.ratios || [1, 9/8, 5/4, 3/2, 2];
  const ratio = ratios[Math.floor(Math.random() * ratios.length)];
  const freq = (SynthMemory.baseFrequency || 528) * ratio;

  const baseVol = (CONFIG.chimeVolume !== undefined ? CONFIG.chimeVolume : 0.28) * 0.35;
  const peakVol = Math.max(0.001, Math.min(baseVol * Math.max(0.4, force), 0.45));
  const t0 = Math.max(ctx.currentTime, 0.001);
  const decayTime = SynthMemory.decay || 1.0;
  const attackTime = SynthMemory.attack || 0.012;

  // Ganancia maestra con ataque y decaimiento adaptado a la cultura
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0001, t0);
  masterGain.gain.linearRampToValueAtTime(peakVol, t0 + attackTime);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, t0 + decayTime);

  // Filtro si el perfil cultural lo requiere (Rumano terracota o Noruego madera profunda)
  if (SynthMemory.filter) {
    const filter = ctx.createBiquadFilter();
    filter.type = SynthMemory.filter.type || 'lowpass';
    filter.frequency.setValueAtTime(SynthMemory.filter.freq, t0);
    if (SynthMemory.filter.Q) filter.Q.setValueAtTime(SynthMemory.filter.Q, t0);
    masterGain.connect(filter);
    filter.connect(ctx.destination);
  } else {
    masterGain.connect(ctx.destination);
  }

  // Oscilador fundamental con el tipo de onda específico de la cultura
  const osc1 = ctx.createOscillator();
  osc1.type = SynthMemory.oscType || 'sine';
  osc1.frequency.setValueAtTime(freq, t0);
  osc1.connect(masterGain);
  osc1.start(t0);
  osc1.stop(t0 + decayTime);

  // Ruso: Doble oscilador detuned + modulación FM para campana de catedral ortodoxa
  if (SynthMemory.bellFM) {
    const oscDetune = ctx.createOscillator();
    const gainDetune = ctx.createGain();
    oscDetune.type = 'sine';
    oscDetune.frequency.setValueAtTime(freq + (SynthMemory.bellFM.detuneHz || 4.2), t0);
    gainDetune.gain.setValueAtTime(0.0001, t0);
    gainDetune.gain.linearRampToValueAtTime(peakVol * 0.65, t0 + attackTime);
    gainDetune.gain.exponentialRampToValueAtTime(0.0001, t0 + decayTime);
    oscDetune.connect(gainDetune);
    gainDetune.connect(ctx.destination);
    oscDetune.start(t0);
    oscDetune.stop(t0 + decayTime);

    const modOsc = ctx.createOscillator();
    const modGain = ctx.createGain();
    modOsc.frequency.setValueAtTime(freq * (SynthMemory.bellFM.modRatio || 2.76), t0);
    modGain.gain.setValueAtTime(SynthMemory.bellFM.modDepth || 75, t0);
    modGain.gain.exponentialRampToValueAtTime(0.01, t0 + (SynthMemory.bellFM.decay || 1.9));
    modOsc.connect(modGain);
    modGain.connect(osc1.frequency);
    modOsc.start(t0);
    modOsc.stop(t0 + (SynthMemory.bellFM.decay || 1.9));
  }

  // Chino / Tailandés / Japonés: Armónico agudo brillante y rápido
  if (SynthMemory.sparkleHarmonic) {
    const sp = SynthMemory.sparkleHarmonic;
    const oscSparkle = ctx.createOscillator();
    const gainSparkle = ctx.createGain();
    oscSparkle.type = 'sine';
    oscSparkle.frequency.setValueAtTime(freq * sp.ratio, t0);
    gainSparkle.gain.setValueAtTime(0.0001, t0);
    gainSparkle.gain.linearRampToValueAtTime(peakVol * sp.gain, t0 + attackTime);
    gainSparkle.gain.exponentialRampToValueAtTime(0.0001, t0 + sp.decay);
    oscSparkle.connect(gainSparkle);
    gainSparkle.connect(ctx.destination);
    oscSparkle.start(t0);
    oscSparkle.stop(t0 + sp.decay);
  }

  // Noruego: Subarmónico denso y profundo de madera de fiordo
  if (SynthMemory.subHarmonic) {
    const sub = SynthMemory.subHarmonic;
    const oscSub = ctx.createOscillator();
    const gainSub = ctx.createGain();
    oscSub.type = 'triangle';
    oscSub.frequency.setValueAtTime(freq * sub.ratio, t0);
    gainSub.gain.setValueAtTime(0.0001, t0);
    gainSub.gain.linearRampToValueAtTime(peakVol * sub.gain, t0 + attackTime);
    gainSub.gain.exponentialRampToValueAtTime(0.0001, t0 + sub.decay);
    oscSub.connect(gainSub);
    gainSub.connect(ctx.destination);
    oscSub.start(t0);
    oscSub.stop(t0 + sub.decay);
  }

  // Marroquí: Armónico envolvente cálido de patio
  if (SynthMemory.warmthHarmonic) {
    const wm = SynthMemory.warmthHarmonic;
    const oscWarm = ctx.createOscillator();
    const gainWarm = ctx.createGain();
    oscWarm.type = 'triangle';
    oscWarm.frequency.setValueAtTime(freq * wm.ratio, t0);
    gainWarm.gain.setValueAtTime(0.0001, t0);
    gainWarm.gain.linearRampToValueAtTime(peakVol * wm.gain, t0 + attackTime);
    gainWarm.gain.exponentialRampToValueAtTime(0.0001, t0 + wm.decay);
    oscWarm.connect(gainWarm);
    gainWarm.connect(ctx.destination);
    oscWarm.start(t0);
    oscWarm.stop(t0 + wm.decay);
  }
}

function playDoorChime(force = 1) {
  if (!CONFIG.doorChimes) return;
  const now = performance.now();
  if (now - lastChimeStamp < 70) return;
  lastChimeStamp = now;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
      ctx.resume().then(() => {
        executeChimeSound(ctx, force);
      }).catch(() => {});
      return;
    }

    executeChimeSound(ctx, force);
  } catch (e) {
    // Protección contra restricciones de autoplay del navegador
  }
}
window.playDoorChime = playDoorChime;
window.executeChimeSound = executeChimeSound;
window.getAudioContext = getAudioContext;
window.SynthMemory = SynthMemory;
window.applyAudioCulture = applyAudioCulture;
window.initAudioModule = initAudioModule;

// Inicialización inmediata del módulo de audio en pantalla inicial ('chinese')
initAudioModule('chinese');

function updateConstraintsFactors() {
  if (!activeConstraints) return;
  const rawStretch = CONFIG.stretchFactor !== undefined ? CONFIG.stretchFactor : 1.10;
  const stretch = Math.max(1.05, rawStretch);
  const rawCompress = CONFIG.compressFactor !== undefined ? CONFIG.compressFactor : 0.62;
  const compress = Math.min(stretch - 0.08, Math.max(0.01, rawCompress));

  activeConstraints.forEach((c) => {
    if (!c.isSpacer) {
      c.minLength = c.length * compress;
      c.maxLength = c.length * stretch;
    }
  });
}

function rebuildCloth() {
  CONFIG.cellWidth = ASSIGNED_WIDTH / (CONFIG.gridW - 1);
  CONFIG.cellHeight = CONFIG.aheight / (CONFIG.gridH - 1);
  main();
  const currentData = (typeof roofsData !== 'undefined' && roofsData[currentRoof]) ? roofsData[currentRoof] : null;
  if (currentData) {
    if (c) {
      c.classList.remove('is-chinese', 'is-japanese', 'is-moroccan', 'is-russian', 'is-thai', 'is-norwegian', 'is-romanian');
      if (currentData.roofClass) c.classList.add(currentData.roofClass);
      if (currentData.scaleX) {
        const tx = currentData.translateX ? `translateX(${currentData.translateX}px) ` : '';
        c.style.transform = `${tx}scaleX(${currentData.scaleX})`;
        c.style.transformOrigin = 'center top';
      } else {
        c.style.transform = 'none';
      }
    }
    if (currentData.curtainText && typeof updateCurtainText === 'function') {
      updateCurtainText(currentData.curtainText);
    }
  }
}
window.rebuildCloth = rebuildCloth;

function main() {
  if (rafID) cancelAnimationFrame(rafID);
  if (input) input.unbind();

  const containerEl = document.getElementById('container');
  if (!containerEl) {
    console.warn("Element #container not found yet, retrying...");
    setTimeout(main, 100);
    return;
  }

  if (!fullCode) {
    fullCode = 'Architecture Roof Myths TECTA 建筑 结构 历史 传说 中式 瓦 梁 飞檐 斗拱 传统 文化 魅力 ';
  }
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
    octx.font = `500 ${fontSize}px 'Outfit', 'Noto Sans Thai', 'Noto Sans Arabic', 'Noto Sans JP', 'Noto Sans SC', 'Microsoft YaHei', 'Meiryo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillStyle = '#111111'; // Tono negro oscuro sólido y nítido de alta opacidad
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

  const existingCanvas = containerEl.querySelector('canvas');
  if (existingCanvas) {
    c = existingCanvas;
  } else {
    c = document.createElement('canvas');
    containerEl.innerHTML = '';
    containerEl.appendChild(c);
  }
  sizeCanvas();
  const ctx = c.getContext('2d');

  const particles = [];
  const constraints = [], horizontalConstraints = [];
  const pinnedParticles = [];
  activeParticles = particles;
  activeConstraints = constraints;
  window.activeParticles = particles;
  window.activeConstraints = constraints;

  input = new Input({ c, particles });

  // Precomputar distribución horizontal de nodos dentro del espacio asignado (ASSIGNED_WIDTH)
  // Al incrementar Width, se incorporan subdivisiones y columnas en los laterales formando pliegues estables
  const fullness = (CONFIG.awidth !== undefined ? CONFIG.awidth : ASSIGNED_WIDTH) / ASSIGNED_WIDTH;
  const gatherFactor = (CONFIG.awidth - ASSIGNED_WIDTH) / ASSIGNED_WIDTH;
  const alpha = -0.32 * Math.max(-0.5, Math.min(0.8, gatherFactor));

  const colX = [];
  for (let i = 0; i < gridW; i++) {
    const u = gridW > 1 ? i / (gridW - 1) : 0.5;
    const s = 2 * u - 1;
    const sMapped = (1 - alpha) * s + alpha * (s * s * s);
    const uMapped = (sMapped + 1) / 2;
    let xi = uMapped * ASSIGNED_WIDTH;
    if (gatherFactor > 0.05) {
      const sideIntensity = Math.pow(Math.abs(s), 2);
      const pleatWave = Math.sin(i * Math.PI * 0.8) * 2.2 * gatherFactor * sideIntensity;
      if (i > 0 && i < gridW - 1) {
        xi = Math.max(0, Math.min(ASSIGNED_WIDTH, xi + pleatWave));
      }
    }
    colX.push(xi);
  }

  // Creación de partículas de la cuadrícula
  for (let i = 0; i < gridW; i++) {
    for (let j = 0; j < gridH; j++) {
      let x = colX[i];
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
        const initDist = Math.hypot(bottomP.pos.x - p.pos.x, bottomP.pos.y - p.pos.y) || cellHeight;
        const sFactor = CONFIG.stretchFactor !== undefined ? Math.max(1.05, CONFIG.stretchFactor) : 1.10;
        const cFactor = CONFIG.compressFactor !== undefined ? Math.min(sFactor - 0.08, Math.max(0.01, CONFIG.compressFactor)) : 0.62;
        const constraint = new Constraint({
          p1: p,
          p2: bottomP,
          length: initDist,
          id: id + gridW * gridH,
          compressFactor: cFactor,
          stretchFactor: sFactor,
        });
        constraints.push(constraint);
        p.downConstraint = constraint;
      }

      // Restricción horizontal espaciadora elástica para dar coherencia de cortina fluida
      if (i < gridW - 1) {
        const rightP = particles[getPointID(j, i + 1, gridH)];
        const initDist = Math.hypot(rightP.pos.x - p.pos.x, rightP.pos.y - p.pos.y) || cellWidth;
        const hc = new Constraint({
          p1: p,
          p2: rightP,
          length: initDist,
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
    const offsetX = (c.width / dpr - ASSIGNED_WIDTH) / 2 + paddingLeft;
    const offsetY = 0; // Posición exacta justo bajo el techo
    const trimLeft = CONFIG.trimColsLeft || 0;
    const trimRight = CONFIG.trimColsRight || 0;

    particles.forEach((p) => {
      if (!p.char || p.char === ' ') return;
      if (trimLeft > 0 || trimRight > 0) {
        const col = Math.floor(p.id / gridH);
        if (col < trimLeft || col >= gridW - trimRight) return;
      }
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
    const iters = CONFIG.iterationsPerFrame !== undefined ? CONFIG.iterationsPerFrame : iterationsPerFrame;
    for (let i = 0; i < iters; i++) {
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
    const paddingLeft = CONFIG.paddingLeft || 0;
    const offsetX = (this.c.width / dpr - ASSIGNED_WIDTH) / 2 + paddingLeft;
    const offsetY = 0;
    this.mousePos.x = (e.clientX - rect.left) * scaleX - offsetX;
    this.mousePos.y = (e.clientY - rect.top) * scaleY - offsetY;
  }
  pointerdown(e) {
    this.setMouse(e);
    const ctx = getAudioContext();
    if (ctx && (ctx.state === 'suspended' || ctx.state === 'interrupted')) {
      ctx.resume().catch(() => {});
    }

    for (const p of this.particles) {
      if (this.mousePos.subtractNew(p.pos).length < this.grabRadius) {
        this.grabbedParticle = p;
        this.grabbedParticle.originalPinnedState = this.grabbedParticle.pinned;
        this.grabbedParticle.pinned = true;
        if (CONFIG.doorChimes) playDoorChime(1);
        break;
      }
    }
    if (!this.grabbedParticle) {
      this.pointerIsDown = true;
      if (CONFIG.doorChimes) playDoorChime(0.85);
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
      if (CONFIG.doorChimes) playDoorChime(1.5);
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
        if (CONFIG.doorChimes) playDoorChime(strength * 3);
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
    } else if (this.pos.x > ASSIGNED_WIDTH - radius) {
      this.pos.x = ASSIGNED_WIDTH - radius;
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
    const cFactor = compressFactor !== undefined ? compressFactor : 0.62;
    const sFactor = stretchFactor !== undefined ? stretchFactor : 1.1;
    this.minLength = length * (isSpacer ? 0.6 : Math.min(sFactor - 0.08, Math.max(0.01, cFactor)));
    this.maxLength = length * (isSpacer ? 4.0 : Math.max(1.05, sFactor));
  }
  solve() {
    const dx = this.p2.pos.x - this.p1.pos.x;
    const dy = this.p2.pos.y - this.p1.pos.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) return;

    // Asegurar que minLength y maxLength nunca entren en conflicto oscilatorio
    const minL = Math.min(this.minLength, this.maxLength - 0.02);
    const maxL = Math.max(this.maxLength, minL + 0.02);

    let targetLength = this.length;
    if (distance < minL) targetLength = minL;
    else if (distance > maxL) targetLength = maxL;
    else return;

    const difference = targetLength - distance;
    const divisor = (this.p1.pinned || this.p2.pinned) ? 1.0 : 2.0;
    const percent = (difference / distance) / divisor;

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

// Inicialización del motor de física de la cortina
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(main, 100));
} else {
  setTimeout(main, 100);
}

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
      mainRoof.classList.remove('is-chinese', 'is-japanese', 'is-moroccan', 'is-russian', 'is-thai', 'is-norwegian', 'is-romanian');
      if (data.roofClass) {
        mainRoof.classList.add(data.roofClass);
      }
      mainRoof.style.opacity = '1';
    }
    if (containerEl) {
      containerEl.classList.remove('is-chinese', 'is-japanese', 'is-moroccan', 'is-russian', 'is-thai', 'is-norwegian', 'is-romanian');
      if (data.roofClass) {
        containerEl.classList.add(data.roofClass);
      }
    }
    if (curtainCanvas) {
      curtainCanvas.classList.remove('is-chinese', 'is-japanese', 'is-moroccan', 'is-russian', 'is-thai', 'is-norwegian', 'is-romanian');
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
      heroStage.classList.remove('state-chinese', 'state-japanese', 'state-moroccan', 'state-russian', 'state-thai', 'state-norwegian', 'state-romanian');
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
    CONFIG.trimColsLeft = data.trimColsLeft || 0;
    CONFIG.trimColsRight = data.trimColsRight || 0;
    if (data.curtainText && typeof updateCurtainText === 'function') {
      updateCurtainText(data.curtainText);
    }
    if (curtainCanvas) {
      curtainCanvas.style.opacity = '1';
      curtainCanvas.style.filter = 'none';
    }

    currentRoof = stateKey;
    applyAudioCulture(stateKey);
    const countrySelect = document.getElementById('select-country');
    if (countrySelect && countrySelect.value !== stateKey) {
      countrySelect.value = stateKey;
    }
    console.log('Roof state successfully switched to:', currentRoof);
  }, 250);
}

function initRoofTransitions() {
  initAudioModule('chinese');
  const mainRoof = document.getElementById('main-roof');
  const btnLeft = document.getElementById('btn-roof-left');
  const btnRight = document.getElementById('btn-roof-right');

  console.log('Main roof element:', mainRoof);
  console.log('Left button:', btnLeft);
  console.log('Right button:', btnRight);

  // Navegación secuencial ampliada (chinese -> japanese -> moroccan -> russian -> thai -> norwegian -> romanian)
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
      setRoofState('norwegian');
    } else if (currentRoof === 'norwegian') {
      setRoofState('romanian');
    } else if (currentRoof === 'romanian') {
      setRoofState('chinese');
    }
  });

  btnLeft?.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Left button clicked! currentRoof:', currentRoof);
    if (currentRoof === 'romanian') {
      setRoofState('norwegian');
    } else if (currentRoof === 'norwegian') {
      setRoofState('thai');
    } else if (currentRoof === 'thai') {
      setRoofState('russian');
    } else if (currentRoof === 'russian') {
      setRoofState('moroccan');
    } else if (currentRoof === 'moroccan') {
      setRoofState('japanese');
    } else if (currentRoof === 'japanese') {
      setRoofState('chinese');
    } else if (currentRoof === 'chinese') {
      setRoofState('romanian');
    }
  });
}

function initStudioPanel() {
  const panel = document.getElementById('studio-panel');
  const toggleBtn = document.getElementById('btn-toggle-play');
  const closeBtn = document.getElementById('studio-close-btn');
  const countrySelect = document.getElementById('select-country');
  const rebuildBtn = document.getElementById('btn-rebuild-cloth');

  if (!panel || !toggleBtn) return;

  // Alternar (toggle) visibilidad del panel con el botón 'Play'
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Botón de cierre 'o'
  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  });

  // Cerrar al hacer clic fuera del panel
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) {
      if (panel.classList.contains('is-open')) {
        panel.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) {
      panel.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Secciones colapsables (STUDIO / 01, DESTINATION, CLOTH, MOTION & SOUND)
  const sectionHeaders = panel.querySelectorAll('.studio-section-header');
  sectionHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const section = header.closest('.studio-section');
      if (section) {
        section.classList.toggle('is-collapsed');
        const isExpanded = !section.classList.contains('is-collapsed');
        header.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      }
    });
  });

  // Selector de país (Country)
  if (countrySelect) {
    countrySelect.value = currentRoof || 'chinese';
  }
  countrySelect?.addEventListener('change', () => {
    setRoofState(countrySelect.value);
  });

  // Sincronización bidireccional entre sliders (range) e inputs numéricos con soporte para input y change
  function bindControl(rangeId, inputId, configKey, onUpdate, formatDecimals = null) {
    const range = document.getElementById(rangeId);
    const numInput = document.getElementById(inputId);
    if (!range || !numInput) return;

    if (CONFIG[configKey] !== undefined) {
      const val = formatDecimals !== null ? CONFIG[configKey].toFixed(formatDecimals) : CONFIG[configKey];
      range.value = CONFIG[configKey];
      numInput.value = val;
    }

    const updateFromRange = () => {
      const val = parseFloat(range.value);
      numInput.value = formatDecimals !== null ? val.toFixed(formatDecimals) : val;
      CONFIG[configKey] = val;
      if (onUpdate) onUpdate(val);
    };

    const updateFromNumInput = () => {
      let val = parseFloat(numInput.value);
      if (!isNaN(val)) {
        if (range.min !== '' && val < parseFloat(range.min)) val = parseFloat(range.min);
        if (range.max !== '' && val > parseFloat(range.max)) val = parseFloat(range.max);
        range.value = val;
        numInput.value = formatDecimals !== null ? val.toFixed(formatDecimals) : val;
        CONFIG[configKey] = val;
        if (onUpdate) onUpdate(val);
      }
    };

    range.addEventListener('input', updateFromRange);
    range.addEventListener('change', updateFromRange);

    numInput.addEventListener('input', updateFromNumInput);
    numInput.addEventListener('change', updateFromNumInput);
  }

  let clothRebuildRaf = null;
  function scheduleClothRebuild() {
    if (clothRebuildRaf) cancelAnimationFrame(clothRebuildRaf);
    clothRebuildRaf = requestAnimationFrame(() => {
      clothRebuildRaf = null;
      rebuildCloth();
    });
  }

  // Controles estructurales de CLOTH en tiempo real
  const rangeWidth = document.getElementById('range-width');
  const inputWidth = document.getElementById('input-width');
  const rangeCols = document.getElementById('range-columns');
  const inputCols = document.getElementById('input-columns');

  bindControl('range-width', 'input-width', 'awidth', (val) => {
    CONFIG.awidth = val;
    // Sincronización dinámica: al incrementar Width se incorporan subdivisiones y columnas a los lados
    const dynamicCols = Math.max(10, Math.min(60, Math.round(44 * (val / 449))));
    CONFIG.gridW = dynamicCols;
    if (rangeCols && parseFloat(rangeCols.value) !== dynamicCols) rangeCols.value = dynamicCols;
    if (inputCols && parseFloat(inputCols.value) !== dynamicCols) inputCols.value = dynamicCols;
    scheduleClothRebuild();
  });
  bindControl('range-height', 'input-height', 'aheight', (val) => {
    CONFIG.aheight = val;
    scheduleClothRebuild();
  });
  bindControl('range-columns', 'input-columns', 'gridW', (val) => {
    const cols = Math.max(10, Math.min(60, Math.round(val)));
    CONFIG.gridW = cols;
    // Sincronización bidireccional proporcional con Width
    const dynamicWidth = Math.max(100, Math.min(600, Math.round(449 * (cols / 44))));
    CONFIG.awidth = dynamicWidth;
    if (rangeWidth && parseFloat(rangeWidth.value) !== dynamicWidth) rangeWidth.value = dynamicWidth;
    if (inputWidth && parseFloat(inputWidth.value) !== dynamicWidth) inputWidth.value = dynamicWidth;
    scheduleClothRebuild();
  });
  bindControl('range-rows', 'input-rows', 'gridH', (val) => {
    CONFIG.gridH = Math.max(2, Math.round(val));
    scheduleClothRebuild();
  });

  // Botón interactivo Rebuild cloth
  rebuildBtn?.addEventListener('click', () => {
    rebuildCloth();
  });

  // Controles dinámicos de MOTION & SOUND
  bindControl('range-gravity', 'input-gravity', 'gravity', null, 2);
  bindControl('range-damping', 'input-damping', 'damping', null, 3);
  bindControl('range-precision', 'input-precision', 'iterationsPerFrame', null, 0);
  bindControl('range-stretch', 'input-stretch', 'stretchFactor', () => {
    updateConstraintsFactors();
  }, 2);
  bindControl('range-compress', 'input-compress', 'compressFactor', () => {
    updateConstraintsFactors();
  }, 2);
  bindControl('range-radius', 'input-radius', 'mouseSize', null, 0);
  bindControl('range-force', 'input-force', 'mouseStrength', null, 1);
  bindControl('range-volume', 'input-volume', 'chimeVolume', null, 2);

  // Checkboxes
  const chkChimes = document.getElementById('chk-door-chimes');
  chkChimes?.addEventListener('change', () => {
    CONFIG.doorChimes = chkChimes.checked;
  });

  const chkBounds = document.getElementById('chk-keep-bounds');
  chkBounds?.addEventListener('change', () => {
    CONFIG.contain = chkBounds.checked;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAudioModule('chinese');
    initRoofTransitions();
    initStudioPanel();
  });
} else {
  initAudioModule('chinese');
  initRoofTransitions();
  initStudioPanel();
}
window.addEventListener('load', () => {
  initAudioModule('chinese');
});

window.moroccanCurtainText = moroccanCurtainText;
window.russianCurtainText = russianCurtainText;
window.thaiCurtainText = thaiCurtainText;
window.norwegianCurtainText = norwegianCurtainText;
window.romanianCurtainText = romanianCurtainText;
window.roofsData = roofsData;
window.setRoofState = setRoofState;
Object.defineProperty(window, 'currentRoof', {
  get: () => currentRoof,
  set: (v) => {
    currentRoof = v;
    applyAudioCulture(v);
  },
  configurable: true
});
