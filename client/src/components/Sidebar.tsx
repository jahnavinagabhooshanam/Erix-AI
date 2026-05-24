import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, FileText, Activity, Zap, Settings, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Incidents', path: '/dashboard/incidents', icon: AlertTriangle },
  { name: 'Logs', path: '/dashboard/logs', icon: FileText },
  { name: 'Simulation', path: '/dashboard/simulation', icon: Zap },
  { name: 'Integrations', path: '/dashboard/integrations', icon: Activity },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useApp();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="w-64 bg-[#0A0A0F] border-r border-white/5 flex flex-col hidden md:flex z-10 h-screen justify-between">
      <div>
        {/* Workspace Switcher */}
        <div className="h-16 flex items-center px-4 border-b border-white/5">
          <Link to="/" className="flex items-center group">
            <img src="/logo.png" alt="Errix AI" className="h-10 w-auto object-contain brightness-110 transition-transform duration-200 group-hover:scale-105" />
          </Link>
        </div>

        {/* Menu Navigation */}
        <nav className="py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.name === 'Dashboard' && location.pathname === '/dashboard/');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 group uppercase tracking-wider',
                  isActive
                    ? 'bg-[#00C2FF]/10 text-[#00C2FF] border border-[#00C2FF]/20 shadow-[0_0_15px_rgba(0,194,255,0.05)]'
                    : 'text-slate-400 border border-transparent hover:bg-white/5 hover:text-slate-200'
                )}
              >
                <Icon className={clsx("w-4.5 h-4.5", isActive ? "text-[#00C2FF] drop-shadow-[0_0_8px_rgba(0,194,255,0.5)]" : "group-hover:text-slate-300")} />
                {item.name}
                {item.name === 'Simulation' && (
                  <span className="ml-auto flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7B61FF]"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Operator Session Details */}
      <div className="p-4 border-t border-white/5 space-y-3 bg-black/20">
        <div className="flex items-center gap-3">
          <img 
            src={user?.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Operator'} 
            alt="Operator Profile" 
            className="w-10 h-10 rounded-full border border-white/20"
          />
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-slate-200 truncate">{user?.displayName || 'Jane Doe'}</p>
            <p className="text-[9px] text-slate-500 font-mono truncate">{user?.email}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full py-2 bg-red-950/10 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
