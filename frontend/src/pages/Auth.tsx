import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Mail, Lock, UserPlus } from 'lucide-react';
import useCarbonStore from '../store/carbonStore';

export const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { loginMock } = useCarbonStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password || (isSignUp && !username)) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    // Since we are setting up Phase 1 scaffolding without active Supabase credentials,
    // we fallback to mock simulation logic to let the user log in instantly.
    setTimeout(() => {
      const parsedUser = username || email.split('@')[0];
      loginMock(parsedUser);
      setIsLoading(false);
      navigate('/dashboard');
    }, 800);
  };

  const triggerGoogleOAuth = () => {
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      loginMock('google_researcher');
      setIsLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-6 selection:bg-accent-green selection:text-bg-primary">
      <div className="w-full max-w-md bg-bg-surface border border-bg-card rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glowing aura */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-green/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-bg-card flex items-center justify-center border border-accent-green/20 shadow-glow-green mb-4">
            <Activity className="text-accent-green" size={24} />
          </div>
          <h2 className="font-display font-black text-xl tracking-wider">
            {isSignUp ? 'REGISTER ACCOUNT' : 'SECURE SIGN IN'}
          </h2>
          <p className="text-xs text-text-muted font-mono mt-1">
            CARBONSENSE RESEARCH TERMINAL
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-mono flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-text-muted tracking-wide block">
                RESEARCHER ID (USERNAME)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <UserPlus size={16} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. j_doe"
                  className="w-full bg-bg-card border border-bg-card focus:border-accent-green text-text-primary pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all duration-300 font-mono outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-display font-bold text-text-muted tracking-wide block">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@carbonsense.org"
                className="w-full bg-bg-card border border-bg-card focus:border-accent-green text-text-primary pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all duration-300 font-mono outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-display font-bold text-text-muted tracking-wide block">
              SECURITY PASSWORD
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-card border border-bg-card focus:border-accent-green text-text-primary pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all duration-300 font-mono outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-accent-green text-bg-primary font-display font-bold text-sm tracking-wider transition-all duration-300 hover:shadow-glow-green disabled:opacity-50 select-none"
          >
            {isLoading ? 'ESTABLISHING CONNECTION...' : isSignUp ? 'CREATE ACCOUNT' : 'AUTHORIZE SESSION'}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-x-0 h-px bg-bg-card" />
          <span className="relative bg-bg-surface px-4 text-[10px] font-mono text-text-muted tracking-widest">
            OR
          </span>
        </div>

        {/* Google Auth Option */}
        <button
          onClick={triggerGoogleOAuth}
          className="w-full py-3 rounded-lg bg-bg-card border border-bg-card hover:border-text-muted/30 text-text-primary font-display font-semibold text-xs tracking-wider flex items-center justify-center space-x-2 transition-all duration-300 select-none"
        >
          <ShieldCheck size={16} className="text-accent-blue" />
          <span>SIGN IN WITH RESEARCH PROVIDER (GOOGLE)</span>
        </button>

        {/* Switch panel */}
        <div className="mt-8 text-center text-xs">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-text-muted hover:text-accent-green transition-colors font-mono"
          >
            {isSignUp ? 'Already registered? Authorize session here.' : 'Request new credentials/Sign up.'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Auth;
