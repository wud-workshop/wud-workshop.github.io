let circles = [];
let maxCircles = 15;
let caterpillarColors = [];

let head = { x: 0, y: 0, size: 60 };
let velocity;
let directionChangeTimer = 0;
let exploded = false;
let particles = [];

function setup() {
  
  createCanvas(windowWidth, windowHeight);
  noStroke();
  colorMode(HSB, 360, 100, 100);

  // Start head in center
  head.x = width / 2;
  head.y = height / 2;
  velocity = createVector(2, 0);

  // Create gradient colors
  for (let i = 0; i < maxCircles; i++) {
    let hue = map(i, 0, maxCircles, 110, 10);
    caterpillarColors.push(color(hue, 90, 90));
  }
}

function draw() {
  background(198, 91, 78);

  fill(120, 80, 40);
  textSize(22);

  if (!exploded) {
    text("Press SPACE to grow your Hungry Hungry Caterpillar 🐛 (" + circles.length + "/15)", 20, 40);
  } else {
    text("💥 The Caterpillar Exploded! Press refresh to start over.", 20, 40);
  }

  if (exploded) {
    // Animate explosion particles
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.life -= 2;

      fill(p.col);
      ellipse(p.x, p.y, p.size);
    }
    particles = particles.filter(p => p.life > 0);
    return; // stop rest of the logic once exploded
  }

  // Randomly change direction sometimes
  directionChangeTimer--;
  if (directionChangeTimer <= 0) {
    let angleChange = random(-PI / 4, PI / 4);
    velocity.rotate(angleChange);
    directionChangeTimer = int(random(30, 100));
  }

  // Move the head
  head.x += velocity.x;
  head.y += velocity.y;

  // Bounce off walls
  if (head.x < 30 || head.x > width - 30) {
    velocity.x *= -1;
  }
  if (head.y < 30 || head.y > height - 30) {
    velocity.y *= -1;
  }

  // Move segments to follow
  for (let i = circles.length - 1; i > 0; i--) {
    let prev = circles[i - 1];
    let target = circles[i];
    let dx = prev.x - target.x;
    let dy = prev.y - target.y;
    let distVal = sqrt(dx * dx + dy * dy);
    let segmentLength = 50;
    if (distVal > 0) {
      target.x += (dx / distVal) * (distVal - segmentLength);
      target.y += (dy / distVal) * (distVal - segmentLength);
    }
  }

  // Update head
  if (circles.length > 0) {
    circles[0].x = head.x;
    circles[0].y = head.y;
  }

  // Draw caterpillar
  for (let i = circles.length - 1; i >= 0; i--) {
    fill(caterpillarColors[i]);
    ellipse(circles[i].x, circles[i].y, circles[i].size);
  }

  // Draw head face
  if (circles.length > 0) {
    drawFace(circles[0]);
  }
}

function keyPressed() {
  if (key === ' ') {
    if (exploded) return; // no new segments after explosion

    if (circles.length < maxCircles) {
      if (circles.length === 0) {
        circles.push({ x: head.x, y: head.y, size: 60 });
      } else {
        let prev = circles[circles.length - 1];
        circles.push({ x: prev.x, y: prev.y, size: 60 });
      }
    } else if (circles.length === maxCircles) {
      triggerExplosion();
    }
  }
}

function triggerExplosion() {
  exploded = true;
  for (let c of circles) {
    for (let i = 0; i < 10; i++) {
      particles.push({
        x: c.x,
        y: c.y,
        vx: random(-4, 4),
        vy: random(-4, 4),
        size: random(5, 15),
        col: color(random(360), 100, 100),
        life: random(60, 100)
      });
    }
  }
  circles = []; // remove the caterpillar
}

function drawFace(head) {
  push();
  translate(head.x, head.y);

  // Antennae
  stroke(0);
  strokeWeight(3);
  line(-15, -40, -25, -60);
  line(15, -40, 25, -60);
  noStroke();

  // Eyes
  fill(0);
  ellipse(-10, -10, 10);
  ellipse(10, -10, 10);

  // Smile
  noFill();
  stroke(0);
  strokeWeight(2);
  arc(0, 5, 20, 10, 0, PI);
  pop();
}
function mousePressed() {
  fullscreen(!fullscreen())
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
