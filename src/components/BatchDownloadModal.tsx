import React, { useState } from 'react';
import { X, Layers, Link as LinkIcon, Sparkles, Check, Clipboard } from 'lucide-react';

interface BatchDownloadModalProps {
  onClose: () => void;
  onStartBatch: (urls: string[], defaultFormat: 'video' | 'audio' | 'auto') => void;
}

export const BatchDownloadModal: React.FC<BatchDownloadModalProps> = ({
  onClose,
  onStartBatch,
}) => {
  const [rawText, setRawText] = useState('');
  const [defaultFormat, setDefaultFormat] = useState<'video' | 'audio' | 'auto'>('auto');

  // Parse valid URLs
  const lines = rawText.split('\n');
  const validUrls = lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith('http://') || l.startsWith('https://'));

  const handleLoadSample = (sampleType: 'videos' | 'software' | 'audio') => {
    if (sampleType === 'videos') {
      setRawText(
        `https://www.youtube.com/watch?v=M7FIvfx5J10\nhttps://www.youtube.com/watch?v=kJQP7kiw5Fk\nhttps://www.youtube.com/watch?v=fJ9rUzIMcZQ\nhttps://www.facebook.com/watch/?v=mock_fb_reel_2026`
      );
      setDefaultFormat('video');
    } else if (sampleType === 'audio') {
      setRawText(
        `https://soundcloud.com/artist/bengali-folk-acoustic-remix\nhttps://music.youtube.com/watch?v=habib_special_2026\nhttps://open.spotify.com/track/mock_track_320kbps`
      );
      setDefaultFormat('audio');
    } else {
      setRawText(
        `https://nodejs.org/dist/v22.0.0/node-v22.0.0-x64.msi\nhttps://download.visualstudio.microsoft.com/download/pr/vcredist_x64.exe\nhttps://7-zip.org/a/7z2401-x64.exe`
      );
      setDefaultFormat('auto');
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawText((prev) => (prev ? `${prev}\n${text}` : text));
      }
    } catch {
      // Browser permissions may restrict clipboard
    }
  };

  const handleStart = () => {
    if (validUrls.length === 0) return;
    onStartBatch(validUrls, defaultFormat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-800 px-4 py-2.5 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-100">
              Multi-Link Batch Downloader - Shuvo Edition
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
        <div className="p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Paste Multiple Links (One URL per line):</span>
            </label>
            <button
              onClick={handlePasteClipboard}
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition-colors"
            >
              <Clipboard className="w-3 h-3" />
              <span>Paste from Clipboard</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=...&#10;https://example.com/files/archive.zip&#10;https://facebook.com/video/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 leading-relaxed"
            />
          </div>

          {/* Quick Presets & Format Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">Presets:</span>
              <button
                type="button"
                onClick={() => handleLoadSample('videos')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px]"
              >
                + Video Playlist
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('audio')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px]"
              >
                + Music Bundle
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('software')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px]"
              >
                + Softwares
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">Target:</span>
              <select
                value={defaultFormat}
                onChange={(e) => setDefaultFormat(e.target.value as 'video' | 'audio' | 'auto')}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-purple-300 font-medium"
              >
                <option value="auto">Auto-Detect</option>
                <option value="video">Force Video (MP4)</option>
                <option value="audio">Force Audio (MP3)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-400">
              Valid URLs Detected: <strong className="text-cyan-400 font-mono text-sm">{validUrls.length}</strong>
            </span>
            <span className="text-[11px] text-slate-500">
              Each file will be queued with multi-threaded chunking
            </span>
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

          <button
            type="button"
            disabled={validUrls.length === 0}
            onClick={handleStart}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium transition-all shadow-md ${
              validUrls.length > 0
                ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Start Batch Download ({validUrls.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
