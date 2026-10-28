import React from 'react';
import { X, HelpCircle, Keyboard, Phone, ShieldCheck, Zap, MessageCircle, Layers, Globe } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs">
              <HelpCircle className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-100">
              Shuvo IDM User Guide &amp; Keyboard Shortcuts
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close user guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Bengali Quick Guide Box */}
          <div className="bg-gradient-to-r from-blue-950/70 to-indigo-950/70 p-3 rounded-xl border border-blue-600/40 space-y-1">
            <div className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
              <span>🇧🇩</span>
              <span>ব্যবহার সহায়িকা (Quick Bengali Guide)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>Shuvo IDM</strong> দিয়ে আপনি যেকোনো ভিডিও (YouTube, Facebook, TikTok) অথবা বড় ফাইল ৫ গুণ দ্রুত ডাউনলোড করতে পারবেন। ৮ টি মাল্টি-থ্রেড কানেকশন এক সাথে কাজ করে। লাইসেন্স কী পেতে সরাসরি ডেভেলপার <strong>SM Shuvo (01997966529)</strong> এর সাথে যোগাযোগ করুন।
            </p>
          </div>

          {/* Shortcuts */}
          <div className="space-y-2">
            <div className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
              <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Keyboard &amp; Mouse Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Add New URL:</span>
                <kbd className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-cyan-300 font-mono text-[10px]">Alt + A</kbd>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Paste &amp; Download:</span>
                <kbd className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-cyan-300 font-mono text-[10px]">Ctrl + V</kbd>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Inspect Download:</span>
                <span className="text-cyan-300 font-mono text-[10px]">Double Click</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Context Menu:</span>
                <span className="text-cyan-300 font-mono text-[10px]">Right Click</span>
              </div>
            </div>
          </div>

          {/* Core Features */}
          <div className="space-y-2">
            <div className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Key Features &amp; Superpowers</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
              <li>
                <strong className="text-slate-200">8-Thread Dynamic Segmentation:</strong> Splits each file into 8 concurrent parallel chunks to maximize bandwidth saturation.
              </li>
              <li>
                <strong className="text-slate-200">Browser Extension Video Sniffer:</strong> Captures YouTube 4K, 1080p, 720p, and extracts MP3 320kbps audio streams with 1 click.
              </li>
              <li>
                <strong className="text-slate-200">Smart Queue Priority:</strong> Assign High (3.0x), Normal (1.5x), or Low (0.6x) bandwidth priority to critical downloads.
              </li>
              <li>
                <strong className="text-slate-200">HTTP &amp; SOCKS5 Proxy Tunneling:</strong> Built-in anonymous proxy support with latency verification.
              </li>
              <li>
                <strong className="text-slate-200">Cryptographic Hardware Licensing:</strong> HMAC-SHA256 signature verification tied to unique hardware Machine IDs.
              </li>
            </ul>
          </div>

          {/* Author Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Licensed &amp; Developed by SM Shuvo
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="tel:01997966529"
                  className="font-mono text-cyan-300 font-bold hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-cyan-400" />
                  <span>01997966529</span>
                </a>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              For commercial distribution, lifetime license activation keys, and custom modules, contact developer SM Shuvo directly via Phone or WhatsApp.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all text-xs cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
