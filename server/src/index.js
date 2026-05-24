import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { User, Incident, Log, Integration } from './models/Schemas.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/errix';

// Mongoose Connection with Graceful In-Memory Fallback for demo portability
let isDbConnected = false;
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB successfully connected.');
    isDbConnected = true;
    seedDatabase();
  })
  .catch(err => {
    console.warn('MongoDB connection failed. Operating in hybrid memory-fallback mode:', err.message);
  });

// Memory DB Fallback variables for resilience
let memoryIncidents = [];
let memoryLogs = [];
let memoryUsers = [];
let memoryIntegrationsByUser = {};

// JWT / Crypto helper functions
const JWT_SECRET = process.env.JWT_SECRET || 'errix_super_secret_jwt_sign_key_998877';

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const generateToken = (payload) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
};

const verifyToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload;
  } catch (e) {
    return null;
  }
};

const createAuditLog = async (message, type = 'info') => {
  const logTime = new Date().toLocaleTimeString([], { hour12: false });
  const logEntry = {
    type,
    service: 'Auth Service',
    message,
    time: logTime,
    cluster: 'Security Node'
  };
  
  if (isDbConnected) {
    try {
      const l = new Log(logEntry);
      await l.save();
    } catch (e) {
      console.error('Failed to save audit log:', e);
    }
  } else {
    memoryLogs.unshift(logEntry);
  }
  
  // Broadcast log to all dashboard clients in real-time
  io.emit('new_log', logEntry);
  return logEntry;
};
let memoryIntegrations = [
  { provider: 'github', status: 'connected' },
  { provider: 'slack', status: 'connected', config: { webhookUrl: 'https://hooks.slack.com/services/...' } }
];
let memoryKPIs = [
  { label: 'APIs Monitored', value: '127', change: '+12', trend: 'up' },
  { label: 'Active Incidents', value: '3', change: '-2', trend: 'down' },
  { label: 'System Health Score', value: '92%', change: '+1.2%', trend: 'up' },
  { label: 'Average Response Time', value: '123ms', change: '-8ms', trend: 'down' },
  { label: 'API Uptime %', value: '99.8%', change: '0%', trend: 'neutral' },
  { label: 'AI Prediction Accuracy', value: '94%', change: '+0.5%', trend: 'up' },
];

async function seedDatabase() {
  try {
    const incCount = await Incident.countDocuments();
    if (incCount === 0) {
      await Incident.insertMany([
        {
          id: 'INC-1042',
          endpoint: '/payment/process',
          severity: 'critical',
          timestamp: '2 mins ago',
          type: 'Timeout Error',
          service: 'Billing Service',
          impact: 'High',
          rootCause: 'Database connection pool saturation leading to query delays.',
          confidence: 92,
          probableCauses: [
            'Missing DB indexing on transactions table',
            'Slow third-party Stripe API response',
            'Increased CPU utilization on master database node'
          ],
          recommendedFixes: [
            { title: 'Increase DB Connection Pool', desc: 'Raise max connections count in client pool from 20 to 50.' },
            { title: 'Add Transaction Index', desc: 'Create index on transactions(user_id, status).' }
          ]
        },
        {
          id: 'INC-1041',
          endpoint: '/auth/login',
          severity: 'medium',
          timestamp: '15 mins ago',
          type: 'Token Validation Failure',
          service: 'Auth Service',
          impact: 'Medium',
          rootCause: 'Redis cache node failover causing session lookups to fail over back to persistent DB.',
          confidence: 87,
          probableCauses: [
            'Redis cluster primary replica node down',
            'Sudden user traffic spike on login endpoint'
          ],
          recommendedFixes: [
            { title: 'Redis Cluster Recovery', desc: 'Restart node auth-cache-02 and sync cluster state.' }
          ]
        }
      ]);
      console.log('Seeded database with default incidents.');
    }

    const logCount = await Log.countDocuments();
    if (logCount === 0) {
      await Log.insertMany([
        { type: 'error', service: 'Payment API', message: 'POST /payment/process → 504 Gateway Timeout', time: '10:42:05', cluster: 'High Latency Cluster' },
        { type: 'warning', service: 'Load Balancer', message: 'Response latency exceeded threshold (850ms)', time: '10:41:50', cluster: 'High Latency Cluster' },
        { type: 'info', service: 'Database', message: 'Database CPU usage increased to 85%', time: '10:40:12', cluster: 'Resource Spike' }
      ]);
      console.log('Seeded database with default logs.');
    }
  } catch (e) {
    console.error('Database seeding failed:', e);
  }
}

