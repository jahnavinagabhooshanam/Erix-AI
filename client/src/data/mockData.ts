export const kpiData = [
  { label: 'APIs Monitored', value: '142', change: '+12', trend: 'up' },
  { label: 'Active Incidents', value: '3', change: '-2', trend: 'down' },
  { label: 'System Health Score', value: '94%', change: '+1.2%', trend: 'up' },
  { label: 'Average Response Time', value: '124ms', change: '-8ms', trend: 'down' },
  { label: 'API Uptime %', value: '99.98%', change: '0%', trend: 'neutral' },
  { label: 'AI Prediction Accuracy', value: '98.2%', change: '+0.5%', trend: 'up' },
];

export const latencyData = [
  { time: '00:00', latency: 120, baseline: 115 },
  { time: '04:00', latency: 118, baseline: 115 },
  { time: '08:00', latency: 145, baseline: 120 },
  { time: '12:00', latency: 190, baseline: 125 },
  { time: '16:00', latency: 130, baseline: 120 },
  { time: '20:00', latency: 125, baseline: 115 },
  { time: '24:00', latency: 122, baseline: 115 },
];

export const incidents = [
  {
    id: 'INC-1042',
    endpoint: '/payment/process',
    severity: 'critical',
    timestamp: '2 mins ago',
    type: 'Timeout Error',
    service: 'Billing Service',
    impact: 'High',
  },
  {
    id: 'INC-1041',
    endpoint: '/auth/login',
    severity: 'medium',
    timestamp: '15 mins ago',
    type: 'Token Validation Failure',
    service: 'Auth Service',
    impact: 'Medium',
  },
  {
    id: 'INC-1040',
    endpoint: '/checkout',
    severity: 'critical',
    timestamp: '1 hr ago',
    type: '500 Internal Server Error',
    service: 'Checkout API',
    impact: 'High',
  },
];

export const logFeed = [
  { type: 'error', message: 'POST /payment/process → 504 Gateway Timeout', time: '10:42:05' },
  { type: 'warning', message: 'Response latency exceeded threshold (850ms)', time: '10:41:50' },
  { type: 'info', message: 'Database CPU usage increased to 85%', time: '10:40:12' },
  { type: 'error', message: 'Stripe API connection refused', time: '10:39:45' },
  { type: 'info', message: 'Autoscaling triggered for payment-worker-pool', time: '10:38:20' },
];
