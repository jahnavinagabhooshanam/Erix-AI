import { motion } from 'framer-motion';
import { Code2, AlertCircle, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

const GitHubLogo = ({ className }: { className?: string }) => (
  <img 
    src="https://www.vectorlogo.zone/logos/github/github-icon.svg" 
    className={`${className} brightness-0 invert`} 
    alt="GitHub" 
  />
);

const SlackLogo = ({ className }: { className?: string }) => (
  <img 
    src="https://www.vectorlogo.zone/logos/slack/slack-icon.svg" 
    className={className} 
    alt="Slack" 
  />
);

const AWSLogo = ({ className }: { className?: string }) => (
  <img 
    src="https://www.vectorlogo.zone/logos/amazon_cloudwatch/amazon_cloudwatch-icon.svg" 
    className={className} 
    alt="AWS" 
  />
);

const GrafanaLogo = ({ className }: { className?: string }) => (
  <img 
    src="https://www.vectorlogo.zone/logos/grafana/grafana-icon.svg" 
    className={className} 
    alt="Grafana" 
  />
);

const DatadogLogo = ({ className }: { className?: string }) => (
  <img 
    src="https://www.vectorlogo.zone/logos/datadoghq/datadoghq-icon.svg" 
    className={className} 
    alt="Datadog" 
  />
);

const KubernetesLogo = ({ className }: { className?: string }) => (
  <img 
    src="https://www.vectorlogo.zone/logos/kubernetes/kubernetes-icon.svg" 
    className={className} 
    alt="Kubernetes" 
  />
);

const integrationsList = [
  { id: 'github', name: 'GitHub', desc: 'Sync deployments, PRs, and commit timelines.', icon: GitHubLogo, color: 'text-white', glow: 'hover:border-white/40' },
  { id: 'slack', name: 'Slack', desc: 'Push instant AI failure alerts to engineering channels.', icon: SlackLogo, color: 'text-[#36C5F0]', glow: 'hover:border-emerald-500/40' },
  { id: 'aws', name: 'AWS CloudWatch', desc: 'Pull metrics, triggers, and API Gateway streams.', icon: AWSLogo, color: 'text-[#FF9900]', glow: 'hover:border-amber-500/40' },
  { id: 'grafana', name: 'Grafana', desc: 'Feed anomaly metrics directly to central boards.', icon: GrafanaLogo, color: 'text-[#F47A20]', glow: 'hover:border-orange-500/40' },
  { id: 'datadog', name: 'Datadog', desc: 'Bi-directional trace indexing and warning clustering.', icon: DatadogLogo, color: 'text-[#8D4BE0]', glow: 'hover:border-purple-500/40' },
  { id: 'k8s', name: 'Kubernetes', desc: 'Autoscale nodes or trigger pod recovery routines.', icon: KubernetesLogo, color: 'text-[#326CE5]', glow: 'hover:border-blue-500/40' },
];

const openIntegrationPopup = (provider: string, name: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const width = 480;
    const height = 480;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      "",
      `Connect ${name}`,
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no,location=no`
    );
    
    if (!popup) {
      reject(new Error("Popup blocker prevented integration setup. Please allow popups."));
      return;
    }
    
    let contentHtml = "";
    
    if (provider === 'github') {
      contentHtml = `
        <h1>Authorize GitHub Integration</h1>
        <p>Grant Errix AI read/write access to sync repositories, commits, and check health.</p>
        <div class="oauth-box">
          <p style="font-size:12px;color:#5f6368;margin-bottom:10px;">Select repository to monitor:</p>
          <select id="repo" style="width:100%;padding:10px;font-size:14px;border:1px solid #dadce0;border-radius:4px;">
            <option value="errix-core-api">errix-core-api</option>
            <option value="auth-jwt-service">auth-jwt-service</option>
            <option value="billing-workers">billing-workers</option>
          </select>
        </div>
        <button type="submit" onclick="submitConfig()">Authorize Errix AI</button>
        <script>
          function submitConfig() {
            const repo = document.getElementById('repo').value;
            window.opener.postMessage({ type: 'INTEG_CONNECT_SUCCESS', config: { repo } }, '*');
            window.close();
          }
        </script>
      `;
    } else if (provider === 'slack') {
      contentHtml = `
        <h1>Add Errix AI to Slack</h1>
        <p>Enable real-time AI anomaly alerts directly into your engineering channels.</p>
        <div class="oauth-box">
          <div class="form-group">
            <label>Select Alerts Channel</label>
            <input type="text" id="channel" value="#alerts-devops" placeholder="#channel-name" required>
          </div>
          <div class="form-group" style="margin-top:12px;">
            <label>Webhook URL (optional)</label>
            <input type="text" id="webhook" value="https://hooks.slack.com/services/T00/B00/X00" placeholder="https://hooks.slack.com/services/..." required>
          </div>
        </div>
        <button type="submit" onclick="submitConfig()">Allow Access</button>
        <script>
          function submitConfig() {
            const channel = document.getElementById('channel').value;
            const webhookUrl = document.getElementById('webhook').value;
            window.opener.postMessage({ type: 'INTEG_CONNECT_SUCCESS', config: { channel, webhookUrl } }, '*');
            window.close();
          }
        </script>
      `;
    } else if (provider === 'aws') {
      contentHtml = `
        <h1>AWS CloudWatch Integration</h1>
        <p>Pull cloud infrastructure metrics, triggers, and API Gateway traffic logs.</p>
        <div class="oauth-box">
          <div class="form-group">
            <label>AWS Region</label>
            <input type="text" id="region" value="us-east-1" placeholder="us-east-1" required>
          </div>
          <div class="form-group" style="margin-top:12px;">
            <label>AWS Access Key ID</label>
            <input type="text" id="accessKey" value="AKIAIOSFODNN7EXAMPLE" placeholder="AKIA..." required>
          </div>
        </div>
        <button type="submit" onclick="submitConfig()">Verify & Sync</button>
        <script>
          function submitConfig() {
            const region = document.getElementById('region').value;
            const accessKey = document.getElementById('accessKey').value;
            window.opener.postMessage({ type: 'INTEG_CONNECT_SUCCESS', config: { region, accessKey } }, '*');
            window.close();
          }
        </script>
      `;
    } else if (provider === 'grafana') {
      contentHtml = `
        <h1>Grafana Metrics Connector</h1>
        <p>Feed anomaly alert streams directly into Grafana visualization boards.</p>
        <div class="oauth-box">
          <div class="form-group">
            <label>Grafana Host URL</label>
            <input type="text" id="url" value="https://grafana.company.org" placeholder="https://..." required>
          </div>
          <div class="form-group" style="margin-top:12px;">
            <label>API Key / Token</label>
            <input type="password" id="key" value="••••••••••••••••" placeholder="glsa_..." required>
          </div>
        </div>
        <button type="submit" onclick="submitConfig()">Connect Board</button>
        <script>
          function submitConfig() {
            const url = document.getElementById('url').value;
            const key = document.getElementById('key').value;
            window.opener.postMessage({ type: 'INTEG_CONNECT_SUCCESS', config: { url, key } }, '*');
            window.close();
          }
        </script>
      `;
    } else if (provider === 'datadog') {
      contentHtml = `
        <h1>Datadog Log Agent</h1>
        <p>Integrate trace collector indexing and sequential trace anomaly detection.</p>
        <div class="oauth-box">
          <div class="form-group">
            <label>Datadog API Key</label>
            <input type="password" id="key" value="••••••••••••••••" placeholder="API Key" required>
          </div>
        </div>
        <button type="submit" onclick="submitConfig()">Bind Agent</button>
        <script>
          function submitConfig() {
            const key = document.getElementById('key').value;
            window.opener.postMessage({ type: 'INTEG_CONNECT_SUCCESS', config: { key } }, '*');
            window.close();
          }
        </script>
      `;
    } else if (provider === 'k8s') {
      contentHtml = `
        <h1>Kubernetes Cluster Autoscale</h1>
        <p>Allow Errix AI daemon to auto-reboot crashed pods and scale container counts.</p>
        <div class="oauth-box">
          <div class="form-group">
            <label>Target Namespace</label>
            <input type="text" id="namespace" value="production" placeholder="default" required>
          </div>
        </div>
        <button type="submit" onclick="submitConfig()">Link Pod Daemon</button>
        <script>
          function submitConfig() {
            const namespace = document.getElementById('namespace').value;
            window.opener.postMessage({ type: 'INTEG_CONNECT_SUCCESS', config: { namespace } }, '*');
            window.close();
          }
        </script>
      `;
    }
    
    const popupHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Connect ${name}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Roboto', sans-serif;
            background-color: #ffffff;
            color: #202124;
            margin: 0;
            padding: 30px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: calc(100vh - 60px);
          }
          h1 {
            font-size: 20px;
            font-weight: 500;
            margin: 0 0 10px 0;
            color: #202124;
          }
          p {
            font-size: 13px;
            color: #5f6368;
            line-height: 1.5;
            margin: 0 0 20px 0;
          }
          .oauth-box {
            background-color: #f8f9fa;
            border: 1px dashed #dadce0;
            border-radius: 8px;
            padding: 20px;
            flex-grow: 1;
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .form-group {
            text-align: left;
          }
          label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: #5f6368;
            margin-bottom: 6px;
            text-transform: uppercase;
          }
          input {
            width: 100%;
            box-sizing: border-box;
            padding: 10px;
            font-size: 14px;
            border: 1px solid #dadce0;
            border-radius: 4px;
            outline: none;
          }
          input:focus {
            border-color: #1a73e8;
          }
          button {
            background-color: #1a73e8;
            color: white;
            border: none;
            padding: 12px;
            font-size: 14px;
            font-weight: 500;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
            transition: background-color 0.15s;
          }
          button:hover {
            background-color: #1557b0;
          }
        </style>
      </head>
      <body>
        <div>
          ${contentHtml}
        </div>
      </body>
      </html>
    `;
    
    popup.document.write(popupHtml);
    popup.document.close();
    
    const messageListener = (event: MessageEvent) => {
      if (event.data && event.data.type === 'INTEG_CONNECT_SUCCESS') {
        window.removeEventListener('message', messageListener);
        resolve(event.data.config);
      }
    };
    
    window.addEventListener('message', messageListener);
  });
};

