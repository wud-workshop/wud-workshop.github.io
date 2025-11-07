// ========== INPUTS (editable) ==========
let hashHex = "a1b2c3d4e5f6789012345678901234567890abcd";
let palette = [
  { r: 255, g: 100, b: 50, a: 137 },   // palette[0]: RGB for fill, a for shape type
  { r: 50, g: 150, b: 200, a: 178 },   // palette[1]: a for size
  { r: 100, g: 200, b: 100, a: 200 },
  { r: 200, g: 100, b: 200, a: 220 },
  { r: 150, g: 150, b: 50, a: 180 },
  { r: 50, g: 100, b: 150, a: 160 },
  { r: 200, g: 200, b: 100, a: 190 },
  { r: 100, g: 50, b: 200, a: 210 }
];

// ========== DERIVED VALUES ==========
let shapes = [];  // Array of 8 shape objects with type, size, color
let inputField; // Text input for user string

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Create input field
  inputField = createInput('');
  inputField.position(20, 20);
  inputField.size(300);
  inputField.attribute('placeholder', 'Enter text to generate shape...');
  inputField.input(handleInput);
  
  calculateShape();
}

// Handle input changes
function handleInput() {
  const userText = inputField.value();
  if (userText.length > 0) {
    // Calculate SHA-256 hash
    hashHex = sha256(userText);
    
    // Generate palette from hash
    palette = generatePaletteFromHash(hashHex);
    
    // Recalculate shape
    calculateShape();
    redraw();
  }
}

// Calculate shape properties from palette
function calculateShape() {
  shapes = [];
  
  // Generate 8 shapes from the 8 palette colors
  for (let i = 0; i < 8; i++) {
    const color = palette[i];
    
    // Shape type from this color's alpha
    const shapeType = color.a % 4;
    
    // Size from this color's alpha (map to percentage of canvas)
    const t = color.a / 255.0;
    const minDim = min(width, height);
    const size = map(t, 0, 1, 0.08 * minDim, 0.25 * minDim);
    
    shapes.push({
      type: shapeType,
      size: size,
      color: { r: color.r, g: color.g, b: color.b },
      index: i
    });
  }
}

// Simple SHA-256 implementation
function sha256(str) {
  // Convert string to UTF-8 byte array
  const utf8 = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < utf8.length; i++) {
    bytes.push(utf8.charCodeAt(i));
  }
  
  // SHA-256 constants
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  
  // Initial hash values
  let H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  
  // Pre-processing
  const msgLen = bytes.length;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) {
    bytes.push(0x00);
  }
  
  // Append length in bits as 64-bit big-endian
  const bitLen = msgLen * 8;
  for (let i = 7; i >= 0; i--) {
    bytes.push((bitLen >>> (i * 8)) & 0xff);
  }
  
  // Process chunks
  for (let chunk = 0; chunk < bytes.length; chunk += 64) {
    const w = new Array(64);
    
    // Copy chunk into first 16 words
    for (let i = 0; i < 16; i++) {
      w[i] = (bytes[chunk + i * 4] << 24) |
             (bytes[chunk + i * 4 + 1] << 16) |
             (bytes[chunk + i * 4 + 2] << 8) |
             (bytes[chunk + i * 4 + 3]);
    }
    
    // Extend words
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    
    // Initialize working variables
    let [a, b, c, d, e, f, g, h] = H;
    
    // Compression function
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;
      
      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }
    
    // Add compressed chunk to hash
    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
    H[5] = (H[5] + f) | 0;
    H[6] = (H[6] + g) | 0;
    H[7] = (H[7] + h) | 0;
  }
  
  // Convert to hex string
  let result = '';
  for (let i = 0; i < H.length; i++) {
    result += ((H[i] >>> 0).toString(16).padStart(8, '0'));
  }
  return result;
}

// Rotate right helper
function rotr(n, b) {
  return (n >>> b) | (n << (32 - b));
}

// Generate palette from hash
function generatePaletteFromHash(hash) {
  const newPalette = [];
  for (let i = 0; i < 8; i++) {
    const offset = i * 8;
    const r = parseInt(hash.substr(offset, 2), 16);
    const g = parseInt(hash.substr(offset + 2, 2), 16);
    const b = parseInt(hash.substr(offset + 4, 2), 16);
    const a = parseInt(hash.substr(offset + 6, 2), 16);
    newPalette.push({ r, g, b, a });
  }
  return newPalette;
}

function draw() {
  background(240);
  
  // Layout 8 shapes in a 3x3 grid (with center empty or use 2x4)
  const cols = 4;
  const rows = 2;
  const marginX = width * 0.1;
  const marginY = height * 0.1;
  const cellWidth = (width - marginX * 2) / cols;
  const cellHeight = (height - marginY * 2) / rows;
  
  noStroke();
  
  // Draw each of the 8 shapes
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    
    // Calculate grid position
    const col = i % cols;
    const row = floor(i / cols);
    const cx = marginX + col * cellWidth + cellWidth / 2;
    const cy = marginY + row * cellHeight + cellHeight / 2;
    
    // Set fill color
    fill(shape.color.r, shape.color.g, shape.color.b);
    
    // Draw shape based on type
    if (shape.type === 0) {
      // Circle
      circle(cx, cy, shape.size);
    } else if (shape.type === 1) {
      // Rectangle (centered)
      rectMode(CENTER);
      square(cx, cy, shape.size);
    } else if (shape.type === 2) {
      // Triangle (equilateral, centered)
      drawCenteredTriangle(cx, cy, shape.size);
    } else {
      // Blob (irregular closed curve)
      drawBlob(cx, cy, shape.size, shape.index);
    }
  }
}

function drawCenteredTriangle(cx, cy, size) {
  // Equilateral triangle with "diameter" = size
  const h = size * sqrt(3) / 2;
  const x1 = cx;
  const y1 = cy - h * 0.666;
  const x2 = cx - size / 2;
  const y2 = cy + h * 0.333;
  const x3 = cx + size / 2;
  const y3 = cy + h * 0.333;
  triangle(x1, y1, x2, y2, x3, y3);
}

function drawBlob(cx, cy, size, shapeIndex) {
  // Generate 8-10 points around center with deterministic jitter
  const numPoints = 9;
  const baseRadius = size / 2;
  
  // Deterministic RNG seeded from hashHex + shape index
  let seed = shapeIndex * 1000;
  for (let i = 0; i < min(8, hashHex.length); i++) {
    seed += hashHex.charCodeAt(i + shapeIndex);
  }
  
  beginShape();
  for (let i = 0; i < numPoints; i++) {
    const angle = map(i, 0, numPoints, 0, TWO_PI);
    
    // Deterministic jitter: -10% to +10% of baseRadius
    const hash = (seed * (i + 1) * 2654435761) % 1000;
    const jitter = map(hash, 0, 999, -0.1, 0.1) * baseRadius;
    const r = baseRadius + jitter;
    
    const x = cx + cos(angle) * r;
    const y = cy + sin(angle) * r;
    curveVertex(x, y);
  }
  // Close the curve by repeating first few points
  for (let i = 0; i < 3; i++) {
    const angle = map(i, 0, numPoints, 0, TWO_PI);
    const hash = (seed * (i + 1) * 2654435761) % 1000;
    const jitter = map(hash, 0, 999, -0.1, 0.1) * baseRadius;
    const r = baseRadius + jitter;
    const x = cx + cos(angle) * r;
    const y = cy + sin(angle) * r;
    curveVertex(x, y);
  }
  endShape();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Recalculate size based on new dimensions
  calculateShape();
  
  redraw();
}
