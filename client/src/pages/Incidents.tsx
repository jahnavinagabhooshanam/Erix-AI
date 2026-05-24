import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, BrainCircuit, Search, ChevronRight, AlertTriangle, AlertCircle, Sparkles, Cpu, Database, Activity, CheckCircle2, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Incidents() {
  const { incidents, activeIncidentId, setActiveIncidentId, isAnalyzing } = useApp();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Custom Recommended Fix actions simulation states
  const [applyingFixId, setApplyingFixId] = useState<number | null>(null);
  const [successFixId, setSuccessFixId] = useState<number | null>(null);

  // Auto-select the first incident matching filters if none is active
  const filteredIncidents = incidents.filter(incident => {
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    const matchesSearch = incident.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          incident.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  useEffect(() => {
    if (filteredIncidents.length > 0) {
      const isCurrentActiveValid = filteredIncidents.some(inc => inc.id === activeIncidentId);
      if (!isCurrentActiveValid) {
        setActiveIncidentId(filteredIncidents[0].id);
      }
    } else {
      setActiveIncidentId(null);
    }
  }, [incidents, filterSeverity, searchTerm, activeIncidentId, setActiveIncidentId]);

  const selectedIncident = incidents.find(inc => inc.id === activeIncidentId) || filteredIncidents[0];

  const handleApplyFix = (fixId: number) => {
    setApplyingFixId(fixId);
    setTimeout(() => {
      setApplyingFixId(null);
      setSuccessFixId(fixId);
      setTimeout(() => {
        setSuccessFixId(null);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="space-y-6 h-full flex flex-col font-sans text-left">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white glow-text flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          API Incident Control & Diagnostics
        </h1>
        <p className="text-slate-400 text-sm mt-1">Review active API exceptions, parse failure logs, and execute AI recommended patches</p>
      </div>

      {/* Main Workspace: 12-Column Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column (col-span-5): Search, Filters, and Registry List */}
        <div className="lg:col-span-5 glass-card overflow-hidden flex flex-col border border-white/5 shadow-2xl">
          <div className="p-4 border-b border-white/5 bg-black/20 space-y-4">
            {/* Header / Severity Count */}
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-slate-400" /> Operational Registry
              </h3>
              <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                {incidents.filter(i => i.severity === 'critical').length} Critical Alerts
              </span>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-500 absolute left-3" />
              <input 
                type="text" 
                placeholder="Search API, type, or service..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#05050A] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
              />
            </div>

            {/* Severity Tabs */}
            <div className="flex bg-[#05050A] border border-white/10 rounded-lg p-0.5 w-full justify-between">
              {['all', 'critical', 'medium', 'low'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={clsx(
                    "px-3 py-1.5 text-[10px] font-extrabold rounded-md capitalize transition-all cursor-pointer flex-1 text-center",
                    filterSeverity === sev ? "bg-white/10 text-white shadow" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* List Feed */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredIncidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 h-full">
                <AlertCircle className="w-10 h-10 text-slate-600 mb-3" />
                <p className="font-bold text-slate-300 text-xs">No incidents matching filters</p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] text-center">Adjust filter settings or run a synthetic simulation script.</p>
              </div>
            ) : (
              filteredIncidents.map((incident) => {
                const isActive = activeIncidentId === incident.id;
                return (
                  <button
                    key={incident.id}
                    onClick={() => setActiveIncidentId(incident.id)}
                    className={clsx(
                      "w-full text-left p-3.5 rounded-lg cursor-pointer transition-all border flex items-center justify-between group",
                      isActive
                        ? "bg-[#00C2FF]/5 border-[#00C2FF]/30 shadow-[0_0_15px_rgba(0,194,255,0.05)]"
                        : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/5"
                    )}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx(
                          "w-1.5 h-1.5 rounded-full",
                          incident.severity === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                        )} />
                        <span className="text-[9px] font-bold font-mono text-slate-500">{incident.id}</span>
                        <span className="text-[9px] text-slate-600 font-mono">•</span>
                        <span className="text-[9px] text-[#00C2FF] font-black uppercase font-mono">{incident.service}</span>
                      </div>
                      <h4 className={clsx(
                        "font-extrabold text-xs transition-colors",
                        isActive ? "text-[#00C2FF]" : "text-slate-200 group-hover:text-[#00C2FF]"
                      )}>
                        {incident.type}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate bg-black/20 px-2 py-0.5 rounded border border-white/5 w-fit">
                        {incident.endpoint}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (col-span-7): integrated AI Root Cause Analysis */}
        <div className="lg:col-span-7 glass-card overflow-hidden flex flex-col relative border border-white/5 shadow-2xl">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-[#7B61FF]/30 border-t-[#7B61FF] animate-spin" />
                  <BrainCircuit className="w-8 h-8 text-[#7B61FF] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse">
                  AI is analyzing root cause & parsing traces...
                </p>
                <p className="text-[10px] text-slate-500 mt-2 font-mono">Comparing diagnostic vectors against anomaly cluster DB</p>
              </motion.div>
            ) : selectedIncident ? (
              <motion.div
                key="analysis"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto"
              >
                {/* Diagnostics Header */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#00C2FF]/10 to-[#7B61FF]/10 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-80 h-80 bg-[#00C2FF]/5 blur-[100px] rounded-full" />
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={clsx(
                        "px-2.5 py-0.5 text-[9px] font-black rounded-lg border uppercase tracking-wider",
                        selectedIncident.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      )}>
                        {selectedIncident.severity}
                      </span>
                      <span className="text-slate-400 text-xs font-mono font-bold">{selectedIncident.id} · {selectedIncident.service}</span>
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight">{selectedIncident.type}</h2>
                    <p className="text-slate-300 font-mono bg-black/40 inline-block px-3 py-1 rounded border border-white/5 text-xs">
                      {selectedIncident.endpoint}
                    </p>
                  </div>
                </div>

                {/* Analysis Content */}
                <div className="p-6 space-y-6">
                  {/* Performance Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#0A0A0F] border border-[#00C2FF]/20 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#00C2FF]/10 flex items-center justify-center flex-shrink-0">
                        <BrainCircuit className="w-6 h-6 text-[#00C2FF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI Confidence Match</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xl font-black text-[#00C2FF] font-mono">{selectedIncident.confidence}%</span>
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${selectedIncident.confidence}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#0A0A0F] border border-red-500/20 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">System Impact</p>
                        <p className="text-base font-black text-red-400 tracking-tight mt-0.5 uppercase">{selectedIncident.impact} Severity Impact</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Root Cause Explanation */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#7B61FF] animate-pulse" /> 
                      Root Cause Diagnostics
                    </h3>
                    <div className="bg-[#7B61FF]/5 border border-[#7B61FF]/20 rounded-xl p-5 text-xs text-slate-300 leading-relaxed font-semibold">
                      {selectedIncident.rootCause}
                    </div>
                  </div>

                  {/* Probable Causes */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Database className="w-3.5 h-3.5" /> Anomaly Indicators
                    </h3>
                    <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 space-y-3">
                      {selectedIncident.probableCauses?.map((cause, i) => (
                        <div key={i} className="flex items-start gap-3 text-slate-300 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="font-semibold text-slate-300 leading-relaxed">{cause}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Fixes */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" /> Actionable Fixes
                    </h3>
                    <div className="space-y-3">
                      {selectedIncident.recommendedFixes?.map((fix, i) => (
                        <div 
                          key={i} 
                          className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all shadow-md"
                        >
                          <div className="flex-1 pr-4 text-left">
                            <p className="font-extrabold text-[#00C2FF] text-xs mb-0.5">{fix.title}</p>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{fix.desc}</p>
                          </div>
                          
                          <button
                            onClick={() => handleApplyFix(i)}
                            disabled={applyingFixId !== null}
                            className={clsx(
                              "px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase transition-all flex items-center gap-1.5 border cursor-pointer flex-shrink-0",
                              successFixId === i
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : applyingFixId === i
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/30 cursor-not-allowed"
                                : "bg-[#7B61FF]/10 text-[#7B61FF] border-[#7B61FF]/20 hover:bg-[#7B61FF]/20"
                            )}
                          >
                            {successFixId === i ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                              </>
                            ) : applyingFixId === i ? (
                              <>
                                <span className="w-3 h-3 rounded-full border-2 border-t-transparent border-blue-400 animate-spin" />
                                Deploying...
                              </>
                            ) : (
                              <>
                                <Wrench className="w-3.5 h-3.5" /> Deploy Patch
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                  <BrainCircuit className="w-10 h-10 text-slate-600 animate-pulse" />
                </div>
                <p className="text-sm font-bold text-slate-300">Select an operational failure</p>
                <p className="text-xs text-slate-500 text-center max-w-xs mt-2">
                  Select an active incident from the left registry to parse its telemetry logs and load AI-recommended fixes.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
}
