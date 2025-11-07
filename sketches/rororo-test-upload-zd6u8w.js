let img, procImg; // original + thresholded
let ui;

let stepSlider, lenSlider, angleSlider, maxLinesSlider;
let randMinSlider, randMaxSlider;
let randToggleBtn;

let thresBtn, thresSlider, thresholdOn = false;

let swSlider, capSelect;

let jitterXSlider, jitterYSlider; // jitter controls

let randomMode = false;

// ---------- helpers: UI ----------
function makeRow(label, w) {
  const row = createDiv().parent(ui)
    .style('display','flex')
    .style('gap','8px')
    .style('align-items','center')
    .style('margin','4px 0');
  if (label) row.child(createSpan(label).style('min-width','130px'));
  w.parent(row);
  const val = createSpan('').parent(row).style('opacity','0.7');
  return {row, val};
}
function bindValue(slider, valSpan, fmt=(v)=>v) {
  const set = ()=> valSpan.html(String(fmt(slider.value())));
  slider.input(()=>{ set(); redraw(); });
  set();
}

// ---------- deterministic hash (stable randomness) ----------
function hash(n){ return (Math.sin(n)*43758.5453123)%1.0; } // returns -0.999.. to 0.999..
function uhash(n){ let v = hash(n); return v<0? v+1 : v; } // 0..1
function dither(seed, range){ return (uhash(seed)*2-1) * range; } // -range..range

function setup() {
  pixelDensity(displayDensity()); // max-density export
  const c = createCanvas(900, 600);
  c.parent(createDiv().id('canvas-wrap'));

  // ---- UI OUTSIDE CANVAS ----
  ui = createDiv().id('ui')
    .style('margin','8px 0')
    .style('font-family','system-ui, sans-serif')
    .style('max-width','900px');
  createElement('h3','Controls').parent(ui).style('margin','8px 0');

  // File
  const fileRow = createDiv().parent(ui).style('margin','6px 0');
  fileRow.child(createSpan('Image: '));
  fileRow.child(createFileInput(handleFile));

  // Core
  ({val:stepVal} = makeRow('Step', stepSlider = createSlider(4, 50, 12, 1)));
  bindValue(stepSlider, stepVal, v=>v);

  ({val:lenVal}  = makeRow('Length ×', lenSlider = createSlider(0.2, 3.0, 1.0, 0.1)));
  bindValue(lenSlider, lenVal, v=>v.toFixed(1));

  ({val:angVal}  = makeRow('Angle °', angleSlider = createSlider(0, 180, 45, 1)));
  bindValue(angleSlider, angVal, v=>v+'°');

  ({val:maxLVal} = makeRow('Max lines', maxLinesSlider = createSlider(1, 30, 10, 1)));
  bindValue(maxLinesSlider, maxLVal, v=>v);

  // Random angle control
  ({val:randMinVal} = makeRow('Rand Min °', randMinSlider = createSlider(0, 180, 0, 1)));
  bindValue(randMinSlider, randMinVal, v=>v+'°');

  ({val:randMaxVal} = makeRow('Rand Max °', randMaxSlider = createSlider(0, 180, 60, 1)));
  bindValue(randMaxSlider, randMaxVal, v=>v+'°');

  // Random toggle
  const rRow = makeRow('Random angles', randToggleBtn = createButton('OFF'));
  randToggleBtn.mousePressed(()=>{
    randomMode = !randomMode;
    randToggleBtn.html(randomMode?'ON':'OFF');
    redraw();
  });

  // Threshold pre-process
  const thBtnRow = makeRow('Threshold', thresBtn = createButton('OFF'));
  thresBtn.mousePressed(()=>{
    thresholdOn = !thresholdOn;
    thresBtn.html(thresholdOn?'ON':'OFF');
    if (img) updateProcessed(); // only when needed
    redraw();
  });
  ({val:thVal} = makeRow('Threshold level', thresSlider = createSlider(0, 255, 128, 1)));
  thresSlider.input(()=>{
    thVal.html(thresSlider.value());
    if (img && thresholdOn) updateProcessed(); // avoid expensive work unless active
    redraw();
  });
  thVal.html(thresSlider.value());

  // Stroke style
  ({val:swVal} = makeRow('Stroke weight', swSlider = createSlider(0.5, 6, 1.2, 0.1)));
  bindValue(swSlider, swVal, v=>v.toFixed(1));

  const capRow = makeRow('Stroke cap', capSelect = createSelect());
  capSelect.option('round'); capSelect.option('square'); capSelect.option('project');
  capSelect.selected('round'); capSelect.changed(redraw);

  // Jitter
  ({val:jxVal} = makeRow('Jitter X (px)', jitterXSlider = createSlider(0, 12, 0, 0.1)));
  bindValue(jitterXSlider, jxVal, v=>v.toFixed(1));
  ({val:jyVal} = makeRow('Jitter Y (px)', jitterYSlider = createSlider(0, 12, 0, 0.1)));
  bindValue(jitterYSlider, jyVal, v=>v.toFixed(1));

  ui.child(createP('Tip: Press “S” to save PNG at max pixel density.').style('margin','6px 0'));

  noLoop();
  background(245);
}

