export type DownloadCategory = 'all' | 'videos' | 'music' | 'documents' | 'programs' | 'torrents';

export type DownloadStatus = 'downloading' | 'paused' | 'completed' | 'stopped' | 'failed' | 'queued';

export type DownloadPriority = 'high' | 'normal' | 'low';

export interface DownloadChunk {
  id: number;
  progress: number; // 0 - 100
  speed: number;    // bytes per sec
}

export interface DownloadItem {
  id: string;
  name: string;
  url: string;
  category: DownloadCategory;
  fileSize: number;       // total bytes
  downloadedBytes: number;
  status: DownloadStatus;
  priority: DownloadPriority;
  speed: number;          // current speed bytes/s
  eta: number;            // seconds left
  progress: number;       // 0 - 100
  chunks: DownloadChunk[];
  resolution?: string;    // e.g. "1080p FHD", "4K (2160p)", "MP3 320kbps"
  downloadType: 'video' | 'audio' | 'file';
  thumbnail?: string;
  createdAt: string;
  completedAt?: string;
  savePath: string;
  resumeSupported: boolean;
  checksum?: string;
  mimeType?: string;
  proxyUsed?: string;
}

export interface LicenseState {
  status: 'TRIAL' | 'ACTIVATED' | 'EXPIRED';
  info: string;
  machineId: string;
  expiryDate?: string;
  activatedKey?: string;
  trialDaysLeft: number;
}

export type ProxyProtocol = 'http' | 'https' | 'socks4' | 'socks5';

export interface ProxyConfig {
  enabled: boolean;
  protocol: ProxyProtocol;
  host: string;
  port: number | string;
  username?: string;
  password?: string;
  bypassLocal: boolean;
  lastTested?: string;
  latencyMs?: number;
  status: 'untested' | 'connected' | 'error';
}

export interface QueueSettings {
  enabled: boolean;
  maxConcurrent: number;            // max active downloading threads (1, 2, 3, 5, etc.)
  autoPromote: boolean;             // auto-start next queued task when slot frees up
  dynamicBandwidthAllocation: boolean; // allocate higher speed slice to High priority tasks
  totalBandwidthLimitKBps: number;  // 0 for unlimited, or cap in KB/s
}

