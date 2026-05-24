import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useApp } from '../context/AppContext';
import { ArrowUpRight, ArrowDownRight, Activity, Zap } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

// Generate dummy heatmap data: 7 days, 24 hours
const heatmapData = Array.from({ length: 7 }, (_, day) => 
  Array.from({ length: 24 }, (_, hour) => {
    // Generate some mock error densities (0 to 4)
    let val = 0;
    if (Math.random() > 0.85) val = Math.floor(Math.random() * 3) + 1;
    // Inject some fixed spikes
    if ((day === 2 && hour === 10) || (day === 4 && hour === 16) || (day === 6 && hour === 2)) val = 4;
    return val;
  })
);

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Dashboard() {
  const { kpis, latencyData, incidents, integrations, setActiveIncidentId } = useApp();
  const navigate = useNavigate();

  const handleIncidentClick = (id: string) => {
    setActiveIncidentId(id);
    navigate('/dashboard/incidents');
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  if (connectedCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg glass-card p-10 border border-white/5 shadow-2xl space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto text-[#00C2FF] animate-pulse">
            <Activity className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">System Monitoring Offline</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Connect your GitHub repository or configure cloud logs to activate real-time API failure and silent error monitoring.
            </p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/integrations')}
            className="glow-button px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-lg cursor-pointer"
          >
            Connect GitHub
          </button>
        </motion.div>
      </div>
    );
  }

  // Convert latencyData to bar chart format for failures representation
  const failureChartData = latencyData.map(pt => {
    // Determine mock failure rate based on latency
    const rate = pt.latency > 300 ? Math.floor(Math.random() * 15) + 12 : Math.floor(Math.random() * 3) + 1;
    return {
      time: pt.time,
      failures: rate,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white glow-text flex items-center gap-2">
            <Activity className="text-[#00C2FF] w-7 h-7 drop-shadow-[0_0_8px_rgba(0,194,255,0.5)] animate-pulse" />
            Errix Control Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">AI-Powered API Failure Detection & Active Incidents Monitoring</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/dashboard/simulation')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 animate-bounce" />
            Simulate Failure
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="glass-card p-4 relative overflow-hidden group border border-white/5 hover:border-[#00C2FF]/30 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00C2FF]/5 to-[#7B61FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#00C2FF]/5 rounded-full blur-2xl group-hover:bg-[#7B61FF]/10 transition-all duration-500" />
            
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{kpi.label}</p>
            <div className="flex items-end justify-between relative z-10">
              <h3 className="text-2xl font-black text-white tracking-tight font-mono">{kpi.value}</h3>
              <div className={clsx(
                "flex items-center text-xs font-extrabold",
                kpi.trend === 'up' && (kpi.label.includes('Incidents') || kpi.label.includes('Time') ? 'text-red-400' : 'text-green-400'),
                kpi.trend === 'down' && (kpi.label.includes('Incidents') || kpi.label.includes('Time') ? 'text-green-400' : 'text-red-400'),
                kpi.trend === 'neutral' && 'text-slate-400'
              )}>
                {kpi.trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
                {kpi.trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {kpi.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Trend Area Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 border border-white/5 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C2FF] animate-pulse" />
              API Response Time Trend
            </h3>
            <span className="text-xs text-slate-500 font-mono">vs 120ms baseline</span>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00C2FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#00C2FF' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#00C2FF" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Failure Detection Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 border border-white/5 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7B61FF] animate-pulse" />
              Failure Rate Detection
            </h3>
            <span className="text-xs text-slate-500 font-mono">Errors per interval</span>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failureChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#7B61FF' }}
                />
                <Bar dataKey="failures" fill="#7B61FF" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Heatmap & Incidents Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Heatmap Box */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border border-white/5 xl:col-span-2 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="mb-4">
            <h3 className="font-bold text-lg text-slate-200">Incident Density Map</h3>
            <p className="text-xs text-slate-500">Hourly density of detected anomalies over the past week</p>
          </div>
          
          <div className="flex-1 flex flex-col gap-1 overflow-x-auto select-none py-2">
            {heatmapData.map((dayData, dayIdx) => (
              <div key={dayIdx} className="flex gap-1 items-center min-w-[550px]">
                <span className="w-8 text-[10px] font-bold text-slate-500 text-left">{days[dayIdx]}</span>
                <div className="flex gap-1 flex-1">
                  {dayData.map((val, hrIdx) => (
                    <div
                      key={hrIdx}
                      className={clsx(
                        "w-5 h-5 rounded-sm transition-all duration-300 cursor-pointer hover:scale-110 border border-black/30",
                        val === 0 && "bg-[#111827] hover:bg-slate-700",
                        val === 1 && "bg-blue-900/40 hover:bg-blue-800",
                        val === 2 && "bg-[#7B61FF]/40 hover:bg-[#7B61FF]/60",
                        val === 3 && "bg-orange-600/60 hover:bg-orange-500",
                        val === 4 && "bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)] hover:bg-red-500"
                      )}
                      title={`Day ${days[dayIdx]} Hour ${hrIdx}:00 - ${val} errors`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 text-[10px] font-semibold text-slate-500">
            <span>Healthy</span>
            <div className="flex gap-1">
              <div className="w-3.5 h-3.5 bg-[#111827] rounded-sm" />
              <div className="w-3.5 h-3.5 bg-blue-900/40 rounded-sm" />
              <div className="w-3.5 h-3.5 bg-[#7B61FF]/40 rounded-sm" />
              <div className="w-3.5 h-3.5 bg-orange-600/60 rounded-sm" />
              <div className="w-3.5 h-3.5 bg-red-600 rounded-sm" />
            </div>
            <span>Critical</span>
          </div>
        </motion.div>

        {/* Live Incident Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border border-white/5 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.5)] h-[280px]"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-200">Incident Activity Feed</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {incidents.slice(0, 5).map((incident) => (
              <div 
                key={incident.id} 
                onClick={() => handleIncidentClick(incident.id)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-2 h-2 rounded-full",
                    incident.severity === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                  )} />
                  <div>
                    <p className="text-xs font-extrabold text-slate-200 group-hover:text-blue-400 transition-colors font-mono">{incident.id} - {incident.type}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{incident.endpoint}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">{incident.timestamp}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
