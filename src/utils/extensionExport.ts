/**
 * Chrome / Edge / Brave Extension Source Files for Shuvo IDM Pro
 * Intercepts video streams (YouTube, Facebook, BongoBD, Toffee, TikTok, etc.)
 * and torrent/magnet links, routing them to Shuvo IDM localhost:5000 bridge
 */

export const EXTENSION_MANIFEST_JSON = `{
  "manifest_version": 3,
  "name": "Shuvo IDM Pro - Video & Download Interceptor",
  "version": "2026.2.0",
  "description": "Automatically intercept video streams (YouTube, Facebook, BongoBD) and files for Shuvo IDM Pro by SM Shuvo.",
  "permissions": [
    "downloads",
    "webRequest",
    "tabs",
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": [
        "*://*.youtube.com/*",
        "*://*.facebook.com/*",
        "*://*.bongobd.com/*",
        "*://*.toffeelive.com/*",
        "*://*.chorki.com/*",
        "*://*.hoichoi.tv/*",
        "*://*.tiktok.com/*",
        "*://*.instagram.com/*",
        "*://*.vimeo.com/*",
        "*://*/*"
      ],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_end"
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Shuvo IDM Pro Interceptor"
  }
}
`;

export const EXTENSION_BACKGROUND_JS = `// Shuvo IDM Chrome Extension - Background Interceptor
// Dispatches downloads to Shuvo IDM Local Server (http://localhost:5000/download)

const SHUVO_API_URL = "http://localhost:5000/download";

// List of extensions to automatically intercept like real IDM (including Torrents & Bongo/HLS)
const INTERCEPT_EXTENSIONS = [
  ".mp4", ".mkv", ".webm", ".avi", ".mov", ".flv",
  ".m3u8", ".mpd", ".ts",
  ".torrent", ".magnet",
  ".mp3", ".wav", ".aac", ".flac",
  ".zip", ".rar", ".7z", ".tar.gz",
  ".exe", ".msi", ".iso", ".bin",
  ".pdf", ".docx", ".xlsx"
];

// Intercept browser downloads
chrome.downloads.onCreated.addListener((downloadItem) => {
  const url = downloadItem.finalUrl || downloadItem.url;
  const isTarget = url.startsWith("magnet:") || INTERCEPT_EXTENSIONS.some(ext => url.toLowerCase().split('?')[0].endsWith(ext));

  if (isTarget) {
    // Cancel browser default download
    chrome.downloads.cancel(downloadItem.id, () => {
      chrome.downloads.erase({ id: downloadItem.id });
    });

    // Forward URL to Shuvo IDM
    sendToShuvoIDM(url);
  }
});

// Forward request to Shuvo IDM desktop app
async function sendToShuvoIDM(url) {
  try {
    const res = await fetch(SHUVO_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url })
    });
    console.log("Shuvo IDM Dispatched:", res.status);
  } catch (err) {
    console.warn("Shuvo IDM desktop app not running on port 5000:", err);
  }
}

// Receive messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "downloadWithShuvoIDM") {
    sendToShuvoIDM(request.url);
    sendResponse({ status: "dispatched" });
  }
  return true;
});
`;

export const EXTENSION_CONTENT_JS = `// Shuvo IDM Chrome Extension - Content Script (Floating Video Sniffer)
// Injects floating "Download this video" button on YouTube, Facebook, BongoBD, TikTok, and HTML5 players

(function initShuvoSniffer() {
  function checkAndAttach() {
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      if (video.dataset.shuvoAttached) return;
      video.dataset.shuvoAttached = "true";

      const btn = document.createElement('div');
      btn.className = 'shuvo-idm-floating-btn';
      btn.innerHTML = \`
        <button type="button" class="shuvo-btn-inner" title="Download with Shuvo IDM Pro (8-Thread High Speed)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Download with Shuvo IDM</span>
        </button>
      \`;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const currentUrl = window.location.href;
        chrome.runtime.sendMessage({
          action: "downloadWithShuvoIDM",
          url: currentUrl
        });
      });

      const parent = video.parentElement || document.body;
      parent.style.position = parent.style.position || 'relative';
      parent.appendChild(btn);
    });

    // Magnet Link Interceptor
    document.querySelectorAll('a[href^="magnet:"]').forEach((magLink) => {
      if (magLink.dataset.shuvoAttached) return;
      magLink.dataset.shuvoAttached = "true";
      magLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.sendMessage({
          action: "downloadWithShuvoIDM",
          url: magLink.href
        });
      });
    });
  }

  setInterval(checkAndAttach, 1500);
})();
`;

export const EXTENSION_CONTENT_CSS = `/* Shuvo IDM Floating Video Sniffer Styles */
.shuvo-idm-floating-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 9999999;
  font-family: system-ui, -apple-system, sans-serif;
  cursor: pointer;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.7));
}

.shuvo-btn-inner {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #1d4ed8, #0284c7);
  color: #ffffff;
  border: 1px solid rgba(56, 189, 248, 0.6);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(0,0,0,0.5);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.shuvo-btn-inner:hover {
  transform: scale(1.05);
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  border-color: #38bdf8;
}
`;

export const EXTENSION_POPUP_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { width: 300px; padding: 14px; margin: 0; background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; }
    h3 { margin: 0 0 4px; font-size: 14px; color: #38bdf8; }
    p { font-size: 11px; color: #94a3b8; line-height: 1.4; margin: 0 0 10px; }
    .status { background: #1e293b; border: 1px solid #334155; padding: 8px; border-radius: 6px; font-size: 11px; margin-bottom: 10px; }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; margin-right: 6px; }
    button { width: 100%; background: #0284c7; color: white; border: none; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer; }
    button:hover { background: #0369a1; }
  </style>
</head>
<body>
  <h3>Shuvo IDM Pro Interceptor</h3>
  <p>Developer: SM Shuvo (01997966529)</p>
  <div class="status">
    <span class="dot"></span> <strong>Desktop Bridge:</strong> http://localhost:5000
  </div>
  <p style="font-size: 10px; color: #cbd5e1;">Supports BongoBD, YouTube, Facebook, Torrents, and Direct Files.</p>
  <button id="sendCurrent">Download Current Video</button>
  <script>
    document.getElementById('sendCurrent').addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        chrome.runtime.sendMessage({ action: "downloadWithShuvoIDM", url: tab.url });
        alert("Sent to Shuvo IDM Pro!");
      }
    });
  </script>
</body>
</html>
`;
