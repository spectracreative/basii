import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User } from 'lucide-react';
import { supabase } from '../utils/supabase';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Supabase requires an email, so we fake an email using the username
    // We use a standard TLD (.com) because Supabase rejects .local
    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@basii.com`;

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          onLogin(data.session);
        } else {
          // Sometimes email confirmation is required by default, but for local/personal we assume it works or we just show a message
          setError('Signup successful! You can now sign in.');
          setIsSignUp(false);
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onLogin(data.session);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card glass"
        style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '64px', 
            height: '64px', 
            backgroundColor: 'var(--color-primary)', 
            borderRadius: '50%',
            marginBottom: '1rem',
            color: 'white'
          }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)' }}>
            {isSignUp ? 'Create Account' : 'Welcome to Basii'}
          </h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            {isSignUp ? 'Sign up to sync your dashboard' : 'Please sign in to access your dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="input-field" 
                style={{ paddingLeft: '2.5rem' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                className="input-field" 
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="text-danger" style={{ fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem' }}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button 
            type="button" 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
