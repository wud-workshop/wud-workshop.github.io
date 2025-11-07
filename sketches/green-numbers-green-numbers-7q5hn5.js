let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(32);
  noStroke();
}

function draw() {
  background(0, 150); // semi-transparent background for trails

  // update and display each particle
  for (let p of particles) {
    p.update();
    p.display();
  }
}

function mousePressed() {
  const numNew = int(random(5, 15)); // spawn between 5 and 15 characters
  for (let i = 0; i < numNew; i++) {
    const x = mouseX + random(-50, 50);
    const y = mouseY + random(-50, 50);
    const speed = p5.Vector.random2D().mult(random(0.5, 3));
    const greenShade = color(0, random(100, 255), 0, random(150, 255));
    const charSet = ['#', '%', '¥', '§', '*', '∆', 'ø', 'Ω', '≈', '|', '/', '\\'];
    const symbol = random(charSet);
    particles.push(new Particle(x, y, speed, greenShade, symbol));
  }
}

class Particle {
  constructor(x, y, velocity, col, symbol) {
    this.position = createVector(x, y);
    this.velocity = velocity;
    this.color = col;
    this.symbol = symbol;
  }

  update() {
    this.position.add(this.velocity);

    // bounce off edges
    if (this.position.x < 0 || this.position.x > width) {
      this.velocity.x *= -1;
    }
    if (this.position.y < 0 || this.position.y > height) {
      this.velocity.y *= -1;
    }
  }

  display() {
    fill(this.color);
    text(this.symbol, this.position.x, this.position.y);
  }
}
