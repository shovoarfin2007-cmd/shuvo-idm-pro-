import React, { useState, useEffect } from 'react';
import {
  Video,
  Music,
  FileText,
  Package,
  Radio,
  File,
  Play,
  Pause,
  RotateCcw,
  Square,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckSquare,
  Square as EmptySquare,
  Copy,
  Info,
  Download,
  FolderOpen,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import { DownloadItem, DownloadCategory, DownloadStatus, DownloadPriority } from '../types/idm';
import { formatBytes, formatSpeed, formatDuration } from '../utils/license';
import { PRIORITY_LABELS } from '../utils/queue';

interface DownloadTableProps {
  downloads: DownloadItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onInspectItem: (item: DownloadItem) => void;
  onTogglePauseItem: (item: DownloadItem) => void;
  onStopItem: (item: DownloadItem) => void;
  onRedownloadItem: (item: DownloadItem) => void;
  onDeleteItem: (id: string) => void;
  onSaveToDisk: (item: DownloadItem) => void;
  onPasteAndDownload: () => void;
  onOpenFolder: () => void;
  onChangePriority: (id: string, priority: DownloadPriority) => void;
}

type SortField = 'name' | 'size' | 'status' | 'priority' | 'speed' | 'progress' | 'eta';
type SortOrder = 'asc' | 'desc';

export const DownloadTable: React.FC<DownloadTableProps> = ({
  downloads,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onInspectItem,
  onTogglePauseItem,
  onStopItem,
  onRedownloadItem,
  onDeleteItem,
  onSaveToDisk,
  onPasteAndDownload,
  onOpenFolder,
  onChangePriority,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('progress');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    item: DownloadItem | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });

  // Close context menu on external click
  useEffect(() => {
    const handleOutsideClick = () => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [contextMenu.visible]);

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredDownloads = downloads.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.resolution && d.resolution.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedDownloads = [...filteredDownloads].sort((a, b) => {
    let diff = 0;
    if (sortField === 'name') {
      diff = a.name.localeCompare(b.name);
    } else if (sortField === 'size') {
      diff = a.fileSize - b.fileSize;
    } else if (sortField === 'speed') {
      diff = a.speed - b.speed;
    } else if (sortField === 'progress') {
      diff = a.progress - b.progress;
    } else if (sortField === 'eta') {
      diff = a.eta - b.eta;
    } else if (sortField === 'status') {
      diff = a.status.localeCompare(b.status);
    } else if (sortField === 'priority') {
      const pMap = { high: 3, normal: 2, low: 1 };
      diff = (pMap[a.priority || 'normal'] || 2) - (pMap[b.priority || 'normal'] || 2);
    }
    return sortOrder === 'asc' ? diff : -diff;
  });

  const allSelected =
    sortedDownloads.length > 0 &&
    sortedDownloads.every((d) => selectedIds.includes(d.id));

  const handleRowContextMenu = (e: React.MouseEvent, item: DownloadItem) => {
    e.preventDefault();
    if (!selectedIds.includes(item.id)) {
      onToggleSelect(item.id);
    }
    setContextMenu({
      visible: true,
      x: Math.min(e.clientX, window.innerWidth - 230),
      y: Math.min(e.clientY, window.innerHeight - 340),
      item,
    });
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getCategoryIcon = (category: DownloadCategory) => {
    switch (category) {
      case 'videos':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'music':
        return <Music className="w-4 h-4 text-emerald-400" />;
      case 'documents':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'programs':
        return <Package className="w-4 h-4 text-cyan-400" />;
      case 'torrents':
        return <Radio className="w-4 h-4 text-purple-400" />;
      default:
        return <File className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: DownloadStatus) => {
    switch (status) {
      case 'downloading':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-950/80 text-sky-400 border border-sky-700/60 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            Downloading
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Paused
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Finished
          </span>
        );
      case 'stopped':
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Stopped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
            Queued
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-200 overflow-hidden relative">
      {/* Table search & filter header */}
      <div className="p-2.5 bg-slate-900/95 border-b border-slate-800/90 flex items-center justify-between gap-3 text-xs backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search downloads by file name, streaming link, or quality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2.5 text-slate-400">
          <span className="font-mono text-[11px]">
            Showing <strong className="text-slate-200">{sortedDownloads.length}</strong> items
          </span>
          {selectedIds.length > 0 && (
            <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-md text-[11px] font-medium shadow-xs">
              {selectedIds.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900/95 sticky top-0 z-10 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold backdrop-blur-sm">
            <tr>
              <th className="py-2.5 px-3 w-9 text-center">
                <button
                  onClick={allSelected ? onClearSelection : onSelectAll}
                  className="text-slate-400 hover:text-blue-400 focus:outline-none cursor-pointer"
                  title={allSelected ? 'Deselect all' : 'Select all'}
                  aria-label={allSelected ? 'Deselect all downloads' : 'Select all downloads'}
                >
                  {allSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                  ) : (
                    <EmptySquare className="w-3.5 h-3.5" />
                  )}
                </button>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-200 transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  <span>File Name</span>
                  {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('size')}
                className="py-2.5 px-3 w-24 cursor-pointer hover:text-slate-200 transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Size</span>
                  {sortField === 'size' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="py-2.5 px-3 w-28 text-center cursor-pointer hover:text-slate-200 transition-colors select-none"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Status</span>
                  {sortField === 'status' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('priority')}
                className="py-2.5 px-3 w-28 text-center cursor-pointer hover:text-slate-200 transition-colors select-none"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Priority</span>
                  {sortField === 'priority' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('speed')}
                className="py-2.5 px-3 w-28 text-right cursor-pointer hover:text-slate-200 transition-colors select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Rate</span>
                  {sortField === 'speed' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('progress')}
                className="py-2.5 px-3 w-44 cursor-pointer hover:text-slate-200 transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Progress &amp; 8 Threads</span>
                  {sortField === 'progress' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('eta')}
                className="py-2.5 px-3 w-24 text-center cursor-pointer hover:text-slate-200 transition-colors select-none"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>ETA</span>
                  {sortField === 'eta' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-2.5 px-3 w-36 text-center">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {sortedDownloads.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-20 text-center text-slate-500 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shadow-inner">
                    <Download className="w-7 h-7 text-cyan-500/60" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-300">No downloads matching criteria</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Click &quot;Add URL&quot; or &quot;Paste &amp; Download&quot; from the top toolbar to start grabbing videos, software, or files.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={onPasteAndDownload}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow transition-all cursor-pointer"
                    >
                      Paste &amp; Start
                    </button>
                    <button
                      onClick={onOpenFolder}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all border border-slate-700 cursor-pointer"
                    >
                      Open Output Folder
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              sortedDownloads.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    onContextMenu={(e) => handleRowContextMenu(e, item)}
                    onDoubleClick={() => onInspectItem(item)}
                    className={`group transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-950/40 hover:bg-blue-950/60'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelect(item.id);
                        }}
                        className="text-slate-500 hover:text-blue-400 focus:outline-none cursor-pointer"
                        aria-label={`Select ${item.name}`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <EmptySquare className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>

                    {/* File Name + Category */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5 max-w-sm xl:max-w-md">
                        <div className="shrink-0 p-1.5 rounded-lg bg-slate-900 border border-slate-800 shadow-xs">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 truncate mt-0.5">
                            {item.resolution && (
                              <span className="bg-slate-800 text-cyan-300 px-1.5 py-0.2 rounded font-mono font-medium">
                                {item.resolution}
                              </span>
                            )}
                            <span className="truncate">{item.url}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                      {formatBytes(item.fileSize)}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Priority Badge with 1-click toggle */}
                    <td className="py-2.5 px-3 text-center">
                      {(() => {
                        const pri = item.priority || 'normal';
                        const info = PRIORITY_LABELS[pri];
                        const nextPriority: DownloadPriority =
                          pri === 'high' ? 'normal' : pri === 'normal' ? 'low' : 'high';
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onChangePriority(item.id, nextPriority);
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border transition-all active:scale-95 cursor-pointer shadow-xs ${info.color}`}
                            title={`Priority: ${info.label} (${info.desc}) — Click to toggle priority`}
                          >
                            <span>{info.badge}</span>
                          </button>
                        );
                      })()}
                    </td>

                    {/* Speed / Transfer Rate */}
                    <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                      {item.status === 'downloading' ? (
                        <span className="text-cyan-400 font-bold tracking-tight">
                          {formatSpeed(item.speed)}
                        </span>
                      ) : (
                        <span className="text-slate-600">0 KB/s</span>
                      )}
                    </td>

                    {/* Progress Bar + Real-time 8-Thread Chunks Indicator */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-300 font-bold">{item.progress.toFixed(1)}%</span>
                          <span className="text-slate-500 text-[9px]">
                            {formatBytes(item.downloadedBytes)} / {formatBytes(item.fileSize)}
                          </span>
                        </div>

                        {/* Master Progress Bar */}
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex border border-slate-800 shadow-inner">
                          <div
                            className={`h-full transition-all duration-300 ${
                              item.status === 'completed'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/30'
                                : item.status === 'paused'
                                ? 'bg-amber-500'
                                : item.status === 'downloading'
                                ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(item.progress, 100)}%` }}
                          />
                        </div>

                        {/* Mini 8-Segment Chunk Preview Grid (Signature IDM visual!) */}
                        {item.status === 'downloading' && item.chunks && item.chunks.length > 0 && (
                          <div className="grid grid-cols-8 gap-0.5 pt-0.5">
                            {item.chunks.map((chk) => (
                              <div
                                key={chk.id}
                                className="h-1 bg-slate-900 rounded-xs overflow-hidden border border-slate-800/80"
                                title={`Thread #${chk.id}: ${Math.floor(chk.progress)}%`}
                              >
                                <div
                                  className="h-full bg-cyan-400 transition-all duration-300"
                                  style={{ width: `${chk.progress}%` }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ETA */}
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-400">
                      {item.status === 'downloading' ? (
                        formatDuration(item.eta)
                      ) : item.status === 'completed' ? (
                        <span className="text-emerald-400 font-medium">Done</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Quick Row Action Buttons */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Pause / Resume */}
                        {item.status === 'downloading' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePauseItem(item);
                            }}
                            className="p-1.5 rounded-lg bg-amber-950/80 text-amber-300 hover:bg-amber-900 border border-amber-800 transition-all cursor-pointer"
                            title="Pause Download"
                            aria-label={`Pause ${item.name}`}
                          >
                            <Pause className="w-3 h-3" />
                          </button>
                        ) : item.status === 'paused' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePauseItem(item);
                            }}
                            className="p-1.5 rounded-lg bg-sky-950/80 text-sky-300 hover:bg-sky-900 border border-sky-800 transition-all cursor-pointer"
                            title="Resume Download"
                            aria-label={`Resume ${item.name}`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRedownloadItem(item);
                            }}
                            className="p-1.5 rounded-lg bg-slate-850 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                            title="Re-download"
                            aria-label={`Re-download ${item.name}`}
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}

                        {/* Open / Inspect */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectItem(item);
                          }}
                          className="p-1.5 rounded-lg bg-blue-950/80 text-blue-300 hover:bg-blue-900 border border-blue-800 transition-all cursor-pointer"
                          title="Open Live IDM Multi-Thread Progress Dialog"
                          aria-label={`Inspect ${item.name}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>

                        {/* Save to Disk (if completed) */}
                        {item.status === 'completed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSaveToDisk(item);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 transition-all cursor-pointer shadow-xs"
                            title="Save verified file to PC disk"
                            aria-label={`Save ${item.name} to disk`}
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 text-slate-500 hover:text-rose-400 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-800 transition-all cursor-pointer"
                          title="Delete from list"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Shuvo Watermark badge pinned to bottom right of table */}
      <div className="absolute right-4 bottom-4 pointer-events-auto shadow-2xl z-20">
        <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">
            <span className="text-emerald-400">SM Shuvo</span>
            <span className="text-slate-500 mx-1.5">|</span>
            <a
              href="tel:01997966529"
              className="text-cyan-300 font-mono hover:text-cyan-200 hover:underline"
              title="Call Developer SM Shuvo"
            >
              01997966529
            </a>
          </span>
        </div>
      </div>

      {/* IDM Desktop Style Context Menu */}
      {contextMenu.visible && contextMenu.item && (
        <div
          className="fixed z-50 w-56 bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl py-1 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-800 truncate">
            {contextMenu.item.name}
          </div>

          <button
            onClick={() => {
              onInspectItem(contextMenu.item!);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white text-left transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Progress Window</span>
          </button>

          <button
            onClick={() => {
              handleCopyUrl(contextMenu.item!.url, contextMenu.item!.id);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white text-left transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Copy Download Link</span>
          </button>

          <button
            onClick={() => {
              onOpenFolder();
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white text-left transition-colors cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Output Folder</span>
          </button>

          {contextMenu.item.status === 'completed' && (
            <button
              onClick={() => {
                onSaveToDisk(contextMenu.item!);
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white text-left transition-colors text-emerald-400 font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save File to PC</span>
            </button>
          )}

          <div className="h-[1px] bg-slate-800 my-1" />

          <button
            onClick={() => {
              onTogglePauseItem(contextMenu.item!);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white text-left transition-colors cursor-pointer"
          >
            {contextMenu.item.status === 'downloading' ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pause Download</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-sky-400" />
                <span>Resume Download</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onStopItem(contextMenu.item!);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white text-left transition-colors text-rose-400 cursor-pointer"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Stop Download</span>
          </button>

          <button
            onClick={() => {
              onRedownloadItem(contextMenu.item!);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white text-left transition-colors text-amber-400 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-download</span>
          </button>

          <div className="h-[1px] bg-slate-800 my-1" />

          {/* Queue Priority Selection */}
          <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">
            Set Queue Priority
          </div>

          <button
            onClick={() => {
              onChangePriority(contextMenu.item!.id, 'high');
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-800 text-left transition-colors cursor-pointer ${
              (contextMenu.item.priority || 'normal') === 'high'
                ? 'text-rose-400 font-bold bg-rose-950/30'
                : 'text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>🔥</span> High Priority (3.0x)
            </span>
            {(contextMenu.item.priority || 'normal') === 'high' && <span>✓</span>}
          </button>

          <button
            onClick={() => {
              onChangePriority(contextMenu.item!.id, 'normal');
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-800 text-left transition-colors cursor-pointer ${
              (contextMenu.item.priority || 'normal') === 'normal'
                ? 'text-cyan-400 font-bold bg-cyan-950/30'
                : 'text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>⚡</span> Normal Priority (1.5x)
            </span>
            {(contextMenu.item.priority || 'normal') === 'normal' && <span>✓</span>}
          </button>

          <button
            onClick={() => {
              onChangePriority(contextMenu.item!.id, 'low');
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-800 text-left transition-colors cursor-pointer ${
              (contextMenu.item.priority || 'normal') === 'low'
                ? 'text-slate-300 font-bold bg-slate-800/40'
                : 'text-slate-400'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>💤</span> Low Priority (0.6x)
            </span>
            {(contextMenu.item.priority || 'normal') === 'low' && <span>✓</span>}
          </button>

          <div className="h-[1px] bg-slate-800 my-1" />

          <button
            onClick={() => {
              onDeleteItem(contextMenu.item!.id);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-600 hover:text-white text-left transition-colors text-rose-400 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Item</span>
          </button>
        </div>
      )}
    </div>
  );
};
