// Spotify API utility functions using Authorization Code Flow with PKCE
import { SpotifyApi, AccessToken } from "@spotify/web-api-ts-sdk";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "user-read-recently-played",
  "playlist-read-private",
  "playlist-read-collaborative",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
];

// Generate a random string for the code verifier
function generateRandomString(length: number): string {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

// Create SHA256 hash and base64url encode it
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(a: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(a)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Generate code challenge from verifier
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const hashed = await sha256(codeVerifier);
  return base64urlencode(hashed);
}

// Initiate Spotify login
export async function redirectToSpotifyAuth(): Promise<void> {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store the verifier for later use
  localStorage.setItem("code_verifier", codeVerifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(" "),
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string): Promise<string> {
  const codeVerifier = localStorage.getItem("code_verifier");

  if (!codeVerifier) {
    throw new Error("No code verifier found");
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for token");
  }

  const data = await response.json();

  // Store tokens
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem(
    "expires_at",
    String(Date.now() + data.expires_in * 1000),
  );

  // Clean up code verifier
  localStorage.removeItem("code_verifier");

  return data.access_token;
}

// Refresh the access token
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.error === "invalid_grant") {
      logout();
      window.location.reload();
    }
    throw new Error(`Failed to refresh token: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();

  localStorage.setItem("access_token", data.access_token);
  if (data.refresh_token) {
    localStorage.setItem("refresh_token", data.refresh_token);
  }
  localStorage.setItem(
    "expires_at",
    String(Date.now() + data.expires_in * 1000),
  );

  return data.access_token;
}

// Get valid access token (refreshes if needed)
export async function getAccessToken(): Promise<string | null> {
  const token = localStorage.getItem("access_token");
  const expiresAt = localStorage.getItem("expires_at");

  if (!token) {
    return null;
  }

  if (!expiresAt) {
    return token;
  }

  // Check if token is expired or will expire in the next minute
  if (Date.now() >= parseInt(expiresAt) - 60000) {
    return await refreshAccessToken();
  }

  return token;
}

// Logout
export function logout(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("expires_at");
  localStorage.removeItem("code_verifier");
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  return !!localStorage.getItem("access_token");
}

const MAX_RETRIES = 4;

async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let attempt = 0;

  while (true) {
    const response = await fetch(input, init);

    if (response.status !== 429 || attempt >= MAX_RETRIES) {
      return response;
    }

    const retryAfter = response.headers.get("Retry-After");
    const waitMs = retryAfter
      ? parseInt(retryAfter) * 1000
      : Math.pow(2, attempt) * 1000;

    await new Promise((resolve) => setTimeout(resolve, waitMs));
    attempt++;
  }
}

export function getSpotifyClient(): SpotifyApi {
  const token = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const expiresAt = localStorage.getItem("expires_at");

  if (!token) {
    throw new Error("No access token available");
  }

  const accessToken: AccessToken = {
    access_token: token,
    token_type: "Bearer",
    expires_in: expiresAt
      ? Math.floor((parseInt(expiresAt) - Date.now()) / 1000)
      : 3600,
    refresh_token: refreshToken || "",
  };

  return SpotifyApi.withAccessToken(CLIENT_ID, accessToken, { fetch: fetchWithRetry });
}
