// Word Tiler — UNA SOLA PAROLA PER RIQUADRO
// - La tela è completamente tassellata (nessuno spazio vuoto)
// - Ogni tile mostra una singola PAROLA, con fade in → hold → fade out (uno alla volta)
// - Slider "Variation" (0..100): 0 = dimensioni quasi uguali, 100 = massima variabilità

let variation = 100;  // valore iniziale
let variationSlider, variationLabel;

const PALETTE = ["#111111", "#1f2937", "#0ea5e9", "#f59e0b", "#10b981", "#ef4444"];

// Sostituisci questa lista con il tuo vocabolario
const WORDS = [
  "river","spark","dream","orbit","cloud","echo","pulse","light","breeze",
  "shift","flare","wander","glow","whisper","drift","trace","ripple","bloom",
  "north","ember","wave","story","future","motion","quiet","ray","field","phase"
];

let tiles = [];

function setup() {
  createCanvas(1000, 650);
  noStroke();
  textAlign(CENTER, CENTER);

  // UI: slider variation
  const ui = createDiv().style('position','absolute').style('left','12px').style('top','12px')
                        .style('color','#fff').style('font-family','Helvetica, Arial, sans-serif');
  variationLabel = createSpan(`Variation: ${variation}`).parent(ui).style('margin-right','8px');
  variationSlider = createSlider(0, 100, variation, 1).parent(ui);
  variationSlider.input(() => {
    variation = variationSlider.value();
    variationLabel.html(`Variation: ${variation}`);
    refitAllTiles();
  });

  generateInitialTiles();
}

function draw() {
  background(0);
  for (let t of tiles) {
    updateTile(t);
    drawTile(t);
  }
}

//––––––––––––––––––––––––––––––
// TILING COMPLETO DELLA TELA
//––––––––––––––––––––––––––––––

function generateInitialTiles() {
  tiles = [];
  subdivide(0, 0, width, height, 0);
}

function subdivide(x, y, w, h, d) {
  const MIN_W = 120;
  const MIN_H = 90;
  const MAX_DEPTH = 14;

  if (w < MIN_W * 1.2 || h < MIN_H * 1.2 || d >= MAX_DEPTH) {
    tiles.push(makeTile(x, y, w, h));
    return;
  }

  // Scegli orientamento del taglio
  let vertical = (w / h > 1.3) ? true :
                 (h / w > 1.3) ? false :
                 (random() < 0.5);

  // Rapporto di taglio
  let r = random(0.35, 0.65);

  if (vertical) {
    let w1 = max(MIN_W, floor(w * r));
    let w2 = w - w1;
    if (w2 < MIN_W) { w2 = MIN_W; w1 = w - MIN_W; }
    subdivide(x, y, w1, h, d + 1);
    subdivide(x + w1, y, w2, h, d + 1);
  } else {
    let h1 = max(MIN_H, floor(h * r));
    let h2 = h - h1;
    if (h2 < MIN_H) { h2 = MIN_H; h1 = h - MIN_H; }
    subdivide(x, y, w, h1, d + 1);
    subdivide(x, y + h1, w, h2, d + 1);
  }
}

//––––––––––––––––––––––––––––––
// COSTRUZIONE TILE (UNA PAROLA)
//––––––––––––––––––––––––––––––

function makeTile(x, y, w, h) {
  const bg = random(PALETTE);
  const word = random(WORDS).toUpperCase();

  const size = computeFittedSizeSingle(word, w, h, variation);

  // Colore del testo con contrasto automatico
  const c = color(bg);
  const lum = (0.2126 * red(c) + 0.7152 * green(c) + 0.0722 * blue(c)) / 255;
  const txtCol = lum > 0.55 ? color(0) : color(255);

  return {
    x, y, w, h,
    bg,
    word,
    size,
    textColor: txtCol,
    // tempi animazione indipendenti
    t: 0,
    fadeIn: random(0.5, 1.2),
    hold: random(1.0, 2.0),
    fadeOut: random(0.5, 1.2)
  };
}

// Riadatta la dimensione di tutte le parole quando cambia lo slider
function refitAllTiles() {
  for (let t of tiles) {
    t.size = computeFittedSizeSingle(t.word, t.w, t.h, variation);
  }
}

// Calcola la size massima che entra nel box per UNA SOLA riga
function computeFittedSizeSingle(word, w, h, variationVal) {
  const margin = 0.08 * min(w, h);
  const maxW = max(1, w - margin * 2);
  const maxH = max(1, h - margin * 2);

  const MIN_SIZE = 10;
  const MAX_SIZE = 220; // un po' più grande per far esplodere le parole corte

  // variation 0..1
  const v = constrain(variationVal, 0, 100) / 100;
  const mid = (MIN_SIZE + MAX_SIZE) / 2;

  // target prima del fit:
  // v=0 → vicino a mid; v=1 → grande escursione su tutto l'intervallo
  let target =
    mid + (random(-1, 1) * pow(random(), 0.2) * (MAX_SIZE - MIN_SIZE) * v);
  target = constrain(target, MIN_SIZE, MAX_SIZE);

  // ricerca binaria per stare in larghezza e altezza
  let lo = 6, hi = target, best = lo;
  for (let i = 0; i < 16; i++) {
    const test = (lo + hi) * 0.5;
    textSize(test);
    const tw = textWidth(word);
    const th = textAscent() + textDescent();
    if (tw <= maxW && th <= maxH) {
      best = test;
      lo = test;
    } else {
      hi = test;
    }
  }
  return best;
}

//––––––––––––––––––––––––––––––
// UPDATE & FADE (uno alla volta)
//––––––––––––––––––––––––––––––

function updateTile(t) {
  t.t += deltaTime / 1000;
  const total = t.fadeIn + t.hold + t.fadeOut;

  if (t.t > total) {
    // Rigenera SOLO questo riquadro con nuova parola
    const keep = { x:t.x, y:t.y, w:t.w, h:t.h };
    Object.assign(t, makeTile(keep.x, keep.y, keep.w, keep.h));
  }
}

function alphaTile(t) {
  const { t: time, fadeIn, hold, fadeOut } = t;
  if (time < fadeIn) {
    const u = time / fadeIn; return u * u;           // ease-in
  } else if (time < fadeIn + hold) {
    return 1;
  } else {
    const u = (time - fadeIn - hold) / fadeOut; return 1 - pow(u, 3); // ease-out
  }
}

//––––––––––––––––––––––––––––––
// DISEGNO
//––––––––––––––––––––––––––––––

function drawTile(t) {
  fill(t.bg);
  rect(t.x, t.y, t.w, t.h);

  const a = alphaTile(t);
  push();
  fill(red(t.textColor), green(t.textColor), blue(t.textColor), 255 * a);
  textSize(t.size);
  text(t.word, t.x + t.w / 2, t.y + t.h / 2);
  pop();
}