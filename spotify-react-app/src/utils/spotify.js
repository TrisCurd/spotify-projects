// Spotify API utility functions using Authorization Code Flow with PKCE

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played'
];

// Generate a random string for the code verifier
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

// Create SHA256 hash and base64url encode it
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Generate code challenge from verifier
async function generateCodeChallenge(codeVerifier) {
  const hashed = await sha256(codeVerifier);
  return base64urlencode(hashed);
}

// Initiate Spotify login
export async function redirectToSpotifyAuth() {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store the verifier for later use
  localStorage.setItem('code_verifier', codeVerifier);
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });
  
  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code) {
  const codeVerifier = localStorage.getItem('code_verifier');
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });
  
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  localStorage.setItem('expires_at', Date.now() + data.expires_in * 1000);
  
  // Clean up code verifier
  localStorage.removeItem('code_verifier');
  
  return data.access_token;
}

// Refresh the access token
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }
  
  const data = await response.json();
  
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('expires_at', Date.now() + data.expires_in * 1000);
  
  return data.access_token;
}

// Get valid access token (refreshes if needed)
export async function getAccessToken() {
  const token = localStorage.getItem('access_token');
  const expiresAt = localStorage.getItem('expires_at');
  
  if (!token) {
    return null;
  }
  
  // Check if token is expired or will expire in the next minute
  if (Date.now() >= expiresAt - 60000) {
    return await refreshAccessToken();
  }
  
  return token;
}

// Make authenticated API request
export async function spotifyApi(endpoint, options = {}) {
  const token = await getAccessToken();
  
  if (!token) {
    throw new Error('No access token available');
  }
  
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }
  
  return await response.json();
}

// Logout
export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('expires_at');
  localStorage.removeItem('code_verifier');
}

// Check if user is logged in
export function isLoggedIn() {
  return !!localStorage.getItem('access_token');
}
