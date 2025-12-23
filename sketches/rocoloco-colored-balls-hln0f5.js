// Array to store all balls
let balls = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  background(0);
}

function draw() {
  background(0);

  for (let ball of balls) {
    ball.update();
    ball.display();
  }
}

// Add a new ball on mouse press
function mousePressed() {
  balls.push(new Ball(mouseX, mouseY));
}

// Ball class
class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.radius = random(20, 50);

    // Perlin noise offsets (unique per ball)
    this.tx = random(1000);
    this.ty = random(1000);

    this.noiseSpeed = 0.01;
    this.maxSpeed = 2;

    // Direction multipliers for bouncing
    this.dirX = 1;
    this.dirY = 1;
  }

  update() {
    // Perlin-based velocities
    let vx = map(noise(this.tx), 0, 1, -this.maxSpeed, this.maxSpeed);
    let vy = map(noise(this.ty), 0, 1, -this.maxSpeed, this.maxSpeed);

    this.x += vx * this.dirX;
    this.y += vy * this.dirY;

    // Advance noise space
    this.tx += this.noiseSpeed;
    this.ty += this.noiseSpeed;

    // Bounce off walls
    if (this.x < this.radius) {
      this.x = this.radius;
      this.dirX *= -1;
    }
    if (this.x > width - this.radius) {
      this.x = width - this.radius;
      this.dirX *= -1;
    }

    if (this.y < this.radius) {
      this.y = this.radius;
      this.dirY *= -1;
    }
    if (this.y > height - this.radius) {
      this.y = height - this.radius;
      this.dirY *= -1;
    }
  }

  display() {
    fill(255, 220, 0); // yellow
    ellipse(this.x, this.y, this.radius * 2);
  }
}
