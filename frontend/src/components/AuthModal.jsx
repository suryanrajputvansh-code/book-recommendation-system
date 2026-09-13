import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }
      onAuthSuccess({ name: isLogin ? formData.email.split('@')[0] : formData.name, email: formData.email });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-paper-50 rounded-xl shadow-2xl border border-paper-300 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-paper-200">
          <h2 className="text-xl display-font font-bold text-ink-900">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-paper-200 text-muted hover:text-ink-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">{error}</div>}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-paper pl-10" placeholder="John Doe" />
              </div>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-paper pl-10" placeholder="you@example.com" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-paper pl-10" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
          <div className="text-center pt-2">
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-accent hover:text-accent-dark font-semibold transition-colors">
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}