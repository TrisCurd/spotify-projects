import { useState, useEffect } from 'react';
import { spotifyApi, logout } from '../utils/spotify';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await spotifyApi('/me');
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Your Spotify Profile</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        alignItems: 'center',
        padding: '1.5rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        {profile.images && profile.images[0] && (
          <img 
            src={profile.images[0].url} 
            alt={profile.display_name}
            style={{ 
              width: '150px', 
              height: '150px', 
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        )}
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>{profile.display_name}</h2>
          <p style={{ margin: '0.25rem 0', color: '#666' }}>Email: {profile.email}</p>
          <p style={{ margin: '0.25rem 0', color: '#666' }}>Followers: {profile.followers.total}</p>
          <p style={{ margin: '0.25rem 0', color: '#666' }}>Country: {profile.country}</p>
          <p style={{ margin: '0.25rem 0', color: '#666' }}>
            Subscription: {profile.product === 'premium' ? '✨ Premium' : 'Free'}
          </p>
          <a 
            href={profile.external_urls.spotify} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#1DB954', textDecoration: 'none' }}
          >
            Open in Spotify →
          </a>
        </div>
      </div>
    </div>
  );
}

export default Profile;
