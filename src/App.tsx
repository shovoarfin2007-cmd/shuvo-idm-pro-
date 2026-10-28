import React, { useState, useEffect, useRef } from 'react';
import { TitleBar } from './components/TitleBar';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { DownloadTable } from './components/DownloadTable';
import { StatusBar } from './components/StatusBar';
import { IDMProgressModal } from './components/IDMProgressModal';
import { FormatResolutionModal } from './components/FormatResolutionModal';
import { BatchDownloadModal } from './components/BatchDownloadModal';
import { LicenseModal } from './components/LicenseModal';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { BrowserSnifferDemo } from './components/BrowserSnifferDemo';
import { ApiExtensionModal } from './components/ApiExtensionModal';
import { HelpModal } from './components/HelpModal';
import { ProxyConfigModal } from './components/ProxyConfigModal';
import { AdminKeygenModal } from './components/AdminKeygenModal';
import { SmartQueueModal } from './components/SmartQueueModal';
import { SoftwareBuilderModal } from './components/SoftwareBuilderModal';
import {
  DownloadItem,
  DownloadCategory,
  DownloadStatus,
  DownloadPriority,
  LicenseState,
  ProxyConfig,
  QueueSettings,
} from './types/idm';
import { INITIAL_DOWNLOADS } from './utils/sampleData';
import {
  getOrGenerateMachineId,
  verifyLicenseKey,
  formatBytes,
  TRIAL_DAYS,
} from './utils/license';
import { DEFAULT_PROXY_CONFIG, getProxySpeedMultiplier, formatProxyUri } from './utils/proxy';
import {
  loadQueueSettings,
  saveQueueSettings,
  scheduleSmartQueue,
  calculatePrioritySpeedMultiplier,
} from './utils/queue';
import { soundManager } from './utils/audio';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

