import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Save, 
  Sparkles, 
  AlertTriangle, 
  Link2, 
  Users, 
  Globe, 
  Shield, 
  Palette, 
  Zap, 
  Plus, 
  X, 
  Trash2, 
  Check, 
  CheckCircle, 
  Moon, 
  Info,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

interface TeamMember {
  name: string;
  role: string;
  email: string;
}

// Helper to get from localstorage with fallback
const getLocalStorage = (key: string, fallback: any) => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return saved;
    }
  }
  return fallback;
};

export default function Settings() {
  const { integrations, toggleIntegration } = useApp();
  const navigate = useNavigate();

  // 1. AI Detection States
  const [aiSensitivity, setAiSensitivity] = useState(() => getLocalStorage('errix_sett_aiSensitivity', 'medium'));
  const [autoRootCause, setAutoRootCause] = useState(() => getLocalStorage('errix_sett_autoRootCause', true));
  const [incidentPrediction, setIncidentPrediction] = useState(() => getLocalStorage('errix_sett_incidentPrediction', true));
  const [confidenceThreshold, setConfidenceThreshold] = useState(() => getLocalStorage('errix_sett_confidenceThreshold', 85));

  // 2. Alert Thresholds
  const [responseTimeAlert, setResponseTimeAlert] = useState(() => getLocalStorage('errix_sett_responseTimeAlert', '200ms'));
  const [errorRateThreshold, setErrorRateThreshold] = useState(() => getLocalStorage('errix_sett_errorRateThreshold', '5%'));
  const [cpuUsageAlert, setCpuUsageAlert] = useState(() => getLocalStorage('errix_sett_cpuUsageAlert', '80%'));
  const [memoryThreshold, setMemoryThreshold] = useState(() => getLocalStorage('errix_sett_memoryThreshold', '75%'));

  // 4. Notifications
  const [emailAlerts, setEmailAlerts] = useState(() => getLocalStorage('errix_sett_emailAlerts', true));
  const [slackNotifications, setSlackNotifications] = useState(() => getLocalStorage('errix_sett_slackNotifications', true));
  const [criticalOnly, setCriticalOnly] = useState(() => getLocalStorage('errix_sett_criticalOnly', true));
  const [weeklyReports, setWeeklyReports] = useState(() => getLocalStorage('errix_sett_weeklyReports', false));
  const [deploymentFailures, setDeploymentFailures] = useState(() => getLocalStorage('errix_sett_deploymentFailures', true));

  // 5. Team Settings
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => getLocalStorage('errix_sett_teamMembers', [
    { name: 'Jahnavi', role: 'Owner', email: 'jahnavi@errix.ai' },
    { name: 'Member 2', role: 'Developer', email: 'member2@errix.ai' }
  ]));

  // 6. Monitored Endpoints
  const [monitoredEndpoints, setMonitoredEndpoints] = useState<string[]>(() => getLocalStorage('errix_sett_monitoredEndpoints', [
    '/payment/process',
    '/auth/login',
    '/checkout'
  ]));

  // 7. Security Settings
  const [twoFactor, setTwoFactor] = useState(() => getLocalStorage('errix_sett_twoFactor', true));
  const [sessionTimeout, setSessionTimeout] = useState(() => getLocalStorage('errix_sett_sessionTimeout', true));
  const [autoLogout, setAutoLogout] = useState(() => getLocalStorage('errix_sett_autoLogout', '30 mins'));

  // 8. Theme & Personalization
  const [theme] = useState(() => getLocalStorage('errix_sett_theme', 'dark'));
  const [accentColor, setAccentColor] = useState(() => getLocalStorage('errix_sett_accentColor', 'blue'));
  const [workspaceName, setWorkspaceName] = useState(() => getLocalStorage('errix_sett_workspaceName', 'Errix Production'));

  // 9. Auto Remediation (Auto Fixes)
  const [restartFailed, setRestartFailed] = useState(() => getLocalStorage('errix_sett_restartFailed', true));
  const [retryFailed, setRetryFailed] = useState(() => getLocalStorage('errix_sett_retryFailed', true));
  const [clearCache, setClearCache] = useState(() => getLocalStorage('errix_sett_clearCache', true));

  // Modals state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Developer');

  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState('');

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Check if integration is connected from AppContext
  const isConnected = (provider: string) => {
    return integrations.some(i => i.provider === provider && i.status === 'connected');
  };

  // Keep a local backup/mock of connections so if AppContext is empty, it still feels connected
  const [localConnections, setLocalConnections] = useState<Record<string, boolean>>(() => {
    return getLocalStorage('errix_sett_localConnections', { github: true, slack: true, datadog: false });
  });

  const getStatus = (provider: string) => {
    if (integrations.length > 0) {
      return isConnected(provider);
    }
    return localConnections[provider] ?? false;
  };

  const handleIntegToggle = async (provider: string, name: string) => {
    const isNowConnected = getStatus(provider);
    
    // Toggle locally
    const nextConns = { ...localConnections, [provider]: !isNowConnected };
    setLocalConnections(nextConns);
    localStorage.setItem('errix_sett_localConnections', JSON.stringify(nextConns));

    // Toggle globally (in server database if running)
    try {
      if (integrations.length > 0) {
        if (isNowConnected) {
          await toggleIntegration(provider);
        } else {
          let config = {};
          if (provider === 'github') config = { repo: 'errix-core-api' };
          if (provider === 'slack') config = { channel: '#alerts-devops' };
          if (provider === 'datadog') config = { key: 'dd_agent_custom_key' };
          await toggleIntegration(provider, config);
        }
      }
    } catch (e) {
      console.warn("Could not sync integration toggle with database:", e);
    }

    setToastMessage(`${name} status updated`);
    setShowToast(true);
  };

  const handleSave = () => {
    localStorage.setItem('errix_sett_aiSensitivity', JSON.stringify(aiSensitivity));
    localStorage.setItem('errix_sett_autoRootCause', JSON.stringify(autoRootCause));
    localStorage.setItem('errix_sett_incidentPrediction', JSON.stringify(incidentPrediction));
    localStorage.setItem('errix_sett_confidenceThreshold', JSON.stringify(confidenceThreshold));
    localStorage.setItem('errix_sett_responseTimeAlert', JSON.stringify(responseTimeAlert));
    localStorage.setItem('errix_sett_errorRateThreshold', JSON.stringify(errorRateThreshold));
    localStorage.setItem('errix_sett_cpuUsageAlert', JSON.stringify(cpuUsageAlert));
    localStorage.setItem('errix_sett_memoryThreshold', JSON.stringify(memoryThreshold));
    localStorage.setItem('errix_sett_emailAlerts', JSON.stringify(emailAlerts));
    localStorage.setItem('errix_sett_slackNotifications', JSON.stringify(slackNotifications));
    localStorage.setItem('errix_sett_criticalOnly', JSON.stringify(criticalOnly));
    localStorage.setItem('errix_sett_weeklyReports', JSON.stringify(weeklyReports));
    localStorage.setItem('errix_sett_deploymentFailures', JSON.stringify(deploymentFailures));
    localStorage.setItem('errix_sett_teamMembers', JSON.stringify(teamMembers));
    localStorage.setItem('errix_sett_monitoredEndpoints', JSON.stringify(monitoredEndpoints));
    localStorage.setItem('errix_sett_twoFactor', JSON.stringify(twoFactor));
    localStorage.setItem('errix_sett_sessionTimeout', JSON.stringify(sessionTimeout));
    localStorage.setItem('errix_sett_autoLogout', JSON.stringify(autoLogout));
    localStorage.setItem('errix_sett_theme', JSON.stringify(theme));
    localStorage.setItem('errix_sett_accentColor', JSON.stringify(accentColor));
    localStorage.setItem('errix_sett_workspaceName', JSON.stringify(workspaceName));
    localStorage.setItem('errix_sett_restartFailed', JSON.stringify(restartFailed));
    localStorage.setItem('errix_sett_retryFailed', JSON.stringify(retryFailed));
    localStorage.setItem('errix_sett_clearCache', JSON.stringify(clearCache));

    setToastMessage('Configuration Updated');
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleInviteSubmit = () => {
    if (!inviteName || !inviteEmail) return;
    setTeamMembers(prev => [...prev, { name: inviteName, role: inviteRole, email: inviteEmail }]);
    setInviteName('');
    setInviteEmail('');
    setInviteRole('Developer');
    setShowInviteModal(false);
  };

  const handleAddEndpointSubmit = () => {
    if (!newEndpoint || !newEndpoint.startsWith('/')) return;
    if (!monitoredEndpoints.includes(newEndpoint)) {
      setMonitoredEndpoints(prev => [...prev, newEndpoint]);
    }
    setNewEndpoint('');
    setShowEndpointModal(false);
  };

  const handleDeleteEndpoint = (endpoint: string) => {
    setMonitoredEndpoints(prev => prev.filter(e => e !== endpoint));
  };

  const handleDeleteMember = (email: string) => {
    if (email === 'jahnavi@errix.ai') return; // protect owner
    setTeamMembers(prev => prev.filter(m => m.email !== email));
  };

  // Define accent styles based on user selection
  const accText = accentColor === 'blue' ? 'text-[#00C2FF]' : 'text-purple-400';
  const accRange = accentColor === 'blue' ? 'accent-[#00C2FF]' : 'accent-purple-500';
  const accFocus = accentColor === 'blue' ? 'focus:border-[#00C2FF]/50' : 'focus:border-purple-500/50';
  const accBtn = accentColor === 'blue' 
    ? 'from-[#00C2FF] to-blue-600 hover:shadow-[0_0_20px_rgba(0,194,255,0.4)] text-black font-extrabold' 
    : 'from-[#7B61FF] to-pink-600 hover:shadow-[0_0_20px_rgba(123,97,255,0.4)] text-white font-extrabold';
  const accToggle = accentColor === 'blue' ? 'bg-[#00C2FF]' : 'bg-[#7B61FF]';

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans text-left pb-12 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0A0A0F]/90 backdrop-blur-md border border-emerald-500/30 px-5 py-4 rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] flex items-center gap-3 text-xs text-white"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm">{toastMessage}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">System settings written to disk.</p>
            </div>
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3 }}
              className="absolute bottom-0 left-0 h-1 bg-emerald-500 rounded-b-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white glow-text flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-slate-400" />
          System Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configure threshold limits, notification integrations, and cluster parameters</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUMN 1 */}
        <div className="space-y-6">
          
          {/* 1. AI Detection Engine */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border border-white/5 space-y-5 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className={`w-4 h-4 ${accText}`} /> AI Detection Engine
            </h3>

            <div className="space-y-4">
              {/* Sensitivity Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>AI Sensitivity</span>
                  <span className={`${accText} uppercase font-mono`}>{aiSensitivity}</span>
                </div>
                <div className="relative flex items-center pt-1">
                  <span className="text-[10px] text-slate-500 font-mono mr-2">Low</span>
                  <div className="flex-1 relative flex items-center">
                    <input 
                      type="range" 
                      min="1" 
                      max="3" 
                      value={aiSensitivity === 'low' ? 1 : aiSensitivity === 'medium' ? 2 : 3}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setAiSensitivity(val === 1 ? 'low' : val === 2 ? 'medium' : 'high');
                      }}
                      className={`w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer ${accRange}`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono ml-2">High</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">Controls anomaly detection sensitivity.</p>
              </div>

              {/* Auto Root Cause Analysis Toggle */}
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-300">Auto Root Cause Analysis</p>
                  <p className="text-[10px] text-slate-500 leading-normal">Automatically analyze failures using AI.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setAutoRootCause(!autoRootCause)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${autoRootCause ? accToggle : 'bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${autoRootCause ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Incident Prediction Toggle */}
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-300">Incident Prediction</p>
                  <p className="text-[10px] text-slate-500 leading-normal">Predict outages before failures occur.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIncidentPrediction(!incidentPrediction)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${incidentPrediction ? accToggle : 'bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${incidentPrediction ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Confidence Threshold Slider */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>Confidence Threshold</span>
                  <span className={`${accText} font-mono font-bold`}>{confidenceThreshold}% confidence required</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="99" 
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                  className={`w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer ${accRange}`}
                />
                <p className="text-[10px] text-slate-500 leading-normal">Minimum confidence level required to flag anomalies automatically.</p>
              </div>
            </div>
          </motion.div>

          {/* 4. Notification Preferences */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6 border border-white/5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-white/5 pb-3">
              <Bell className={`w-4 h-4 ${accText}`} /> Notification Preferences
            </h3>
            
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group text-xs text-slate-300">
                <input 
                  type="checkbox" 
                  checked={emailAlerts}
                  onChange={() => setEmailAlerts(!emailAlerts)}
                  className={`rounded bg-black/40 border border-white/10 ${accRange} focus:ring-0 cursor-pointer h-4.5 w-4.5`}
                />
                <div className="flex flex-col">
                  <span className="group-hover:text-white transition-colors font-bold">Email Alerts</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">Critical reports digest sent to verified team.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group text-xs text-slate-300">
                <input 
                  type="checkbox" 
                  checked={slackNotifications}
                  onChange={() => setSlackNotifications(!slackNotifications)}
                  className={`rounded bg-black/40 border border-white/10 ${accRange} focus:ring-0 cursor-pointer h-4.5 w-4.5`}
                />
                <div className="flex flex-col">
                  <span className="group-hover:text-white transition-colors font-bold">Slack Notifications</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">Push active alerts in Slack webhook channel.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group text-xs text-slate-300">
                <input 
                  type="checkbox" 
                  checked={criticalOnly}
                  onChange={() => setCriticalOnly(!criticalOnly)}
                  className={`rounded bg-black/40 border border-white/10 ${accRange} focus:ring-0 cursor-pointer h-4.5 w-4.5`}
                />
                <div className="flex flex-col">
                  <span className="group-hover:text-white transition-colors font-bold">Critical Incidents Only</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">Filters out low/medium severity warnings.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group text-xs text-slate-300">
                <input 
                  type="checkbox" 
                  checked={weeklyReports}
                  onChange={() => setWeeklyReports(!weeklyReports)}
                  className={`rounded bg-black/40 border border-white/10 ${accRange} focus:ring-0 cursor-pointer h-4.5 w-4.5`}
                />
                <div className="flex flex-col">
                  <span className="group-hover:text-white transition-colors font-bold">Weekly Health Reports</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">A comprehensive cluster analytics digest.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group text-xs text-slate-300">
                <input 
                  type="checkbox" 
                  checked={deploymentFailures}
                  onChange={() => setDeploymentFailures(!deploymentFailures)}
                  className={`rounded bg-black/40 border border-white/10 ${accRange} focus:ring-0 cursor-pointer h-4.5 w-4.5`}
                />
                <div className="flex flex-col">
                  <span className="group-hover:text-white transition-colors font-bold">Deployment Failure Alerts</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">Direct warning triggers when CI/CD fails.</span>
                </div>
              </label>
            </div>
          </motion.div>

          {/* 6. API Monitoring Configuration */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6 border border-white/5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Globe className={`w-4 h-4 ${accText}`} /> Monitored Endpoints
              </h3>
              <button 
                onClick={() => setShowEndpointModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-black uppercase text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer animate-pulse"
              >
                <Plus className="w-3.5 h-3.5" /> Add Endpoint
              </button>
            </div>

            <div className="space-y-2 pt-1 max-h-[160px] overflow-y-auto pr-1">
              {monitoredEndpoints.map((endpoint, i) => (
                <div key={i} className="flex justify-between items-center bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-xs font-mono">
                  <span className={`${accText} font-bold`}>{endpoint}</span>
                  <button 
                    onClick={() => handleDeleteEndpoint(endpoint)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {monitoredEndpoints.length === 0 && (
                <p className="text-[10px] text-slate-500 italic text-center py-2">No monitored endpoints. Click Add Endpoint to register.</p>
              )}
            </div>
          </motion.div>

          {/* 5. Team & Workspace Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-6 border border-white/5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Users className={`w-4 h-4 ${accText}`} /> Team Members
              </h3>
              <button 
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-black uppercase text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer animate-pulse"
              >
                <Plus className="w-3.5 h-3.5" /> Invite Member
              </button>
            </div>

            <div className="space-y-3 pt-1 max-h-[220px] overflow-y-auto pr-1">
              {teamMembers.map((member, i) => (
                <div key={i} className="flex justify-between items-center bg-black/30 border border-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${member.name}`} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full border border-white/15"
                    />
                    <div>
                      <p className="text-xs font-bold text-white leading-none">{member.name}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-1">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-white/5">
                      {member.role}
                    </span>
                    {member.name !== 'Jahnavi' && (
                      <button 
                        onClick={() => handleDeleteMember(member.email)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* COLUMN 2 */}
        <div className="space-y-6">

          {/* 2. Alert Threshold Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 border border-white/5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-white/5 pb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" /> Incident Thresholds
            </h3>

            <div className="grid grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Response Time</label>
                  <span className="text-[9px] text-slate-500 font-mono">Alert Trigger</span>
                </div>
                <input 
                  type="text" 
                  value={responseTimeAlert}
                  onChange={(e) => setResponseTimeAlert(e.target.value)}
                  className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none ${accFocus}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Error Rate</label>
                  <span className="text-[9px] text-slate-500 font-mono">Threshold</span>
                </div>
                <input 
                  type="text" 
                  value={errorRateThreshold}
                  onChange={(e) => setErrorRateThreshold(e.target.value)}
                  className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none ${accFocus}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">CPU Usage</label>
                  <span className="text-[9px] text-slate-500 font-mono">Limit</span>
                </div>
                <input 
                  type="text" 
                  value={cpuUsageAlert}
                  onChange={(e) => setCpuUsageAlert(e.target.value)}
                  className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none ${accFocus}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Memory Load</label>
                  <span className="text-[9px] text-slate-500 font-mono">Limit</span>
                </div>
                <input 
                  type="text" 
                  value={memoryThreshold}
                  onChange={(e) => setMemoryThreshold(e.target.value)}
                  className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none ${accFocus}`}
                />
              </div>

            </div>
            
            <div className="flex gap-2 items-start mt-2 p-2 bg-amber-500/5 border border-amber-500/10 rounded text-[9px] text-amber-500/80 leading-relaxed font-mono">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>Threshold violations automatically log issues to incident pipelines and page engineers.</span>
            </div>
          </motion.div>

          {/* 3. Connected Services / Integrations */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 border border-white/5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Link2 className={`w-4 h-4 ${accText}`} /> Connected Services
              </h3>
              <button 
                onClick={() => navigate('/dashboard/integrations')}
                className="text-[10px] font-black uppercase text-[#00C2FF] hover:underline cursor-pointer"
              >
                Integrations Hub →
              </button>
            </div>

            <div className="space-y-4 pt-1">
              
              {/* GitHub */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatus('github') ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <p className="text-xs font-bold text-slate-300">GitHub Service</p>
                  </div>
                  {getStatus('github') && (
                    <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Connected Account: <span className="font-mono text-[#00C2FF]">jahnavi-dev</span></p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleIntegToggle('github', 'GitHub')}
                    className={`px-2.5 py-1.5 border text-[10px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                      getStatus('github')
                        ? 'bg-red-950/10 border-red-500/20 hover:bg-red-500/15 text-red-400 font-extrabold'
                        : 'bg-emerald-950/10 border-emerald-500/20 hover:bg-emerald-500/15 text-emerald-400 font-extrabold'
                    }`}
                  >
                    {getStatus('github') ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>

              {/* Slack */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <div>
                  <div className="flex items-center gap-2 pt-2">
                    <span className={`w-2 h-2 rounded-full ${getStatus('slack') ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <p className="text-xs font-bold text-slate-300">Slack Webhooks</p>
                  </div>
                  {getStatus('slack') && (
                    <p className="text-[10px] text-slate-500 leading-normal mt-0.5 font-mono">Stream: #alerts-devops</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleIntegToggle('slack', 'Slack')}
                    className={`px-2.5 py-1.5 border text-[10px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                      getStatus('slack')
                        ? 'bg-red-950/10 border-red-500/20 hover:bg-red-500/15 text-red-400 font-extrabold'
                        : 'bg-emerald-950/10 border-emerald-500/20 hover:bg-emerald-500/15 text-emerald-400 font-extrabold'
                    }`}
                  >
                    {getStatus('slack') ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>

              {/* Datadog */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <div>
                  <div className="flex items-center gap-2 pt-2">
                    <span className={`w-2 h-2 rounded-full ${getStatus('datadog') ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`} />
                    <p className="text-xs font-bold text-slate-300">Datadog Agent</p>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5 font-mono">
                    {getStatus('datadog') ? 'Agent Connected' : 'Datadog Pending'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleIntegToggle('datadog', 'Datadog')}
                    className={`px-2.5 py-1.5 border text-[10px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                      getStatus('datadog')
                        ? 'bg-red-950/10 border-red-500/20 hover:bg-red-500/15 text-red-400 font-extrabold'
                        : 'bg-yellow-950/10 border-yellow-500/20 hover:bg-yellow-500/15 text-yellow-400 font-extrabold'
                    }`}
                  >
                    {getStatus('datadog') ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>

          {/* 7. Security Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 border border-white/5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-white/5 pb-3">
              <Shield className={`w-4 h-4 ${accText}`} /> Security Settings
            </h3>

            <div className="space-y-4 pt-1">
              
              <label className="flex items-center gap-3 cursor-pointer group text-xs text-slate-300">
                <input 
                  type="checkbox" 
                  checked={twoFactor}
                  onChange={() => setTwoFactor(!twoFactor)}
                  className={`rounded bg-black/40 border border-white/10 ${accRange} focus:ring-0 cursor-pointer h-4.5 w-4.5`}
                />
                <div className="flex flex-col">
                  <span className="group-hover:text-white transition-colors font-bold">Two-Factor Authentication</span>
                  <span className="text-[9px] text-slate-500 leading-normal mt-0.5">Secure API credentials and auth tokens using standard MFA keys.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group text-xs text-slate-300">
                <input 
                  type="checkbox" 
                  checked={sessionTimeout}
                  onChange={() => setSessionTimeout(!sessionTimeout)}
                  className={`rounded bg-black/40 border border-white/10 ${accRange} focus:ring-0 cursor-pointer h-4.5 w-4.5`}
                />
                <div className="flex flex-col">
                  <span className="group-hover:text-white transition-colors font-bold">Session Timeout</span>
                  <span className="text-[9px] text-slate-500 leading-normal mt-0.5">Enforce automated developer dashboard sign-out when idle.</span>
                </div>
              </label>

              {sessionTimeout && (
                <div className="space-y-1.5 pl-7 border-l border-white/5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Auto Logout Period</label>
                  <select 
                    value={autoLogout}
                    onChange={(e) => setAutoLogout(e.target.value)}
                    className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none ${accFocus}`}
                  >
                    <option value="15 mins">Auto logout: 15 mins</option>
                    <option value="30 mins">Auto logout: 30 mins</option>
                    <option value="1 hour">Auto logout: 1 hour</option>
                    <option value="4 hours">Auto logout: 4 hours</option>
                  </select>
                </div>
              )}

            </div>
          </motion.div>

          {/* 8. Appearance Theme & Personalization */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 border border-white/5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-white/5 pb-3">
              <Palette className={`w-4 h-4 ${accText}`} /> Appearance
            </h3>

            <div className="space-y-4 pt-1">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Theme Profile</label>
                <div className="flex justify-between items-center bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-blue-400" /> Dark Mode (Active)
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">System Default</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Accent Highlights</label>
                <div className="flex gap-4 pt-1">
                  
                  {/* Blue Swatch */}
                  <button 
                    onClick={() => setAccentColor('blue')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      accentColor === 'blue'
                        ? 'bg-blue-500/10 border-[#00C2FF] text-white shadow-[0_0_10px_rgba(0,194,255,0.2)]'
                        : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-[#00C2FF] flex items-center justify-center">
                      {accentColor === 'blue' && <Check className="w-2.5 h-2.5 text-black" />}
                    </span>
                    Blue Accent
                  </button>

                  {/* Purple Swatch */}
                  <button 
                    onClick={() => setAccentColor('purple')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      accentColor === 'purple'
                        ? 'bg-purple-500/10 border-purple-500 text-white shadow-[0_0_10px_rgba(123,97,255,0.2)]'
                        : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-[#7B61FF] flex items-center justify-center">
                      {accentColor === 'purple' && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    Purple Accent
                  </button>

                </div>
              </div>

              <div className="space-y-1.5 border-t border-white/5 pt-3">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Workspace Node Name</label>
                <input 
                  type="text" 
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none ${accFocus}`}
                />
              </div>

            </div>
          </motion.div>

        </div>

        {/* 9. Auto Remediation Settings (Auto Fixes) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-6 border border-white/5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)] lg:col-span-2 relative overflow-hidden"
        >
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-white/5 pb-3">
            <Zap className="w-4 h-4 text-purple-400 animate-bounce" /> Auto Remediation (Auto Fixes)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-300 bg-black/20 p-3 rounded-xl border border-white/5 hover:border-purple-500/20 transition-all">
              <input 
                type="checkbox" 
                checked={restartFailed}
                onChange={() => setRestartFailed(!restartFailed)}
                className={`rounded bg-black/40 border border-white/10 ${accRange} focus:ring-0 cursor-pointer h-4.5 w-4.5 mt-0.5`}
              />
              <div className="flex flex-col">
                <span className="group-hover:text-white transition-colors font-bold">Restart Failed Service Automatically</span>
                <span className="text-[10px] text-slate-500 leading-relaxed mt-1">Automatically power-cycle host instances or Docker pods on failure.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-300 bg-black/20 p-3 rounded-xl border border-white/5 hover:border-purple-500/20 transition-all">
              <input 
                type="checkbox" 
                checked={retryFailed}
                onChange={() => setRetryFailed(!retryFailed)}
                className={`rounded bg-black/40 border border-white/10 ${accRange} focus:ring-0 cursor-pointer h-4.5 w-4.5 mt-0.5`}
              />
              <div className="flex flex-col">
                <span className="group-hover:text-white transition-colors font-bold">Retry Failed Requests</span>
                <span className="text-[10px] text-slate-500 leading-relaxed mt-1">Implement exponential backoff retries for client API bottlenecks.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-300 bg-black/20 p-3 rounded-xl border border-white/5 hover:border-purple-500/20 transition-all">
              <input 
                type="checkbox" 
                checked={clearCache}
                onChange={() => setClearCache(!clearCache)}
                className={`rounded bg-black/40 border border-white/10 ${accRange} focus:ring-0 cursor-pointer h-4.5 w-4.5 mt-0.5`}
              />
              <div className="flex flex-col">
                <span className="group-hover:text-white transition-colors font-bold">Clear Cache During Overload</span>
                <span className="text-[10px] text-slate-500 leading-relaxed mt-1">Purge Redis caches and free heap buffers when memory exceeds threshold limits.</span>
              </div>
            </label>

          </div>
        </motion.div>

      </div>

      {/* Save Configuration Button */}
      <div className="pt-4">
        <button 
          onClick={handleSave}
          className={`glow-button w-full py-3.5 bg-gradient-to-r ${accBtn} text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg`}
        >
          <Save className="w-4.5 h-4.5" />
          Save Configuration
        </button>
      </div>

      {/* Invite Team Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-card p-6 w-full max-w-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <UserPlus className={`w-4 h-4 ${accText}`} /> Invite Team Member
                </h3>
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Alex Rivera"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none ${accFocus} font-medium`}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="alex@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none ${accFocus} font-mono`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</label>
                  <select 
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none ${accFocus} font-medium`}
                  >
                    <option value="Developer">Developer</option>
                    <option value="Architect">Architect</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Security Admin">Security Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleInviteSubmit}
                  disabled={!inviteName || !inviteEmail}
                  className={`flex-1 py-2 bg-gradient-to-r ${accBtn} rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50`}
                >
                  Send Invite
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Endpoint Modal */}
      <AnimatePresence>
        {showEndpointModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEndpointModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-card p-6 w-full max-w-sm border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Globe className={`w-4 h-4 ${accText}`} /> Add Endpoint
                </h3>
                <button 
                  onClick={() => setShowEndpointModal(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endpoint Path</label>
                <input 
                  type="text" 
                  placeholder="e.g. /api/v1/health"
                  value={newEndpoint}
                  onChange={(e) => setNewEndpoint(e.target.value)}
                  className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none ${accFocus} font-mono`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddEndpointSubmit();
                  }}
                />
                <p className="text-[9px] text-slate-500 font-mono mt-1">Paths must start with a forward slash (/).</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowEndpointModal(false)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddEndpointSubmit}
                  disabled={!newEndpoint || !newEndpoint.startsWith('/')}
                  className={`flex-1 py-2 bg-gradient-to-r ${accBtn} rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50`}
                >
                  Add Endpoint
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
