// White bouncing circle with trailing effect
// Slider for radius + Save Image button

let x, y, vx, vy;
let radiusSlider;
let saveBtn;

function setup() {
  createCanvas(800, 500);
  background(0); // trails remain

  // Start circle
  x = width / 2;
  y = height / 2;
  vx = random(-4, 4);
  vy = random(-4, 4);

  // UI
  createP("Radius").style('color', '#fff').style('font-family', 'sans-serif');
  radiusSlider = createSlider(5, 150, 40, 1);

  saveBtn = createButton("Save Image");
  saveBtn.mousePressed(() => {
    const timestamp = year() + "-" + nf(month(),2) + "-" + nf(day(),2) + "_" +
                      nf(hour(),2) + nf(minute(),2) + nf(second(),2);
    saveCanvas("bouncing-" + timestamp, "png");
  });
}

function draw() {
  // Do NOT clear → trail stays
  let r = radiusSlider.value();

  // Move & bounce
  x += vx;
  y += vy;

  if (x - r < 0)  { x = r; vx *= -1; }
  if (x + r > width)  { x = width - r; vx *= -1; }
  if (y - r < 0)  { y = r; vy *= -1; }
  if (y + r > height) { y = height - r; vy *= -1; }

  // Draw
  stroke(0,0,0,);
  fill(255);
  circle(x, y, r * 2);
}