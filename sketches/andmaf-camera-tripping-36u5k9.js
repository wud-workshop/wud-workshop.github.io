let capture;
let hSlider, vSlider, thresholdSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Create webcam capture
  capture = createCapture(VIDEO);
  capture.size(320, 240);
  capture.hide();
  
  // Create sliders
  hSlider = createSlider(1, 8, 2);
  hSlider.position(10, 10);
  hSlider.style('width', '150px');
  
  vSlider = createSlider(1, 8, 2);
  vSlider.position(10, 40);
  vSlider.style('width', '150px');
  
  thresholdSlider = createSlider(0, 255, 127);
  thresholdSlider.position(10, 70);
  thresholdSlider.style('width', '150px');
  
  pixelDensity(1);
}

function draw() {
  background(0);
  
  // Get slider values
  let hDivisions = hSlider.value();
  let vDivisions = vSlider.value();
  let thresholdValue = thresholdSlider.value();
  
  // Calculate division size
  let divWidth = width / hDivisions;
  let divHeight = height / vDivisions;
  
  capture.loadPixels();
  
  // Draw each division
  for (let i = 0; i < hDivisions; i++) {
    for (let j = 0; j < vDivisions; j++) {
      push();
      translate(i * divWidth, j * divHeight);
      
      // Mirror horizontally and vertically based on position
      if (i % 2 === 1) {
        translate(divWidth, 0);
        scale(-1, 1);
      }
      if (j % 2 === 1) {
        translate(0, divHeight);
        scale(1, -1);
      }
      
      // Draw the captured image with threshold
      drawThresholdedImage(0, 0, divWidth, divHeight, thresholdValue);
      
      pop();
    }
  }
  
  // Draw labels
  fill(255);
  noStroke();
  textSize(12);
  text('Horizontal: ' + hDivisions, 170, 23);
  text('Vertical: ' + vDivisions, 170, 53);
  text('Threshold: ' + thresholdValue, 170, 83);
}

function drawThresholdedImage(x, y, w, h, threshold) {
  let img = createImage(capture.width, capture.height);
  img.loadPixels();
  
  for (let i = 0; i < capture.pixels.length; i += 4) {
    // Convert to grayscale
    let r = capture.pixels[i];
    let g = capture.pixels[i + 1];
    let b = capture.pixels[i + 2];
    let gray = (r + g + b) / 3;
    
    // Apply threshold
    let val = gray > threshold ? 255 : 0;
    
    img.pixels[i] = val;
    img.pixels[i + 1] = val;
    img.pixels[i + 2] = val;
    img.pixels[i + 3] = 255;
  }
  
  img.updatePixels();
  image(img, x, y, w, h);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}