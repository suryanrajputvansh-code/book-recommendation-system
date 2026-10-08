import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const { login, signup, googleLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);

  // Load Google Identity Services script
  useEffect(() => {
    const scriptId = 'google-jssdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Initialize Google Button when script is ready
  useEffect(() => {
    let timer;
    const initGoogleBtn = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        // Use client_id from meta tag or placeholder
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              setError('');
              try {
                const user = await googleLogin(response.credential);
                if (onAuthSuccess) onAuthSuccess(user);
                onClose();
              } catch (err) {
                setError(err.message || 'Google sign in failed');
              } finally {
                setLoading(false);
              }
            }
          }
        });
        window.google.accounts.id.renderButton(
          googleBtnRef.current,
          { theme: 'outline', size: 'large', width: '100%', text: isLogin ? 'signin_with' : 'signup_with' }
        );
      } else {
        timer = setTimeout(initGoogleBtn, 300);
      }
    };
    initGoogleBtn();
    return () => clearTimeout(timer);
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const email = formData.email.trim();
    const password = formData.password;
    const name = formData.name.strip ? formData.name.strip() : formData.name.trim();

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      let user;
      if (isLogin) {
        user = await login(email, password);
      } else {
        user = await signup(name, email, password);
      }
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-paper-50 rounded-xl shadow-2xl border border-paper-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-paper-200 bg-paper-100/60">
          <div>
            <h2 className="text-xl display-font font-bold text-ink-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              {isLogin ? 'Sign in to access personalized recommendations' : 'Join BookWise to rate books & save favorites'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-paper-200 text-muted hover:text-ink-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md font-medium leading-relaxed">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-paper pl-10"
                  placeholder="Vanch Suryan"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-paper pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Password</label>
              <span className="text-[10px] text-muted font-mono">Min 8 chars</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-paper pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-2 py-3 text-sm font-bold tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-paper-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-paper-50 px-2 text-muted font-mono text-[10px]">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-in Button Container */}
          <div ref={googleBtnRef} className="w-full flex justify-center min-h-[40px]"></div>

          <div className="text-center pt-2 border-t border-paper-200">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-xs text-accent hover:text-accent-dark font-bold transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}