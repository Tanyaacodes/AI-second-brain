import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    // Restore session from localStorage
    const saved = localStorage.getItem('burfi_user');
    const token = localStorage.getItem('burfi_token');
    if (saved && token) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('burfi_user');
        localStorage.removeItem('burfi_token');
      }
    }
    setAuthChecked(true);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setShowAuth(false);
    setIsEntered(true); // Jump into the app after successful login
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setShowAuth(false);
    setIsEntered(false);
    localStorage.removeItem('burfi_user');
    localStorage.removeItem('burfi_token');
    // Force a reload to ensure all state is wiped and we hit the landing page fresh
    window.location.href = '/'; 
  };

  if (!authChecked) return null; // prevent flash

  // Show the main app only if logged in AND they have "entered" via landing page
  if (currentUser && isEntered) {
    return (
      <div className="App">
        <Home currentUser={currentUser} onLogout={handleLogout} onLogin={handleLogin} />
      </div>
    );
  }

  // Otherwise, decide between Landing and Auth
  return (
    <div className="App">
      {showAuth 
        ? <AuthPage onLogin={handleLogin} onBack={() => setShowAuth(false)} />
        : <LandingPage onGetStarted={() => {
            // Force a fresh login every time from the landing page 
            // for maximum privacy and to prevent past user accounts from opening.
            localStorage.removeItem('burfi_user');
            localStorage.removeItem('burfi_token');
            setCurrentUser(null);
            setShowAuth(true);
          }} />
      }
    </div>
  );
}

export default App;