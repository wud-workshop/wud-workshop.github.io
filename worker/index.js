// P5.js Workshop Gallery - Cloudflare Worker
// Handles sketch uploads to GitHub

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return jsonResponse({ success: false, error: 'Method not allowed' }, 405, corsHeaders);
    }

    try {
      // Parse multipart form data
      const formData = await request.formData();
      const authorName = formData.get('authorName');
      const file = formData.get('file');

      // Validate inputs
      const validation = validateInputs(authorName, file);
      if (!validation.valid) {
        return jsonResponse({ success: false, error: validation.error }, 400, corsHeaders);
      }

      // Read file content
      const fileContent = await file.text();

      // Sanitize author name
      const sanitizedAuthor = sanitizeString(authorName, 20);

      // Sanitize filename (remove .js extension first)
      const originalFilename = file.name.replace(/\.js$/, '');
      const sanitizedFilename = sanitizeString(originalFilename, 30);

      // Generate random 6-char string
      const randomString = generateRandomString(6);

      // Create final filename
      const finalFilename = `${sanitizedAuthor}-${sanitizedFilename}-${randomString}.js`;

      // Upload file to GitHub
      await uploadToGitHub(
        env.GITHUB_TOKEN,
        env.GITHUB_OWNER,
        env.GITHUB_REPO,
        `sketches/${finalFilename}`,
        fileContent,
        `Add sketch by ${authorName}`,
      );

      // Update manifest.json
      await updateManifest(env.GITHUB_TOKEN, env.GITHUB_OWNER, env.GITHUB_REPO, {
        id: `${sanitizedAuthor}-${sanitizedFilename}-${randomString}`,
        author: authorName,
        filename: finalFilename,
        uploadedAt: new Date().toISOString(),
      });

      // Return success
      const galleryUrl = `https://${env.GITHUB_OWNER}.github.io/${env.GITHUB_REPO}/`;
      return jsonResponse(
        {
          success: true,
          filename: finalFilename,
          galleryUrl: galleryUrl,
        },
        200,
        corsHeaders,
      );
    } catch (error) {
      console.error('Upload error:', error);
      return jsonResponse(
        {
          success: false,
          error: 'Internal server error. Please try again.',
        },
        500,
        corsHeaders,
      );
    }
  },
};

// Validate inputs
function validateInputs(authorName, file) {
  if (!authorName || typeof authorName !== 'string') {
    return { valid: false, error: 'Author name is required' };
  }

  if (authorName.length < 1 || authorName.length > 100) {
    return { valid: false, error: 'Author name must be between 1 and 100 characters' };
  }

  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  if (!file.name.endsWith('.js')) {
    return { valid: false, error: 'File must be a .js file' };
  }

  if (file.size > 51200) {
    // 50KB
    return { valid: false, error: 'File must be less than 50KB' };
  }

  return { valid: true };
}

// Sanitize string for filename
function sanitizeString(str, maxLength) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, maxLength);
}

// Generate random alphanumeric string
function generateRandomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Base64 encoding helpers for Cloudflare Workers
function base64Encode(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const binString = Array.from(data, (byte) => String.fromCodePoint(byte)).join('');
  return btoa(binString);
}

function base64Decode(str) {
  const binString = atob(str);
  const bytes = Uint8Array.from(binString, (char) => char.codePointAt(0));
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

// Upload file to GitHub
async function uploadToGitHub(token, owner, repo, path, content, message) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'P5-Workshop-Gallery',
    },
    body: JSON.stringify({
      message: message,
      content: base64Encode(content),
      branch: 'main',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

// Get file from GitHub
async function getFromGitHub(token, owner, repo, path) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'P5-Workshop-Gallery',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null; // File doesn't exist
    }
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

// Update manifest.json
async function updateManifest(token, owner, repo, newSketch) {
  const manifestPath = 'sketches/manifest.json';

  // Get current manifest
  const currentManifest = await getFromGitHub(token, owner, repo, manifestPath);

  let manifest;
  let sha;

  if (currentManifest) {
    // Decode existing manifest
    const content = base64Decode(currentManifest.content);
    manifest = JSON.parse(content);
    sha = currentManifest.sha;
  } else {
    // Create new manifest
    manifest = { sketches: [] };
    sha = undefined;
  }

  // Add new sketch to beginning of array
  manifest.sketches.unshift(newSketch);

  // Upload updated manifest
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${manifestPath}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'P5-Workshop-Gallery',
    },
    body: JSON.stringify({
      message: 'Update manifest with new sketch',
      content: base64Encode(JSON.stringify(manifest, null, 2)),
      sha: sha,
      branch: 'main',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update manifest: ${response.status} - ${error}`);
  }

  return await response.json();
}

// Helper to create JSON response
function jsonResponse(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}
