import { DownloadItem, DownloadPriority, QueueSettings } from '../types/idm';
export { formatBytes } from './license';

export const DEFAULT_QUEUE_SETTINGS: QueueSettings = {
  enabled: true,
  maxConcurrent: 2,
  autoPromote: true,
  dynamicBandwidthAllocation: true,
  totalBandwidthLimitKBps: 0, // 0 = unlimited
};

export const PRIORITY_WEIGHTS: Record<DownloadPriority, number> = {
  high: 3.0,
  normal: 1.5,
  low: 0.6,
};

export const PRIORITY_LABELS: Record<DownloadPriority, { label: string; badge: string; color: string; desc: string }> = {
  high: {
    label: 'High Priority',
    badge: 'HIGH',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    desc: '3.0x Bandwidth Weight — Processed First',
  },
  normal: {
    label: 'Normal Priority',
    badge: 'NORMAL',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    desc: '1.5x Bandwidth Weight — Standard Queue',
  },
  low: {
    label: 'Low Priority',
    badge: 'LOW',
    color: 'bg-slate-500/20 text-slate-400 border-slate-600/40',
    desc: '0.6x Bandwidth Weight — Background/Idle',
  },
};

export function getPriorityScore(priority: DownloadPriority): number {
  switch (priority) {
    case 'high':
      return 3;
    case 'normal':
      return 2;
    case 'low':
      return 1;
    default:
      return 2;
  }
}

export function compareDownloadsByPriority(a: DownloadItem, b: DownloadItem): number {
  const scoreDiff = getPriorityScore(b.priority || 'normal') - getPriorityScore(a.priority || 'normal');
  if (scoreDiff !== 0) {
    return scoreDiff;
  }
  // Secondary sort: earlier creation time gets processed first
  const timeA = new Date(a.createdAt || 0).getTime();
  const timeB = new Date(b.createdAt || 0).getTime();
  return timeA - timeB;
}

export interface QueueScheduleResult {
  updatedItems: DownloadItem[];
  promotedIds: string[];
  activeCount: number;
  queuedCount: number;
  slotsRemaining: number;
}

/**
 * Pure scheduler function to enforce maxConcurrent download limit
 * and auto-promote highest priority queued downloads into active downloading state.
 */
export function scheduleSmartQueue(
  items: DownloadItem[],
  settings: QueueSettings = DEFAULT_QUEUE_SETTINGS
): QueueScheduleResult {
  if (!settings.enabled) {
    const active = items.filter(i => i.status === 'downloading').length;
    const queued = items.filter(i => i.status === 'queued').length;
    return {
      updatedItems: items,
      promotedIds: [],
      activeCount: active,
      queuedCount: queued,
      slotsRemaining: Math.max(0, settings.maxConcurrent - active),
    };
  }

  const activeItems = items.filter(i => i.status === 'downloading');
  const activeCount = activeItems.length;
  const queuedItems = items.filter(i => i.status === 'queued');
  const queuedCount = queuedItems.length;

  const slotsAvailable = Math.max(0, settings.maxConcurrent - activeCount);
  if (slotsAvailable <= 0 || queuedCount === 0 || !settings.autoPromote) {
    return {
      updatedItems: items,
      promotedIds: [],
      activeCount,
      queuedCount,
      slotsRemaining: slotsAvailable,
    };
  }

  // Sort queued items by priority descending then createdAt ascending
  const sortedQueued = [...queuedItems].sort(compareDownloadsByPriority);
  const itemsToPromote = sortedQueued.slice(0, slotsAvailable);
  const promoteIdSet = new Set(itemsToPromote.map(i => i.id));

  const updatedItems = items.map(item => {
    if (promoteIdSet.has(item.id)) {
      return {
        ...item,
        status: 'downloading' as const,
      };
    }
    return item;
  });

  return {
    updatedItems,
    promotedIds: Array.from(promoteIdSet),
    activeCount: activeCount + itemsToPromote.length,
    queuedCount: queuedCount - itemsToPromote.length,
    slotsRemaining: Math.max(0, settings.maxConcurrent - (activeCount + itemsToPromote.length)),
  };
}

/**
 * Calculates dynamic bandwidth distribution shares for active downloads.
 * High priority downloads receive proportionally higher speed multipliers.
 */
export function calculatePrioritySpeedMultiplier(
  priority: DownloadPriority,
  isDynamicEnabled: boolean = true
): number {
  if (!isDynamicEnabled) return 1.0;
  return PRIORITY_WEIGHTS[priority] || 1.0;
}

export function loadQueueSettings(): QueueSettings {
  try {
    const saved = localStorage.getItem('idm_smart_queue_settings');
    if (saved) {
      return { ...DEFAULT_QUEUE_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_QUEUE_SETTINGS;
}

export function saveQueueSettings(settings: QueueSettings): void {
  try {
    localStorage.setItem('idm_smart_queue_settings', JSON.stringify(settings));
  } catch {
    // ignore
  }
}