// JWT verification middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required.' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
  req.user = payload;
  next();
};

// --- API ROUTES ---

// Register standard Operator
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, company } = req.body;
  if (!name || !email || !password || !company) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const normalizedEmail = email.toLowerCase().trim();
    let existingUser = null;
    if (isDbConnected) {
      existingUser = await User.findOne({ email: normalizedEmail });
    } else {
      existingUser = memoryUsers.find(u => u.email === normalizedEmail);
    }
    
    if (existingUser) {
      return res.status(400).json({ error: 'An operator with this email is already registered.' });
    }
    
    const firebaseUid = 'usr_' + crypto.randomBytes(8).toString('hex');
    const hashedPassword = hashPassword(password);
    const photoURL = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
    
    const userPayload = {
      name,
      email: normalizedEmail,
      firebaseUid,
      company,
      password: hashedPassword,
      photoURL,
      provider: 'email'
    };
    
    if (isDbConnected) {
      const user = new User(userPayload);
      await user.save();
    } else {
      memoryUsers.push(userPayload);
    }
    
    // Create audit log and broadcast real-time log
    await createAuditLog(`Operator ${name} (${normalizedEmail}) provisioned secure system credentials.`, 'info');
    
    const token = generateToken({ email: normalizedEmail, firebaseUid });
    
    res.status(201).json({
      user: {
        uid: firebaseUid,
        email: normalizedEmail,
        displayName: name,
        photoURL,
        company
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login standard Operator
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const normalizedEmail = email.toLowerCase().trim();
    let user = null;
    if (isDbConnected) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = memoryUsers.find(u => u.email === normalizedEmail);
    }
    
    if (!user || user.provider !== 'email') {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    
    const token = generateToken({ email: normalizedEmail, firebaseUid: user.firebaseUid });
    
    // Create audit log and broadcast real-time log
    await createAuditLog(`Operator ${user.name} logged into console session.`, 'info');
    
    res.status(200).json({
      user: {
        uid: user.firebaseUid,
        email: user.email,
        displayName: user.name,
        photoURL: user.photoURL,
        company: user.company
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google Identity Login
app.post('/api/auth/google-login', async (req, res) => {
  const { email, displayName, photoURL } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Google email is required.' });
  }
  try {
    const normalizedEmail = email.toLowerCase().trim();
    let user = null;
    if (isDbConnected) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = memoryUsers.find(u => u.email === normalizedEmail);
    }
    
    const firebaseUid = user ? user.firebaseUid : 'usr_google_' + crypto.randomBytes(8).toString('hex');
    const finalDisplayName = displayName || normalizedEmail.split('@')[0];
    const finalPhotoURL = photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(finalDisplayName)}`;
    
    if (!user) {
      const userPayload = {
        name: finalDisplayName,
        email: normalizedEmail,
        firebaseUid,
        company: 'Errix Workspace',
        photoURL: finalPhotoURL,
        provider: 'google'
      };
      if (isDbConnected) {
        user = new User(userPayload);
        await user.save();
      } else {
        user = userPayload;
        memoryUsers.push(user);
      }
      await createAuditLog(`New Operator registered via Google Identity: ${finalDisplayName} (${normalizedEmail})`, 'info');
    } else {
      await createAuditLog(`Operator ${user.name} logged in via Google Identity.`, 'info');
    }
    
    const token = generateToken({ email: normalizedEmail, firebaseUid });
    
    res.status(200).json({
      user: {
        uid: firebaseUid,
        email: normalizedEmail,
        displayName: finalDisplayName,
        photoURL: finalPhotoURL,
        company: user.company || 'Errix Workspace'
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout Operator
app.post('/api/auth/logout', authenticate, async (req, res) => {
  try {
    const { email } = req.user;
    let name = email.split('@')[0];
    if (isDbConnected) {
      const user = await User.findOne({ email });
      if (user) name = user.name;
    } else {
      const user = memoryUsers.find(u => u.email === email);
      if (user) name = user.name;
    }
    
    await createAuditLog(`Operator ${name} closed session and logged out.`, 'info');
    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get logged-in operator details
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    let user = null;
    if (isDbConnected) {
      user = await User.findOne({ firebaseUid });
    } else {
      user = memoryUsers.find(u => u.firebaseUid === firebaseUid);
    }
    if (!user) {
      return res.status(404).json({ error: 'User session not found.' });
    }
    return res.status(200).json({
      uid: user.firebaseUid,
      email: user.email,
      displayName: user.name,
      photoURL: user.photoURL,
      company: user.company
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sync/Register user in MongoDB (Backward compatibility)
app.post('/api/auth/sync-user', async (req, res) => {
  const { name, email, firebaseUid, company } = req.body;
  try {
    if (isDbConnected) {
      let user = await User.findOne({ firebaseUid });
      if (!user) {
        user = new User({ name, email, firebaseUid, company, provider: 'google' });
        await user.save();
      }
      return res.status(200).json(user);
    } else {
      return res.status(200).json({ name, email, firebaseUid, company, message: 'Saved in local fallback context' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all incidents
app.get('/api/incidents', authenticate, async (req, res) => {
  try {
    if (isDbConnected) {
      const dbIncidents = await Incident.find().sort({ _id: -1 });
      res.json(dbIncidents);
    } else {
      res.json(memoryIncidents.length > 0 ? memoryIncidents : [
        {
          id: 'INC-1042',
          endpoint: '/payment/process',
          severity: 'critical',
          timestamp: '2 mins ago',
          type: 'Timeout Error',
          service: 'Billing Service',
          impact: 'High',
          rootCause: 'Database connection pool saturation leading to query delays.',
          confidence: 92,
          probableCauses: ['Missing DB indexing on transactions table', 'Slow third-party Stripe API response'],
          recommendedFixes: [{ title: 'Increase DB Connection Pool', desc: 'Raise pool count to 50.' }]
        }
      ]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all logs
app.get('/api/logs', authenticate, async (req, res) => {
  try {
    if (isDbConnected) {
      const dbLogs = await Log.find().sort({ _id: -1 }).limit(100);
      res.json(dbLogs);
    } else {
      res.json(memoryLogs.length > 0 ? memoryLogs : [
        { type: 'error', service: 'Payment API', message: 'POST /payment/process → 504 Gateway Timeout', time: '10:42:05', cluster: 'High Latency Cluster' },
        { type: 'warning', service: 'Load Balancer', message: 'Response latency exceeded threshold (850ms)', time: '10:41:50', cluster: 'High Latency Cluster' }
      ]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch KPIs
app.get('/api/kpis', authenticate, (req, res) => {
  res.json(memoryKPIs);
});

// Fetch Integrations list
app.get('/api/integrations', authenticate, async (req, res) => {
  const { firebaseUid } = req.user;
  const defaultList = [
    { provider: 'github', status: 'disconnected', config: {} },
    { provider: 'slack', status: 'disconnected', config: {} },
    { provider: 'aws', status: 'disconnected', config: {} },
    { provider: 'grafana', status: 'disconnected', config: {} },
    { provider: 'datadog', status: 'disconnected', config: {} },
    { provider: 'k8s', status: 'disconnected', config: {} }
  ];
  
  try {
    if (isDbConnected) {
      let dbList = await Integration.find({ userId: firebaseUid });
      if (dbList.length === 0) {
        // Seed default integrations for this user
        const toInsert = defaultList.map(item => ({
          userId: firebaseUid,
          provider: item.provider,
          status: item.status,
          config: item.config
        }));
        await Integration.insertMany(toInsert);
        dbList = await Integration.find({ userId: firebaseUid });
      }
      res.json(dbList);
    } else {
      if (!memoryIntegrationsByUser[firebaseUid]) {
        memoryIntegrationsByUser[firebaseUid] = defaultList;
      }
      res.json(memoryIntegrationsByUser[firebaseUid]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle/Connect integrations status
app.post('/api/integrations/toggle', authenticate, async (req, res) => {
  const { firebaseUid } = req.user;
  const { provider, config = {} } = req.body;
  
  try {
    let target = null;
    let newStatus = 'disconnected';
    
    if (isDbConnected) {
      let existing = await Integration.findOne({ userId: firebaseUid, provider });
      if (!existing) {
        console.log(`[DB] Creating new integration record for user ${firebaseUid}, provider ${provider}`);
        existing = new Integration({
          userId: firebaseUid,
          provider,
          status: 'disconnected',
          config: {}
        });
      }
      newStatus = existing.status === 'connected' ? 'disconnected' : 'connected';
      existing.status = newStatus;
      existing.config = newStatus === 'connected' ? config : {};
      await existing.save();
      console.log(`[DB] Updated integration ${provider} for user ${firebaseUid} to status: ${newStatus}`);
      const dbList = await Integration.find({ userId: firebaseUid });
      target = dbList;
    } else {
      if (!memoryIntegrationsByUser[firebaseUid]) {
        memoryIntegrationsByUser[firebaseUid] = [
          { provider: 'github', status: 'disconnected', config: {} },
          { provider: 'slack', status: 'disconnected', config: {} },
          { provider: 'aws', status: 'disconnected', config: {} },
          { provider: 'grafana', status: 'disconnected', config: {} },
          { provider: 'datadog', status: 'disconnected', config: {} },
          { provider: 'k8s', status: 'disconnected', config: {} }
        ];
      }
      
      memoryIntegrationsByUser[firebaseUid] = memoryIntegrationsByUser[firebaseUid].map(item => {
        if (item.provider === provider) {
          newStatus = item.status === 'connected' ? 'disconnected' : 'connected';
          return { ...item, status: newStatus, config: newStatus === 'connected' ? config : {} };
        }
        return item;
      });
      target = memoryIntegrationsByUser[firebaseUid];
    }
    
    // Log audit event
    const providerNames = {
      github: 'GitHub Codebase Pipeline',
      slack: 'Slack Webhook Alerts Channel',
      aws: 'AWS CloudWatch Stream',
      grafana: 'Grafana Metrics Board',
      datadog: 'Datadog Trace Daemon',
      k8s: 'Kubernetes Cluster Autoscale'
    };
    
    const friendlyName = providerNames[provider] || provider;
    if (newStatus === 'connected') {
      const configMsg = provider === 'github' ? ` (Repository: ${config.repo})` :
                        provider === 'slack' ? ` (Channel: ${config.channel})` :
                        provider === 'aws' ? ` (Region: ${config.region})` :
                        provider === 'grafana' ? ` (URL: ${config.url})` :
                        provider === 'k8s' ? ` (Namespace: ${config.namespace})` : '';
      await createAuditLog(`Integration initialized: Connected ${friendlyName}${configMsg}.`, 'info');
    } else {
      await createAuditLog(`Integration removed: Disconnected ${friendlyName}.`, 'warning');
    }
    
    res.json(target);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simulate chaos inject
app.post('/api/simulate', authenticate, async (req, res) => {
  const { scenarioId } = req.body;
  const timestamp = 'Just now';
  const logTime = new Date().toLocaleTimeString([], { hour12: false });
  
  let newIncident;
  let newLogs = [];
  let latencySpikeValue = 450;
  
  switch (scenarioId) {
    case 'timeout':
      newIncident = {
        id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        endpoint: '/v1/orders/create',
        severity: 'critical',
        timestamp,
        type: 'Timeout Spike',
        service: 'Order Processing',
        impact: 'High',
        rootCause: 'Downstream HTTP client timeout waiting for Inventory validation service.',
        confidence: 94,
        probableCauses: [
          'Inventory service container replica failed',
          'Connection pool exhaustion in HTTP client middleware'
        ],
        recommendedFixes: [
          { title: 'Add Circuit Breaker', desc: 'Deploy circuit breaker on inventory client.' },
          { title: 'Scale Inventory Service', desc: 'Increase replica count of inventory pods.' }
        ]
      };
      newLogs = [
        { type: 'error', service: 'Order API', message: 'POST /v1/orders/create → 504 Gateway Timeout', time: logTime, cluster: 'Client Timeout Cluster' },
        { type: 'warning', service: 'Inventory Service', message: 'Read timeouts detected on pod inv-replica-03', time: logTime, cluster: 'Service Interruption' }
      ];
      latencySpikeValue = 680;
      break;

    case 'crash':
      newIncident = {
        id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        endpoint: '/v1/users/register',
        severity: 'critical',
        timestamp,
        type: 'Server Crash',
        service: 'Identity Service',
        impact: 'High',
        rootCause: 'Node.js out-of-memory crash due to large JSON payload parsing recursion.',
        confidence: 98,
        probableCauses: [
          'Heap limit reached (512MB) on register worker node 4',
          'Uncaught exception in error handling middleware'
        ],
        recommendedFixes: [
          { title: 'Upgrade Memory Limit', desc: 'Increase Kubernetes memory limit allocation.' }
        ]
      };
      newLogs = [
        { type: 'error', service: 'Identity Service', message: 'FATAL ERROR: JavaScript heap out of memory', time: logTime, cluster: 'Heap Dump Event' },
        { type: 'warning', service: 'Kubernetes Pod', message: 'Pod identity-register crashed with status OOMKilled', time: logTime, cluster: 'Resource Saturation' }
      ];
      latencySpikeValue = 920;
      break;

    case 'db':
      newIncident = {
        id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        endpoint: '/v1/analytics/dashboard',
        severity: 'medium',
        timestamp,
        type: 'Database Slowdown',
        service: 'Reporting Service',
        impact: 'Medium',
        rootCause: 'Sequential scanning on transactions table due to missing composite index.',
        confidence: 89,
        probableCauses: [
          'Missing index on user_id + timestamp column',
          'Analytical queries executed on primary database node'
        ],
        recommendedFixes: [
          { title: 'Create Composite Index', desc: 'Run CREATE INDEX idx_trans_user_time.' }
        ]
      };
      newLogs = [
        { type: 'warning', service: 'Database', message: 'Slow Query Detected: SELECT SUM(amount) FROM transactions (3450ms)', time: logTime, cluster: 'Slow Query Pattern' }
      ];
      latencySpikeValue = 280;
      break;

    case 'auth':
      newIncident = {
        id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        endpoint: '/v1/auth/session-refresh',
        severity: 'medium',
        timestamp,
        type: 'Authentication Failure',
        service: 'Auth Token API',
        impact: 'Medium',
        rootCause: 'Cryptographic key rotation synchronization mismatch.',
        confidence: 91,
        probableCauses: [
          'Auth instance 01 failed to load latest RSA public key',
          'Clock drift on secondary vault instances'
        ],
        recommendedFixes: [
          { title: 'Sync Cryptographic Keys', desc: 'Force reload JWKS secrets cache.' }
        ]
      };
      newLogs = [
        { type: 'error', service: 'Auth API', message: 'JWT Signature Verification failed', time: logTime, cluster: 'Auth Failure Cluster' }
      ];
      latencySpikeValue = 160;
      break;

    case 'rate':
      newIncident = {
        id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        endpoint: '/v1/checkout/apply-coupon',
        severity: 'low',
        timestamp,
        type: 'Rate Limit Exceeded',
        service: 'Discount Service',
        impact: 'Low',
        rootCause: 'Abusive script hit apply-coupon API.',
        confidence: 96,
        probableCauses: [
          'Single user client making 400 requests/sec'
        ],
        recommendedFixes: [
          { title: 'Block IP Range', desc: 'Add IP to block list.' }
        ]
      };
      newLogs = [
        { type: 'warning', service: 'API Gateway', message: 'Rate Limit Exceeded: 429 Too Many Requests', time: logTime, cluster: 'Rate limit anomalies' }
      ];
      latencySpikeValue = 135;
      break;
  }

  // Persist to MongoDB if active
  if (isDbConnected) {
    try {
      const inc = new Incident(newIncident);
      await inc.save();
      for (const log of newLogs) {
        const l = new Log(log);
        await l.save();
      }
    } catch (e) {
      console.error('Failed to write incident to MongoDB:', e);
    }
  } else {
    memoryIncidents.unshift(newIncident);
    newLogs.forEach(l => memoryLogs.unshift(l));
  }

  // Update memory KPIs based on incident severity
  memoryKPIs = memoryKPIs.map(kpi => {
    if (kpi.label === 'Active Incidents') return { ...kpi, value: String(parseInt(kpi.value) + 1), change: '+1', trend: 'up' };
    if (kpi.label === 'System Health Score') {
      const val = parseInt(kpi.value) - (newIncident.severity === 'critical' ? 15 : 5);
      return { ...kpi, value: `${Math.max(val, 40)}%`, change: `-${newIncident.severity === 'critical' ? 15 : 5}%`, trend: 'down' };
    }
    if (kpi.label === 'Average Response Time') {
      return { ...kpi, value: `${latencySpikeValue}ms`, change: `+${latencySpikeValue - 123}ms`, trend: 'up' };
    }
    return kpi;
  });

  // Trigger Slack Integration webhook alert if configured
  const slackInteg = memoryIntegrations.find(integ => integ.provider === 'slack');
  if (slackInteg && slackInteg.status === 'connected') {
    console.log(`[SLACK ALERT SENT] Alert triggered: ${newIncident.type} on ${newIncident.endpoint}`);
  }

  // Broadcast the events via Socket.IO
  const payload = {
    incident: newIncident,
    logs: newLogs,
    latencySpikeValue,
    kpis: memoryKPIs
  };

  io.emit('chaos_incident', payload);

  res.status(200).json(payload);
});

// Clear/Reset dashboard
app.post('/api/clear', authenticate, async (req, res) => {
  if (isDbConnected) {
    try {
      await Incident.deleteMany({});
      await Log.deleteMany({});
      await seedDatabase();
    } catch (e) {
      console.error(e);
    }
  }
  memoryIncidents = [];
  memoryLogs = [];
  memoryKPIs = [
    { label: 'APIs Monitored', value: '127', change: '+12', trend: 'up' },
    { label: 'Active Incidents', value: '3', change: '-2', trend: 'down' },
    { label: 'System Health Score', value: '92%', change: '+1.2%', trend: 'up' },
    { label: 'Average Response Time', value: '123ms', change: '-8ms', trend: 'down' },
    { label: 'API Uptime %', value: '99.8%', change: '0%', trend: 'neutral' },
    { label: 'AI Prediction Accuracy', value: '94%', change: '+0.5%', trend: 'up' },
  ];
  io.emit('chaos_clear');
  res.status(200).json({ message: 'Environment reset' });
});


// Socket Connections handler
io.on('connection', (socket) => {
  console.log('Client dashboard socket connected:', socket.id);
});

server.listen(PORT, () => {
  console.log(`Errix backend server listening on port ${PORT}`);
});
