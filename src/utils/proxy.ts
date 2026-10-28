import { ProxyConfig } from '../types/idm';

export const DEFAULT_PROXY_CONFIG: ProxyConfig = {
  enabled: false,
  protocol: 'http',
  host: '',
  port: '',
  username: '',
  password: '',
  bypassLocal: true,
  status: 'untested',
};

/**
 * Validates a proxy configuration object
 */
export function validateProxyConfig(config: ProxyConfig): { valid: boolean; error?: string } {
  if (!config.enabled) {
    return { valid: true };
  }

  const host = config.host.trim();
  if (!host) {
    return { valid: false, error: 'Proxy host address cannot be empty.' };
  }

  const portNum = Number(config.port);
  if (!portNum || isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return { valid: false, error: 'Proxy port must be a valid integer between 1 and 65535.' };
  }

  return { valid: true };
}

/**
 * Formats a ProxyConfig into a standard connection URI: protocol://[user:pass@]host:port
 */
export function formatProxyUri(config: ProxyConfig, maskPassword = true): string {
  if (!config.host || !config.port) return 'None';

  let authPart = '';
  if (config.username) {
    const pass = maskPassword ? '***' : config.password || '';
    authPart = `${encodeURIComponent(config.username)}:${pass}@`;
  }

  return `${config.protocol}://${authPart}${config.host}:${config.port}`;
}

/**
 * Simulates proxy throughput penalty / overhead multiplier.
 * SOCKS5 typically has slightly different overhead compared to HTTP/HTTPS proxies.
 */
export function getProxySpeedMultiplier(config: ProxyConfig): number {
  if (!config.enabled || config.status !== 'connected') {
    return 1.0;
  }
  // Fast local proxies have ~95% throughput, remote proxies ~80-88%
  if (config.host === '127.0.0.1' || config.host === 'localhost') {
    return 0.96;
  }
  return 0.85;
}
