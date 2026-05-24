import { useState } from 'react';
import { Search, Database, Network, AlertCircle, Zap, Cpu, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import clsx from 'clsx';

export default function LogIntelligence() {
  const { logs } = useApp();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryOutput, setSummaryOutput] = useState<string | null>(null);

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.type !== filter) return false;
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase()) && !log.service.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const triggerAISummary = () => {
    setIsSummarizing(true);
    setSummaryOutput(null);
    setTimeout(() => {
      setIsSummarizing(false);
      setSummaryOutput(
        "Cascade anomaly detected. Root cause: Connection pool saturation on billing DB node. Impacted downstream services: payment-processor and checkout gateway. Recommended action: scale DB read pool replicas."
      );
    }, 1500);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white glow-text flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-400" />
            Smart Log Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time log parsing, vector clustering & error classification</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0A0A0F] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 w-64 font-mono"
            />
          </div>
          <div className="flex bg-[#0A0A0F] border border-white/10 rounded-lg p-0.5">
            {['all', 'error', 'warning', 'info'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-colors cursor-pointer",
                  filter === f ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Terminal Log Viewer */}
        <div className="lg:col-span-3 glass-card overflow-hidden flex flex-col border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="p-3 border-b border-white/5 bg-black/40 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-slate-500 font-mono">errix-log-daemon v2.4</span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-xs p-4 bg-[#05050A] space-y-1.5 selection:bg-purple-500/30">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-600 text-center py-8">No logs matching query.</div>
            ) : (
              filteredLogs.map((log, idx) => (
                <div key={log.id} className="flex items-start gap-4 hover:bg-white/5 py-1 px-2 rounded transition-colors group">
                  {/* Line Number */}
                  <span className="w-8 text-right text-slate-700 select-none font-bold">{(idx + 1).toString().padStart(3, '0')}</span>
                  
                  {/* Log Time */}
                  <span className="text-slate-600 select-none font-bold">{log.time}</span>
                  
                  {/* Severity Badge */}
                  <span className={clsx(
                    "font-extrabold w-16 select-none",
                    log.type === 'error' && 'text-red-500',
                    log.type === 'warning' && 'text-yellow-500',
                    log.type === 'info' && 'text-blue-500'
                  )}>
                    [{log.type.toUpperCase()}]
                  </span>

                  {/* Service */}
                  <span className="text-purple-400 font-semibold w-28 truncate select-none">[{log.service}]</span>

                  {/* Message */}
                  <span className={clsx(
                    "flex-1 break-all",
                    log.type === 'error' && 'text-red-200',
                    log.type === 'warning' && 'text-yellow-100',
                    log.type === 'info' && 'text-slate-300'
                  )}>{log.message}</span>

                  {/* AI Cluster */}
                  <span className="text-slate-600 hidden xl:inline-flex items-center gap-1 text-[10px] group-hover:text-purple-500 transition-colors select-none font-bold">
                    <Network className="w-3 h-3" /> {log.cluster}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Summary Sidebar */}
        <div className="lg:col-span-1 glass-card p-5 space-y-6 overflow-y-auto border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" /> AI Log Summary
              </h3>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={triggerAISummary}
                disabled={isSummarizing}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-[0_0_15px_rgba(123,97,255,0.4)] text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze Anomaly Stream
              </button>

              {isSummarizing && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 animate-pulse">
                  <div className="h-3 bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-700 rounded w-5/6" />
                  <div className="h-3 bg-slate-700 rounded w-2/3" />
                </div>
              )}

              {summaryOutput && (
                <div className="bg-[#7B61FF]/10 border border-[#7B61FF]/20 rounded-xl p-4 text-xs text-slate-300 leading-relaxed font-semibold">
                  {summaryOutput}
                </div>
              )}

              {!isSummarizing && !summaryOutput && (
                <p className="text-xs text-slate-500 leading-relaxed text-center py-4">
                  Click the analysis button to run Errix AI log scanning and compile incident summarization.
                </p>
              )}
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-4">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-widest mb-3">Suspicious Patterns</h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs mb-1">
                  <AlertCircle className="w-4.5 h-4.5" /> Out of Memory Risk
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">Heap allocations approaching physical container maximums on register cluster.</p>
              </div>
              <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs mb-1">
                  <Cpu className="w-4.5 h-4.5" /> Multi-Lock Saturation
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">Sequential select queries creating lock timeouts in transactional DB.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
