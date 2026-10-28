import React from 'react';
import {
  DownloadCloud,
  Volume2,
  VolumeX,
  ShieldCheck,
  Clock,
  ExternalLink,
  HelpCircle,
  PhoneCall,
  Minus,
  Square,
  X,
  MessageCircle,
  Package,
} from 'lucide-react';
import { LicenseState } from '../types/idm';

interface TitleBarProps {
  license: LicenseState;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenLicense: () => void;
  onOpenHelp: () => void;
  onOpenSnifferDemo: () => void;
  onOpenSoftwareBuilder: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  license,
  soundEnabled,
  onToggleSound,
  onOpenLicense,
  onOpenHelp,
  onOpenSnifferDemo,
  onOpenSoftwareBuilder,
}) => {
  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/90 text-slate-200 select-none px-3.5 py-2 flex items-center justify-between text-xs transition-all shadow-sm">
      {/* Left: Window Controls + Brand & Version */}
      <div className="flex items-center gap-3">
        {/* macOS/Windows style traffic lights */}
        <div className="flex items-center gap-1.5 mr-1">
          <button
            type="button"
            className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 border border-rose-600/60 flex items-center justify-center transition-all group cursor-pointer"
            title="Close Shuvo IDM (Simulated)"
            aria-label="Close"
          >
            <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            type="button"
            className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 border border-amber-600/60 flex items-center justify-center transition-all group cursor-pointer"
            title="Minimize Shuvo IDM"
            aria-label="Minimize"
          >
            <Minus className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            type="button"
            className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 border border-emerald-600/60 flex items-center justify-center transition-all group cursor-pointer"
            title="Maximize Shuvo IDM"
            aria-label="Maximize"
          >
            <Square className="w-1.5 h-1.5 text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Brand Icon + Name */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20 ring-1 ring-white/10">
            <DownloadCloud className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white flex items-center gap-1">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
                Shuvo IDM
              </span>
              <span className="text-slate-400 font-normal hidden sm:inline text-[11px]">
                · Ultimate Download Manager Pro
              </span>
            </span>
            <span className="bg-blue-950/80 text-blue-300 border border-blue-800/80 px-2 py-0.5 rounded text-[10px] font-mono font-medium shadow-xs">
              v2026.2 Ultra
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Developer contact badge with direct WhatsApp / Call trigger */}
      <div className="hidden lg:flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full text-slate-300 shadow-inner">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400 text-[11px]">Dev: SM Shuvo</span>
        </div>
        <span className="text-slate-600">|</span>
        <a
          href="tel:01997966529"
          className="flex items-center gap-1 font-mono text-cyan-300 hover:text-cyan-200 transition-colors text-[11px]"
          title="Direct Phone Call to SM Shuvo"
        >
          <PhoneCall className="w-3 h-3 text-cyan-400" />
          <span>01997966529</span>
        </a>
        <span className="text-slate-600">|</span>
        <a
          href="https://wa.me/8801997966529?text=Assalamu%20Alaikum%20Shuvo%20Bhai,%20I%20need%20a%20license%20key%20for%20Shuvo%20IDM%20Pro"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          title="Open WhatsApp Chat with SM Shuvo"
        >
          <MessageCircle className="w-3 h-3 text-emerald-400" />
          <span>WhatsApp</span>
        </a>
      </div>

      {/* Right: Quick actions & License pill */}
      <div className="flex items-center gap-2">
        {/* Make .EXE / Desktop Software Builder Button */}
        <button
          onClick={onOpenSoftwareBuilder}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/40 border border-emerald-400/40 transition-all active:scale-95 cursor-pointer ring-1 ring-emerald-400/30"
          title="Make into Standalone Windows .EXE Software or Install on Desktop"
        >
          <Package className="w-3.5 h-3.5" />
          <span>Make .EXE Software</span>
        </button>

        {/* Sniffer Demo Simulator Button */}
        <button
          onClick={onOpenSnifferDemo}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-950 to-blue-950 text-cyan-300 hover:from-indigo-900 hover:to-blue-900 border border-cyan-800/60 transition-all shadow-xs hover:shadow-cyan-900/30 active:scale-95 cursor-pointer"
          title="Try Browser Video Sniffer Overlay Extension"
        >
          <ExternalLink className="w-3 h-3 text-cyan-400" />
          <span className="hidden sm:inline font-medium">Video Sniffer</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={onToggleSound}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:bg-slate-800 hover:border-cyan-700'
              : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400'
          }`}
          title={soundEnabled ? 'Mute IDM completion sounds' : 'Enable IDM completion sounds'}
          aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Help & Guide */}
        <button
          onClick={onOpenHelp}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="User Guide & Shortcuts"
          aria-label="Open user guide"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* License Pill */}
        <button
          onClick={onOpenLicense}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium border transition-all shadow-xs active:scale-95 cursor-pointer ${
            license.status === 'ACTIVATED'
              ? 'bg-emerald-950/90 border-emerald-600/80 text-emerald-300 hover:bg-emerald-900/90 shadow-emerald-950/40'
              : 'bg-amber-950/90 border-amber-600/80 text-amber-300 hover:bg-amber-900/90 animate-pulse'
          }`}
          title="Click to view license details or activate key"
        >
          {license.status === 'ACTIVATED' ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">ACTIVATED ({license.info})</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">TRIAL ({license.trialDaysLeft} Days Left)</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
