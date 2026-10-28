import React, { useState } from 'react';
import {
  X,
  Video,
  Music,
  CheckCircle,
  Image as ImageIcon,
  Cpu,
  DownloadCloud,
  FileCode,
} from 'lucide-react';

interface FormatResolutionModalProps {
  initialUrl?: string;
  onClose: () => void;
  onConfirm: (options: {
    url: string;
    fileName: string;
    formatType: 'video' | 'audio' | 'file';
    resolution: string;
    downloadThumbnail: boolean;
    threads: number;
    startNow: boolean;
  }) => void;
}

export const FormatResolutionModal: React.FC<FormatResolutionModalProps> = ({
  initialUrl = '',
  onClose,
  onConfirm,
}) => {
  const [url, setUrl] = useState(initialUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  
  // Compute default filename based on URL
  const deriveFileName = (testUrl: string, type: 'video' | 'audio' | 'file') => {
    try {
      const parts = testUrl.split('/');
      const last = parts[parts.length - 1].split('?')[0];
      if (last && last.includes('.')) return last;
      if (type === 'audio') return 'Audio_Track_320kbps.mp3';
      return 'Video_Download_1080p.mp4';
    } catch {
      return type === 'audio' ? 'Audio_Download.mp3' : 'Video_Download.mp4';
    }
  };

  const [formatType, setFormatType] = useState<'video' | 'audio' | 'file'>('video');
  const [resolution, setResolution] = useState('1080p (FHD)');
  const [downloadThumbnail, setDownloadThumbnail] = useState(true);
  const [threads, setThreads] = useState(8);
  const [fileName, setFileName] = useState(() => deriveFileName(url, 'video'));

  const isVideoUrl = /youtube|youtu\.be|facebook|fb\.watch|instagram|tiktok|vimeo/i.test(url);

  const handleFormatChange = (type: 'video' | 'audio' | 'file') => {
    setFormatType(type);
    if (type === 'audio') {
      setFileName((prev) => prev.replace(/\.[^/.]+$/, '') + '.mp3');
    } else if (type === 'video') {
      setFileName((prev) => prev.replace(/\.[^/.]+$/, '') + '.mp4');
    }
  };

  const handleSubmit = (startNow: boolean) => {
    if (!url.trim()) return;
    onConfirm({
      url: url.trim(),
      fileName: fileName.trim() || 'Downloaded_Media.mp4',
      formatType,
      resolution,
      downloadThumbnail,
      threads,
      startNow,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-800 px-4 py-2.5 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DownloadCloud className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-100">
              Download Options & Resolution - Shuvo IDM
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Target URL */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium flex items-center justify-between">
              <span>Target URL:</span>
              {isVideoUrl && (
                <span className="text-[10px] text-cyan-400 font-mono">
                  ✓ Streaming Video Detected
                </span>
              )}
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setFileName(deriveFileName(e.target.value, formatType));
              }}
              placeholder="Paste link: https://youtube.com/watch?v=..."
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Target File Name */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Save As File Name:</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Download Format Radio selection */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Download Format:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFormatChange('video')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                  formatType === 'video'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium'
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Video className="w-4 h-4 text-rose-400" />
                <div>
                  <div className="font-semibold">Video (MP4)</div>
                  <div className="text-[10px] text-slate-400">High-definition audio & video</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFormatChange('audio')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                  formatType === 'audio'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-medium'
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Music className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold">Audio Only (MP3)</div>
                  <div className="text-[10px] text-slate-400">Extract 320kbps audio</div>
                </div>
              </button>
            </div>
          </div>

          {/* Resolution Dropdown (if video) */}
          {formatType === 'video' && (
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Video Resolution Quality:</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Best Available (4K/2K/1080p)">Best Available (4K / 2K / 1080p)</option>
                <option value="2160p (4K)">2160p (4K Ultra HD)</option>
                <option value="1440p (2K)">1440p (2K Quad HD)</option>
                <option value="1080p (FHD)">1080p (Full HD - Recommended)</option>
                <option value="720p (HD)">720p (HD Ready)</option>
                <option value="480p">480p (Standard Definition)</option>
                <option value="360p">360p (Low Bandwidth)</option>
              </select>
            </div>
          )}

          {/* Advanced options: Thumbnail & Parallel Threads */}
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/60 space-y-2">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={downloadThumbnail}
                onChange={(e) => setDownloadThumbnail(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-0 focus:outline-none cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                Also Download Video Thumbnail (JPG)
              </span>
            </label>

            <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-700/60">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Max Parallel Connections:
              </span>
              <select
                value={threads}
                onChange={(e) => setThreads(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-cyan-300 font-mono text-xs"
              >
                <option value={4}>4 Threads</option>
                <option value={8}>8 Threads (Optimal)</option>
                <option value={16}>16 Threads (High Speed)</option>
                <option value={32}>32 Threads (Extreme Turbo)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/90 px-4 py-3 border-t border-slate-700 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-all"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-all"
            >
              Add to Queue
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all shadow-md active:scale-95"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Start Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
