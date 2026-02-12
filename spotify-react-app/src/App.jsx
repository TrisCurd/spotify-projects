import { useState, useEffect } from 'react';
import Login from './components/Login';
import Profile from './components/Profile';
import TopTracks from './components/TopTracks';
import { isLoggedIn, exchangeCodeForToken } from './utils/spotify';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle callback from Spotify
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      if (code) {
        try {
          await exchangeCodeForToken(code);
          setLoggedIn(true);
          // Clean up URL
          window.history.replaceState({}, document.title, '/');
        } catch (error) {
          console.error('Error exchanging code for token:', error);
        }
      } else {
        setLoggedIn(isLoggedIn());
      }
      setLoading(false);
    };
    
    handleCallback();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  if (!loggedIn) {
    return <Login />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <Profile />
      <TopTracks />
    </div>
  );
}

export default App;
