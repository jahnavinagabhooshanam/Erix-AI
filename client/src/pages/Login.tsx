import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '../config/firebase';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all fields.');
    }
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate user.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google OAuth failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Backdrops */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-8 border border-white/5 relative z-10 shadow-[0_4px_40px_rgba(0,0,0,0.6)]"
      >
        {/* Branding Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center group mb-2">
            <img src="/logo.png" alt="Errix AI" className="h-20 w-auto object-contain brightness-110 transition-transform duration-200 group-hover:scale-105" />
          </Link>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-black flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00C2FF]" /> Secure Vault Login
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-lg mb-6 leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4.5 h-4.5 text-slate-500 absolute left-3" />
              <input
                type="email"
                placeholder="developer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#05050A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
              <button type="button" className="text-[10px] font-bold text-[#00C2FF] hover:underline uppercase">Forgot Password?</button>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4.5 h-4.5 text-slate-500 absolute left-3" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#05050A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glow-button py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
            ) : (
              <>
                Access System <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-white/5 w-full absolute" />
          <span className="bg-[#0F1117] px-3 text-[10px] font-extrabold text-slate-500 uppercase z-10">Or connect with</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-.1 3.2-2.6 4.7l3.1 2.4c1.8-1.7 2.9-4.1 2.9-6.63z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.1-2.4c-.86.58-1.97.92-3.1.92-2.39 0-4.41-1.61-5.14-3.78l-3.2 2.4C4.3 21.6 7.84 24 12 24z" />
            <path fill="#FBBC05" d="M6.86 15.83c-.18-.58-.29-1.2-.29-1.83s.11-1.25.29-1.83l-3.2-2.4c-.64 1.27-1 2.7-1 4.23s.36 2.96 1 4.23l3.2-2.4z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.84 0 4.3 2.4 2.66 5.92l3.2 2.4c.73-2.17 2.75-3.78 5.14-3.78z" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-xs text-slate-500 mt-8">
          Don't have an operator key?{' '}
          <Link to="/get-started" className="text-purple-400 font-bold hover:underline">
            Request Access
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
