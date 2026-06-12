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

    // Fallback mock logic for testing auth instant simulation
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
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-4 selection:bg-accent-green/30 font-body relative overflow-hidden">
      {/* Subtle grid background overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />

      <div className="w-full max-w-[420px] bg-bg-surface/80 backdrop-blur-md border border-white/[0.06] rounded-sm p-8 relative z-10 shadow-2xl space-y-4">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6 space-y-2">
          <div className="w-14 h-14 rounded-sm bg-bg-card border border-white/[0.08] flex items-center justify-center shadow-inner">
            <Activity className="text-accent-green opacity-80" size={28} />
          </div>
          <h2 className="font-display font-black text-[32px] tracking-wide text-text-primary text-center uppercase leading-tight pt-2">
            {isSignUp ? 'REGISTER_ACCOUNT' : 'Welcome to CarbonSense'}
          </h2>
          {!isSignUp ? (
            <p className="text-[16px] text-text-muted font-body text-center leading-normal">
              Sign in to access your Carbon Intelligence Dashboard.
            </p>
          ) : (
            <p className="text-[12px] text-text-muted/60 font-mono tracking-[0.3em] uppercase font-bold">
              CARBONSENSE_TERMINAL_V1.6
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-sm bg-accent-red/10 border border-accent-red/20 text-accent-red/90 text-[14px] font-mono flex items-center space-x-2 font-bold tracking-tighter uppercase shadow-[inset_0_0_10px_-5px_#FF3366]">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-[14px] font-mono font-black text-text-muted/60 tracking-[0.2em] block uppercase">
                RESEARCHER_ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted/40">
                  <UserPlus size={16} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. researcher_01"
                  className="w-full bg-bg-primary/80 border border-white/[0.06] focus:border-accent-green/60 text-text-primary pl-10 pr-4 py-3 rounded-sm text-[16px] transition-all font-mono outline-none uppercase tracking-tighter placeholder:text-text-muted/30 focus:shadow-[0_0_15px_-5px_rgba(0,255,135,0.2)]"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[14px] font-mono font-black text-text-muted/60 tracking-[0.2em] block uppercase">
              EMAIL_ADDRESS
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted/40">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ID@CARBONSENSE.ORG"
                className="w-full bg-bg-primary/80 border border-white/[0.06] focus:border-accent-green/60 text-text-primary pl-10 pr-4 py-3 rounded-sm text-[16px] transition-all font-mono outline-none uppercase tracking-tighter placeholder:text-text-muted/30 focus:shadow-[0_0_15px_-5px_rgba(0,255,135,0.2)]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-mono font-black text-text-muted/60 tracking-[0.2em] block uppercase">
              SECURITY_KEY
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted/40">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-primary/80 border border-white/[0.06] focus:border-accent-green/60 text-text-primary pl-10 pr-4 py-3 rounded-sm text-[16px] transition-all font-mono outline-none tracking-widest focus:shadow-[0_0_15px_-5px_rgba(0,255,135,0.2)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-sm bg-accent-green text-bg-primary font-mono font-black text-[16px] tracking-[0.25em] transition-all disabled:opacity-40 select-none uppercase cursor-pointer mt-4 shadow-[0_0_15px_-5px_#00FF87] hover:bg-accent-green/90"
          >
            {isLoading ? 'ESTABLISHING_LINK...' : isSignUp ? 'CREATE_ACCOUNT' : '[ Sign In ]'}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex items-center justify-center my-5">
          <div className="absolute inset-x-0 h-px bg-white/[0.03]" />
          <span className="relative bg-bg-surface px-4 text-[12px] font-mono text-text-muted/40 tracking-[0.3em] font-black uppercase">
            OR
          </span>
        </div>

        {/* Google Auth Option */}
        <button
          onClick={triggerGoogleOAuth}
          className="w-full py-2.5 rounded-sm bg-white/[0.02] border border-white/[0.05] hover:border-accent-blue/30 hover:bg-accent-blue/5 text-text-primary/90 font-mono font-bold text-[16px] flex items-center justify-center space-x-2 transition-all select-none uppercase cursor-pointer tracking-[0.2em]"
        >
          <ShieldCheck size={16} className="text-accent-blue/80" />
          <span>SIGN_IN_WITH_OAUTH_2.0</span>
        </button>

        {/* Switch panel */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-text-muted/50 hover:text-accent-green/80 transition-colors font-mono text-[14px] uppercase tracking-tighter font-bold"
          >
            {isSignUp ? '[ ALREADY REGISTERED? CLICK TO AUTHORIZE ]' : '[ REQUEST NEW CREDENTIALS / SIGN UP ]'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Auth;
