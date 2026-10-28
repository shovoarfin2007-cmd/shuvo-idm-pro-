import { test } from 'node:test';
import assert from 'node:assert';
import {
  scheduleSmartQueue,
  compareDownloadsByPriority,
  calculatePrioritySpeedMultiplier,
  PRIORITY_WEIGHTS,
} from './queue.ts';
import { DownloadItem, QueueSettings } from '../types/idm.ts';

function createMockItem(
  id: string,
  priority: 'high' | 'normal' | 'low',
  status: 'downloading' | 'queued' | 'completed' | 'paused',
  createdAt: string = '2026-10-23T10:00:00Z'
): DownloadItem {
  return {
    id,
    name: `Item-${id}`,
    url: `https://example.com/file-${id}.bin`,
    category: 'all',
    fileSize: 1000000,
    downloadedBytes: 100,
    status,
    priority,
    speed: 1024,
    eta: 30,
    progress: 10,
    chunks: [],
    downloadType: 'file',
    createdAt,
    savePath: '/downloads',
    resumeSupported: true,
  };
}

test('compareDownloadsByPriority sorts high priority ahead of normal and low', () => {
  const high = createMockItem('1', 'high', 'queued', '2026-10-23T10:00:00Z');
  const normal = createMockItem('2', 'normal', 'queued', '2026-10-23T09:00:00Z');
  const low = createMockItem('3', 'low', 'queued', '2026-10-23T08:00:00Z');

  const items = [low, normal, high];
  items.sort(compareDownloadsByPriority);

  assert.strictEqual(items[0].id, '1', 'High priority should be first');
  assert.strictEqual(items[1].id, '2', 'Normal priority should be second');
  assert.strictEqual(items[2].id, '3', 'Low priority should be third');
});

test('compareDownloadsByPriority sorts same priority by earlier createdAt first', () => {
  const highEarlier = createMockItem('h1', 'high', 'queued', '2026-10-23T08:00:00Z');
  const highLater = createMockItem('h2', 'high', 'queued', '2026-10-23T09:00:00Z');

  const items = [highLater, highEarlier];
  items.sort(compareDownloadsByPriority);

  assert.strictEqual(items[0].id, 'h1');
  assert.strictEqual(items[1].id, 'h2');
});

test('scheduleSmartQueue promotes highest priority queued item when slot is available', () => {
  const settings: QueueSettings = {
    enabled: true,
    maxConcurrent: 2,
    autoPromote: true,
    dynamicBandwidthAllocation: true,
    totalBandwidthLimitKBps: 0,
  };

  const items: DownloadItem[] = [
    createMockItem('active1', 'normal', 'downloading'),
    createMockItem('queuedLow', 'low', 'queued', '2026-10-23T07:00:00Z'),
    createMockItem('queuedHigh', 'high', 'queued', '2026-10-23T08:00:00Z'),
    createMockItem('queuedNormal', 'normal', 'queued', '2026-10-23T08:00:00Z'),
  ];

  const result = scheduleSmartQueue(items, settings);

  assert.strictEqual(result.activeCount, 2, 'Should have exactly 2 active downloads');
  assert.strictEqual(result.slotsRemaining, 0, 'No slots should remain');
  assert.deepStrictEqual(result.promotedIds, ['queuedHigh'], 'High priority queued item should be promoted');

  const promoted = result.updatedItems.find(i => i.id === 'queuedHigh');
  assert.strictEqual(promoted?.status, 'downloading');
});

test('scheduleSmartQueue respects maxConcurrent when all slots are full', () => {
  const settings: QueueSettings = {
    enabled: true,
    maxConcurrent: 1,
    autoPromote: true,
    dynamicBandwidthAllocation: true,
    totalBandwidthLimitKBps: 0,
  };

  const items: DownloadItem[] = [
    createMockItem('active1', 'normal', 'downloading'),
    createMockItem('queuedHigh', 'high', 'queued'),
  ];

  const result = scheduleSmartQueue(items, settings);
  assert.strictEqual(result.promotedIds.length, 0, 'Should not promote when slots are filled');
  assert.strictEqual(result.activeCount, 1);
});

test('scheduleSmartQueue does not alter items when queue is disabled', () => {
  const settings: QueueSettings = {
    enabled: false,
    maxConcurrent: 2,
    autoPromote: true,
    dynamicBandwidthAllocation: true,
    totalBandwidthLimitKBps: 0,
  };

  const items: DownloadItem[] = [
    createMockItem('queued1', 'high', 'queued'),
  ];

  const result = scheduleSmartQueue(items, settings);
  assert.strictEqual(result.promotedIds.length, 0);
  assert.strictEqual(result.updatedItems[0].status, 'queued');
});

test('calculatePrioritySpeedMultiplier returns correct weighted shares', () => {
  assert.strictEqual(calculatePrioritySpeedMultiplier('high', true), PRIORITY_WEIGHTS.high);
  assert.strictEqual(calculatePrioritySpeedMultiplier('normal', true), PRIORITY_WEIGHTS.normal);
  assert.strictEqual(calculatePrioritySpeedMultiplier('low', true), PRIORITY_WEIGHTS.low);
  assert.strictEqual(calculatePrioritySpeedMultiplier('high', false), 1.0);
});
