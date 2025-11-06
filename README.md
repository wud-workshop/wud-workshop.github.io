# P5.js Workshop Sketch Gallery

A fullscreen gallery for sharing P5.js sketches with drag-and-drop upload functionality. Built for workshops and collaborative creative coding sessions.

## Live Demo

This repository is hosted on GitHub Pages and can be visited at:

**https://wud-workshop.github.io/**

## Features

- **Fullscreen Gallery**: View P5.js sketches in an immersive fullscreen display with iframe isolation
- **Easy Upload**: Drag and drop .js sketch files with author attribution
- **Arrow Navigation**: Browse sketches with keyboard arrows or on-screen buttons
- **GitHub-Powered**: Sketches stored in your GitHub repository via GitHub Pages
- **Serverless Backend**: Cloudflare Workers handle uploads without a traditional server

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Sketch Engine**: P5.js (loaded from CDN)
- **Hosting**: GitHub Pages
- **Backend**: Cloudflare Workers
- **Storage**: GitHub Repository (via GitHub Contents API)

## Usage

### Viewing the Gallery

1. Visit the gallery at https://wud-workshop.github.io/
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
wud-workshop/
├── index.html              # Gallery viewer (fullscreen display)
├── sketch-viewer.html      # Iframe viewer for individual sketches
├── upload.html             # Upload page (drag & drop)
├── style.css               # Shared styles
├── test-sketch.js          # Example sketch for testing
├── LICENSE                 # MIT License
├── README.md               # This file
├── sketches/
│   └── manifest.json       # Registry of all uploaded sketches
└── worker/
    ├── index.js            # Cloudflare Worker (upload handler)
    ├── wrangler.toml       # Worker configuration
    ├── package.json        # Worker package info
    └── pnpm-lock.yaml      # Package lock file
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

1. Page loads manifest from `sketches/manifest.json`
2. Displays first sketch (or empty state if none exist)
3. User navigates with arrows
4. On switch: loads new sketch in an iframe via `sketch-viewer.html`
5. The iframe loads P5.js from CDN and executes the sketch code
6. Iframe sandboxing provides isolation between sketches

### Security Features

- File type validation (`.js` only)
- File size limit (50KB)
- Input sanitization (prevents path traversal)
- GitHub token never exposed to frontend
- CORS headers configured
- Iframe sandboxing for sketch isolation

## Configuration

### Environment Variables (Worker)

The `worker/wrangler.toml` file contains:

- `GITHUB_OWNER`: GitHub username (already set for this repository)
- `GITHUB_REPO`: Repository name (already set for this repository)

> **Note:** These are already configured for the wud-workshop repository. You only need to update them if you're forking this project to create your own gallery.

### GitHub Token Setup

The worker needs a GitHub Personal Access Token to upload sketches.

**For Production (Only if deploying your own Cloudflare Worker):**

```bash
cd worker
pnpm run secret:put GITHUB_TOKEN
# Paste your Personal Access Token when prompted
```

**For Local Development:**

Create a `.dev.vars` file in the `worker/` directory:

```bash
GITHUB_TOKEN=your_github_token_here
```

> **Important:** The worker always uploads sketches to GitHub, even when running locally. After uploading sketches via local development, you must pull changes from the remote repository to sync your local `sketches/` folder. The worker never modifies local files directly.

## Development

### Frontend Local Testing

Test the frontend locally with any HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server -p 8000
```

Visit `http://localhost:8000`

Or use the VS Code Live Server extension.

**Testing with Local Worker:**

The `WORKER_URL` in `upload.html` is already set to `http://localhost:8787` for local development. If testing against a locally running worker, keep this value. For production, update it to your deployed worker URL.

> **⚠️ Important:** Do not commit changes to `WORKER_URL` when switching between local and production URLs. Keep it at the localhost value in the repository.

### Worker Development

The worker directory uses pnpm and Wrangler as a local dev dependency:

