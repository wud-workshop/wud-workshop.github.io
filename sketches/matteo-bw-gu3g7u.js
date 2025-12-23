let x, y, vx, vy;
let radiusSlider;
let saveBtn;
let cnv;

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style('z-index', '0');

  background(0);

  x = width / 2;
  y = height / 2;
  vx = random(-4, 4);
  vy = random(-4, 4);

  // Slider
  radiusSlider = createSlider(5, 150, 40, 1);
  radiusSlider.position(20, 20);
  radiusSlider.style('width', '160px');
  radiusSlider.style('z-index', '1');

  // Save button
  saveBtn = createButton("Save Image");
  saveBtn.position(20, 50);
  saveBtn.style('z-index', '1');

  saveBtn.mousePressed(() => {
    const timestamp =
      year() + "-" + nf(month(), 2) + "-" + nf(day(), 2) + "_" +
      nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
    saveCanvas("bouncing-" + timestamp, "png");
  });
}

function draw() {
  let r = radiusSlider.value();

  x += vx;
  y += vy;

  if (x - r < 0)  { x = r; vx *= -1; }
  if (x + r > width)  { x = width - r; vx *= -1; }
  if (y - r < 0)  { y = r; vy *= -1; }
  if (y + r > height) { y = height - r; vy *= -1; }

  fill(255);
  //noStroke();
  circle(x, y, r * 2);
}
