# Spotify React App

A React application to interact with the Spotify Web API.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Spotify account (free or premium)

## Setup Instructions

### 1. Register Your App with Spotify

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app name and description
5. Accept the terms and conditions
6. Once created, you'll see your **Client ID** and **Client Secret**
7. Click "Edit Settings" and add `http://localhost:5173/callback` to the Redirect URIs
8. Save your changes

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

Replace `your_client_id_here` with your actual Client ID from the Spotify Dashboard.

### 4. Run the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Spotify API Authentication Flow

This starter uses the **Authorization Code Flow with PKCE** (Proof Key for Code Exchange), which is the recommended approach for client-side applications. This flow:

- Doesn't require a client secret (more secure for browser apps)
- Uses a code verifier/challenge mechanism
- Provides refresh tokens for long-term access

### How It Works

1. User clicks "Login with Spotify"
2. Redirected to Spotify's authorization page
3. User grants permissions
4. Spotify redirects back with an authorization code
5. App exchanges the code for an access token
6. Access token is used for API requests

## Available Spotify API Scopes

Common scopes you might want to use:

- `user-read-private` - Read user's subscription details
- `user-read-email` - Read user's email
- `user-top-read` - Read user's top artists and tracks
- `user-read-recently-played` - Read recently played tracks
- `user-library-read` - Read saved tracks and albums
- `playlist-read-private` - Read private playlists
- `playlist-modify-public` - Modify public playlists
- `playlist-modify-private` - Modify private playlists

Add these to the scope array in `src/utils/spotify.js` as needed.

## Project Structure

```
spotify-react-app/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Login button component
│   │   ├── Profile.jsx        # User profile display
│   │   └── TopTracks.jsx      # Example: Display top tracks
│   ├── utils/
│   │   └── spotify.js         # Spotify API utilities
│   ├── App.jsx                # Main app component
│   └── main.jsx               # Entry point
├── .env                       # Environment variables (create this)
├── package.json
└── README.md
```

## Next Steps

Once you have the basic auth working, you can:

1. Fetch user's playlists
2. Search for tracks, artists, albums
3. Get recommendations
4. Control playback (requires Spotify Premium)
5. Create and modify playlists

Check out the [Spotify Web API Reference](https://developer.spotify.com/documentation/web-api) for all available endpoints.

## Troubleshooting

**"Invalid redirect URI"**: Make sure `http://localhost:5173/callback` is added to your app's Redirect URIs in the Spotify Dashboard.

Error: Failed to refresh token: , {"error":"invalid_grant","error_description":"Refresh token revoked"}

**CORS errors**: The Spotify API supports CORS for browser requests, but make sure you're using the correct endpoints.

**401 Unauthorized**: Your access token may have expired. Implement token refresh using the refresh token.

## Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Authorization Guide](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [API Reference](https://developer.spotify.com/documentation/web-api/reference)