export default function Integrations() {
  const { integrations, toggleIntegration } = useApp();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggle = async (provider: string, name: string, isCurrentlyConnected: boolean) => {
    try {
      if (isCurrentlyConnected) {
        // Disconnect directly
        await toggleIntegration(provider);
        setToastMessage(`${name} integration disconnected successfully.`);
      } else {
        // Connect via oauth popup input
        const config = await openIntegrationPopup(provider, name);
        await toggleIntegration(provider, config);
        setToastMessage(`${name} integration connected successfully!`);
      }
    } catch (e: any) {
      setToastMessage(e.message || "Failed to toggle integration.");
    }
    
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const isProviderConnected = (id: string) => {
    return integrations.some(i => i.provider === id && i.status === 'connected');
  };

  // Filter integrations to display repositories connected when Github is active
  const githubConnected = isProviderConnected('github');

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 z-50 bg-[#0A0A0F] border border-blue-500/30 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs text-white"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span className="font-bold font-mono">{toastMessage}</span>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white glow-text flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#7B61FF]" />
            Integrations Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">Connect your DevOps tools, notification channels, and infrastructure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationsList.map((integration, idx) => {
          const Icon = integration.icon;
          const isConnected = isProviderConnected(integration.id);
          
          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className={`glass-card p-6 border border-white/5 transition-all duration-300 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)] ${integration.glow}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white/5 ${integration.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] font-black border px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                    isConnected 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-slate-800/40 text-slate-500 border-slate-700'
                  }`}>
                    {isConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>
                <h3 className="font-extrabold text-white text-base mb-1 tracking-tight">{integration.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">{integration.desc}</p>
              </div>

              <button
                onClick={() => handleToggle(integration.id, integration.name, isConnected)}
                className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  isConnected 
                    ? "bg-red-950/10 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                    : "bg-[#00C2FF]/10 border border-[#00C2FF]/20 text-[#00C2FF] hover:bg-[#00C2FF] hover:text-black hover:shadow-[0_0_15px_rgba(0,194,255,0.3)]"
                }`}
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* GitHub Repository Monitor Section (Visible if connected) */}
      {githubConnected && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border border-white/5 shadow-2xl mt-8 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#00C2FF]" /> Connected Repositories
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Syncing 3 repositories</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'errix-core-api', health: 'Healthy', branch: 'main', commit: '8f342a1' },
              { name: 'auth-jwt-service', health: 'Anomalies Detected', branch: 'release-1.4', commit: '4c1d29e' },
              { name: 'billing-workers', health: 'Healthy', branch: 'main', commit: '990a2bf' }
            ].map((repo, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-white">{repo.name}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      repo.health === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {repo.health}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">Branch: {repo.branch} @ {repo.commit}</p>
                </div>
                
                {repo.health !== 'Healthy' && (
                  <div className="flex items-center gap-1.5 mt-4 p-2 bg-red-500/5 border border-red-500/20 rounded text-[9px] text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Deployment failure anomaly detected.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
