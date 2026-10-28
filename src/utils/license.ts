import { md5, hmacSha256 } from './cryptoUtil';

export const SECRET_SALT = 'ShuvoSecretMasterKey2026';
export const TRIAL_DAYS = 3;

/**
 * Generates a stable Machine ID based on hardware/browser fingerprint or persistent seed
 */
export function getOrGenerateMachineId(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('shuvo_idm_machine_id');
    if (stored) return stored;
    
    // Deterministic hardware fingerprint based on platform, screen, language, cores
    const userAgent = navigator.userAgent || 'Desktop';
    const screenRes = `${window.screen?.width || 1920}x${window.screen?.height || 1080}x${window.screen?.colorDepth || 24}`;
    const lang = navigator.language || 'en';
    const cores = (navigator as unknown as { hardwareConcurrency?: number }).hardwareConcurrency || 4;
    const rawId = `SHUVO-${userAgent}-${screenRes}-${lang}-${cores}`;
    
    const hash = md5(rawId).substring(0, 8).toUpperCase();
    const machineId = `SHUVO-${hash}`;
    localStorage.setItem('shuvo_idm_machine_id', machineId);
    return machineId;
  }
  return 'SHUVO-B7EI4KK6';
}

/**
 * Computes the HMAC-SHA256 signature matching the Python algorithm:
 * expected_msg = f"{self.machine_id}-{str(days_option).upper()}"
 * expected_sig = hmac.new(SECRET_SALT.encode(), expected_msg.encode(), hashlib.sha256).hexdigest().upper()
 * valid_key = f"SHUVO-{expected_sig[:16]}"
 */
export function generateLicenseKey(machineId: string, duration: string | number): string {
  const cleanMachineId = machineId.trim().toUpperCase();
  const durStr = String(duration).trim().toUpperCase();
  const expectedMsg = `${cleanMachineId}-${durStr}`;
  const sig = hmacSha256(SECRET_SALT, expectedMsg).toUpperCase();
  return `SHUVO-${sig.substring(0, 16)}`;
}

export interface LicenseVerificationResult {
  valid: boolean;
  duration: string;
  expiryDate?: string;
  message: string;
}

export function verifyLicenseKey(inputKey: string, machineId: string): LicenseVerificationResult {
  const cleanKey = inputKey.trim().toUpperCase();
  const options: (number | string)[] = [1, 3, 7, 10, 15, 20, 30, 60, 90, 365, 'LIFETIME'];

  for (const opt of options) {
    const expected = generateLicenseKey(machineId, opt);
    if (cleanKey === expected) {
      if (String(opt).toUpperCase() === 'LIFETIME') {
        return {
          valid: true,
          duration: 'LIFETIME',
          message: 'Lifetime Access Unlocked Successfully!',
        };
      }
      const days = Number(opt);
      const date = new Date();
      date.setDate(date.getDate() + days);
      const expiryStr = date.toISOString().split('T')[0];
      return {
        valid: true,
        duration: `${days} Days`,
        expiryDate: expiryStr,
        message: `Activated Successfully for ${days} Days!`,
      };
    }
  }

  return {
    valid: false,
    duration: '0',
    message: 'Invalid License Key for this Machine ID!',
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatSpeed(bytesPerSec: number): string {
  if (!bytesPerSec || bytesPerSec <= 0) return '0 KB/s';
  if (bytesPerSec < 1024 * 1024) {
    return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  }
  return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`;
}

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}
