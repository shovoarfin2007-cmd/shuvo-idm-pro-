import React from 'react';
import { Gauge, Activity, ShieldCheck, Clock, Layers, Wifi, Globe, ListOrdered } from 'lucide-react';
import { LicenseState, ProxyConfig, QueueSettings } from '../types/idm';
import { formatSpeed } from '../utils/license';

interface StatusBarProps {
  license: LicenseState;
  proxyConfig: ProxyConfig;
  queueSettings: QueueSettings;
  queuedCount: number;
  globalSpeed: number;
  activeDownloadsCount: number;
  activeThreadsCount: number;
  speedLimit: string;
  onChangeSpeedLimit: (limit: string) => void;
  onOpenLicense: () => void;
  onOpenProxyModal: () => void;
  onOpenSmartQueue: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  license,
  proxyConfig,
  queueSettings,
  queuedCount,
  globalSpeed,
  activeDownloadsCount,
  activeThreadsCount,
  speedLimit,
  onChangeSpeedLimit,
  onOpenLicense,
  onOpenProxyModal,
  onOpenSmartQueue,
}) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/90 px-3.5 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-300 select-none shadow-xs">
      {/* Left: License status & system readiness */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Core:</span>
          <span className="font-semibold text-slate-200">
            {activeDownloadsCount > 0 ? (
              <span className="text-sky-400 flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                Active ({activeDownloadsCount} downloading)
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">Engine Ready</span>
            )}
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

        {/* License Pill */}
        <button
          onClick={onOpenLicense}
          className="flex items-center gap-1.5 hover:underline transition-all text-[11px] cursor-pointer"
        >
          {license.status === 'ACTIVATED' ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              License: UNLOCKED ({license.info})
            </span>
          ) : (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              License: FREE TRIAL ({license.trialDaysLeft} Days Left)
            </span>
          )}
        </button>

        <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

        {/* Proxy Tunnel Pill */}
        <button
          onClick={onOpenProxyModal}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
            proxyConfig.enabled
              ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900'
              : 'text-slate-500 hover:text-slate-400'
          }`}
          title="Click to view or edit Proxy Settings"
        >
          <Globe
            className={`w-3 h-3 ${
              proxyConfig.enabled ? 'text-cyan-400 animate-pulse' : 'text-slate-500'
            }`}
          />
          {proxyConfig.enabled ? (
            <span>
              Proxy: <strong className="font-mono text-white">{proxyConfig.protocol.toUpperCase()}</strong>{' '}
              {proxyConfig.host}:{proxyConfig.port}
              {proxyConfig.latencyMs ? ` (${proxyConfig.latencyMs}ms)` : ''}
            </span>
          ) : (
            <span>Proxy: Disabled</span>
          )}
        </button>

        <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

        {/* Smart Queue Telemetry Pill */}
        <button
          onClick={onOpenSmartQueue}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
            queueSettings.enabled
              ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/80 hover:bg-indigo-900'
              : 'text-slate-500 hover:text-slate-400'
          }`}
          title="Click to configure Smart Queue & Concurrent Thread Limits"
        >
          <ListOrdered className={`w-3 h-3 ${queueSettings.enabled ? 'text-indigo-400' : 'text-slate-500'}`} />
          <span>
            Queue:{' '}
            <strong className="font-mono text-white">
              {activeDownloadsCount}/{queueSettings.maxConcurrent}
            </strong>{' '}
            Slots
            {queuedCount > 0 && (
              <span className="text-amber-400 ml-1">({queuedCount} waiting)</span>
            )}
          </span>
        </button>
      </div>

      {/* Right: Global Telemetry & Speed Limiter */}
      <div className="flex items-center gap-3">
        {/* Active Threads */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sockets:</span>
          <span className="font-mono text-cyan-300 font-bold">{activeThreadsCount} threads</span>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 hidden md:block" />

        {/* Total Download Speed */}
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[11px]">Total Speed:</span>
          <span className="font-mono text-cyan-300 font-bold text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {formatSpeed(globalSpeed)}
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

        {/* Speed Limiter selector */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <Gauge className="w-3 h-3 text-slate-400" />
          <span className="text-slate-400 hidden lg:inline">Limit:</span>
          <select
            value={speedLimit}
            onChange={(e) => onChangeSpeedLimit(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-md px-2 py-0.5 text-slate-200 text-xs focus:outline-none cursor-pointer"
            aria-label="Status bar speed limit"
          >
            <option value="Unlimited">Unlimited</option>
            <option value="500 KB/s">500 KB/s</option>
            <option value="1 MB/s">1 MB/s</option>
            <option value="5 MB/s">5 MB/s</option>
            <option value="10 MB/s">10 MB/s</option>
            <option value="25 MB/s">25 MB/s</option>
            <option value="50 MB/s">50 MB/s</option>
          </select>
        </div>
      </div>
    </footer>
  );
};
