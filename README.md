# P5.js Workshop Sketch Gallery

A fullscreen gallery for sharing P5.js sketches with drag-and-drop upload functionality. Built for workshops and collaborative creative coding sessions.

## Features

- **Fullscreen Gallery**: View P5.js sketches in an immersive fullscreen display
- **Easy Upload**: Drag and drop .js sketch files with author attribution
- **Arrow Navigation**: Browse sketches with keyboard arrows or on-screen buttons
- **GitHub-Powered**: Sketches stored in your GitHub repository via GitHub Pages
- **Serverless Backend**: Cloudflare Workers handle uploads without a traditional server

## Live Demo

Once deployed, your gallery will be available at:

```
https://workshop-2025.github.io/p5-gallery/
```

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Sketch Engine**: P5.js (loaded from CDN)
- **Hosting**: GitHub Pages
- **Backend**: Cloudflare Workers
- **Storage**: GitHub Repository (via GitHub Contents API)

## Quick Start

### Prerequisites

1. GitHub account
2. Cloudflare account (free tier works)
3. Node.js and npm installed
4. Wrangler CLI: `npm install -g wrangler`

### Setup Instructions

#### 1. GitHub Repository Setup

1. **Create a GitHub account** (if you don't have one)

   - Suggested username: `workshop-2025`

2. **Create a new public repository**:

   - Name: `p5-gallery`
   - Public visibility
   - No README or .gitignore (we have our own files)

3. **Enable GitHub Pages**:

   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `main`
   - Folder: `/ (root)`
   - Save and wait 2-3 minutes for deployment

4. **Create Personal Access Token (PAT)**:
   - Go to Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Name it: `p5-gallery-upload`
   - Expiration: 90 days (or your preference)
   - Scopes: Check `repo` (full control of private repositories)
   - Click "Generate token"
   - **COPY THE TOKEN** - you'll only see it once!
   - Store it securely

#### 2. Deploy Frontend to GitHub Pages

```bash
# Clone this repository (or initialize if starting fresh)
cd p5-workshop-gh

# Initialize git (if not already done)
git init
git branch -M main

# Add your GitHub remote (replace with your username/repo)
git remote add origin https://github.com/workshop-2025/p5-gallery.git

# Commit and push
git add .
git commit -m "Initial commit: P5.js gallery"
git push -u origin main
```

Wait 2-3 minutes for GitHub Pages to deploy. Your gallery will be live at:

```
https://workshop-2025.github.io/p5-gallery/
```

#### 3. Deploy Cloudflare Worker

```bash
# Navigate to worker directory
cd worker

# Login to Cloudflare
wrangler login

# Set the GitHub token secret
wrangler secret put GITHUB_TOKEN
# When prompted, paste your Personal Access Token

# Update wrangler.toml with your GitHub details
# Edit: GITHUB_OWNER and GITHUB_REPO values

# Deploy the worker
wrangler publish
```

After deployment, Wrangler will show your worker URL:

```
https://p5-upload-worker.your-subdomain.workers.dev
```

#### 4. Update Frontend with Worker URL

Edit `upload.html` and replace the placeholder:

```javascript
// Change this line:
const WORKER_URL = 'YOUR_WORKER_URL_HERE/upload';

// To your actual worker URL:
const WORKER_URL = 'https://p5-upload-worker.your-subdomain.workers.dev/upload';
```

Commit and push the change:

```bash
git add upload.html
git commit -m "Update worker URL"
git push
```

## Usage

### Viewing the Gallery

1. Visit your gallery URL: `https://workshop-2025.github.io/p5-gallery/`
2. Use the arrow buttons or keyboard arrows (← →) to navigate
3. Each sketch displays fullscreen with the author's name

### Uploading a Sketch

1. Click "Upload Sketch" in the gallery or visit `/upload.html`
2. Enter your name
3. Drag and drop your `.js` sketch file (or click to select)
4. Click "Upload Sketch"
5. Wait for confirmation, then view in the gallery

### Sketch Requirements

- Must be a `.js` file
- Maximum size: 50KB
- Must contain valid P5.js code (typically `setup()` and `draw()` functions)

### Example Test Sketch

See `test-sketch.js` for a simple example:

```javascript
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  fill(255, 0, 100);
  ellipse(mouseX, mouseY, 50, 50);
}
```

## File Structure

```
p5-gallery/
├── index.html              # Gallery viewer (fullscreen display)
├── upload.html             # Upload page (drag & drop)
├── style.css               # Shared styles
├── test-sketch.js          # Example sketch for testing
├── README.md               # This file
├── sketches/
│   └── manifest.json       # Registry of all uploaded sketches
└── worker/
    ├── index.js            # Cloudflare Worker (upload handler)
    ├── wrangler.toml       # Worker configuration
    └── package.json        # Worker package info
```

## How It Works

### Upload Flow

1. User uploads a `.js` file with their name
2. Frontend validates file (type, size)
3. File is sent to Cloudflare Worker
4. Worker validates and sanitizes inputs
5. Worker generates unique filename: `{author}-{filename}-{random}.js`
6. Worker uploads sketch to GitHub via Contents API
7. Worker updates `manifest.json` with new entry
8. GitHub Pages automatically serves the updated files
9. Gallery fetches updated manifest and displays new sketch

### Gallery Flow

1. Page loads P5.js from CDN
2. Fetches `sketches/manifest.json`
3. Displays first sketch (or empty state)
4. User navigates with arrows
5. On switch: cleans up previous sketch, loads new one
6. P5.js executes the sketch code

## Configuration

### Environment Variables (Worker)

Set in `worker/wrangler.toml`:

- `GITHUB_OWNER`: Your GitHub username (e.g., `workshop-2025`)
- `GITHUB_REPO`: Your repository name (e.g., `p5-gallery`)

Set via command (secure):

- `GITHUB_TOKEN`: Your Personal Access Token

### Rate Limiting

The worker enforces rate limits to prevent abuse:

- **10 uploads per IP per minute**
- Returns 429 status if exceeded

### Security Features

- File type validation (`.js` only)
- File size limit (50KB)
- Input sanitization (prevents path traversal)
- GitHub token never exposed to frontend
- CORS headers configured
- Rate limiting per IP

## Development

### Local Testing

You can test the frontend locally with a simple HTTP server:

```bash
# Python 3
python -m http.server 8000

# Or with Node.js
npx http-server -p 8000
```

Visit `http://localhost:8000`

### Worker Development

Test the worker locally:

```bash
cd worker
wrangler dev
```

This starts a local development server for testing uploads.

## Troubleshooting

### Sketches not appearing after upload

- Wait 1-2 minutes for GitHub Pages to update
- Check `sketches/manifest.json` in your repo
- Verify the sketch file was uploaded to `sketches/` directory
- Hard refresh the gallery page (Ctrl+Shift+R / Cmd+Shift+R)

### Upload fails with 401 error

- Check your GitHub token has `repo` permissions
- Verify token is set correctly: `wrangler secret put GITHUB_TOKEN`
- Token may have expired - generate a new one

### Worker deployment fails

- Ensure you're logged in: `wrangler login`
- Check `wrangler.toml` values are correct
- Verify you have a Cloudflare account

### Gallery shows empty state with sketches uploaded

- Check browser console for errors
- Verify `manifest.json` is valid JSON
- Check GitHub Pages deployment status

## License

MIT License - feel free to use for your workshops and modify as needed!

## Credits

Built for creative coding workshops. Powered by P5.js, GitHub Pages, and Cloudflare Workers.
