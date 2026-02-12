import { redirectToSpotifyAuth } from '../utils/spotify';

function Login() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ marginBottom: '2rem' }}>Spotify React App</h1>
      <button
        onClick={redirectToSpotifyAuth}
        style={{
          backgroundColor: '#1DB954',
          color: 'white',
          border: 'none',
          padding: '12px 32px',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '24px',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        Login with Spotify
      </button>
    </div>
  );
}

export default Login;
