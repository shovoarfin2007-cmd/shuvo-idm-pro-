import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  KeyRound,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Sparkles,
  Lock,
  Unlock,
  MessageSquare,
} from 'lucide-react';
import { generateLicenseKey } from '../utils/license';

interface AdminKeygenModalProps {
  onClose: () => void;
  defaultMachineId?: string;
}

export const AdminKeygenModal: React.FC<AdminKeygenModalProps> = ({
  onClose,
  defaultMachineId = '',
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Keygen inputs
  const [targetMachineId, setTargetMachineId] = useState(defaultMachineId || 'SHUVO-');
  const [selectedDuration, setSelectedDuration] = useState<string | number>('LIFETIME');
  const [customerName, setCustomerName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow either the secret salt or author PIN 2026 or 01997966529
    if (
      masterPassword.trim() === 'ShuvoSecretMasterKey2026' ||
      masterPassword.trim() === '2026' ||
      masterPassword.trim() === '01997966529'
    ) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect master admin PIN! Only author SM Shuvo has access.');
    }
  };

  const handleGenerate = () => {
    if (!targetMachineId.trim()) return;
    const cleanId = targetMachineId.trim().toUpperCase();
    const key = generateLicenseKey(cleanId, selectedDuration);
    setGeneratedKey(key);
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const customerMessage = `🎉 Assalamu Alaikum ${customerName ? customerName : 'Brother'},
Here is your official Shuvo IDM License Key:

🔑 License Key: ${generatedKey}
💻 Machine ID: ${targetMachineId.toUpperCase()}
⏱️ Validity: ${selectedDuration === 'LIFETIME' ? 'Lifetime Unlimited' : `${selectedDuration} Days`}

Thank you for choosing Shuvo IDM!
Support & Contact: SM Shuvo (01997966529)`;

  const handleCopyCustomerTemplate = () => {
    navigator.clipboard.writeText(customerMessage);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleDownloadPythonScript = () => {
    const pythonCode = `import hmac
import hashlib

SECRET_SALT = "ShuvoSecretMasterKey2026"

def generate_key(machine_id, duration):
    machine_id = machine_id.strip().upper()
    dur_str = str(duration).strip().upper()
    msg = f"{machine_id}-{dur_str}"
    sig = hmac.new(SECRET_SALT.encode(), msg.encode(), hashlib.sha256).hexdigest().upper()
    return f"SHUVO-{sig[:16]}"

if __name__ == "__main__":
    print("==================================================")
    print("  SM SHUVO IDM - STANDALONE KEY GENERATOR")
    print("  Author: SM Shuvo | Mobile: 01997966529")
    print("==================================================")
    
    while True:
        m_id = input("\\nEnter Customer Machine ID (e.g. SHUVO-A1B2C3D4): ").strip()
        if not m_id:
            break
        print("Duration Options: 1, 3, 7, 10, 15, 20, 30, 60, 90, 365, LIFETIME")
        dur = input("Enter Duration [Default: LIFETIME]: ").strip() or "LIFETIME"
        
        license_key = generate_key(m_id, dur)
        print("\\n--------------------------------------------------")
        print(f"Customer Machine ID : {m_id.upper()}")
        print(f"Validity Option     : {dur.upper()}")
        print(f"Generated Key       : {license_key}")
        print("--------------------------------------------------\\n")
`;
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shuvo_keygen.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadOfflineHtml = () => {
    const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shuvo IDM - Standalone Key Generator</title>
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #1e293b; border: 1px solid #334155; padding: 24px; border-radius: 12px; max-width: 480px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h2 { margin-top: 0; color: #38bdf8; }
    label { font-size: 13px; color: #94a3b8; display: block; margin-top: 12px; margin-bottom: 4px; }
    input, select { width: 100%; box-sizing: border-box; background: #0f172a; border: 1px solid #475569; color: white; padding: 8px 12px; border-radius: 6px; font-family: monospace; font-size: 14px; }
    button { background: #10b981; color: white; border: none; padding: 10px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 16px; font-size: 14px; }
    button:hover { background: #059669; }
    .result { margin-top: 16px; background: #0f172a; border: 1px dashed #38bdf8; padding: 12px; border-radius: 6px; word-break: break-all; font-family: monospace; color: #34d399; font-weight: bold; font-size: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🔑 Shuvo IDM Keygen Software</h2>
    <p style="font-size:12px; color:#cbd5e1;">Standalone Offline Key Generator for SM Shuvo (01997966529)</p>
    <label>Customer Machine ID:</label>
    <input type="text" id="mId" placeholder="e.g. SHUVO-BFF52F70" value="SHUVO-">
    <label>Duration / Validity:</label>
    <select id="dur">
      <option value="LIFETIME">LIFETIME (Permanent)</option>
      <option value="365">365 Days (1 Year)</option>
      <option value="90">90 Days (3 Months)</option>
      <option value="30">30 Days (1 Month)</option>
      <option value="7">7 Days (1 Week)</option>
    </select>
    <button onclick="genKey()">Generate License Key</button>
    <div id="res" class="result" style="display:none;"></div>
  </div>
  <script>
    async function hmacSha256(key, msg) {
      const enc = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const signature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(msg));
      return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    }
    async function genKey() {
      const id = document.getElementById('mId').value.trim().toUpperCase();
      const dur = document.getElementById('dur').value;
      if (!id) return alert('Enter Machine ID');
      const sig = await hmacSha256("ShuvoSecretMasterKey2026", id + "-" + dur);
      const key = "SHUVO-" + sig.substring(0, 16);
      const box = document.getElementById('res');
      box.style.display = 'block';
      box.innerText = key;
    }
  </script>
</body>
</html>`;
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shuvo_keygen_offline.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-purple-500/50 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 px-4 py-2.5 border-b border-purple-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-100">
              SM Shuvo Admin Keygen Software (Master Portal)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
            aria-label="Close admin portal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <form onSubmit={handleAdminLogin} className="p-5 space-y-4 text-xs">
            <div className="bg-purple-950/40 p-3 rounded-lg border border-purple-800/40 space-y-1 text-center">
              <ShieldAlert className="w-8 h-8 text-purple-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200 text-sm">Author Master Key Protected</div>
              <p className="text-[11px] text-slate-400">
                To prevent regular users from extending their own licenses, key generation is strictly reserved for developer <strong>SM Shuvo</strong>.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Enter Master Secret Key or Admin PIN:</label>
              <input
                type="password"
                value={masterPassword}
                onChange={(e) => {
                  setMasterPassword(e.target.value);
                  setAuthError('');
                }}
                placeholder="Enter Author Secret (e.g. 2026)"
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                autoFocus
              />
              {authError && <div className="text-rose-400 text-[11px] pt-1">{authError}</div>}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock Keygen</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 space-y-4 text-xs">
            {/* Authenticated header badge */}
            <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-600/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Developer Authenticated: SM Shuvo (01997966529)</span>
              </div>
              <span className="text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-200 font-mono">
                HMAC-SHA256 Active
              </span>
            </div>

            {/* Inputs */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Customer Machine ID:</label>
                  <input
                    type="text"
                    value={targetMachineId}
                    onChange={(e) => setTargetMachineId(e.target.value.toUpperCase())}
                    placeholder="SHUVO-XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-cyan-300 font-bold text-xs uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Customer Name (Optional):</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahim"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">License Duration / Validity:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'LIFETIME', label: 'Lifetime' },
                    { id: '365', label: '1 Year (365d)' },
                    { id: '90', label: '3 Months (90d)' },
                    { id: '30', label: '1 Month (30d)' },
                    { id: '15', label: '15 Days' },
                    { id: '7', label: '7 Days' },
                  ].map((dur) => (
                    <button
                      key={dur.id}
                      type="button"
                      onClick={() => setSelectedDuration(dur.id)}
                      className={`py-1 px-2 rounded border text-center transition-all ${
                        selectedDuration === dur.id
                          ? 'bg-purple-600 border-purple-400 text-white font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                className="w-full mt-2 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 active:scale-98 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Official License Key</span>
              </button>
            </div>

            {/* Generated Output */}
            {generatedKey && (
              <div className="bg-slate-950 p-3 rounded-lg border border-purple-500/60 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Generated Key for {targetMachineId}:</span>
                  <span className="text-emerald-400 font-mono text-[10px]">Valid &amp; Verified</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 font-mono text-emerald-400 font-bold text-sm tracking-wider select-all">
                    {generatedKey}
                  </div>
                  <button
                    onClick={handleCopyKey}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all active:scale-95"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCustomerTemplate}
                  className="w-full flex items-center justify-center gap-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium border border-slate-700"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {copiedTemplate ? 'Copied WhatsApp Reply Message!' : 'Copy Full WhatsApp Reply Template'}
                  </span>
                </button>
              </div>
            )}

            {/* Standalone Software Exporters for Shuvo */}
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Separate Keygen Software to PC:</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Download these standalone keygen scripts so you can generate keys from your own computer or phone without touching the client app:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleDownloadPythonScript}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-900 hover:bg-slate-700 text-cyan-300 text-[11px] border border-cyan-800 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download shuvo_keygen.py</span>
                </button>
                <button
                  onClick={handleDownloadOfflineHtml}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-900 hover:bg-slate-700 text-emerald-300 text-[11px] border border-emerald-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Offline HTML App</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-800/90 px-4 py-2.5 border-t border-slate-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-all text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
