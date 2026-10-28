import React from 'react';
import {
  X,
  ListOrdered,
  Cpu,
  Zap,
  Flame,
  Clock,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  Sliders,
  Gauge,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { DownloadItem, DownloadPriority, QueueSettings } from '../types/idm';
import { PRIORITY_LABELS, formatBytes } from '../utils/queue';

interface SmartQueueModalProps {
  settings: QueueSettings;
  downloads: DownloadItem[];
  onClose: () => void;
  onUpdateSettings: (settings: QueueSettings) => void;
  onChangePriority: (id: string, priority: DownloadPriority) => void;
  onStartQueuedNow: (id: string) => void;
  onPauseItem: (item: DownloadItem) => void;
}

export const SmartQueueModal: React.FC<SmartQueueModalProps> = ({
  settings,
  downloads,
  onClose,
  onUpdateSettings,
  onChangePriority,
  onStartQueuedNow,
  onPauseItem,
}) => {
  const [localSettings, setLocalSettings] = React.useState<QueueSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const activeDownloads = downloads.filter((d) => d.status === 'downloading');
  const queuedDownloads = downloads.filter((d) => d.status === 'queued');
  const pausedDownloads = downloads.filter((d) => d.status === 'paused');

  // Combined queue list: active first, then queued sorted by priority
  const queueList = [
    ...activeDownloads,
    ...queuedDownloads,
    ...pausedDownloads,
  ];

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/40 rounded-lg text-indigo-400">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Smart Queue &amp; Background Thread Scheduler</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                  IDM Pro Feature
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated multi-slot concurrency limiter with priority-weighted bandwidth balancing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close Smart Queue window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Top Live Telemetry Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Metric 1 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                  Active Concurrency
                </div>
                <div className="text-lg font-mono font-bold text-cyan-300 mt-0.5">
                  {activeDownloads.length} / {localSettings.maxConcurrent}{' '}
                  <span className="text-xs font-normal text-slate-500">slots</span>
                </div>
              </div>
              <div className="p-2 bg-cyan-950/40 border border-cyan-800/50 rounded-md text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                  Background Threads
                </div>
                <div className="text-lg font-mono font-bold text-indigo-300 mt-0.5">
                  {activeDownloads.length * 8}{' '}
                  <span className="text-xs font-normal text-slate-500">live sockets</span>
                </div>
              </div>
              <div className="p-2 bg-indigo-950/40 border border-indigo-800/50 rounded-md text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                  Waiting in Queue
                </div>
                <div className="text-lg font-mono font-bold text-amber-300 mt-0.5">
                  {queuedDownloads.length}{' '}
                  <span className="text-xs font-normal text-slate-500">tasks</span>
                </div>
              </div>
              <div className="p-2 bg-amber-950/40 border border-amber-800/50 rounded-md text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Scheduler Settings Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-slate-200">
                  Scheduler Parameters
                </span>
              </div>
              {/* Enable / Disable Switch */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs text-slate-300 font-medium">
                  {localSettings.enabled ? 'Queue Active' : 'Queue Suspended'}
                </span>
                <input
                  type="checkbox"
                  checked={localSettings.enabled}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, enabled: e.target.checked })
                  }
                  className="sr-only"
                />
                <div
                  className={`w-9 h-5 rounded-full transition-colors p-0.5 ${
                    localSettings.enabled ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      localSettings.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Max Concurrent Downloads */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-slate-300">
                    Max Concurrent Downloads
                  </label>
                  <span className="font-mono text-indigo-300 font-bold px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                    {localSettings.maxConcurrent} active
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={localSettings.maxConcurrent}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      maxConcurrent: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1 (Strict Sequential)</span>
                  <span>2 (Recommended)</span>
                  <span>4</span>
                  <span>6 (Max)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Limits the total background download threads to{' '}
                  <strong className="text-slate-300">
                    {localSettings.maxConcurrent * 8} connections
                  </strong>
                  , saving system CPU and router sockets.
                </p>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {/* Auto Promote */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.autoPromote}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        autoPromote: e.target.checked,
                      })
                    }
                    className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium text-slate-200">
                      Auto-Start Next Queued Item
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      When an active download finishes or is paused, immediately allocate its slot
                      to the highest-priority item waiting in queue.
                    </p>
                  </div>
                </label>

                {/* Dynamic Bandwidth Weights */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.dynamicBandwidthAllocation}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        dynamicBandwidthAllocation: e.target.checked,
                      })
                    }
                    className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium text-slate-200">
                      Priority Bandwidth Acceleration
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Allocate <strong>3.0x</strong> socket bandwidth weight to High priority,{' '}
                      <strong>1.5x</strong> to Normal, and <strong>0.6x</strong> to Low priority.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Queue Tasks Management Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Managed Tasks &amp; Priority Ranking ({queueList.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Click priority badge to elevate task position
              </span>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center">#</th>
                    <th className="py-2 px-3">Download Name</th>
                    <th className="py-2 px-3 w-24">Size</th>
                    <th className="py-2 px-3 w-28 text-center">Status</th>
                    <th className="py-2 px-3 w-36 text-center">Priority Level</th>
                    <th className="py-2 px-3 w-24 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {queueList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No active or queued downloads at this moment.
                      </td>
                    </tr>
                  ) : (
                    queueList.map((item, idx) => {
                      const priority = item.priority || 'normal';
                      const pInfo = PRIORITY_LABELS[priority];
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-900/50 transition-colors"
                        >
                          <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-medium text-slate-200 truncate max-w-xs">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-xs">
                              {item.url}
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-300 text-[11px]">
                            {formatBytes(item.fileSize)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {item.status === 'downloading' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-400 bg-sky-950 px-2 py-0.5 rounded-full border border-sky-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                                Active
                              </span>
                            ) : item.status === 'queued' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">
                                Queued
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                                Paused
                              </span>
                            )}
                          </td>
                          {/* Priority Switcher */}
                          <td className="py-2 px-3 text-center">
                            <select
                              value={priority}
                              onChange={(e) =>
                                onChangePriority(item.id, e.target.value as DownloadPriority)
                              }
                              className={`text-[11px] font-semibold rounded px-2 py-1 border cursor-pointer focus:outline-none transition-colors ${pInfo.color}`}
                              aria-label={`Change priority for ${item.name}`}
                            >
                              <option value="high" className="bg-slate-900 text-rose-300">
                                🔥 High (3.0x Weight)
                              </option>
                              <option value="normal" className="bg-slate-900 text-cyan-300">
                                ⚡ Normal (1.5x Weight)
                              </option>
                              <option value="low" className="bg-slate-900 text-slate-400">
                                💤 Low (0.6x Weight)
                              </option>
                            </select>
                          </td>
                          {/* Row Actions */}
                          <td className="py-2 px-3 text-center">
                            {item.status === 'downloading' ? (
                              <button
                                onClick={() => onPauseItem(item)}
                                className="p-1 rounded bg-amber-950/80 text-amber-300 hover:bg-amber-900 border border-amber-800 transition-colors"
                                title="Pause task"
                                aria-label={`Pause ${item.name}`}
                              >
                                <Pause className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => onStartQueuedNow(item.id)}
                                className="p-1 rounded bg-sky-950/80 text-sky-300 hover:bg-sky-900 border border-sky-800 transition-colors"
                                title="Start immediately (Bypass queue)"
                                aria-label={`Start ${item.name} now`}
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Settings Applied Successfully
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Apply Queue Rules</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
