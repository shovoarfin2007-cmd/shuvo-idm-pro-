import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateLicenseKey,
  verifyLicenseKey,
  formatBytes,
  formatSpeed,
  formatDuration,
} from './license';

test('license generation produces valid SHUVO format with 16-hex characters', () => {
  const machineId = 'SHUVO-A1B2C3D4';
  const lifetimeKey = generateLicenseKey(machineId, 'LIFETIME');
  assert.match(lifetimeKey, /^SHUVO-[0-9A-F]{16}$/);

  const thirtyDayKey = generateLicenseKey(machineId, 30);
  assert.match(thirtyDayKey, /^SHUVO-[0-9A-F]{16}$/);
  assert.notEqual(lifetimeKey, thirtyDayKey);
});

test('license verification approves valid generated keys and rejects invalid ones', () => {
  const machineId = 'SHUVO-A1B2C3D4';
  const lifetimeKey = generateLicenseKey(machineId, 'LIFETIME');

  const validResult = verifyLicenseKey(lifetimeKey, machineId);
  assert.equal(validResult.valid, true);
  assert.equal(validResult.duration, 'LIFETIME');

  const thirtyDayKey = generateLicenseKey(machineId, 30);
  const thirtyDayResult = verifyLicenseKey(thirtyDayKey, machineId);
  assert.equal(thirtyDayResult.valid, true);
  assert.equal(thirtyDayResult.duration, '30 Days');
  assert.ok(thirtyDayResult.expiryDate);

  // Mismatched machine ID should fail
  const mismatchedResult = verifyLicenseKey(lifetimeKey, 'SHUVO-DIFFERENT');
  assert.equal(mismatchedResult.valid, false);

  // Arbitrary bad key should fail
  const fakeResult = verifyLicenseKey('SHUVO-BADKEY12345678', machineId);
  assert.equal(fakeResult.valid, false);
});

test('formatBytes properly scales units', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1024 * 1024 * 4.5), '4.5 MB');
  assert.equal(formatBytes(1024 * 1024 * 1024 * 2), '2 GB');
});

test('formatSpeed properly formats transfer rates', () => {
  assert.equal(formatSpeed(0), '0 KB/s');
  assert.equal(formatSpeed(512 * 1024), '512.0 KB/s');
  assert.equal(formatSpeed(2.5 * 1024 * 1024), '2.50 MB/s');
});

test('formatDuration formats seconds accurately', () => {
  assert.equal(formatDuration(45), '45s');
  assert.equal(formatDuration(125), '2m 5s');
  assert.equal(formatDuration(3665), '1h 1m 5s');
});