export default function App() {
  // --- Persistent Storage State ---
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
    try {
      const stored = localStorage.getItem('shuvo_idm_downloads');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    return INITIAL_DOWNLOADS;
  });

  const [license, setLicense] = useState<LicenseState>(() => {
    const machineId = getOrGenerateMachineId();
    try {
      const stored = localStorage.getItem('shuvo_idm_license');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    return {
      status: 'TRIAL',
      info: `${TRIAL_DAYS} Days Left`,
      machineId,
      trialDaysLeft: TRIAL_DAYS,
    };
  });

  const [saveFolder, setSaveFolder] = useState<string>(() => {
    return localStorage.getItem('shuvo_idm_save_folder') || 'C:\\Users\\User\\Downloads';
  });

  const [speedLimit, setSpeedLimit] = useState<string>('Unlimited');

  const [proxyConfig, setProxyConfig] = useState<ProxyConfig>(() => {
    try {
      const stored = localStorage.getItem('shuvo_idm_proxy');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    return DEFAULT_PROXY_CONFIG;
  });

  const [queueSettings, setQueueSettings] = useState<QueueSettings>(() => loadQueueSettings());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<DownloadCategory>('all');
  const [statusFilter, setStatusFilter] = useState<DownloadStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // --- Modal Controllers ---
  const [progressModalItem, setProgressModalItem] = useState<DownloadItem | null>(null);
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [formatInitialUrl, setFormatInitialUrl] = useState('');
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [mediaPreviewItem, setMediaPreviewItem] = useState<DownloadItem | null>(null);
  const [snifferDemoOpen, setSnifferDemoOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [proxyModalOpen, setProxyModalOpen] = useState(false);
  const [adminKeygenOpen, setAdminKeygenOpen] = useState(false);
  const [smartQueueModalOpen, setSmartQueueModalOpen] = useState(false);
  const [softwareBuilderOpen, setSoftwareBuilderOpen] = useState(false);

  // Toast Helper
  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastNotification = { id, title, message, type };
    setToasts((prev) => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shuvo_idm_downloads', JSON.stringify(downloads));
    } catch {
      // LocalStorage quota handling
    }
  }, [downloads]);

  useEffect(() => {
    try {
      localStorage.setItem('shuvo_idm_license', JSON.stringify(license));
    } catch {
      // Ignore
    }
  }, [license]);

  useEffect(() => {
    localStorage.setItem('shuvo_idm_save_folder', saveFolder);
  }, [saveFolder]);

  useEffect(() => {
    try {
      localStorage.setItem('shuvo_idm_proxy', JSON.stringify(proxyConfig));
    } catch {
      // Ignore
    }
  }, [proxyConfig]);

  useEffect(() => {
    saveQueueSettings(queueSettings);
  }, [queueSettings]);

  // Keep progress modal in sync with item changes in table
  useEffect(() => {
    if (progressModalItem) {
      const updated = downloads.find((d) => d.id === progressModalItem.id);
      if (updated) {
        setProgressModalItem(updated);
      }
    }
  }, [downloads, progressModalItem?.id]);

  // Global Keyboard Shortcuts (Alt+A for Add URL, Ctrl+V when not in text input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+A -> Add URL
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        handleOpenAddUrl();
        return;
      }

      // Check if user is typing inside an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || (e.target as HTMLElement)?.isContentEditable;

      // Ctrl+V or Cmd+V -> Paste & Download when not focused in input
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V') && !isInput) {
        e.preventDefault();
        handlePasteAndDownload();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Download Speed Limiter helper ---
  const getSpeedLimitBytes = (limitStr: string): number => {
    switch (limitStr) {
      case '500 KB/s':
        return 500 * 1024;
      case '1 MB/s':
        return 1024 * 1024;
      case '5 MB/s':
        return 5 * 1024 * 1024;
      case '10 MB/s':
        return 10 * 1024 * 1024;
      case '25 MB/s':
        return 25 * 1024 * 1024;
      case '50 MB/s':
        return 50 * 1024 * 1024;
      default:
        return 0; // Unlimited
    }
  };

  // --- Multi-Threaded Real-Time Download Simulation Loop with Smart Queue Scheduling ---
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads((prev) => {
        // Step 1: Execute Smart Queue scheduler to promote highest-priority queued tasks
        let currentList = prev;
        if (queueSettings.enabled && queueSettings.autoPromote) {
          const scheduleResult = scheduleSmartQueue(prev, queueSettings);
          currentList = scheduleResult.updatedItems;
          if (scheduleResult.promotedIds.length > 0) {
            soundManager.playStart();
            const promotedNames = scheduleResult.updatedItems
              .filter((i) => scheduleResult.promotedIds.includes(i.id))
              .map((i) => i.name)
              .join(', ');
            addToast('Smart Queue Auto-Promoted', `${promotedNames} is now actively downloading.`, 'info');
          }
        }

        const activeItems = currentList.filter((d) => d.status === 'downloading');
        if (activeItems.length === 0) return currentList;

        const maxTotalBytes = getSpeedLimitBytes(speedLimit);
        const proxyMultiplier = getProxySpeedMultiplier(proxyConfig);
        const activeProxyUri = proxyConfig.enabled ? formatProxyUri(proxyConfig) : undefined;

        // Calculate dynamic bandwidth distribution based on priorities
        const totalPriorityWeights = activeItems.reduce((acc, curr) => {
          return (
            acc +
            calculatePrioritySpeedMultiplier(
              curr.priority || 'normal',
              queueSettings.dynamicBandwidthAllocation
            )
          );
        }, 0);

        let hasCompletedAny = false;
        let completedItemName = '';

        const updated = currentList.map((item) => {
          if (item.status !== 'downloading') return item;

          const pWeight = calculatePrioritySpeedMultiplier(
            item.priority || 'normal',
            queueSettings.dynamicBandwidthAllocation
          );

          let itemSpeed: number;
          if (maxTotalBytes > 0 && totalPriorityWeights > 0) {
            // Distribute limited bandwidth proportionally to priority weight
            itemSpeed = (pWeight / totalPriorityWeights) * maxTotalBytes * proxyMultiplier;
          } else {
            // Uncapped mode: baseline speed is scaled directly by priority multiplier
            const baseFactor = pWeight / 1.5;
            itemSpeed = (4.2 * baseFactor + Math.random() * 2.2) * 1024 * 1024 * proxyMultiplier;
          }

          // In half a second (500ms):
          const dt = 0.5;
          const deltaBytes = itemSpeed * dt;
          const nextDownloaded = Math.min(item.downloadedBytes + deltaBytes, item.fileSize);
          const nextProgress = (nextDownloaded / item.fileSize) * 100;
          const remainingBytes = item.fileSize - nextDownloaded;
          const nextEta = itemSpeed > 0 ? Math.ceil(remainingBytes / itemSpeed) : 0;

          // Update individual 8 connection chunks
          const updatedChunks = item.chunks.map((chk, idx) => {
            const chunkBaseProgress = Math.min(
              100,
              nextProgress + (idx - 4) * 2.5 + (Math.random() * 2 - 1)
            );
            return {
              ...chk,
              progress: Math.max(0, Math.min(100, chunkBaseProgress)),
              speed: itemSpeed / 8,
            };
          });

          // Check for download completion
          if (nextDownloaded >= item.fileSize) {
            hasCompletedAny = true;
            completedItemName = item.name;
            return {
              ...item,
              downloadedBytes: item.fileSize,
              progress: 100,
              status: 'completed' as DownloadStatus,
              speed: 0,
              eta: 0,
              completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              chunks: updatedChunks.map((c) => ({ ...c, progress: 100, speed: 0 })),
              proxyUsed: activeProxyUri,
            };
          }

          return {
            ...item,
            downloadedBytes: nextDownloaded,
            progress: nextProgress,
            speed: itemSpeed,
            eta: nextEta,
            chunks: updatedChunks,
            proxyUsed: activeProxyUri,
          };
        });

        if (hasCompletedAny) {
          soundManager.playCompleted();
          addToast('Download Complete!', `${completedItemName} finished successfully. Ready to save or play.`, 'success');
        }

        return updated;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [speedLimit, proxyConfig, queueSettings]);

  // --- Handlers ---
  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    soundManager.setEnabled(nextVal);
    addToast('Sound Effects', nextVal ? 'IDM completion sound chime enabled' : 'IDM completion sounds muted', 'info');
  };

  const handleOpenAddUrl = () => {
    setFormatInitialUrl('');
    setFormatModalOpen(true);
  };

  const handlePasteAndDownload = async () => {
    soundManager.playStart();
    let clipUrl = '';
    try {
      clipUrl = await navigator.clipboard.readText();
    } catch {
      // If clipboard access is blocked, prompt
    }
    if (!clipUrl || !clipUrl.startsWith('http')) {
      clipUrl = prompt('Enter or paste download link (URL):') || '';
    }
    if (clipUrl && (clipUrl.startsWith('http://') || clipUrl.startsWith('https://'))) {
      setFormatInitialUrl(clipUrl.trim());
      setFormatModalOpen(true);
      addToast('Link Intercepted', `Captured: ${clipUrl.substring(0, 45)}...`, 'info');
    }
  };

  const handleConfirmAddDownload = (options: {
    url: string;
    fileName: string;
    formatType: 'video' | 'audio' | 'file';
    resolution: string;
    downloadThumbnail: boolean;
    threads: number;
    startNow: boolean;
  }) => {
    soundManager.playStart();
    const isAudio = options.formatType === 'audio';
    const isVideo = options.formatType === 'video';

    let category: DownloadCategory = 'programs';
    if (isVideo) category = 'videos';
    else if (isAudio) category = 'music';
    else if (/\.(pdf|doc|docx|txt|epub)$/i.test(options.fileName)) category = 'documents';
    else if (/\.(torrent|magnet)$/i.test(options.fileName)) category = 'torrents';

    // File size estimation based on resolution/type
    let fileSize = 150 * 1024 * 1024;
    if (options.resolution.includes('4K')) fileSize = 980 * 1024 * 1024;
    else if (options.resolution.includes('2K')) fileSize = 650 * 1024 * 1024;
    else if (options.resolution.includes('1080p')) fileSize = 380 * 1024 * 1024;
    else if (options.resolution.includes('720p')) fileSize = 190 * 1024 * 1024;
    else if (isAudio) fileSize = 12 * 1024 * 1024;

    const subfolder = isVideo ? 'Videos' : isAudio ? 'Music' : 'Downloads';
    const savePath = `${saveFolder}\\${subfolder}\\${options.fileName}`;

    const numChunks = Math.min(Math.max(options.threads, 4), 16);
    const chunks = Array.from({ length: numChunks }, (_, i) => ({
      id: i + 1,
      progress: 0,
      speed: 0,
    }));

    // If Smart Queue is enabled, check available slots
    const currentActive = downloads.filter((d) => d.status === 'downloading').length;
    const shouldQueue =
      queueSettings.enabled &&
      options.startNow &&
      currentActive >= queueSettings.maxConcurrent;

    const initialStatus: DownloadStatus = !options.startNow
      ? 'paused'
      : shouldQueue
      ? 'queued'
      : 'downloading';

    const newItem: DownloadItem = {
      id: `dl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: options.fileName,
      url: options.url,
      category,
      fileSize,
      downloadedBytes: 0,
      status: initialStatus,
      priority: 'normal',
      speed: initialStatus === 'downloading' ? 4.5 * 1024 * 1024 : 0,
      eta: initialStatus === 'downloading' ? 45 : 0,
      progress: 0,
      chunks,
      resolution: isVideo || isAudio ? options.resolution : undefined,
      downloadType: options.formatType,
      thumbnail: isVideo
        ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80'
        : undefined,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      savePath,
      resumeSupported: true,
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };

    setDownloads((prev) => [newItem, ...prev]);
    setFormatModalOpen(false);

    if (initialStatus === 'downloading') {
      setProgressModalItem(newItem);
      addToast('Download Started', `Downloading ${options.fileName} via 8 connections.`, 'info');
    } else if (initialStatus === 'queued') {
      addToast('Added to Smart Queue', `${options.fileName} waiting for next open slot.`, 'info');
    }
  };

  const handleStartBatch = (urls: string[], defaultFormat: 'video' | 'audio' | 'auto') => {
    soundManager.playStart();
    const currentActive = downloads.filter((d) => d.status === 'downloading').length;
    let availableSlots = queueSettings.enabled
      ? Math.max(0, queueSettings.maxConcurrent - currentActive)
      : urls.length;

    const newItems: DownloadItem[] = urls.map((url, idx) => {
      const parts = url.split('/');
      let rawName = parts[parts.length - 1].split('?')[0] || `batch_item_${idx + 1}.mp4`;
      
      let type: 'video' | 'audio' | 'file' = 'file';
      let cat: DownloadCategory = 'programs';
      if (defaultFormat === 'video' || /youtube|youtu\.be|facebook|vimeo/i.test(url)) {
        type = 'video';
        cat = 'videos';
        if (!rawName.endsWith('.mp4')) rawName += '.mp4';
      } else if (defaultFormat === 'audio' || /soundcloud|spotify|music/i.test(url)) {
        type = 'audio';
        cat = 'music';
        if (!rawName.endsWith('.mp3')) rawName += '.mp3';
      }

      // Check slot availability
      const shouldStart = availableSlots > 0;
      if (shouldStart) {
        availableSlots--;
      }

      const itemStatus: DownloadStatus = shouldStart ? 'downloading' : 'queued';

      return {
        id: `dl-batch-${Date.now()}-${idx}`,
        name: rawName,
        url,
        category: cat,
        fileSize: Math.floor((45 + Math.random() * 200) * 1024 * 1024),
        downloadedBytes: 0,
        status: itemStatus,
        priority: 'normal' as DownloadPriority,
        speed: shouldStart ? (2.5 + Math.random() * 3) * 1024 * 1024 : 0,
        eta: 35,
        progress: 0,
        chunks: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, progress: 0, speed: 0 })),
        resolution: type === 'video' ? '1080p (FHD)' : type === 'audio' ? 'MP3 320kbps' : undefined,
        downloadType: type,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        savePath: `${saveFolder}\\Batch\\${rawName}`,
        resumeSupported: true,
        checksum: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      };
    });

    setDownloads((prev) => [...newItems, ...prev]);
    setBatchModalOpen(false);
    addToast('Batch Download Initiated', `Queued ${urls.length} URLs for multi-threaded download.`, 'success');
  };

  const handleChangePriority = (id: string, priority: DownloadPriority) => {
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, priority } : d))
    );
    const item = downloads.find((d) => d.id === id);
    if (item) {
      addToast('Priority Updated', `${item.name} set to ${priority.toUpperCase()} priority.`, 'info');
    }
  };

  const handleStartQueuedNow = (id: string) => {
    soundManager.playStart();
    setDownloads((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'downloading',
              speed: 4.5 * 1024 * 1024,
            }
          : d
      )
    );
    addToast('Task Started', 'Bypassed queue and started immediately.', 'success');
  };

  const handleTogglePause = (item: DownloadItem) => {
    setDownloads((prev) =>
      prev.map((d) => {
        if (d.id === item.id) {
          const nextStatus: DownloadStatus = d.status === 'downloading' ? 'paused' : 'downloading';
          return {
            ...d,
            status: nextStatus,
            speed: nextStatus === 'downloading' ? 4.2 * 1024 * 1024 : 0,
          };
        }
        return d;
      })
    );
    const isPausedNow = item.status === 'downloading';
    addToast(isPausedNow ? 'Download Paused' : 'Download Resumed', item.name, isPausedNow ? 'warning' : 'info');
  };

  const handleStopItem = (item: DownloadItem) => {
    setDownloads((prev) =>
      prev.map((d) => {
        if (d.id === item.id) {
          return { ...d, status: 'stopped', speed: 0, eta: 0 };
        }
        return d;
      })
    );
    addToast('Download Stopped', item.name, 'warning');
  };

  const handleRedownloadItem = (item: DownloadItem) => {
    soundManager.playStart();
    setDownloads((prev) =>
      prev.map((d) => {
        if (d.id === item.id) {
          return {
            ...d,
            downloadedBytes: 0,
            progress: 0,
            status: 'downloading',
            speed: 4.5 * 1024 * 1024,
            eta: Math.ceil(d.fileSize / (4.5 * 1024 * 1024)),
            chunks: d.chunks.map((c) => ({ ...c, progress: 0, speed: 0 })),
          };
        }
        return d;
      })
    );
    setProgressModalItem(item);
    addToast('Re-download Started', item.name, 'info');
  };

  const handleDeleteItem = (id: string) => {
    const item = downloads.find((d) => d.id === id);
    setDownloads((prev) => prev.filter((d) => d.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    if (progressModalItem?.id === id) setProgressModalItem(null);
    if (item) {
      addToast('Removed from list', item.name, 'info');
    }
  };

  const handleStopSelected = () => {
    setDownloads((prev) =>
      prev.map((d) => (selectedIds.includes(d.id) ? { ...d, status: 'stopped', speed: 0 } : d))
    );
    addToast('Stopped Selected', `Stopped ${selectedIds.length} item(s)`, 'warning');
  };

  const handleRedownloadSelected = () => {
    soundManager.playStart();
    setDownloads((prev) =>
      prev.map((d) =>
        selectedIds.includes(d.id)
          ? {
              ...d,
              downloadedBytes: 0,
              progress: 0,
              status: 'downloading',
              speed: 4.2 * 1024 * 1024,
              chunks: d.chunks.map((c) => ({ ...c, progress: 0 })),
            }
          : d
      )
    );
    addToast('Restarted Selected', `Re-started ${selectedIds.length} item(s)`, 'info');
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedIds.length} item(s) from the list?`)) {
      setDownloads((prev) => prev.filter((d) => !selectedIds.includes(d.id)));
      setSelectedIds([]);
      addToast('Deleted Items', 'Selected items removed from queue.', 'info');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all items from the download list?')) {
      setDownloads([]);
      setSelectedIds([]);
      setProgressModalItem(null);
      addToast('List Cleared', 'All download tasks cleared.', 'info');
    }
  };

  const handleChangeFolder = () => {
    const custom = prompt('Enter custom download folder path:', saveFolder);
    if (custom && custom.trim()) {
      setSaveFolder(custom.trim());
      addToast('Folder Updated', `Save directory set to: ${custom.trim()}`, 'success');
    }
  };

  const handleOpenFolder = () => {
    addToast('Downloads Directory', `${saveFolder} (Videos, Music, Documents)`, 'info');
    alert(`Output Directory: ${saveFolder}\nAll downloads are organized automatically into Videos, Music, Documents, and Programs subfolders.`);
  };

  const handleSaveToDisk = (item: DownloadItem) => {
    soundManager.playCompleted();
    // Generate real blob download to user's device browser
    const content = `=====================================================
SHUVO IDM PRO - VERIFIED DOWNLOAD FILE
=====================================================
File Name       : ${item.name}
Original URL    : ${item.url}
Resolution/Type : ${item.resolution || item.downloadType}
File Size       : ${formatBytes(item.fileSize)}
Downloaded Time : ${new Date().toISOString()}
SHA-256 Checksum: ${item.checksum || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
Developer       : SM Shuvo (01997966529)
Status          : Verified 100% Download Integrity
=====================================================
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name.endsWith('.txt') ? item.name : `${item.name}.idm-info.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Saved to PC Disk', `${item.name} downloaded to your machine.`, 'success');
  };

  const handleActivateLicense = (key: string) => {
    const res = verifyLicenseKey(key, license.machineId);
    if (res.valid) {
      soundManager.playCompleted();
      setLicense({
        status: 'ACTIVATED',
        info: res.duration,
        machineId: license.machineId,
        expiryDate: res.expiryDate,
        activatedKey: key,
        trialDaysLeft: 0,
      });
      addToast('License Activated', `Lifetime access unlocked with key ${key}`, 'success');
      return { success: true, message: `✓ ${res.message}` };
    }
    soundManager.playAlert();
    addToast('Activation Failed', res.message, 'error');
    return { success: false, message: `✗ ${res.message}` };
  };

  const handleResetToTrial = () => {
    setLicense({
      status: 'TRIAL',
      info: `${TRIAL_DAYS} Days Left`,
      machineId: license.machineId,
      trialDaysLeft: TRIAL_DAYS,
    });
    addToast('Demo Reset', 'Reset license to 3-day trial mode for demonstration.', 'info');
  };

  const handleChangeSpeedLimit = (newLimit: string) => {
    setSpeedLimit(newLimit);
    addToast('Speed Limit Changed', `Network throttle set to: ${newLimit}`, 'info');
  };

  // Compute active totals
  const activeDownloads = downloads.filter((d) => d.status === 'downloading');
  const globalSpeed = activeDownloads.reduce((acc, curr) => acc + curr.speed, 0);
  const activeThreadsCount = activeDownloads.length * 8;

  // Filter downloads for table view
  const visibleDownloads = downloads.filter((d) => {
    const matchCategory = selectedCategory === 'all' || d.category === selectedCategory;
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'failed'
        ? d.status === 'failed' || d.status === 'stopped'
        : d.status === statusFilter;
    return matchCategory && matchStatus;
  });

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 font-sans overflow-hidden text-slate-100 select-none">
      {/* 1. Window Header / TitleBar */}
      <TitleBar
        license={license}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenLicense={() => setLicenseModalOpen(true)}
        onOpenHelp={() => setHelpModalOpen(true)}
        onOpenSnifferDemo={() => setSnifferDemoOpen(true)}
        onOpenSoftwareBuilder={() => setSoftwareBuilderOpen(true)}
      />

      {/* 2. Top IDM Ribbon Toolbar */}
      <Toolbar
        onAddUrl={handleOpenAddUrl}
        onPasteAndDownload={handlePasteAndDownload}
        onMultiLink={() => setBatchModalOpen(true)}
        onActivateKey={() => setLicenseModalOpen(true)}
        onStopSelected={handleStopSelected}
        onRedownloadSelected={handleRedownloadSelected}
        onDeleteSelected={handleDeleteSelected}
        onClearAll={handleClearAll}
        onOpenFolder={handleOpenFolder}
        onChangeFolder={handleChangeFolder}
        onOpenApiModal={() => setApiModalOpen(true)}
        onOpenProxyModal={() => setProxyModalOpen(true)}
        onOpenSmartQueue={() => setSmartQueueModalOpen(true)}
        onOpenSoftwareBuilder={() => setSoftwareBuilderOpen(true)}
        activeQueueCount={activeDownloads.length}
        maxConcurrent={queueSettings.maxConcurrent}
        queueEnabled={queueSettings.enabled}
        proxyConfig={proxyConfig}
        hasSelection={selectedIds.length > 0}
        saveFolder={saveFolder}
        speedLimit={speedLimit}
        onChangeSpeedLimit={handleChangeSpeedLimit}
      />

      {/* 3. Main Body: Sidebar + Downloads Table */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setStatusFilter('all');
          }}
          statusFilter={statusFilter}
          onSelectStatusFilter={setStatusFilter}
          downloads={downloads}
          saveFolder={saveFolder}
          onContactClick={() => setLicenseModalOpen(true)}
          onKeygenClick={() => setAdminKeygenOpen(true)}
        />

        <DownloadTable
          downloads={visibleDownloads}
          selectedIds={selectedIds}
          onToggleSelect={(id) => {
            setSelectedIds((prev) =>
              prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
            );
          }}
          onSelectAll={() => setSelectedIds(visibleDownloads.map((d) => d.id))}
          onClearSelection={() => setSelectedIds([])}
          onInspectItem={(item) => {
            if (item.status === 'completed') {
              setMediaPreviewItem(item);
            } else {
              setProgressModalItem(item);
            }
          }}
          onTogglePauseItem={handleTogglePause}
          onStopItem={handleStopItem}
          onRedownloadItem={handleRedownloadItem}
          onDeleteItem={handleDeleteItem}
          onSaveToDisk={handleSaveToDisk}
          onPasteAndDownload={handlePasteAndDownload}
          onOpenFolder={handleOpenFolder}
          onChangePriority={handleChangePriority}
        />
      </div>

      {/* 4. Bottom IDM Telemetry StatusBar */}
      <StatusBar
        license={license}
        proxyConfig={proxyConfig}
        queueSettings={queueSettings}
        queuedCount={downloads.filter((d) => d.status === 'queued').length}
        globalSpeed={globalSpeed}
        activeDownloadsCount={activeDownloads.length}
        activeThreadsCount={activeThreadsCount}
        speedLimit={speedLimit}
        onChangeSpeedLimit={handleChangeSpeedLimit}
        onOpenLicense={() => setLicenseModalOpen(true)}
        onOpenProxyModal={() => setProxyModalOpen(true)}
        onOpenSmartQueue={() => setSmartQueueModalOpen(true)}
      />

      {/* --- Floating Toast Notifications Container --- */}
      {toasts.length > 0 && (
        <div className="fixed bottom-12 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`p-3 rounded-xl border shadow-2xl flex items-start justify-between gap-2.5 pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-5 duration-200 ${
                t.type === 'success'
                  ? 'bg-slate-900/95 border-emerald-500/60 text-emerald-200'
                  : t.type === 'warning'
                  ? 'bg-slate-900/95 border-amber-500/60 text-amber-200'
                  : t.type === 'error'
                  ? 'bg-slate-900/95 border-rose-500/60 text-rose-200'
                  : 'bg-slate-900/95 border-cyan-500/60 text-cyan-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {t.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                ) : t.type === 'warning' ? (
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                ) : t.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-xs text-white">{t.title}</div>
                  <div className="text-[11px] text-slate-300 opacity-90 leading-tight mt-0.5">
                    {t.message}
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- Modals & Overlays --- */}

      {/* Live IDM Segmented Progress Modal */}
      {progressModalItem && (
        <IDMProgressModal
          item={progressModalItem}
          onClose={() => setProgressModalItem(null)}
          onTogglePause={() => handleTogglePause(progressModalItem)}
          onCancel={() => {
            handleStopItem(progressModalItem);
            setProgressModalItem(null);
          }}
          onSaveToDisk={() => handleSaveToDisk(progressModalItem)}
          onOpenFolder={handleOpenFolder}
        />
      )}

      {/* Resolution & Format Modal */}
      {formatModalOpen && (
        <FormatResolutionModal
          initialUrl={formatInitialUrl}
          onClose={() => setFormatModalOpen(false)}
          onConfirm={handleConfirmAddDownload}
        />
      )}

      {/* Multi-Link Batch Downloader Modal */}
      {batchModalOpen && (
        <BatchDownloadModal
          onClose={() => setBatchModalOpen(false)}
          onStartBatch={handleStartBatch}
        />
      )}

      {/* License & Cryptographic Key Generator Modal */}
      {licenseModalOpen && (
        <LicenseModal
          license={license}
          onClose={() => setLicenseModalOpen(false)}
          onActivate={handleActivateLicense}
          onResetToTrial={handleResetToTrial}
          onOpenAdminKeygen={() => {
            setLicenseModalOpen(false);
            setAdminKeygenOpen(true);
          }}
        />
      )}

      {/* Media Preview & Checksum Inspector Modal */}
      {mediaPreviewItem && (
        <MediaPreviewModal
          item={mediaPreviewItem}
          onClose={() => setMediaPreviewItem(null)}
          onSaveToDisk={() => handleSaveToDisk(mediaPreviewItem)}
          onOpenFolder={handleOpenFolder}
        />
      )}

      {/* Browser Video Sniffer Overlay Demo */}
      {snifferDemoOpen && (
        <BrowserSnifferDemo
          onClose={() => setSnifferDemoOpen(false)}
          onSniffDownload={(quality, type) => {
            handleConfirmAddDownload({
              url: 'https://www.youtube.com/watch?v=bangla_tech_2026_review',
              fileName: type === 'audio' ? 'Bangla_Tech_Audio_320kbps.mp3' : 'Bangla_Tech_Review_HD.mp4',
              formatType: type,
              resolution: quality,
              downloadThumbnail: true,
              threads: 8,
              startNow: true,
            });
          }}
        />
      )}

      {/* Flask API Integration Modal */}
      {apiModalOpen && (
        <ApiExtensionModal
          onClose={() => setApiModalOpen(false)}
          onSendTestDownload={(url) => {
            handleConfirmAddDownload({
              url,
              fileName: 'Extension_Intercepted_Video.mp4',
              formatType: 'video',
              resolution: '1080p (FHD)',
              downloadThumbnail: true,
              threads: 8,
              startNow: true,
            });
          }}
        />
      )}

      {/* Help & Shortcuts Modal */}
      {helpModalOpen && <HelpModal onClose={() => setHelpModalOpen(false)} />}

      {/* Proxy Configuration Modal */}
      {proxyModalOpen && (
        <ProxyConfigModal
          currentConfig={proxyConfig}
          onClose={() => setProxyModalOpen(false)}
          onSave={(cfg) => {
            setProxyConfig(cfg);
            addToast('Proxy Saved', cfg.enabled ? `Tunnel active: ${cfg.protocol.toUpperCase()}://${cfg.host}:${cfg.port}` : 'Proxy disabled', 'info');
          }}
        />
      )}

      {/* SM Shuvo Standalone Admin Keygen Software Portal */}
      {adminKeygenOpen && (
        <AdminKeygenModal
          onClose={() => setAdminKeygenOpen(false)}
          defaultMachineId={license.machineId}
        />
      )}

      {/* Smart Queue & Concurrency Thread Manager Modal */}
      {smartQueueModalOpen && (
        <SmartQueueModal
          settings={queueSettings}
          downloads={downloads}
          onClose={() => setSmartQueueModalOpen(false)}
          onUpdateSettings={(newSettings) => {
            setQueueSettings(newSettings);
            addToast('Queue Settings Updated', `Max concurrency: ${newSettings.maxConcurrent} active slots`, 'success');
          }}
          onChangePriority={handleChangePriority}
          onStartQueuedNow={handleStartQueuedNow}
          onPauseItem={handleTogglePause}
        />
      )}

      {/* Software Builder & .EXE Exporter Modal */}
      {softwareBuilderOpen && (
        <SoftwareBuilderModal onClose={() => setSoftwareBuilderOpen(false)} />
      )}
    </div>
  );
}
