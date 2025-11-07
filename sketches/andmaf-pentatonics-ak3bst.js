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
let buttons = [];
let activeNotes = []; // Track currently playing notes

// Envelope parameters
const ATTACK = 0.8;
const DECAY = 0.2;
const SUSTAIN = 0.5;
const RELEASE = 1.2;
const MAX_AMP = 0.6;

class Ball {
  constructor(x, y, frequency, name, index) {
    this.x = x;
    this.y = y;
    this.baseRadius = 40;
    this.radius = this.baseRadius;
    this.frequency = frequency;
    this.name = name;
    this.index = index;
    // Color based on octave
    let octaveIndex = Math.floor(index / 5);
    this.hue = map(octaveIndex, 0, 2, 180, 300);
  }
  
  display() {
    push();
    fill(this.hue, 60, 90);
    stroke(this.hue, 60, 70);
    strokeWeight(2);
    ellipse(this.x, this.y, this.radius * 2);
    
    // Draw note name
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
    text(this.name, this.x, this.y);
    pop();
  }
  
  setScale(scale) {
    // Scale the ball based on envelope value (0 to 1)
    this.radius = this.baseRadius * (1 + scale * 0.8); // Grows up to 80% larger
  }
}

class ActiveNote {
  constructor(ball, startTime) {
    this.ball = ball;
    this.startTime = startTime;
    this.osc = new p5.Oscillator('sine');
    this.env = new p5.Envelope();
    
    // Set envelope with slow attack and release
    this.env.setADSR(ATTACK, DECAY, SUSTAIN, RELEASE);
    this.env.setRange(MAX_AMP, 0);
    
    // Set frequency and connect envelope
    this.osc.freq(ball.frequency);
    this.osc.amp(this.env);
    this.osc.start();
    
    // Trigger the envelope
    this.env.play();
  }
  
  getEnvelopeValue() {
    let elapsed = (millis() - this.startTime) / 1000; // Convert to seconds
    
    if (elapsed < ATTACK) {
      // Attack phase: 0 to MAX_AMP
      return map(elapsed, 0, ATTACK, 0, 1);
    } else if (elapsed < ATTACK + DECAY) {
      // Decay phase: MAX_AMP to SUSTAIN
      return map(elapsed, ATTACK, ATTACK + DECAY, 1, SUSTAIN / MAX_AMP);
    } else if (elapsed < ATTACK + DECAY + 0.1) {
      // Sustain phase (short)
      return SUSTAIN / MAX_AMP;
    } else {
      // Release phase: SUSTAIN to 0
      let releaseStart = ATTACK + DECAY + 0.1;
      let releaseProgress = elapsed - releaseStart;
      if (releaseProgress < RELEASE) {
        return map(releaseProgress, 0, RELEASE, SUSTAIN / MAX_AMP, 0);
      }
      return 0;
    }
  }
  
  isFinished() {
    let elapsed = (millis() - this.startTime) / 1000;
    return elapsed > (ATTACK + DECAY + 0.1 + RELEASE);
  }
  
  stop() {
    this.osc.stop();
    this.osc.dispose();
  }
}

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100);
  
  // Arrange balls in a grid-like pattern
  let cols = 5;
  let rows = 3;
  let marginX = 100;
  let marginY = 80;
  let spacingX = (width - 2 * marginX) / (cols - 1);
  let spacingY = (height - marginY - 150) / (rows - 1);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let index = row * cols + col;
      let x = marginX + col * spacingX;
      let y = marginY + row * spacingY;
      balls.push(new Ball(x, y, pentatonicNotes[index], noteNames[index], index));
    }
  }
  
  // Create buttons for each note
  let buttonY = height - 80;
  let buttonSpacing = (width - 40) / 15;
  for (let i = 0; i < 15; i++) {
    let btn = createButton(noteNames[i]);
    btn.position(20 + i * buttonSpacing, buttonY);
    btn.mousePressed(() => playNote(i));
    btn.style('padding', '8px 12px');
    btn.style('font-size', '12px');
    buttons.push(btn);
  }
}

function draw() {
  background(220, 15, 95);
  
  // Update ball sizes based on active notes
  // First reset all balls to base size
  for (let ball of balls) {
    ball.setScale(0);
  }
  
  // Then scale balls with active notes
  for (let i = activeNotes.length - 1; i >= 0; i--) {
    let note = activeNotes[i];
    let envValue = note.getEnvelopeValue();
    note.ball.setScale(envValue);
    
    // Remove finished notes
    if (note.isFinished()) {
      note.stop();
      activeNotes.splice(i, 1);
    }
  }
  
  // Display all balls
  for (let ball of balls) {
    ball.display();
  }
  
  // Instructions
  fill(0);
  noStroke();
  textAlign(LEFT);
  textSize(16);
  text('Click buttons to play notes (they can overlap!)', 20, 30);
}

function playNote(index) {
  // Start audio context on first interaction
  userStartAudio();
  
  // Create new active note
  let ball = balls[index];
  let activeNote = new ActiveNote(ball, millis());
  activeNotes.push(activeNote);
}