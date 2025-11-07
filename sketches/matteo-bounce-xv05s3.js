let balls = [];
const GRAVITY = 0.4;
const BOUNCE = 0.7;

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(30);

  for (let b of balls) {
    // Apply gravity
    b.vy += GRAVITY;

    // Move
    b.x += b.vx;
    b.y += b.vy;

    // Bounce on edges
    if (b.y + b.size / 2 > height) {
      b.y = height - b.size / 2;
      b.vy *= -BOUNCE;
    }

    if (b.x - b.size / 2 < 0 || b.x + b.size / 2 > width) {
      b.vx *= -1;
    }

    // Draw ball
    fill(b.color);
    noStroke();
    circle(b.x, b.y, b.size);
  }
}

function mousePressed() {
  const newBall = {
    x: mouseX,
    y: mouseY,
    size: random(20, 50),
    vx: random(-2, 2),   // small random horizontal motion
    vy: random(-3, 0),   // spawn with a little upward kick
    color: color(random(255), random(255), random(255))
  };

  balls.push(newBall);
}