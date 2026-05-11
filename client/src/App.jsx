import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Chat from './components/Chat/Chat'
import Auth from './components/Auth/Auth'
import './App.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setUser(null);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Permanently delete your account and all your messages? This cannot be undone.')) return;
    await supabase.rpc('delete_user');
    await supabase.auth.signOut();
    localStorage.clear();
    setUser(null);
  };

  return (
    <div className="app">
      {user ? (
        <Chat
          user={user}
          supabase={supabase}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
      ) : (
        <Auth supabase={supabase} />
      )}
    </div>
  );
}

export default App;
