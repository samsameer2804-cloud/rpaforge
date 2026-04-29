const STORAGE_KEYS = [
  'rpaforge-diagrams',
  'rpaforge-process',
  'rpaforge-files',
  'rpaforge-settings',
  'rpaforge-variables',
];

const MAX_STORAGE_MB = 10;
const WARNING_THRESHOLD_MB = 5;

export interface StorageInfo {
  totalBytes: number;
  totalMB: number;
  keys: Record<string, number>;
  isWarning: boolean;
  isExceeded: boolean;
}

export function getStorageInfo(): StorageInfo {
  const keys: Record<string, number> = {};
  let totalBytes = 0;

  for (const key of STORAGE_KEYS) {
    const value = localStorage.getItem(key);
    if (value) {
      const bytes = new Blob([value]).size;
      keys[key] = bytes;
      totalBytes += bytes;
    }
  }

  const totalMB = totalBytes / (1024 * 1024);

  return {
    totalBytes,
    totalMB,
    keys,
    isWarning: totalMB >= WARNING_THRESHOLD_MB,
    isExceeded: totalMB >= MAX_STORAGE_MB,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function clearAllStorage(): void {
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}

export function clearStorageKey(key: string): void {
  localStorage.removeItem(key);
}
