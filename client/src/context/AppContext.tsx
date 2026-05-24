import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { auth, onAuthStateChanged, signOut as fbSignOut } from '../config/firebase';

export interface KPI {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface LatencyPoint {
  time: string;
  latency: number;
  baseline: number;
}

export interface Incident {
  id: string;
  endpoint: string;
  severity: 'critical' | 'medium' | 'low';
  timestamp: string;
  type: string;
  service: string;
  impact: 'High' | 'Medium' | 'Low';
  rootCause?: string;
  confidence?: number;
  probableCauses?: string[];
  recommendedFixes?: { title: string; desc: string }[];
}

export interface LogEntry {
  id: number | string;
  type: 'error' | 'warning' | 'info';
  service: string;
  message: string;
  time: string;
  cluster: string;
}

export interface Integration {
  provider: string;
  status: 'connected' | 'disconnected';
  config?: any;
}

interface AppContextType {
  kpis: KPI[];
  latencyData: LatencyPoint[];
  incidents: Incident[];
  logs: LogEntry[];
  integrations: Integration[];
  user: any;
  loading: boolean;
  isAnalyzing: boolean;
  activeIncidentId: string | null;
  setActiveIncidentId: (id: string | null) => void;
  simulateFailure: (scenarioId: string) => Promise<void>;
  clearSimulation: () => void;
  toggleIntegration: (provider: string, config?: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = '/api';

const initialLatency: LatencyPoint[] = [
  { time: '00:00', latency: 120, baseline: 115 },
  { time: '04:00', latency: 118, baseline: 115 },
  { time: '08:00', latency: 145, baseline: 120 },
  { time: '12:00', latency: 123, baseline: 125 },
  { time: '16:00', latency: 130, baseline: 120 },
  { time: '20:00', latency: 125, baseline: 115 },
  { time: '24:00', latency: 122, baseline: 115 },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [latencyData, setLatencyData] = useState<LatencyPoint[]>(initialLatency);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        // Sync user in database with actual signup name and company
        const tempDetails = localStorage.getItem('errix_temp_signup_details');
        let name = firebaseUser.displayName || firebaseUser.email.split('@')[0];
        let company = firebaseUser.company || 'Errix Workspace';
        
        if (tempDetails) {
          try {
            const parsed = JSON.parse(tempDetails);
            if (parsed.name) name = parsed.name;
            if (parsed.company) company = parsed.company;
            localStorage.removeItem('errix_temp_signup_details');
            
            // Also update the local state to show correct details instantly
            firebaseUser.displayName = name;
            firebaseUser.company = company;
          } catch (e) {}
        }
        
        setUser({ ...firebaseUser, displayName: name, company });
        
        try {
          await fetch(`${API_BASE}/auth/sync-user`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('errix_auth_token')}`
            },
            body: JSON.stringify({
              name,
              email: firebaseUser.email,
              firebaseUid: firebaseUser.uid,
              company
            })
          });
        } catch (e) {
          console.error('Failed to sync user context with server:', e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync data from Express API
  const fetchData = async () => {
    const token = localStorage.getItem('errix_auth_token');
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const [incRes, logRes, kpiRes, integRes] = await Promise.all([
        fetch(`${API_BASE}/incidents`, { headers }),
        fetch(`${API_BASE}/logs`, { headers }),
        fetch(`${API_BASE}/kpis`, { headers }),
        fetch(`${API_BASE}/integrations`, { headers })
      ]);

      if (!incRes.ok || !logRes.ok || !kpiRes.ok || !integRes.ok) {
        throw new Error('Synchronization endpoint returned non-200 response.');
      }

      const [dbInc, dbLogs, dbKpis, dbIntegrations] = await Promise.all([
        incRes.json(),
        logRes.json(),
        kpiRes.json(),
        integRes.json()
      ]);

      setIncidents(dbInc);
      setLogs(dbLogs);
      setKpis(dbKpis);
      setIntegrations(dbIntegrations);
    } catch (e) {
      console.error('REST API synchronization failed, using fallback data:', e);
    }
  };

  // Setup WebSockets & Initial API fetch when user logs in
  useEffect(() => {
    if (!user) {
      return;
    }

    fetchData();

    // Connect socket
    const s = io('http://localhost:5000');

    s.on('connect', () => {
      console.log('Successfully bound Socket.IO client stream.');
    });

    s.on('chaos_incident', (data) => {
      setIncidents(prev => [data.incident, ...prev]);
      setLogs(prev => [...data.logs, ...prev]);
      setKpis(data.kpis);
      setLatencyData(prev => {
        const nextTime = new Date();
        const timeStr = `${nextTime.getHours().toString().padStart(2, '0')}:${nextTime.getMinutes().toString().padStart(2, '0')}`;
        const newPoint = { time: timeStr, latency: data.latencySpikeValue, baseline: 120 };
        return [...prev.slice(1), newPoint];
      });
      setActiveIncidentId(data.incident.id);
    });

    s.on('new_log', (log) => {
      setLogs(prev => [log, ...prev]);
    });

    s.on('chaos_clear', () => {
      fetchData();
      setLatencyData(initialLatency);
      setActiveIncidentId(null);
    });

    return () => {
      s.disconnect();
    };
  }, [user]);

  const simulateFailure = async (scenarioId: string) => {
    setIsAnalyzing(true);
    const token = localStorage.getItem('errix_auth_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ scenarioId }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failure simulation failed.');
      }
      return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using client-side simulation fallback.');
      // Client-side fallback — generates realistic mock data
      await new Promise(r => setTimeout(r, 1800));
      const logTime = new Date().toLocaleTimeString([], { hour12: false });
      const incId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const scenarioMap: Record<string, any> = {
        timeout: {
          incident: {
            id: incId, endpoint: '/v1/orders/create', severity: 'critical', timestamp: 'Just now',
            type: 'Timeout Spike', service: 'Order Processing', impact: 'High',
            rootCause: 'Downstream HTTP client timeout waiting for Inventory validation service.',
            confidence: 94,
            probableCauses: ['Inventory service container replica failed', 'Connection pool exhaustion in HTTP client middleware'],
            recommendedFixes: [
              { title: 'Add Circuit Breaker', desc: 'Deploy circuit breaker on inventory client.' },
              { title: 'Scale Inventory Service', desc: 'Increase replica count of inventory pods.' }
            ]
          },
          logs: [
            { type: 'error', service: 'Order API', message: 'POST /v1/orders/create → 504 Gateway Timeout', time: logTime, cluster: 'Client Timeout Cluster' },
            { type: 'warning', service: 'Inventory Service', message: 'Read timeouts detected on pod inv-replica-03', time: logTime, cluster: 'Service Interruption' },
            { type: 'info', service: 'Load Balancer', message: 'Upstream connection timeout after 30000ms', time: logTime, cluster: 'Client Timeout Cluster' },
            { type: 'error', service: 'Order API', message: 'Circuit breaker OPEN — fallback triggered for inventory check', time: logTime, cluster: 'Resilience Layer' },
            { type: 'warning', service: 'Kubernetes', message: 'Pod inv-replica-03 restarted (CrashLoopBackOff)', time: logTime, cluster: 'Orchestration' }
          ],
          latencySpikeValue: 680
        },
        crash: {
          incident: {
            id: incId, endpoint: '/v1/users/register', severity: 'critical', timestamp: 'Just now',
            type: 'Server Crash', service: 'Identity Service', impact: 'High',
            rootCause: 'Node.js out-of-memory crash due to large JSON payload parsing recursion.',
            confidence: 98,
            probableCauses: ['Heap limit reached (512MB) on register worker node 4', 'Uncaught exception in error handling middleware'],
            recommendedFixes: [{ title: 'Upgrade Memory Limit', desc: 'Increase Kubernetes memory limit allocation.' }]
          },
          logs: [
            { type: 'error', service: 'Identity Service', message: 'FATAL ERROR: JavaScript heap out of memory', time: logTime, cluster: 'Heap Dump Event' },
            { type: 'warning', service: 'Kubernetes Pod', message: 'Pod identity-register crashed with status OOMKilled', time: logTime, cluster: 'Resource Saturation' },
            { type: 'error', service: 'Identity Service', message: 'Process exited with code 137 (SIGKILL)', time: logTime, cluster: 'Heap Dump Event' },
            { type: 'info', service: 'Kubernetes', message: 'Scheduling replacement pod on node worker-05', time: logTime, cluster: 'Orchestration' },
            { type: 'warning', service: 'Health Check', message: 'Liveness probe failed: connection refused on port 3000', time: logTime, cluster: 'Resource Saturation' }
          ],
          latencySpikeValue: 920
        },
        db: {
          incident: {
            id: incId, endpoint: '/v1/analytics/dashboard', severity: 'medium', timestamp: 'Just now',
            type: 'Database Slowdown', service: 'Reporting Service', impact: 'Medium',
            rootCause: 'Sequential scanning on transactions table due to missing composite index.',
            confidence: 89,
            probableCauses: ['Missing index on user_id + timestamp column', 'Analytical queries executed on primary database node'],
            recommendedFixes: [{ title: 'Create Composite Index', desc: 'Run CREATE INDEX idx_trans_user_time.' }]
          },
          logs: [
            { type: 'warning', service: 'Database', message: 'Slow Query Detected: SELECT SUM(amount) FROM transactions (3450ms)', time: logTime, cluster: 'Slow Query Pattern' },
            { type: 'info', service: 'Database', message: 'Query planner chose Seq Scan over Index Scan', time: logTime, cluster: 'Slow Query Pattern' },
            { type: 'warning', service: 'Connection Pool', message: 'Active connections: 48/50 — pool nearly exhausted', time: logTime, cluster: 'Resource Saturation' },
            { type: 'error', service: 'Reporting API', message: 'GET /v1/analytics/dashboard → 503 Service Unavailable', time: logTime, cluster: 'Slow Query Pattern' }
          ],
          latencySpikeValue: 280
        },
        auth: {
          incident: {
            id: incId, endpoint: '/v1/auth/session-refresh', severity: 'medium', timestamp: 'Just now',
            type: 'Authentication Failure', service: 'Auth Token API', impact: 'Medium',
            rootCause: 'Cryptographic key rotation synchronization mismatch.',
            confidence: 91,
            probableCauses: ['Auth instance 01 failed to load latest RSA public key', 'Clock drift on secondary vault instances'],
            recommendedFixes: [{ title: 'Sync Cryptographic Keys', desc: 'Force reload JWKS secrets cache.' }]
          },
          logs: [
            { type: 'error', service: 'Auth API', message: 'JWT Signature Verification failed — invalid signature', time: logTime, cluster: 'Auth Failure Cluster' },
            { type: 'warning', service: 'Vault', message: 'Key version mismatch: expected v3, got v2', time: logTime, cluster: 'Auth Failure Cluster' },
            { type: 'info', service: 'Auth API', message: 'Forcing JWKS endpoint cache refresh', time: logTime, cluster: 'Auth Failure Cluster' },
            { type: 'error', service: 'Session Manager', message: '142 active sessions invalidated during key rotation', time: logTime, cluster: 'Security Event' }
          ],
          latencySpikeValue: 160
        },
        rate: {
          incident: {
            id: incId, endpoint: '/v1/checkout/apply-coupon', severity: 'low', timestamp: 'Just now',
            type: 'Rate Limit Exceeded', service: 'Discount Service', impact: 'Low',
            rootCause: 'Abusive script hit apply-coupon API with 400 req/sec from single IP.',
            confidence: 96,
            probableCauses: ['Single user client making 400 requests/sec', 'Missing rate-limit middleware on coupon endpoint'],
            recommendedFixes: [{ title: 'Block IP Range', desc: 'Add IP 198.51.100.0/24 to WAF blocklist.' }]
          },
          logs: [
            { type: 'warning', service: 'API Gateway', message: 'Rate Limit Exceeded: 429 Too Many Requests from 198.51.100.42', time: logTime, cluster: 'Rate Limit Anomalies' },
            { type: 'info', service: 'WAF', message: 'Suspicious traffic pattern detected: 400 req/sec burst', time: logTime, cluster: 'Rate Limit Anomalies' },
            { type: 'warning', service: 'Discount Service', message: 'Token bucket depleted for client fingerprint abc123', time: logTime, cluster: 'Rate Limit Anomalies' },
            { type: 'info', service: 'API Gateway', message: 'Auto-throttle engaged: reducing throughput to 10 req/sec', time: logTime, cluster: 'Rate Limit Anomalies' }
          ],
          latencySpikeValue: 135
        }
      };
      
      const fallback = scenarioMap[scenarioId] || scenarioMap['timeout'];

      // Update local state so dashboard reflects the simulation
      setIncidents(prev => [fallback.incident, ...prev]);
      setLogs(prev => [...fallback.logs, ...prev]);
      setLatencyData(prev => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const newPoint = { time: timeStr, latency: fallback.latencySpikeValue, baseline: 120 };
        return [...prev.slice(1), newPoint];
      });
      setActiveIncidentId(fallback.incident.id);
      
      return fallback;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearSimulation = async () => {
    const token = localStorage.getItem('errix_auth_token');
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      await fetch(`${API_BASE}/clear`, { method: 'POST', headers });
    } catch (e) {
      console.error('Reset environment request failed:', e);
    }
  };

  const toggleIntegration = async (provider: string, config: any = {}) => {
    const token = localStorage.getItem('errix_auth_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const res = await fetch(`${API_BASE}/integrations/toggle`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ provider, config })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update integration.');
      }
      const data = await res.json();
      setIntegrations(data);
    } catch (e) {
      console.error('Integrations update request failed:', e);
      throw e;
    }
  };

  const logout = async () => {
    await fbSignOut(auth);
  };

  return (
    <AppContext.Provider value={{
      kpis,
      latencyData,
      incidents,
      logs,
      integrations,
      user,
      loading,
      isAnalyzing,
      activeIncidentId,
      setActiveIncidentId,
      simulateFailure,
      clearSimulation,
      toggleIntegration,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
