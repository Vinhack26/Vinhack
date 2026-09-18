import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from '../router';
import { Icon, icons } from '../components/common/Icons';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@breachbuddy.org');
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#050d1a] flex items-center justify-center p-4 selection:bg-cyan-400 selection:text-black">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0a1628] border border-[#152a52] rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-400/20 mb-3">
            <Icon d={icons.shield} size={24} className="text-[#050d1a]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Breach<span className="text-cyan-400">Buddy</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Autonomous Breach Triage & Incident Response</p>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="mb-6 p-3 rounded-xl bg-cyan-400/5 border border-cyan-400/20 flex items-center justify-between">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-cyan-400">Demo User:</span> demo@breachbuddy.org
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 transition-all cursor-pointer"
          >
            Auto Fill
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
            <Icon d={icons.alertCircle} size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organization.com"
              required
              className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#050d1a] font-bold text-sm shadow-lg shadow-cyan-400/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#050d1a] border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to BreachBuddy</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-medium">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
