import React, { useState } from 'react';
import {
  X,
  DownloadCloud,
  ChevronDown,
  Video,
  Music,
  ExternalLink,
  Play,
  RotateCw,
  Globe,
  CheckCircle2,
  Volume2,
  Maximize2,
  Sparkles,
} from 'lucide-react';

interface BrowserSnifferDemoProps {
  onClose: () => void;
  onSniffDownload: (quality: string, type: 'video' | 'audio') => void;
}

export const BrowserSnifferDemo: React.FC<BrowserSnifferDemoProps> = ({
  onClose,
  onSniffDownload,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-xs">
              <ExternalLink className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-100">
              Browser Video Sniffer Overlay — Shuvo IDM Integration Module Simulator
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close sniffer demo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content: Simulated Browser Webpage with Video Player */}
        <div className="p-4 space-y-3.5 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
            <p className="leading-relaxed">
              When surfing YouTube, Facebook Reels, TikTok, or Vimeo in Chrome, the <strong className="text-cyan-400">Shuvo IDM Extension</strong> floats automatically on top of the video player. Click the floating IDM button below:
            </p>
          </div>

          {/* Simulated Browser Window */}
          <div className="border border-slate-700/80 rounded-xl overflow-hidden bg-slate-950 shadow-2xl">
            {/* Browser Address Bar */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <button
                type="button"
                className="text-slate-500 hover:text-slate-300 transition-colors"
                title="Reload page"
              >
                <RotateCw className="w-3 h-3" />
              </button>
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-1 text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <Globe className="w-3 h-3 text-slate-500" />
                <span className="text-slate-300 font-medium truncate">
                  https://www.youtube.com/watch?v=bangla_tech_2026_idm_mastery
                </span>
              </div>
            </div>

            {/* Simulated Video Player */}
            <div className="aspect-video w-full bg-slate-900 relative flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
                alt="Cyberpunk Video Player"
                className="w-full h-full object-cover opacity-65"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/50 flex flex-col justify-between p-4">
                {/* Floating IDM Sniffer Button (The iconic browser overlay!) */}
                <div className="flex justify-end relative">
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl border border-cyan-400/50 hover:scale-105 transition-all cursor-pointer ring-2 ring-cyan-500/20"
                    >
                      <DownloadCloud className="w-4 h-4 text-cyan-200 animate-bounce" />
                      <span>Download this video</span>
                      <ChevronDown className="w-3.5 h-3.5 text-cyan-200" />
                    </button>

                    {/* Quality Selection Dropdown */}
                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/98 backdrop-blur-md border border-cyan-500/50 rounded-xl shadow-2xl py-1 z-30 text-xs animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                          <span>Shuvo IDM Streams</span>
                          <span className="font-mono text-slate-500">8 Streams</span>
                        </div>

                        <button
                          onClick={() => {
                            onSniffDownload('4K Ultra HD (2160p)', 'video');
                            setDropdownOpen(false);
                            onClose();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-blue-600 text-slate-200 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Video className="w-3.5 h-3.5 text-purple-400" />
                            <span className="font-medium">4K Ultra HD (2160p)</span>
                          </div>
                          <span className="font-mono text-[10px] text-purple-300 font-bold">~1.2 GB</span>
                        </button>

                        <button
                          onClick={() => {
                            onSniffDownload('1080p FHD (60fps)', 'video');
                            setDropdownOpen(false);
                            onClose();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-blue-600 text-slate-200 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Video className="w-3.5 h-3.5 text-rose-400" />
                            <span className="font-medium">1080p Full HD (60fps)</span>
                          </div>
                          <span className="font-mono text-[10px] text-emerald-400 font-bold">Recommended</span>
                        </button>

                        <button
                          onClick={() => {
                            onSniffDownload('720p HD (High)', 'video');
                            setDropdownOpen(false);
                            onClose();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-blue-600 text-slate-200 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Video className="w-3.5 h-3.5 text-sky-400" />
                            <span className="font-medium">720p HD (Ready)</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">~240 MB</span>
                        </button>

                        <div className="h-[1px] bg-slate-800 my-1" />

                        <button
                          onClick={() => {
                            onSniffDownload('MP3 Audio (320kbps)', 'audio');
                            setDropdownOpen(false);
                            onClose();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-emerald-600 text-slate-200 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Music className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-medium">Extract Audio (MP3 320k)</span>
                          </div>
                          <span className="font-mono text-[10px] text-emerald-300">12.5 MB</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video HUD Bottom */}
                <div className="space-y-2">
                  <div className="text-base font-bold text-white drop-shadow-md">
                    Artificial Intelligence in 2026 — Masterclass Video Stream
                  </div>

                  {/* Playhead bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full w-[38%]" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <div className="flex items-center gap-3">
                        <Play className="w-3.5 h-3.5 fill-white text-white cursor-pointer" />
                        <Volume2 className="w-3.5 h-3.5 text-slate-300 cursor-pointer" />
                        <span className="font-mono text-[10px]">12:45 / 45:10</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-300 text-[10px]">Auto Sniffer Active</span>
                        <Maximize2 className="w-3.5 h-3.5 text-slate-300 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all text-xs cursor-pointer"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
