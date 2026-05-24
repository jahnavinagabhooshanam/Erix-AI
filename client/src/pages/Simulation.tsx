import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Zap, Shield, HardDrive, ServerCrash, Clock, ShieldAlert, Sparkles, RefreshCw, CheckCircle2, Terminal } from 'lucide-react';
import clsx from 'clsx';

const scenarios = [
  { 
    id: 'timeout', 
    title: 'API Timeout Spike', 
    desc: 'Simulate downstream latency issues causing HTTP timeouts (504 Errors).', 
    icon: Clock, 
    color: 'text-orange-400', 
    bg: 'bg-orange-500/10', 
    border: 'border-orange-500/20',
    target: 'Order API (/v1/orders/create)'
  },
  { 
    id: 'crash', 
    title: 'Identity Server Crash', 
    desc: 'Simulate memory leak / crash leading to complete node crash (OOM).', 
    icon: ServerCrash, 
    color: 'text-red-400', 
    bg: 'bg-red-500/10', 
    border: 'border-red-500/20',
    target: 'Identity Service (/v1/users/register)'
  },
  { 
    id: 'db', 
    title: 'Database Slowdown', 
    desc: 'Inject query execution lock or missing composite index queries.', 
    icon: HardDrive, 
    color: 'text-yellow-400', 
    bg: 'bg-yellow-500/10', 
    border: 'border-yellow-500/20',
    target: 'Reporting DB (/v1/analytics/dashboard)'
  },
  { 
    id: 'auth', 
    title: 'Vault Cryptographic Drift', 
    desc: 'Simulate security key mismatch across session caches.', 
    icon: Shield, 
    color: 'text-[#7B61FF]', 
    bg: 'bg-[#7B61FF]/10', 
    border: 'border-[#7B61FF]/20',
    target: 'Auth Service (/v1/auth/session-refresh)'
  },
  { 
    id: 'rate', 
    title: 'Rate Limit Exhaustion', 
    desc: 'Simulate high volume bots exhausting tokens leading to 429 errors.', 
    icon: ShieldAlert, 
    color: 'text-rose-400', 
    bg: 'bg-rose-500/10', 
    border: 'border-rose-500/20',
    target: 'Discount API (/v1/checkout/apply-coupon)'
  },
];

