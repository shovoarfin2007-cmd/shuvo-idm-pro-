import React, { useState } from 'react';
import {
  X,
  Package,
  Download,
  Terminal,
  FileCode,
  Laptop,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FolderArchive,
  ArrowRight,
  Flame,
} from 'lucide-react';
import {
  PYTHON_DESKTOP_SOURCE,
  BUILD_WINDOWS_EXE_BAT,
  BUILD_ELECTRON_EXE_BAT,
  REQUIREMENTS_TXT,
} from '../utils/desktopAppExport';
import { usePWAInstall } from '../utils/usePWAInstall';

interface SoftwareBuilderModalProps {
  onClose: () => void;
}

export const SoftwareBuilderModal: React.FC<SoftwareBuilderModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'github' | 'pyinstaller' | 'pwa' | 'electron'>('github');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Downloads helper
  const triggerDownload = (fileName: string, content: string, mimeType: string = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPythonScript = () => {
    triggerDownload('shuvo_idm_desktop.py', PYTHON_DESKTOP_SOURCE, 'text/x-python;charset=utf-8');
  };

  const handleDownloadBatScript = () => {
    triggerDownload('build_shuvo_idm_exe.bat', BUILD_WINDOWS_EXE_BAT, 'application/x-bat;charset=utf-8');
  };

  const handleDownloadRequirements = () => {
    triggerDownload('requirements.txt', REQUIREMENTS_TXT, 'text/plain;charset=utf-8');
  };

  const handleDownloadFullBundle = () => {
    handleDownloadBatScript();
    setTimeout(handleDownloadPythonScript, 300);
    setTimeout(handleDownloadRequirements, 600);
  };

  const handleDownloadElectronBat = () => {
    triggerDownload('build_electron_exe.bat', BUILD_ELECTRON_EXE_BAT, 'application/x-bat;charset=utf-8');
  };

  const pyinstallerCommand = 'pyinstaller --noconsole --onefile --clean --name="Shuvo_IDM_Pro" shuvo_idm_desktop.py';

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(pyinstallerCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200 max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Shuvo IDM Pro — সফটওয়্যার তৈরি করার নিয়মাবলী (.EXE Builder)</span>
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
                  Official Guide
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                এই অ্যাপ্লিকেশনটিকে উইন্ডোজ কম্পিউটার বা যেকোনো পিসিতে আসল সফটওয়্যার (.exe) বানানোর উপায়
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close builder modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-4 pt-2 gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'github'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900/60 rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>GitHub ক্লাউড দিয়ে অটো .EXE (সবচেয়ে সহজ)</span>
          </button>

          <button
            onClick={() => setActiveTab('electron')}
            className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'electron'
                ? 'border-purple-400 text-purple-300 bg-slate-900/60 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-purple-400" />
            <span>পিসিতে Electron দিয়ে .EXE</span>
          </button>

          <button
            onClick={() => setActiveTab('pyinstaller')}
            className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pyinstaller'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Python .EXE (PyInstaller)</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'border-blue-400 text-blue-300 bg-slate-900/60 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-blue-400" />
            <span>১-ক্লিকে ডেস্কটপ ইনস্টল (PWA)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Exact Interface Assurance Card */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 p-3.5 rounded-xl border border-emerald-500/50 shadow-md space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ইন্টারফেস কি হুবহু এই প্রিভিউয়ের মতোই হবে? — হ্যাঁ, ১০০% হুবহু একই রকম হবে!</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              স্ক্রিনে আপনি এখন যেমন ডার্ক গ্লাস উইন্ডো, ৮-থ্রেড রিয়েল-টাইম সেগমেন্ট বার, স্পিড গ্রাফ এবং আধুনিক বোতামগুলো দেখতে পাচ্ছেন—<strong>PWA ইনস্টল</strong> অথবা <strong>Electron দিয়ে .EXE বানালে</strong> আপনার পিসির সফটওয়্যারে প্রতিটি পিক্সেল, অ্যানিমেশন ও কালার হুবহু ১০০% একই রকম থাকবে।
            </p>
          </div>

          {/* TAB 0: GITHUB ACTIONS CLOUD BUILD */}
          {activeTab === 'github' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 p-4 rounded-xl border border-emerald-500/50 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>GitHub দিয়ে অটোমেটিক .EXE তৈরি — আপনার কম্পিউটারে কোনো কিছুই লাগবে না!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  সবচেয়ে সুখবর হলো, আমরা ইতিমধ্যে এই প্রজেক্টের ভেতরে <code className="text-emerald-300 font-mono">.github/workflows/build-exe.yml</code> কনফিগারেশন যুক্ত করে রেখেছি! আপনি কেবল এই প্রজেক্টটি আপনার GitHub অ্যাকাউন্টে পুশ করলেই, GitHub এর ক্লাউড উইন্ডোজ সার্ভার স্বয়ংক্রিয়ভাবে <strong className="text-white">Shuvo IDM Pro Setup.exe</strong> বানিয়ে আপনাকে ডাউনলোড লিঙ্ক দিয়ে দিবে।
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>GitHub দিয়ে ১-ক্লিকে .EXE সফটওয়্যার পাওয়ার ৩টি ধাপ:</span>
                </div>

                <div className="space-y-2.5 text-[11px]">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <strong className="text-emerald-300 block">ধাপ ১: কোড GitHub এ আপলোড (Push) করুন</strong>
                    <p className="text-slate-400">
                      GitHub এ একটি নতুন Repository তৈরি করে এই প্রজেক্টের ফাইলগুলো Push / Upload করুন।
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <strong className="text-cyan-300 block">ধাপ ২: GitHub Actions স্বয়ংক্রিয়ভাবে উইন্ডোজ .EXE বানাবে</strong>
                    <p className="text-slate-400">
                      আপনার GitHub রিপোজিটরির <strong className="text-white">&quot;Actions&quot;</strong> ট্যাবে যান। দেখবেন স্বয়ংক্রিয়ভাবে <em>&quot;Build Windows Desktop EXE&quot;</em> ওয়ার্কফ্লো চলতে শুরু করেছে। ২-৩ মিনিটের ভেতর ক্লাউড সার্ভারেই .exe ফাইল তৈরি হয়ে যাবে।
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <strong className="text-purple-300 block">ধাপ ৩: তৈরি করা সফটওয়্যার ডাউনলোড করুন</strong>
                    <p className="text-slate-400">
                      বিল্ড শেষ হলে Actions পেজের নিচের <strong className="text-white">&quot;Artifacts&quot;</strong> সেকশন থেকে <strong className="text-emerald-400 font-mono">Shuvo_IDM_Pro_Windows_EXE</strong> ফাইলটি ১-ক্লিকে ডাউনলোড করে নিন।
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-950/40 border border-emerald-700/50 rounded-lg text-emerald-200 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    ডাউনলোড করা এই <code>.exe</code> ফাইলটি পেনড্রাইভে নিয়ে যেকোনো কম্পিউটারে চালালে ঠিক এই চমৎকার ইন্টারফেস ও ফিচারে চলবে!
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PyInstaller Windows EXE Guide */}
          {activeTab === 'pyinstaller' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-gradient-to-r from-cyan-950/50 via-slate-900 to-blue-950/50 p-3.5 rounded-xl border border-cyan-500/40 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Windows .EXE ফাইল বানানোর সবচেয়ে সহজ উপায় (১-ক্লিক অটো বিল্ডার)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  আপনার কাছে আমরা পুরো <strong>Python Desktop Source Code</strong> এবং একটি <strong>১-ক্লিক বিল্ডার স্ক্রিপ্ট (build_shuvo_idm_exe.bat)</strong> তৈরি করে দিয়েছি। নিচের ফাইলগুলো ডাউনলোড করে ডাবল ক্লিক করলেই উইন্ডোজের জন্য আসল <code>Shuvo_IDM_Pro.exe</code> তৈরি হয়ে যাবে!
                </p>
              </div>

              {/* 1-Click Download Bundle Buttons */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="font-bold text-white text-xs flex items-center justify-between">
                  <span>প্রয়োজনীয় ফাইল ডাউনলোড করুন:</span>
                  <button
                    onClick={handleDownloadFullBundle}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>সব ফাইল একসাথে ডাউনলোড করুন</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={handleDownloadBatScript}
                    className="flex flex-col items-start p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-cyan-800/60 hover:border-cyan-500 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                      <Terminal className="w-4 h-4" />
                      <span>build_exe.bat</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      ১-ক্লিকে স্বয়ংক্রিয়ভাবে .EXE তৈরি করার ব্যাচ ফাইল
                    </span>
                    <span className="text-[10px] text-cyan-300 font-medium mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      ডাউনলোড <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>

                  <button
                    onClick={handleDownloadPythonScript}
                    className="flex flex-col items-start p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-blue-800/60 hover:border-blue-500 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-blue-400 font-bold mb-1">
                      <FileCode className="w-4 h-4" />
                      <span>shuvo_idm_desktop.py</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      IDM-এর আসল ডেস্কটপ পাইথন সোর্স কোড
                    </span>
                    <span className="text-[10px] text-blue-300 font-medium mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      ডাউনলোড <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>

                  <button
                    onClick={handleDownloadRequirements}
                    className="flex flex-col items-start p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-slate-500 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-slate-300 font-bold mb-1">
                      <Package className="w-4 h-4" />
                      <span>requirements.txt</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      yt-dlp, customtkinter সহ সব ডিপেন্ডেন্সি লিস্ট
                    </span>
                    <span className="text-[10px] text-slate-300 font-medium mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      ডাউনলোড <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Step by Step instructions in Bengali */}
              <div className="space-y-2">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>পিসিতে .EXE বানানোর ৩টি সহজ ধাপ:</span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                    <strong className="text-cyan-300">ধাপ ১: পাইথন ইন্সটল করুন</strong>
                    <p className="text-slate-400">
                      আপনার কম্পিউটারে পাইথন না থাকলে{' '}
                      <a
                        href="https://www.python.org/downloads/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 underline font-mono"
                      >
                        python.org
                      </a>{' '}
                      থেকে পাইথন ডাউনলোড করে ইন্সটল করুন। ইন্সটল করার সময় অবশ্যই{' '}
                      <strong className="text-white">&quot;Add Python to PATH&quot;</strong> চেকবক্সে টিক দিন।
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                    <strong className="text-cyan-300">ধাপ ২: ফাইলগুলো একই ফোল্ডারে রাখুন</strong>
                    <p className="text-slate-400">
                      উপরের ৩টি ফাইল (<code>build_shuvo_idm_exe.bat</code>, <code>shuvo_idm_desktop.py</code>, <code>requirements.txt</code>) ডাউনলোড করে আপনার কম্পিউটারের যেকোনো একটি ফোল্ডারে রাখুন।
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                    <strong className="text-cyan-300">ধাপ ৩: build_shuvo_idm_exe.bat ফাইলে ডাবল ক্লিক করুন</strong>
                    <p className="text-slate-400">
                      ব্যস! ব্যাচ ফাইলটি স্বয়ংক্রিয়ভাবে সব ডিপেন্ডেন্সি ইন্সটল করবে এবং ১-২ মিনিটের মধ্যে <code>dist\Shuvo_IDM_Pro.exe</code> তৈরি করে দিবে। এই .exe ফাইলটি যেকোনো উইন্ডোজ পিসিতে বিনা পাইথনে চলবে!
                    </p>

                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>অথবা কমান্ড প্রম্পটে সরাসরি চালাতে পারেন:</span>
                        <button
                          onClick={handleCopyCommand}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCmd ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                        </button>
                      </div>
                      <pre className="bg-slate-900 p-2 rounded text-[10px] font-mono text-cyan-300 overflow-x-auto select-all border border-slate-800">
                        {pyinstallerCommand}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PWA 1-Click Install */}
          {activeTab === 'pwa' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-gradient-to-r from-blue-950/60 to-cyan-950/60 p-4 rounded-xl border border-blue-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-cyan-400" />
                    <span>সরাসরি ব্রাউজার থেকে উইন্ডোজ / ম্যাক সফটওয়্যার হিসেবে ইনস্টল</span>
                  </div>
                  {isInstalled && (
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      ✓ Already Installed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  PWA (Progressive Web App) প্রযুক্তির মাধ্যমে এই Shuvo IDM অ্যাপটি কোনো পাইথন বা কোডিং ছাড়াই সরাসরি আপনার Windows Desktop, Start Menu, বা Taskbar-এ একটি আলাদা অ্যাপ উইন্ডো হিসেবে ইনস্টল করা যায়!
                </p>

                <div className="pt-2">
                  {isInstalled ? (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-600/60 rounded-lg text-emerald-200 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Shuvo IDM Pro আপনার ডেস্কটপে ইতিমধ্যে সফটওয়্যার হিসেবে ইনস্টল করা আছে!</span>
                    </div>
                  ) : isInstallable ? (
                    <button
                      onClick={install}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl transition-all cursor-pointer active:scale-98"
                    >
                      <Download className="w-4 h-4" />
                      <span>এখনই পিসিতে ইনস্টল করুন (Install on Desktop Now)</span>
                    </button>
                  ) : isIOS ? (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                      <strong className="text-white">iPhone / iPad এ ইনস্টল করার নিয়ম:</strong>
                      <p className="text-slate-400">
                        ১. Safari ব্রাউজারের নিচে <strong>Share (শেয়ার)</strong> বাটনে চাপ দিন।<br />
                        ২. নিচে স্ক্রল করে <strong>&quot;Add to Home Screen&quot;</strong> সিলেক্ট করুন।
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                      <strong className="text-cyan-300">Chrome বা Edge থেকে সরাসরি ইনস্টল করতে:</strong>
                      <p className="text-slate-400 leading-relaxed">
                        ব্রাউজারের উপরের অ্যাড্রেস বারের ডান পাশে থাকা <strong className="text-white">ইন্সটল আইকন (Install App)</strong> অথবা ৩ ডট মেনু থেকে <strong className="text-white">&quot;Install Shuvo IDM Pro&quot;</strong> বাটনে ক্লিক করুন।
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-white text-xs">PWA ডেস্কটপ সফটওয়্যারের সুবিধাসমূহ:</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-emerald-400 block mb-0.5">১০০% ফুল স্ক্রিন উইন্ডো</strong>
                    <span className="text-slate-400">ব্রাউজারের কোনো অ্যাড্রেস বার বা ট্যাব থাকবে না, একদম নেটিভ সফটওয়্যার উইন্ডো।</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-cyan-400 block mb-0.5">ডেস্কটপ ও স্টার্ট মেনু শর্টকাট</strong>
                    <span className="text-slate-400">কম্পিউটারের ডেস্কটপ আইকনে ডাবল ক্লিক করেই সাথে সাথে ওপেন হবে।</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-purple-400 block mb-0.5">অফলাইন ক্যাশিং ও অটো আপডেট</strong>
                    <span className="text-slate-400">ইন্টারনেট ছাড়াও সার্ভিস ওয়ার্কারের মাধ্যমে অফলাইনে ওপেন থাকে।</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-amber-400 block mb-0.5">কোনো সাইজ লিমিট নেই</strong>
                    <span className="text-slate-400">কম্পিউটারের র‍্যাম ও স্টোরেজ অপচয় ছাড়াই অত্যন্ত স্মুথ চলে।</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Electron Packaging Guide */}
          {activeTab === 'electron' && (
            <div className="space-y-3 animate-in fade-in duration-150 text-[11px]">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-purple-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-purple-300 text-xs block">Electron JS দিয়ে ঠিক এই ইন্টারফেসটিকেই .EXE বানানো:</strong>
                  <button
                    onClick={handleDownloadElectronBat}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>build_electron_exe.bat ডাউনলোড</span>
                  </button>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  এই পুরো React + Tailwind ওয়েব ইন্টারফেসটিকে হুবহু একটি উইন্ডোজ <code>Setup.exe</code> ইনস্টলার বানাতে নিচের ৩টি সহজ ধাপ ফলো করুন অথবা ১-ক্লিক ব্যাচ ফাইলটি রান করুন:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-purple-400 font-bold">১. প্রজেক্ট ফোল্ডারে electron ইনস্টল করুন:</span>
                  <pre className="bg-slate-900 p-2 rounded font-mono text-[10px] text-cyan-300">
                    npm install -D electron electron-builder
                  </pre>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-purple-400 font-bold">২. build কমান্ড চালান:</span>
                  <pre className="bg-slate-900 p-2 rounded font-mono text-[10px] text-cyan-300">
                    npm run build
                  </pre>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-purple-400 font-bold">৩. উইন্ডোজ .exe প্যাকেজ তৈরি করুন:</span>
                  <pre className="bg-slate-900 p-2 rounded font-mono text-[10px] text-cyan-300">
                    npx electron-builder --win
                  </pre>
                  <p className="text-slate-400 pt-1 text-[10px]">
                    এটি আপনার <code>dist/</code> ফোল্ডারে একটি স্বয়ংসম্পূর্ণ <code>Shuvo_IDM_Setup.exe</code> ফাইল তৈরি করবে যা যে কোনো উইন্ডোজ পিসিতে ইনস্টল করা যাবে।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Support Banner */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300">
                সফটওয়্যার তৈরি বা লাইসেন্সিং এ কোনো সমস্যায় সাহায্য লাগলে:
              </span>
            </div>
            <a
              href="https://wa.me/8801997966529?text=Assalamu%20Alaikum%20SM%20Shuvo%20Bhai,%20I%20need%20help%20building%20Shuvo%20IDM%20software"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              SM Shuvo (01997966529)
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Shuvo IDM Pro · Standalone Desktop Architecture
          </div>
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
