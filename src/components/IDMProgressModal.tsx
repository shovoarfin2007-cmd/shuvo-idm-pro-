import React from 'react';
import {
  X,
  Pause,
  Play,
  Square,
  FolderOpen,
  FileCheck,
  Download,
  Activity,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { DownloadItem } from '../types/idm';
import { formatBytes, formatSpeed, formatDuration } from '../utils/license';

interface IDMProgressModalProps {
  item: DownloadItem;
  onClose: () => void;
  onTogglePause: () => void;
  onCancel: () => void;
  onSaveToDisk: () => void;
  onOpenFolder: () => void;
}

export const IDMProgressModal: React.FC<IDMProgressModalProps> = ({
  item,
  onClose,
  onTogglePause,
  onCancel,
  onSaveToDisk,
  onOpenFolder,
}) => {
  const isCompleted = item.status === 'completed';
  const isPaused = item.status === 'paused';
  const isDownloading = item.status === 'downloading';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Window Title Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-xs">
              <Download className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-100 tracking-wide">
              {isCompleted ? 'Download Complete — Shuvo IDM' : 'Downloading Progress — Shuvo IDM Pro'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            title="Minimize to background tray"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 text-xs">
          {/* File details banner */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5 shadow-inner">
            <div className="flex items-start justify-between gap-2">
              <div className="font-bold text-sm text-white line-clamp-1">
                {item.name}
              </div>
              {item.resolution && (
                <span className="shrink-0 font-mono text-[10px] bg-blue-950 text-cyan-300 border border-blue-800 px-2 py-0.5 rounded-md font-semibold">
                  {item.resolution}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              URL: <span className="font-mono text-slate-300">{item.url}</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              Save To: <span className="font-mono text-emerald-400 font-medium">{item.savePath}</span>
            </div>
          </div>

          {/* Status Label */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Status:</span>
              {isCompleted ? (
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  Download Finished &amp; Checksum Verified!
                </span>
              ) : isPaused ? (
                <span className="font-bold text-amber-400">Download Paused</span>
              ) : isDownloading ? (
                <span className="font-bold text-sky-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  8 Multi-Thread Sockets Accelerating...
                </span>
              ) : (
                <span className="font-bold text-rose-400">Stopped / Cancelled</span>
              )}
            </div>
            <span className="font-mono font-bold text-slate-100 text-sm">
              {item.progress.toFixed(1)}%
            </span>
          </div>

          {/* Master Progress Bar */}
          <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-sm shadow-emerald-500/40'
                  : isPaused
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400'
              }`}
              style={{ width: `${Math.min(item.progress, 100)}%` }}
            />
          </div>

          {/* Multi-thread Segment Visualization (The signature IDM feature!) */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-slate-200">Connection Segments (8 Parallel Chunks)</span>
              </div>
              <span className="font-mono text-[10px] text-cyan-300">
                {isDownloading ? 'Active Dynamic Chunking' : isCompleted ? 'Merged 100%' : 'Idle'}
              </span>
            </div>

            {/* Visualizer bars for 8 parallel chunks */}
            <div className="grid grid-cols-8 gap-1.5 pt-1">
              {item.chunks && item.chunks.length > 0 ? (
                item.chunks.map((chk) => (
                  <div key={chk.id} className="space-y-1">
                    <div className="h-10 bg-slate-900 rounded-md border border-slate-800 overflow-hidden relative flex flex-col justify-end">
                      <div
                        className={`w-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : isPaused
                            ? 'bg-amber-500/70'
                            : 'bg-gradient-to-t from-blue-600 to-cyan-400'
                        }`}
                        style={{ height: `${chk.progress}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white drop-shadow">
                        {Math.floor(chk.progress)}%
                      </span>
                    </div>
                    <div className="text-[9px] text-center text-slate-500 font-mono">
                      T#{chk.id}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-8 text-center text-slate-500 py-2">
                  No segment telemetry available
                </div>
              )}
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
              <div className="text-slate-400 text-[11px]">Downloaded:</div>
              <div className="font-mono font-semibold text-slate-100">
                {formatBytes(item.downloadedBytes)} / {formatBytes(item.fileSize)}
              </div>
            </div>

            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
              <div className="text-slate-400 text-[11px]">Transfer Rate:</div>
              <div className="font-mono font-bold text-cyan-400">
                {isDownloading ? formatSpeed(item.speed) : isCompleted ? 'Completed' : '0 KB/s'}
              </div>
            </div>

            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
              <div className="text-slate-400 text-[11px]">Time Left (ETA):</div>
              <div className="font-mono font-semibold text-slate-200">
                {isDownloading ? formatDuration(item.eta) : isCompleted ? '0s (Finished)' : '-'}
              </div>
            </div>

            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
              <div className="text-slate-400 text-[11px]">Resume Capability:</div>
              <div className="font-mono font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Yes (Byte Ranges Supported)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between gap-2">
          {!isCompleted ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={onTogglePause}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
                    isPaused
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onCancel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Cancel / Stop</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all cursor-pointer"
              >
                Hide to Tray
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={onSaveToDisk}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save to PC</span>
                </button>
                <button
                  onClick={onOpenFolder}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Open Folder</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all cursor-pointer"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
