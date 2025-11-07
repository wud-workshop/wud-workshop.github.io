// p5.js script
let circles = [];
let gravity = 0.5;   // downward acceleration
let damping = 0.8;   // bounce reduction

class Circle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 25;
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
    this.fixed = true; // true while mouse is pressed
  }

  applyPhysics() {
    if (!this.fixed) {
      this.vy += gravity;
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off floor
      if (this.y + this.radius > height) {
        this.y = height - this.radius;
        this.vy *= -damping;
      }

      // Bounce off walls
      if (this.x - this.radius < 0 || this.x + this.radius > width) {
        this.vx *= -damping;
        this.x = constrain(this.x, this.radius, width - this.radius);
      }
    }
  }

  display() {
    noStroke();
    fill(0);
    circle(this.x, this.y, this.radius * 2);
  }
}

function setup() {
  createCanvas(600, 400);
  background(255);
}

function draw() {
  background(255);
  for (let c of circles) {
    c.applyPhysics();
    c.display();
  }
}

function mousePressed() {
  circles.push(new Circle(mouseX, mouseY));
}

function mouseReleased() {
  for (let c of circles) {
    c.fixed = false;
  }
}
