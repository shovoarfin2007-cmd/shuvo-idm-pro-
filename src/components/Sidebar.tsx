import React, { useState } from 'react';
import {
  Folder,
  Video,
  Music,
  FileText,
  Package,
  Radio,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  XCircle,
  HardDrive,
  UserCheck,
  Phone,
  MessageCircle,
  KeyRound,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { DownloadCategory, DownloadItem, DownloadStatus } from '../types/idm';
import { formatBytes } from '../utils/license';

interface SidebarProps {
  selectedCategory: DownloadCategory;
  onSelectCategory: (cat: DownloadCategory) => void;
  statusFilter: DownloadStatus | 'all';
  onSelectStatusFilter: (status: DownloadStatus | 'all') => void;
  downloads: DownloadItem[];
  saveFolder: string;
  onContactClick: () => void;
  onKeygenClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  statusFilter,
  onSelectStatusFilter,
  downloads,
  saveFolder,
  onContactClick,
  onKeygenClick,
}) => {
  const [copiedPath, setCopiedPath] = useState(false);

  // Compute counts
  const categoryCounts = {
    all: downloads.length,
    videos: downloads.filter((d) => d.category === 'videos').length,
    music: downloads.filter((d) => d.category === 'music').length,
    documents: downloads.filter((d) => d.category === 'documents').length,
    programs: downloads.filter((d) => d.category === 'programs').length,
    torrents: downloads.filter((d) => d.category === 'torrents').length,
  };

  const statusCounts = {
    downloading: downloads.filter((d) => d.status === 'downloading').length,
    queued: downloads.filter((d) => d.status === 'queued').length,
    paused: downloads.filter((d) => d.status === 'paused').length,
    completed: downloads.filter((d) => d.status === 'completed').length,
    failed: downloads.filter((d) => d.status === 'failed' || d.status === 'stopped').length,
  };

  const totalBytesDownloaded = downloads.reduce((acc, curr) => acc + curr.downloadedBytes, 0);

  const categories: { id: DownloadCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'all', label: 'All Downloads', icon: <Folder className="w-4 h-4" />, color: 'text-blue-400' },
    { id: 'videos', label: 'Videos & Reels', icon: <Video className="w-4 h-4" />, color: 'text-rose-400' },
    { id: 'music', label: 'Music & Audio', icon: <Music className="w-4 h-4" />, color: 'text-emerald-400' },
    { id: 'documents', label: 'Documents & Books', icon: <FileText className="w-4 h-4" />, color: 'text-amber-400' },
    { id: 'programs', label: 'Programs & ZIPs', icon: <Package className="w-4 h-4" />, color: 'text-cyan-400' },
    { id: 'torrents', label: 'Torrents & Feeds', icon: <Radio className="w-4 h-4" />, color: 'text-purple-400' },
  ];

  const handleCopySavePath = () => {
    navigator.clipboard.writeText(saveFolder);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 select-none text-xs backdrop-blur-sm">
      <div className="overflow-y-auto p-3 space-y-4">
        {/* Categories Section */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
            <span>Categories</span>
            <span className="text-[10px] text-slate-500 font-mono font-normal">
              {downloads.length} items
            </span>
          </div>
          <div className="space-y-1">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id && statusFilter === 'all';
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onSelectStatusFilter('all');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600/25 text-blue-200 font-semibold border border-blue-500/40 shadow-xs'
                      : 'hover:bg-slate-900/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cat.color}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      active ? 'bg-blue-500 text-white font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {categoryCounts[cat.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Filters */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Queue Status
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectStatusFilter('downloading')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'downloading'
                  ? 'bg-sky-600/25 text-sky-200 font-semibold border border-sky-500/40 shadow-xs'
                  : 'hover:bg-slate-900/80 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-sky-400 animate-pulse" />
                <span>Active Downloading</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-semibold">
                {statusCounts.downloading}
              </span>
            </button>

            <button
              onClick={() => onSelectStatusFilter('queued')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'queued'
                  ? 'bg-indigo-600/25 text-indigo-200 font-semibold border border-indigo-500/40 shadow-xs'
                  : 'hover:bg-slate-900/80 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Queued (Smart Queue)</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                {statusCounts.queued}
              </span>
            </button>

            <button
              onClick={() => onSelectStatusFilter('paused')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'paused'
                  ? 'bg-amber-600/25 text-amber-200 font-semibold border border-amber-500/40 shadow-xs'
                  : 'hover:bg-slate-900/80 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <PauseCircle className="w-4 h-4 text-amber-400" />
                <span>Paused Tasks</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold">
                {statusCounts.paused}
              </span>
            </button>

            <button
              onClick={() => onSelectStatusFilter('completed')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600/25 text-emerald-200 font-semibold border border-emerald-500/40 shadow-xs'
                  : 'hover:bg-slate-900/80 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Completed Files</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                {statusCounts.completed}
              </span>
            </button>

            <button
              onClick={() => onSelectStatusFilter('failed')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'failed'
                  ? 'bg-rose-600/25 text-rose-200 font-semibold border border-rose-500/40 shadow-xs'
                  : 'hover:bg-slate-900/80 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Stopped / Cancelled</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-semibold">
                {statusCounts.failed}
              </span>
            </button>
          </div>
        </div>

        {/* Disk & Storage Info */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-200">Local Download Storage</span>
            </div>
            <button
              onClick={handleCopySavePath}
              className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5 rounded cursor-pointer"
              title="Copy output folder path"
              aria-label="Copy folder path"
            >
              {copiedPath ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex justify-between items-baseline text-[11px]">
            <span className="text-slate-400">Total Downloaded:</span>
            <span className="font-mono text-cyan-300 font-bold text-xs">
              {formatBytes(totalBytesDownloaded)}
            </span>
          </div>

          {/* Simulated disk bar */}
          <div className="space-y-1 pt-0.5">
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full w-[42%]" />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>Drive C: 284 GB free</span>
              <span>512 GB SSD</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 truncate pt-1 border-t border-slate-800/80" title={saveFolder}>
            Path: <span className="font-mono text-slate-300">{saveFolder}</span>
          </div>
        </div>
      </div>

      {/* Bottom Shuvo Bhai Watermark & Contact Card */}
      <div className="p-3 border-t border-slate-800/90 bg-slate-950/95 space-y-2">
        <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/40 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-xs">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>SM Shuvo Official</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <p className="text-[10px] text-slate-300 leading-relaxed mb-2">
            Developed &amp; Maintained by <strong className="text-white font-medium">SM Shuvo</strong>. For license key or full version, contact:
          </p>

          <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-800/90">
            <a
              href="tel:01997966529"
              className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 hover:text-cyan-200 transition-colors"
              title="Call SM Shuvo"
            >
              <Phone className="w-3 h-3 text-cyan-400" />
              <span>01997966529</span>
            </a>
            <a
              href="https://wa.me/8801997966529?text=Assalamu%20Alaikum%20Shuvo%20Bhai,%20I%20need%20a%20license%20key%20for%20Shuvo%20IDM%20Pro"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[10px] font-medium border border-emerald-500/50 transition-all cursor-pointer"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          </div>

          <button
            onClick={onKeygenClick}
            className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 border border-purple-600/50 text-purple-200 text-[10px] font-semibold transition-all cursor-pointer shadow-xs active:scale-98"
            title="Open Author Standalone Keygen Portal (SM Shuvo Only)"
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            <span>Author Keygen Software</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
