import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import LogIntelligence from './pages/LogIntelligence';
import Simulation from './pages/Simulation';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { AppProvider, useApp } from './context/AppContext';
import { BrainCircuit } from 'lucide-react';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0A0A0F] text-slate-200 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0A0A0F]">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}

// Protected Route Guard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center text-white">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
          <BrainCircuit className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-xs text-slate-500 font-mono">Verifying operational credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/get-started" element={<SignUp />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="incidents" element={<Incidents />} />
                  <Route path="logs" element={<LogIntelligence />} />
                  <Route path="simulation" element={<Simulation />} />
                  <Route path="integrations" element={<Integrations />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