export default function Simulation() {
  const { simulateFailure, clearSimulation, isAnalyzing } = useApp();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [simError, setSimError] = useState<string | null>(null);

  const handleSimulate = async (id: string) => {
    setActiveScenario(id);
    setLastResult(null);
    setSimError(null);
    try {
      const result = await simulateFailure(id);
      if (result) {
        setLastResult(result);
      }
    } catch (e: any) {
      console.error('Failure simulation failed:', e);
      setSimError(e?.message || 'Simulation failed. Please try again.');
      setTimeout(() => setSimError(null), 5000);
    }
  };

  const handleClear = async () => {
    await clearSimulation();
    setLastResult(null);
    setActiveScenario(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="text-left space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white glow-text flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#7B61FF] animate-pulse" />
            Chaos Simulation Mode
          </h1>
          <p className="text-slate-400 text-sm">
            Inject synthetic failures into the live API environment to demonstrate Errix AI real-time analysis pipeline.
          </p>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Environment
        </button>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {simError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3 flex items-center gap-3 text-xs text-red-400"
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span className="font-bold">{simError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          const isThisActive = activeScenario === scenario.id;
          
          return (
            <motion.div
              key={scenario.id}
              whileHover={!isAnalyzing ? { scale: 1.01, y: -2 } : {}}
              className={clsx(
                "glass-card p-6 border transition-all relative overflow-hidden flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)]",
                isThisActive ? scenario.border : "border-white/5 hover:border-white/15",
                isThisActive && "shadow-[0_0_35px_rgba(123,97,255,0.15)]"
              )}
            >
              {/* Simulation Processing Mask */}
              <AnimatePresence>
                {isThisActive && isAnalyzing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex flex-col items-center justify-center p-4 text-center"
                  >
                    <div className="relative mb-4">
                      <div className="w-12 h-12 rounded-full border-4 border-[#7B61FF]/30 border-t-[#7B61FF] animate-spin" />
                      <Sparkles className="w-5 h-5 text-[#7B61FF] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                    </div>
                    <p className="text-sm font-bold text-white tracking-tight">Injecting synthetic failure into cluster...</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-1">Targeting {scenario.target}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", scenario.bg)}>
                    <Icon className={clsx("w-5 h-5", scenario.color)} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base tracking-tight">{scenario.title}</h3>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">{scenario.target}</span>
                  </div>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed">{scenario.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <button 
                  onClick={() => handleSimulate(scenario.id)}
                  disabled={isAnalyzing}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-red-950/20 to-purple-950/20 hover:from-[#7B61FF]/10 hover:to-[#00C2FF]/10 border border-white/10 hover:border-[#7B61FF]/40 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  Simulate Failure
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Last Simulated Result — Modal Overlay Card */}
      <AnimatePresence>
        {lastResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setLastResult(null); setActiveScenario(null); }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-card p-6 border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.9)] space-y-6 relative z-10 w-full max-w-4xl max-h-[85vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => { setLastResult(null); setActiveScenario(null); }}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer z-20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 pr-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Injected Incident Details
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-mono font-bold">{lastResult.incident?.id}</span>
              </div>

              {/* Content layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-5 space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type / Endpoint</label>
                    <p className="text-white font-extrabold text-base tracking-tight">{lastResult.incident?.type}</p>
                    <p className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded inline-block mt-1">
                      {lastResult.incident?.endpoint}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity</label>
                      <p className={`text-xs font-black uppercase ${
                        lastResult.incident?.severity === 'critical' ? 'text-red-400' :
                        lastResult.incident?.severity === 'medium' ? 'text-amber-400' : 'text-blue-400'
                      }`}>{lastResult.incident?.severity}</p>
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Impact</label>
                      <p className={`text-xs font-black uppercase ${
                        lastResult.incident?.impact === 'High' ? 'text-orange-400' :
                        lastResult.incident?.impact === 'Medium' ? 'text-yellow-400' : 'text-sky-400'
                      }`}>{lastResult.incident?.impact} Impact</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Confidence</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-[#00C2FF] rounded-full transition-all duration-700"
                          style={{ width: `${lastResult.incident?.confidence || 0}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-400">{lastResult.incident?.confidence}%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Root Cause Diagnosis</label>
                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                      {lastResult.incident?.rootCause}
                    </p>
                  </div>

                  {lastResult.incident?.probableCauses && lastResult.incident.probableCauses.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Probable Causes</label>
                      <ul className="space-y-1">
                        {lastResult.incident.probableCauses.map((cause: string, i: number) => (
                          <li key={i} className="text-[11px] text-slate-400 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">▸</span>
                            {cause}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lastResult.incident?.recommendedFixes && lastResult.incident.recommendedFixes.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Recommended Fixes</label>
                      {lastResult.incident.recommendedFixes.map((fix: any, i: number) => (
                        <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5">
                          <p className="text-[11px] font-bold text-emerald-400">{fix.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{fix.desc}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Terminal Logs */}
                <div className="lg:col-span-7 flex flex-col glass-card border border-white/5 overflow-hidden min-h-[260px]">
                  <div className="p-3.5 border-b border-white/5 bg-black/40 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[10px] text-slate-400 font-mono font-bold">Scenario Stream Output</span>
                    </div>
                    <span className="text-[9px] text-slate-600 font-mono">{lastResult.logs?.length} log entries</span>
                  </div>

                  <div className="flex-1 bg-[#05050A] p-4 font-mono text-[11px] overflow-y-auto space-y-2 text-left">
                    {lastResult.logs?.map((log: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 hover:bg-white/5 py-0.5 px-1 rounded transition-all">
                        <span className="text-slate-600 font-bold w-4 text-right">{(idx + 1).toString().padStart(2, '0')}</span>
                        <span className="text-slate-500">{log.time}</span>
                        <span className={`font-black ${
                          log.type === 'error' ? 'text-red-400' : 
                          log.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                        }`}>[{log.type.toUpperCase()}]</span>
                        <span className="text-purple-400 font-bold truncate max-w-[100px]">[{log.service}]</span>
                        <span className="text-slate-300 flex-1 break-all">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
