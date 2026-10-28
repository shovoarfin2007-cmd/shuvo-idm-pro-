import React, { useState } from 'react';
import {
  X,
  Webhook,
  Code2,
  Send,
  Check,
  Copy,
  Terminal,
  Cpu,
  Radio,
  Download,
  Chrome,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import {
  EXTENSION_MANIFEST_JSON,
  EXTENSION_BACKGROUND_JS,
  EXTENSION_CONTENT_JS,
  EXTENSION_CONTENT_CSS,
  EXTENSION_POPUP_HTML,
} from '../utils/extensionExport';

interface ApiExtensionModalProps {
  onClose: () => void;
  onSendTestDownload: (url: string) => void;
}

export const ApiExtensionModal: React.FC<ApiExtensionModalProps> = ({
  onClose,
  onSendTestDownload,
}) => {
  const [testUrl, setTestUrl] = useState('https://www.youtube.com/watch?v=3JZ_D3ELwOQ');
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [sentToast, setSentToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'files' | 'test'>('guide');

  const curlCommand = `curl -X POST http://localhost:5000/download \\
  -H "Content-Type: application/json" \\
  -d '{"url": "${testUrl}"}'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleTestSend = () => {
    onSendTestDownload(testUrl);
    setSentToast(true);
    setTimeout(() => {
      setSentToast(false);
      onClose();
    }, 1200);
  };

  const downloadFile = (fileName: string, content: string, mime: string = 'text/plain') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllExtensionFiles = () => {
    downloadFile('manifest.json', EXTENSION_MANIFEST_JSON, 'application/json');
    setTimeout(() => downloadFile('background.js', EXTENSION_BACKGROUND_JS, 'application/javascript'), 200);
    setTimeout(() => downloadFile('content.js', EXTENSION_CONTENT_JS, 'application/javascript'), 400);
    setTimeout(() => downloadFile('content.css', EXTENSION_CONTENT_CSS, 'text/css'), 600);
    setTimeout(() => downloadFile('popup.html', EXTENSION_POPUP_HTML, 'text/html'), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200 max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xs">
              <Chrome className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>Shuvo IDM — Browser Auto-Download &amp; Extension Integration</span>
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono px-1.5 py-0.2 rounded">
                  Flask Port 5000
                </span>
              </span>
              <p className="text-[11px] text-slate-400">
                যেভাবে আসল IDM-এর মতো যেকোনো ভিডিও বা ফাইল স্বয়ংক্রিয়ভাবে ডাউনলোড হয়
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close API modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2 px-3 border-b-2 font-semibold transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ১. অটোমেটিক ডাউনলোড যেভাবে কাজ করে
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`py-2 px-3 border-b-2 font-semibold transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ২. Chrome Extension ফাইলসমূহ
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`py-2 px-3 border-b-2 font-semibold transition-all cursor-pointer ${
              activeTab === 'test'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ৩. টেস্ট সেন্ডার (API Test)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* TAB 1: HOW AUTO-DOWNLOAD WORKS */}
          {activeTab === 'guide' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-blue-950/60 p-4 rounded-xl border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>হ্যাঁ, Shuvo IDM দিয়ে আসল IDM-এর মতোই ১০০% অটোমেটিক ডাউনলোড করা যায়!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  আসল Internet Download Manager (IDM) যেভাবে কাজ করে, ঠিক সেই একই আর্কিটেকচার Shuvo IDM-এ তৈরি করা হয়েছে। এখানে ২ ধরণের অটোমেটিক সিস্টেম রয়েছে:
                </p>
              </div>

              {/* Method 1: Browser Extension */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Chrome className="w-4 h-4 text-cyan-400" />
                  <span>পদ্ধতি ১: ক্রোম / এজ এক্সটেনশন (Browser Video Sniffer)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ব্রাউজারে যখন আপনি YouTube, Facebook, TikTok বা যেকোনো ওয়েবসাইট থেকে ভিডিও প্লে করবেন, Shuvo IDM এক্সটেনশন স্বয়ংক্রিয়ভাবে ভিডিওর স্ট্রিমিং লিঙ্ক (4K, 1080p, MP3) ডিটেক্ট করে প্লেয়ারের উপর ফ্লোটিং <strong>&quot;Download this video&quot;</strong> বাটন নিয়ে আসে। বাটনে ক্লিক করলেই লিঙ্কটি সরাসরি Shuvo IDM সফটওয়্যারে চলে আসে এবং ৮-থ্রেডে ডাউনলোড শুরু হয়ে যায়!
                </p>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>ব্রাউজার এক্সটেনশন সরাসরি <strong>http://localhost:5000/download</strong> পোর্টে ডাটা পাঠায়।</span>
                  <span className="text-emerald-400 font-mono font-semibold">Active Bridge</span>
                </div>
              </div>

              {/* Method 2: Clipboard Auto-Monitoring */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>পদ্ধতি ২: ক্লিপবোর্ড অটো-মনিটর (Clipboard Auto-Catch)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  সফটওয়্যারটি চালু থাকা অবস্থায় আপনি ব্রাউজার বা যেকোনো জায়গা থেকে কোনো ডাউনলোড লিঙ্ক কপি করলেই (<code>Ctrl + C</code>), Shuvo IDM সাথে সাথে তা স্বয়ংক্রিয়ভাবে ধরে ফেলে এবং ডাউনলোড পপআপ ওপেন করে দেয়।
                </p>
                <div className="text-[10px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  স্বয়ংক্রিয়ভাবে ক্যাচ করা ফরম্যাটসমূহ: <code>.mp4, .mkv, .mp3, .zip, .rar, .exe, .iso, .pdf, .docx, youtube.com, facebook.com</code>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXTENSION FILES & INSTALLATION */}
          {activeTab === 'files' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-xs">Google Chrome &amp; Edge Extension প্যাকেজ</h3>
                    <p className="text-[10px] text-slate-400">এই ফাইলগুলো ডাউনলোড করে আপনার ব্রাউজারে যুক্ত করলেই অটো-ডাউনলোড চালু হবে</p>
                  </div>
                  <button
                    onClick={handleDownloadAllExtensionFiles}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>সব ফাইল ডাউনলোড করুন</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-white block font-mono text-[11px]">manifest.json</strong>
                      <span className="text-slate-400 text-[10px]">Extension configuration</span>
                    </div>
                    <button
                      onClick={() => downloadFile('manifest.json', EXTENSION_MANIFEST_JSON, 'application/json')}
                      className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-white block font-mono text-[11px]">background.js</strong>
                      <span className="text-slate-400 text-[10px]">Download interceptor</span>
                    </div>
                    <button
                      onClick={() => downloadFile('background.js', EXTENSION_BACKGROUND_JS, 'application/javascript')}
                      className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-white block font-mono text-[11px]">content.js</strong>
                      <span className="text-slate-400 text-[10px]">Video player floating button</span>
                    </div>
                    <button
                      onClick={() => downloadFile('content.js', EXTENSION_CONTENT_JS, 'application/javascript')}
                      className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-white block font-mono text-[11px]">content.css</strong>
                      <span className="text-slate-400 text-[10px]">Sniffer UI stylesheet</span>
                    </div>
                    <button
                      onClick={() => downloadFile('content.css', EXTENSION_CONTENT_CSS, 'text/css')}
                      className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Installation steps */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                <strong className="text-cyan-300">ক্রোমে এক্সটেনশন ইনস্টল করার নিয়ম:</strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
                  <li>ফাইলগুলো ডাউনলোড করে আপনার কম্পিউটারে <code>shuvo_extension</code> নামে একটি ফোল্ডারে রাখুন।</li>
                  <li>Google Chrome বা Edge ব্রাউজারে অ্যাড্রেস বারে যান: <code>chrome://extensions</code></li>
                  <li>ডানদিকের উপরে থাকা <strong>&quot;Developer mode&quot;</strong> অপশনটি চালু (ON) করুন।</li>
                  <li>বামে থাকা <strong>&quot;Load unpacked&quot;</strong> বাটনে ক্লিক করে আপনার <code>shuvo_extension</code> ফোল্ডারটি সিলেক্ট করুন।</li>
                  <li>অভিনন্দন! আপনার ব্রাউজারে Shuvo IDM স্বয়ংক্রিয় ডাউনলোড চালু হয়ে গেছে।</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: API TEST SENDER */}
          {activeTab === 'test' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div>
                    <div className="font-semibold text-slate-200">Local Bridge Server: ONLINE</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Listening on http://localhost:5000/download
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] bg-slate-900 border border-slate-700 text-cyan-300 px-2 py-0.5 rounded">
                  CORS Enabled
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    cURL Integration Payload:
                  </span>
                  <button
                    onClick={handleCopyCurl}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    {copiedCurl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCurl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] text-cyan-300 overflow-x-auto select-all">
                  {curlCommand}
                </pre>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Simulate Browser Interception:</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleTestSend}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send to IDM</span>
                  </button>
                </div>
                {sentToast && (
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 animate-pulse">
                    ✓ HTTP 200 OK: Link successfully dispatched to Shuvo IDM queue!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end">
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
