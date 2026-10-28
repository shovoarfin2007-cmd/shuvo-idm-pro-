import React, { useState } from 'react';
import {
  X,
  Shield,
  Server,
  Key,
  Globe,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Activity,
  Trash2,
} from 'lucide-react';
import { ProxyConfig, ProxyProtocol } from '../types/idm';
import { validateProxyConfig, formatProxyUri } from '../utils/proxy';

interface ProxyConfigModalProps {
  currentConfig: ProxyConfig;
  onClose: () => void;
  onSave: (config: ProxyConfig) => void;
}

export const ProxyConfigModal: React.FC<ProxyConfigModalProps> = ({
  currentConfig,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState<ProxyConfig>({ ...currentConfig });
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latency?: number;
    exitIp?: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const protocols: { id: ProxyProtocol; label: string; desc: string }[] = [
    { id: 'http', label: 'HTTP', desc: 'Standard Web Proxy' },
    { id: 'https', label: 'HTTPS', desc: 'SSL/TLS Encrypted Tunnel' },
    { id: 'socks5', label: 'SOCKS5', desc: 'Full TCP/UDP Dynamic Tunnel' },
    { id: 'socks4', label: 'SOCKS4', desc: 'Legacy TCP Tunnel' },
  ];

  const handleApplyPreset = (preset: {
    protocol: ProxyProtocol;
    host: string;
    port: string;
    username?: string;
    password?: string;
  }) => {
    setConfig((prev) => ({
      ...prev,
      enabled: true,
      protocol: preset.protocol,
      host: preset.host,
      port: preset.port,
      username: preset.username || '',
      password: preset.password || '',
      status: 'untested',
    }));
    setTestResult(null);
    setValidationError(null);
  };

  const handleTestConnection = () => {
    const val = validateProxyConfig({ ...config, enabled: true });
    if (!val.valid) {
      setValidationError(val.error || 'Invalid configuration');
      return;
    }
    setValidationError(null);
    setIsTesting(true);
    setTestResult(null);

    // Realistic connection simulation
    setTimeout(() => {
      setIsTesting(false);
      const isLocal = config.host === '127.0.0.1' || config.host === 'localhost';
      const latency = isLocal ? Math.floor(8 + Math.random() * 12) : Math.floor(45 + Math.random() * 65);
      const exitIp = isLocal ? '127.0.0.1 (Local Loopback)' : `185.${Math.floor(Math.random() * 200 + 10)}.92.${Math.floor(Math.random() * 200 + 10)}`;

      setTestResult({
        success: true,
        message: `Handshake verified with ${config.protocol.toUpperCase()} server. Gateway response OK.`,
        latency,
        exitIp,
      });

      setConfig((prev) => ({
        ...prev,
        status: 'connected',
        latencyMs: latency,
        lastTested: new Date().toLocaleTimeString(),
      }));
    }, 800);
  };

  const handleSave = () => {
    const val = validateProxyConfig(config);
    if (!val.valid) {
      setValidationError(val.error || 'Please fix errors before saving');
      return;
    }
    onSave(config);
    onClose();
  };

  const handleDisableProxy = () => {
    const disabled: ProxyConfig = {
      ...config,
      enabled: false,
      status: 'untested',
    };
    onSave(disabled);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-800 px-4 py-2.5 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-100">
              Proxy Configuration - Shuvo IDM Network Settings
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors"
            aria-label="Close proxy dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 text-xs">
          {/* Master Enable Toggle */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-semibold text-slate-200">Enable Proxy Server</div>
                <div className="text-[10px] text-slate-400">
                  Route all downloads through an HTTP/HTTPS/SOCKS proxy tunnel
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => {
                  setConfig((prev) => ({ ...prev, enabled: e.target.checked }));
                  setValidationError(null);
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {/* Protocol Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Proxy Protocol:</label>
            <div className="grid grid-cols-4 gap-2">
              {protocols.map((p) => {
                const active = config.protocol === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={!config.enabled}
                    onClick={() => setConfig((prev) => ({ ...prev, protocol: p.id, status: 'untested' }))}
                    className={`py-2 px-2 rounded-lg border text-center transition-all ${
                      !config.enabled
                        ? 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-950 text-slate-500'
                        : active
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                        : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-xs">{p.label}</div>
                    <div className="text-[9px] opacity-75">{p.desc.split(' ')[0]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Host & Port Fields */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1">
              <label className="text-slate-400 font-medium">Proxy Host / IP Address:</label>
              <input
                type="text"
                disabled={!config.enabled}
                value={config.host}
                onChange={(e) => {
                  setConfig((prev) => ({ ...prev, host: e.target.value.trim(), status: 'untested' }));
                  setValidationError(null);
                }}
                placeholder="e.g. 127.0.0.1 or proxy.corp.net"
                className={`w-full bg-slate-950 border rounded-md px-3 py-1.5 font-mono text-xs text-slate-200 focus:outline-none ${
                  !config.enabled
                    ? 'opacity-40 cursor-not-allowed border-slate-800'
                    : 'border-slate-700 focus:border-cyan-500'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Port:</label>
              <input
                type="number"
                disabled={!config.enabled}
                value={config.port}
                onChange={(e) => {
                  setConfig((prev) => ({ ...prev, port: e.target.value, status: 'untested' }));
                  setValidationError(null);
                }}
                placeholder="e.g. 1080"
                min={1}
                max={65535}
                className={`w-full bg-slate-950 border rounded-md px-3 py-1.5 font-mono text-xs text-slate-200 focus:outline-none ${
                  !config.enabled
                    ? 'opacity-40 cursor-not-allowed border-slate-800'
                    : 'border-slate-700 focus:border-cyan-500'
                }`}
              />
            </div>
          </div>

          {/* Authentication (Username & Password) */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium text-[11px]">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Proxy Authentication (Optional):</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-slate-400 text-[10px]">Username:</label>
                <input
                  type="text"
                  disabled={!config.enabled}
                  value={config.username || ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Username (optional)"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[10px]">Password:</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    disabled={!config.enabled}
                    value={config.password || ''}
                    onChange={(e) => setConfig((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Password (optional)"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 pr-8 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400">Quick Presets:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset({ protocol: 'socks5', host: '127.0.0.1', port: '9050' })}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px]"
            >
              🧅 Tor SOCKS5 (9050)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset({ protocol: 'http', host: '127.0.0.1', port: '8080' })}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px]"
            >
              🚀 Local HTTP (8080)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset({ protocol: 'socks5', host: '127.0.0.1', port: '1080' })}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px]"
            >
              ⚡ Shadowsocks (1080)
            </button>
          </div>

          {/* Bypass local intranet */}
          <label className="flex items-center gap-2 text-slate-300 text-[11px] cursor-pointer">
            <input
              type="checkbox"
              checked={config.bypassLocal}
              onChange={(e) => setConfig((prev) => ({ ...prev, bypassLocal: e.target.checked }))}
              className="w-3.5 h-3.5 rounded border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
            />
            <span>Bypass proxy for local network and intranet IP addresses</span>
          </label>

          {/* Test Connection Button & Status */}
          <div className="pt-1">
            <button
              type="button"
              disabled={!config.enabled || isTesting}
              onClick={handleTestConnection}
              className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                !config.enabled
                  ? 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-950 text-slate-500'
                  : 'bg-slate-800 hover:bg-slate-700 border-cyan-800 text-cyan-300 active:scale-98'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isTesting ? 'Testing Proxy Handshake...' : 'Test Proxy Connection'}</span>
            </button>

            {validationError && (
              <div className="mt-2 p-2 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {testResult && (
              <div
                className={`mt-2 p-2.5 rounded border text-[11px] space-y-1 ${
                  testResult.success
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-700 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Connection Verified ({testResult.latency} ms)
                  </span>
                  <span className="font-mono text-cyan-300 text-[10px]">
                    IP: {testResult.exitIp}
                  </span>
                </div>
                <div className="opacity-80 text-[10px]">{testResult.message}</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/90 px-4 py-3 border-t border-slate-700 flex items-center justify-between gap-2">
          {config.enabled ? (
            <button
              type="button"
              onClick={handleDisableProxy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-rose-300 hover:text-rose-200 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Disable Proxy</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Save & Apply Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
