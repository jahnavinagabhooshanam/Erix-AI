import { Bell, Search, Plug } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { user, integrations } = useApp();
  
  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  return (
    <header className="h-16 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-10 sticky top-0">
      {/* Search Input */}
      <div className="flex items-center w-80 relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3" />
        <input 
          type="text" 
          placeholder="Search endpoints, errors, logs..." 
          className="w-full bg-[#05050A] border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 font-mono"
        />
      </div>

      {/* Operations Info */}
      <div className="flex items-center gap-4">
        {/* Connected Integrations count */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-300 select-none">
          <Plug className="w-3.5 h-3.5 text-[#00C2FF]" />
          <span>{connectedCount} Active</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-slate-400">System Healthy</span>
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-full hover:bg-white/5 cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* User avatar */}
        <img 
          src={user?.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Operator'} 
          alt="User Profile" 
          className="w-8 h-8 rounded-full border border-white/10 shadow"
        />
      </div>
    </header>
  );
}