function handleFile(file) {
  if (file.type === 'image') {
    loadImage(file.data, (loaded) => {
      img = loaded;
      const scale = min(width / img.width, height / img.height);
      img.resize(floor(img.width * scale), floor(img.height * scale));
      if (thresholdOn) updateProcessed();
      redraw();
    });
  }
}

function updateProcessed() {
  if (!img) return;
  procImg = img.get();
  procImg.filter(THRESHOLD, thresSlider.value() / 255);
}

function draw() {
  background(255);
  if (!img) return;

  const step = stepSlider.value();
  const lenMult = lenSlider.value();
  const baseLen = (step * 0.6) * lenMult;

  const maxLines = maxLinesSlider.value();
  const randMin = radians(randMinSlider.value());
  const randMax = radians(randMaxSlider.value());
  const baseAngle = radians(angleSlider.value());

  const sw = swSlider.value();
  const cap = capSelect.value();
  strokeWeight(sw);
  if (cap === 'round') strokeCap(ROUND);
  else if (cap === 'square') strokeCap(SQUARE);
  else strokeCap(PROJECT);

  const jx = jitterXSlider.value();
  const jy = jitterYSlider.value();

  // choose source (raw or thresholded)
  const src = (thresholdOn && procImg) ? procImg : img;
  src.loadPixels();

  const cols = max(1, floor(src.width / step));
  // Note: we avoid building random arrays. All randomness is deterministic (hash-based)
  // when randomMode is OFF, so moving other sliders won't regenerate randomness.

  for (let y = 0; y < src.height; y += step) {
    for (let x = 0; x < src.width; x += step) {
      const ix = constrain(floor(x), 0, src.width - 1);
      const iy = constrain(floor(y), 0, src.height - 1);
      const i = (ix + iy * src.width) * 4;

      const r = src.pixels[i], g = src.pixels[i + 1], b = src.pixels[i + 2];
      const bright = (r + g + b) / 3;

      const lines = int(map(bright, 0, 255, maxLines, 0));
      if (lines <= 0) continue;

      const innerH = step;
      const spacing = innerH / (lines + 1);
      const halfLen = baseLen / 2;

      // stable per-cell seed
      const cx = floor(x / step);
      const cy = floor(y / step);
      const cellIdx = cy * cols + cx;

      push();
      translate(x + step / 2, y + step / 2);

      for (let k = 0; k < lines; k++) {
        const yOff = -innerH / 2 + spacing * (k + 1);

        let theta;
        if (randomMode) {
          // per-line fully random angle each draw (fast, but changes when redrawn)
          theta = baseAngle + random(randMin, randMax);
        } else {
          // deterministic angle from stable hash (no arrays, no regen)
          const u = uhash(cellIdx * 1315423911 + k * 2654435761);
          const angleOffset = randMin + (randMax - randMin) * u;
          theta = baseAngle + angleOffset;
        }

        // deterministic jitter per line and per endpoint
        const cxJ = dither(cellIdx * 97531 + k * 7 + 1, jx);
        const cyJ = dither(cellIdx * 97531 + k * 7 + 2, jy);
        const e1x = dither(cellIdx * 97531 + k * 7 + 3, jx);
        const e1y = dither(cellIdx * 97531 + k * 7 + 4, jy);
        const e2x = dither(cellIdx * 97531 + k * 7 + 5, jx);
        const e2y = dither(cellIdx * 97531 + k * 7 + 6, jy);

        push();
        translate(cxJ, cyJ);
        rotate(theta);
        stroke(0);
        line(-halfLen + e1x, yOff + e1y, halfLen + e2x, yOff + e2y);
        pop();
      }
      pop();
    }
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('lines_image', 'png'); // max pixelDensity()
}
