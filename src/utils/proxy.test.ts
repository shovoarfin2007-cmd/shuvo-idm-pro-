import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateProxyConfig,
  formatProxyUri,
  getProxySpeedMultiplier,
  DEFAULT_PROXY_CONFIG,
} from './proxy';
import { ProxyConfig } from '../types/idm';

test('validateProxyConfig allows disabled proxy regardless of empty host', () => {
  const result = validateProxyConfig(DEFAULT_PROXY_CONFIG);
  assert.equal(result.valid, true);
});

test('validateProxyConfig requires valid host and port when enabled', () => {
  const invalidHost: ProxyConfig = {
    ...DEFAULT_PROXY_CONFIG,
    enabled: true,
    host: '   ',
    port: '8080',
  };
  const hostRes = validateProxyConfig(invalidHost);
  assert.equal(hostRes.valid, false);
  assert.match(hostRes.error || '', /host address cannot be empty/i);

  const invalidPort: ProxyConfig = {
    ...DEFAULT_PROXY_CONFIG,
    enabled: true,
    host: '127.0.0.1',
    port: '99999',
  };
  const portRes = validateProxyConfig(invalidPort);
  assert.equal(portRes.valid, false);
  assert.match(portRes.error || '', /between 1 and 65535/i);

  const validConfig: ProxyConfig = {
    ...DEFAULT_PROXY_CONFIG,
    enabled: true,
    host: '127.0.0.1',
    port: 1080,
  };
  const validRes = validateProxyConfig(validConfig);
  assert.equal(validRes.valid, true);
});

test('formatProxyUri formats URI properly with masked credentials', () => {
  const config: ProxyConfig = {
    enabled: true,
    protocol: 'socks5',
    host: 'proxy.internal.corp',
    port: 1080,
    username: 'admin',
    password: 'supersecretpassword',
    bypassLocal: true,
    status: 'connected',
  };

  const masked = formatProxyUri(config, true);
  assert.equal(masked, 'socks5://admin:***@proxy.internal.corp:1080');

  const unmasked = formatProxyUri(config, false);
  assert.equal(unmasked, 'socks5://admin:supersecretpassword@proxy.internal.corp:1080');
});

test('getProxySpeedMultiplier calculates realistic throughput modifiers', () => {
  const disabled: ProxyConfig = { ...DEFAULT_PROXY_CONFIG, enabled: false };
  assert.equal(getProxySpeedMultiplier(disabled), 1.0);

  const localProxy: ProxyConfig = {
    ...DEFAULT_PROXY_CONFIG,
    enabled: true,
    status: 'connected',
    host: '127.0.0.1',
    port: 8080,
  };
  assert.equal(getProxySpeedMultiplier(localProxy), 0.96);

  const remoteProxy: ProxyConfig = {
    ...DEFAULT_PROXY_CONFIG,
    enabled: true,
    status: 'connected',
    host: '194.26.29.112',
    port: 3128,
  };
  assert.equal(getProxySpeedMultiplier(remoteProxy), 0.85);
});
