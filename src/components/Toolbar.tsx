import React from 'react';
import {
  Plus,
  ClipboardPaste,
  Layers,
  KeyRound,
  Square,
  RotateCcw,
  Trash2,
  Eraser,
  FolderOpen,
  FolderCog,
  Gauge,
  Webhook,
  Globe,
  ListOrdered,
  Sparkles,
  Package,
} from 'lucide-react';
import { ProxyConfig } from '../types/idm';

interface ToolbarProps {
  onAddUrl: () => void;
  onPasteAndDownload: () => void;
  onMultiLink: () => void;
  onActivateKey: () => void;
  onStopSelected: () => void;
  onRedownloadSelected: () => void;
  onDeleteSelected: () => void;
  onClearAll: () => void;
  onOpenFolder: () => void;
  onChangeFolder: () => void;
  onOpenApiModal: () => void;
  onOpenProxyModal: () => void;
  onOpenSmartQueue: () => void;
  onOpenSoftwareBuilder: () => void;
  activeQueueCount: number;
  maxConcurrent: number;
  queueEnabled: boolean;
  proxyConfig: ProxyConfig;
  hasSelection: boolean;
  saveFolder: string;
  speedLimit: string;
  onChangeSpeedLimit: (limit: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddUrl,
  onPasteAndDownload,
  onMultiLink,
  onActivateKey,
  onStopSelected,
  onRedownloadSelected,
  onDeleteSelected,
  onClearAll,
  onOpenFolder,
  onChangeFolder,
  onOpenApiModal,
  onOpenProxyModal,
  onOpenSmartQueue,
  onOpenSoftwareBuilder,
  activeQueueCount,
  maxConcurrent,
  queueEnabled,
  proxyConfig,
  hasSelection,
  saveFolder,
  speedLimit,
  onChangeSpeedLimit,
}) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/90 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-inner">
      {/* Primary Actions Group */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Make .EXE Software Builder Button */}
        <button
          onClick={onOpenSoftwareBuilder}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 border border-emerald-400/40 transition-all active:scale-95 cursor-pointer ring-1 ring-emerald-400/30"
          title="Make into Standalone Windows .EXE Software or Install on Desktop"
        >
          <Package className="w-3.5 h-3.5" />
          <span>Make Software (.EXE)</span>
        </button>
        <button
          onClick={onAddUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 border border-blue-400/30 transition-all active:scale-95 cursor-pointer"
          title="Add single URL to download"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add URL</span>
        </button>

        <button
          onClick={onPasteAndDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-md shadow-sky-600/20 border border-cyan-400/30 transition-all active:scale-95 cursor-pointer"
          title="Paste URL from clipboard & start immediately"
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          <span>Paste &amp; Download</span>
        </button>

        <button
          onClick={onMultiLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-purple-600/20 border border-purple-400/30 transition-all active:scale-95 cursor-pointer"
          title="Batch download multiple URLs simultaneously"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Multi-Link</span>
        </button>

        <button
          onClick={onActivateKey}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold text-xs shadow-md shadow-amber-600/20 border border-amber-400/30 transition-all active:scale-95 cursor-pointer"
          title="Activate License Key"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Activate Key</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        {/* Selected Items Controls */}
        <button
          onClick={onStopSelected}
          disabled={!hasSelection}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            hasSelection
              ? 'bg-rose-700 hover:bg-rose-600 text-white cursor-pointer active:scale-95 shadow-sm border border-rose-500/40'
              : 'bg-slate-900/60 text-slate-600 cursor-not-allowed border border-slate-800/60'
          }`}
          title="Stop selected active download"
        >
          <Square className="w-3 h-3 fill-current" />
          <span>Stop</span>
        </button>

        <button
          onClick={onRedownloadSelected}
          disabled={!hasSelection}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            hasSelection
              ? 'bg-amber-700 hover:bg-amber-600 text-white cursor-pointer active:scale-95 shadow-sm border border-amber-500/40'
              : 'bg-slate-900/60 text-slate-600 cursor-not-allowed border border-slate-800/60'
          }`}
          title="Re-download selected file"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Re-download</span>
        </button>

        <button
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            hasSelection
              ? 'bg-red-800 hover:bg-red-700 text-white cursor-pointer active:scale-95 shadow-sm border border-red-600/40'
              : 'bg-slate-900/60 text-slate-600 cursor-not-allowed border border-slate-800/60'
          }`}
          title="Delete selected from list"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete</span>
        </button>

        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all active:scale-95 border border-slate-700 shadow-xs cursor-pointer"
          title="Clear all completed or inactive downloads"
        >
          <Eraser className="w-3 h-3 text-slate-400" />
          <span>Clear All</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1 hidden md:block" />

        <button
          onClick={onOpenApiModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition-all border border-cyan-800/50 cursor-pointer shadow-xs"
          title="Browser Extension Flask API Server (Port 5000)"
        >
          <Webhook className="w-3 h-3 text-cyan-400" />
          <span className="hidden xl:inline">Flask API</span>
        </button>

        <button
          onClick={onOpenProxyModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer shadow-xs ${
            proxyConfig.enabled
              ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300 hover:bg-cyan-900 shadow-cyan-950/50'
              : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title={
            proxyConfig.enabled
              ? `Proxy Active: ${proxyConfig.protocol.toUpperCase()}://${proxyConfig.host}:${proxyConfig.port} (${proxyConfig.status})`
              : 'Configure HTTP/SOCKS Proxy Tunnel'
          }
        >
          <Globe
            className={`w-3.5 h-3.5 ${
              proxyConfig.enabled ? 'text-cyan-400 animate-pulse' : 'text-slate-400'
            }`}
          />
          <span>Proxy</span>
          {proxyConfig.enabled && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                proxyConfig.status === 'connected' ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}
            />
          )}
        </button>

        <button
          onClick={onOpenSmartQueue}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer shadow-xs ${
            queueEnabled
              ? 'bg-indigo-950/90 border-indigo-500 text-indigo-300 hover:bg-indigo-900 shadow-indigo-950/50'
              : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title={`Smart Queue: ${queueEnabled ? 'Active' : 'Disabled'} (${activeQueueCount}/${maxConcurrent} active slots)`}
        >
          <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
          <span>Smart Queue</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-900/80 text-indigo-200 border border-indigo-700/50">
            {activeQueueCount}/{maxConcurrent}
          </span>
        </button>
      </div>

      {/* Right Controls: Folder & Speed limiter */}
      <div className="flex items-center gap-2 text-xs">
        {/* Speed limiter */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300 shadow-inner">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] text-slate-400 hidden xl:inline">Speed:</span>
          <select
            value={speedLimit}
            onChange={(e) => onChangeSpeedLimit(e.target.value)}
            className="bg-transparent text-cyan-300 font-mono text-xs focus:outline-none cursor-pointer pr-1"
            aria-label="Download Speed Limit"
          >
            <option value="Unlimited" className="bg-slate-900 text-slate-200">Unlimited (Max)</option>
            <option value="500 KB/s" className="bg-slate-900 text-slate-200">500 KB/s (Economy)</option>
            <option value="1 MB/s" className="bg-slate-900 text-slate-200">1 MB/s</option>
            <option value="5 MB/s" className="bg-slate-900 text-slate-200">5 MB/s</option>
            <option value="10 MB/s" className="bg-slate-900 text-slate-200">10 MB/s</option>
            <option value="25 MB/s" className="bg-slate-900 text-slate-200">25 MB/s (Turbo)</option>
            <option value="50 MB/s" className="bg-slate-900 text-slate-200">50 MB/s (Extreme)</option>
          </select>
        </div>

        {/* Folder management */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenFolder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium transition-all active:scale-95 shadow-md shadow-emerald-700/20 border border-emerald-500/40 cursor-pointer"
            title="Open default download folder location"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Open Folder</span>
          </button>
          <button
            onClick={onChangeFolder}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title={`Change download directory (Current: ${saveFolder})`}
            aria-label="Change download folder location"
          >
            <FolderCog className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
