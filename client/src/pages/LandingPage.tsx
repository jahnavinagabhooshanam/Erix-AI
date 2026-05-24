import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Zap, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden selection:bg-blue-500/30 font-sans">
      {/* Background Particles Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-70" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center group">
          <img src="/logo.png" alt="Errix AI" className="h-16 w-auto object-contain brightness-110 transition-transform duration-200 group-hover:scale-105" />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#infrastructure" className="hover:text-white transition-colors">Security</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
            Login
          </Link>
          <button 
            onClick={() => navigate('/get-started')}
            className="glow-button px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-28 pb-20 px-6 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          AI-Powered API Failure Detection & Diagnostics
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight text-white"
        >
          AI-Powered API Failure Detection <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-[#00C2FF] animate-pulse">
            Before Production Breaks
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base md:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed font-medium"
        >
          Detect silent API failures, debug root causes, and resolve incidents instantly with production-ready AI models.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button 
            onClick={() => navigate('/get-started')} 
            className="glow-button px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="px-8 py-3.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-sm uppercase tracking-wider transition-all w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
          >
            Login
          </button>
        </motion.div>

        {/* Floating AI Particles Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-20 w-full relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent z-10" />
          <div className="glass-card p-2 rounded-2xl border-white/10 shadow-[0_0_60px_rgba(0,194,255,0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000" 
              alt="Errix Control Console" 
              className="rounded-xl w-full h-[280px] md:h-[500px] object-cover opacity-60 mix-blend-luminosity"
            />
            
            {/* Real-time Incident Indicator Popups */}
            <div className="absolute top-10 left-10 glass-card p-4 rounded-xl hidden md:flex items-center gap-3 border border-red-500/20 shadow-lg">
               <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                 <Zap className="w-5 h-5 animate-pulse" />
               </div>
               <div className="text-left">
                 <p className="text-[10px] text-slate-500 font-mono">INC-1042 · Billing Service</p>
                 <p className="text-xs font-bold text-white">Payment API Timeout Spike</p>
               </div>
            </div>

            <div className="absolute bottom-20 right-10 glass-card p-4 rounded-xl hidden md:flex items-center gap-3 border border-blue-500/20 shadow-lg">
               <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#00C2FF]">
                 <BrainCircuit className="w-5 h-5 animate-bounce" />
               </div>
               <div className="text-left">
                 <p className="text-[10px] text-slate-500 font-mono">AI Analysis Complete</p>
                 <p className="text-xs font-bold text-white">Missing composite index detected</p>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards Grid Section */}
        <section id="features" className="w-full pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass-card p-6 border border-white/5 hover:border-[#00C2FF]/30 transition-all duration-300 group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#00C2FF] mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">Detect</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              ⚡ Detect silent API failures, downstream memory leaks, and timeout spikes instantly before production collapse.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="glass-card p-6 border border-white/5 hover:border-[#7B61FF]/30 transition-all duration-300 group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-[#7B61FF] mb-4">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">Analyze</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              🧠 Instant AI-compiled root cause explanation with detailed confidence score mapping.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="glass-card p-6 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">Resolve</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              🚀 Smart debugging actions and container scale directives to fix issues.
            </p>
          </motion.div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-10 border-t border-white/5 text-center text-xs text-slate-600 bg-black/40">
        <p>&copy; {new Date().getFullYear()} Errix AI. System Operations Portal. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