```bash
cd worker

# Install dependencies (first time only)
pnpm install

# Test locally
pnpm run dev
```

The worker runs on `http://localhost:8787` by default.

**Testing Locally - CORS Configuration:**

When testing the worker locally, you need to temporarily update the CORS configuration in `worker/index.js`:

```javascript
// For local development only - change line 8:
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Already set to allow all
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

> **🚨 CRITICAL:** The CORS origin is already set to `'*'` (allow all) in the current code. This is fine for local development but represents a security consideration for production. **DO NOT commit any changes to CORS settings** - keep the configuration as is in the repository.

## Deployment

### Deploying the Worker to Cloudflare

1. **Login to Cloudflare** (first time only):

```bash
cd worker
npx wrangler login
```

2. **Deploy the worker**:

```bash
pnpm run deploy
```

3. **Set GitHub token secret** (must be done after first deployment):

```bash
pnpm run secret:put GITHUB_TOKEN
# Paste your Personal Access Token when prompted
```

After deployment, Wrangler will display your worker URL (e.g., `https://your-worker-name.your-subdomain.workers.dev`).

### Deploying the Frontend (GitHub Pages)

The frontend is automatically deployed via GitHub Pages whenever you push to the `main` branch.

**Initial Setup:**

1. Go to repository Settings → Pages
2. Source: Deploy from branch
3. Branch: `main`, Folder: `/ (root)`
4. Save and wait 2-3 minutes for deployment

**Updating Worker URL for Production:**

After deploying your worker, update `upload.html` with the production worker URL:

```javascript
const WORKER_URL = 'https://your-worker-name.your-subdomain.workers.dev';
```

Then commit and push:

```bash
git add upload.html
git commit -m "Update worker URL for production"
git push
```

> **Note:** For this repository (wud-workshop), GitHub Pages is already configured and the site is live at https://wud-workshop.github.io/

## Troubleshooting

### Sketches not appearing after upload

- Wait 1-2 minutes for GitHub Pages to update
- Check `sketches/manifest.json` in your repo
- Verify the sketch file was uploaded to `sketches/` directory
- Hard refresh the gallery page (Ctrl+Shift+R / Cmd+Shift+R)

### Upload fails with 401 error

- Check your GitHub token has `repo` permissions
- Verify token is set correctly with `wrangler secret list` (lists secret names, not values)
- Token may have expired - generate a new one

### Worker deployment fails

- Ensure you're logged in: `cd worker && npx wrangler login`
- Check `wrangler.toml` values are correct
- Verify you have a Cloudflare account

### Gallery shows empty state with sketches uploaded

- Check browser console for errors
- Verify `manifest.json` is valid JSON
- Check GitHub Pages deployment status

## Setting Up Your Own Gallery

If you want to fork this project and create your own gallery:

### Prerequisites

1. GitHub account
2. Cloudflare account (free tier works)
3. Node.js installed (recommend using a version manager like [nvm](https://github.com/nvm-sh/nvm))
4. pnpm installed (`corepack enable`)

### Quick Setup

1. **Fork and configure:**

   - Fork this repository to your GitHub account
   - Rename it if desired (e.g., `my-p5-gallery`)
   - Update `worker/wrangler.toml` with your GitHub username and repository name

2. **Create GitHub Personal Access Token:**

   - Go to Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Copy the token (you'll only see it once!)

3. **Configure token for development:**

   - Create `worker/.dev.vars` file with: `GITHUB_TOKEN=your_token_here`

4. **Deploy:**
   - See the [Deployment](#deployment) section for deploying both the worker and frontend
   - Update `upload.html` with your deployed worker URL

Your gallery will be live at `https://your-username.github.io/your-repo-name/`

## License

MIT License - feel free to use for your workshops and modify as needed!

## Credits

Built for creative coding workshops. Powered by P5.js, GitHub Pages, and Cloudflare Workers.
