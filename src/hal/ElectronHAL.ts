export class ElectronHAL {
  async initialize(){ return true; }
  async getBatteryInfo(): Promise<{ level: number; isCharging: boolean } | null> {
    try {
      // Browser-approximation; real Electron via powerMonitor im Main-Prozess
      // Fallback: null
      return null;
    } catch { return null; }
  }
  async getPlatform(): Promise<string> {
    try { return typeof navigator !== 'undefined' ? (navigator.platform || 'web') : 'node'; }
    catch { return 'unknown'; }
  }
}
