import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import AuthPage from './components/AuthPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

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

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  if (!authChecked) return null; // prevent flash

  return (
    <div className="App">
      {currentUser
        ? <Home currentUser={currentUser} onLogout={handleLogout} />
        : <AuthPage onLogin={handleLogin} />
      }
    </div>
  );
}

export default App;