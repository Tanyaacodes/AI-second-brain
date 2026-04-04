import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

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
  };
  
  const handleLogout = () => setCurrentUser(null);

  if (!authChecked) return null; // prevent flash

  if (currentUser) {
    return (
      <div className="App">
        <Home currentUser={currentUser} onLogout={handleLogout} onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="App">
      {showAuth 
        ? <AuthPage onLogin={handleLogin} onBack={() => setShowAuth(false)} />
        : <LandingPage onGetStarted={() => setShowAuth(true)} />
      }
    </div>
  );
}

export default App;