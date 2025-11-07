// C Major Pentatonic Scale - 3 octaves (C4-A6)
const pentatonicNotes = [
  // Octave 1 (C4-A4)
  261.63, 293.66, 329.63, 392.00, 440.00,
  // Octave 2 (C5-A5)
  523.25, 587.33, 659.25, 783.99, 880.00,
  // Octave 3 (C6-A6)
  1046.50, 1174.66, 1318.51, 1567.98, 1760.00
];

const noteNames = [
  'C4', 'D4', 'E4', 'G4', 'A4',
  'C5', 'D5', 'E5', 'G5', 'A5',
  'C6', 'D6', 'E6', 'G6', 'A6'
];

let balls = [];

class Ball {
  constructor(x, y, frequency, name) {
    this.x = x;
    this.y = y;
    this.radius = 40;
    this.frequency = frequency;
    this.name = name;
    this.isPressed = false;
    // Color based on octave
    let octaveIndex = Math.floor(balls.length / 5);
    this.hue = map(octaveIndex, 0, 2, 180, 300);
  }
  
  display() {
    push();
    if (this.isPressed) {
      fill(this.hue, 80, 100);
      stroke(this.hue, 80, 80);
      strokeWeight(4);
    } else {
      fill(this.hue, 60, 90);
      stroke(this.hue, 60, 70);
      strokeWeight(2);
    }
    ellipse(this.x, this.y, this.radius * 2);
    
    // Draw note name
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
    text(this.name, this.x, this.y);
    pop();
  }
  
  contains(px, py) {
    let d = dist(px, py, this.x, this.y);
    return d < this.radius;
  }
  
  playNote() {
    // Create a new oscillator and envelope for each note
    let osc = new p5.Oscillator('sine');
    let env = new p5.Envelope();
    
    // Set envelope with slow attack and release
    env.setADSR(0.8, 0.2, 0.5, 1.2);
    env.setRange(0.6, 0);
    
    // Set frequency and connect envelope
    osc.freq(this.frequency);
    osc.amp(env);
    osc.start();
    
    // Trigger the envelope
    env.play();
    
    // Stop and dispose of oscillator after envelope completes
    // Total time = attack + decay + release = 0.8 + 0.2 + 1.2 = 2.2s (add buffer)
    setTimeout(() => {
      osc.stop();
      osc.dispose();
    }, 2500);
  }
}

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100);
  
  // Arrange balls in a grid-like pattern
  let cols = 5;
  let rows = 3;
  let marginX = 100;
  let marginY = 100;
  let spacingX = (width - 2 * marginX) / (cols - 1);
  let spacingY = (height - 2 * marginY) / (rows - 1);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let index = row * cols + col;
      let x = marginX + col * spacingX;
      let y = marginY + row * spacingY;
      balls.push(new Ball(x, y, pentatonicNotes[index], noteNames[index]));
    }
  }
}

function draw() {
  background(220, 15, 95);
  
  // Display all balls
  for (let ball of balls) {
    ball.display();
  }
  
  // Instructions
  fill(0);
  noStroke();
  textAlign(LEFT);
  textSize(16);
  text('Click on balls to play notes (they can overlap!)', 20, 30);
}

function mousePressed() {
  // Start audio context on first interaction
  userStartAudio();
  
  for (let ball of balls) {
    if (ball.contains(mouseX, mouseY)) {
      ball.isPressed = true;
      ball.playNote();
      break;
    }
  }
}

function mouseReleased() {
  for (let ball of balls) {
    ball.isPressed = false;
  }
}