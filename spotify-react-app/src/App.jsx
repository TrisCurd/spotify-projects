import { useState, useEffect } from 'react';
import Login from './components/Login';
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
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
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
        <nav style={{ 
          padding: '1rem', 
          backgroundColor: '#1DB954', 
          marginBottom: '2rem' 
        }}>
          <Link to="/" style={{ color: 'white', marginRight: '1rem' }}>Profile</Link>
          <Link to="/top-tracks" style={{ color: 'white', marginRight: '1rem' }}>Top Tracks</Link>
          <Link to="/search" style={{ color: 'white' }}>Search</Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<Profile />} />
          <Route path="/top-tracks" element={<TopTracks />} />
          {/* <Route path="/search" element={<Search />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
