import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Phone,
  MessageCircle,
  Award,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { LicenseState } from '../types/idm';

interface LicenseModalProps {
  license: LicenseState;
  onClose: () => void;
  onActivate: (key: string) => { success: boolean; message: string };
  onResetToTrial: () => void;
  onOpenAdminKeygen: () => void;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({
  license,
  onClose,
  onActivate,
  onResetToTrial,
  onOpenAdminKeygen,
}) => {
  const [inputKey, setInputKey] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const handleCopyMachineId = () => {
    navigator.clipboard.writeText(license.machineId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleActivate = () => {
    if (!inputKey.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a valid license key!' });
      return;
    }
    const res = onActivate(inputKey.trim());
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const whatsappUrl = `https://wa.me/8801997966529?text=Assalamu%20Alaikum%20SM%20Shuvo%20Bhai,%20I%20want%20to%20activate%20Shuvo%20IDM%20Pro.%20My%20Machine%20ID:%20${encodeURIComponent(license.machineId)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center shadow-xs">
              <KeyRound className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-100">
              Shuvo IDM — Cryptographic License Activation
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close license dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Current Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              license.status === 'ACTIVATED'
                ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-200 shadow-md shadow-emerald-950/40'
                : 'bg-amber-950/80 border-amber-600/70 text-amber-200 shadow-md shadow-amber-950/40'
            }`}
          >
            <div className="flex items-center gap-3">
              {license.status === 'ACTIVATED' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <Clock className="w-6 h-6 text-amber-400 shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {license.status === 'ACTIVATED'
                    ? `License Activated (${license.info})`
                    : `Free Trial Active (${license.trialDaysLeft} Days Remaining)`}
                </div>
                <div className="text-[11px] opacity-85 mt-0.5">
                  {license.status === 'ACTIVATED'
                    ? 'All high-speed multi-threaded features and video sniffers are permanently unlocked.'
                    : 'Activate software to unlock unlimited speed and bypass trial expiration.'}
                </div>
              </div>
            </div>

            {license.status === 'ACTIVATED' && (
              <button
                onClick={onResetToTrial}
                className="text-[10px] underline text-slate-400 hover:text-slate-200 cursor-pointer"
                title="Reset to Trial for demonstration"
              >
                Reset
              </button>
            )}
          </div>

          {/* Machine ID Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-inner">
            <div className="text-slate-400 font-semibold flex items-center justify-between text-[11px]">
              <span>Your Unique Hardware Machine ID:</span>
              <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                Hardware Fingerprint
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 font-mono text-emerald-400 font-bold text-sm tracking-wider select-all shadow-inner">
                {license.machineId}
              </div>
              <button
                type="button"
                onClick={handleCopyMachineId}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all active:scale-95 shadow cursor-pointer"
              >
                {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <p className="text-[11px] text-slate-400 leading-normal">
                Send this Machine ID to <strong>SM Shuvo (01997966529)</strong> to generate your personal key:
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-all shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-3 h-3" />
                <span>Send via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Key Input Section */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Enter Secure License Key:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value.toUpperCase());
                  setFeedback({ type: null, message: '' });
                }}
                placeholder="SHUVO-XXXXXXXXXXXXXXXX"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs tracking-wider focus:outline-none focus:border-emerald-500 uppercase shadow-inner"
              />
              <button
                type="button"
                onClick={handleActivate}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Activate Software
              </button>
            </div>
            {feedback.message && (
              <div
                className={`p-2.5 rounded-lg text-xs font-semibold ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/90 border border-emerald-700 text-emerald-300'
                    : 'bg-rose-950/90 border border-rose-700 text-rose-300'
                }`}
              >
                {feedback.message}
              </div>
            )}
          </div>

          {/* Contact Author Banner */}
          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-slate-300">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Official License Support:</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="tel:01997966529"
                className="flex items-center gap-1 text-cyan-300 hover:underline font-mono font-bold"
              >
                <Phone className="w-3 h-3 text-cyan-400" />
                01997966529
              </a>
              <a
                href="https://wa.me/8801997966529"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:underline font-semibold"
              >
                <MessageCircle className="w-3 h-3 text-emerald-400" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenAdminKeygen}
            className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer font-medium"
            title="Open Author Keygen Software"
          >
            <Sparkles className="w-3 h-3" />
            <span>Admin Keygen Software Portal (SM Shuvo Only)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
