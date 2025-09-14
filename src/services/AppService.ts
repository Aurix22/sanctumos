export interface AppWindowSpec { width?: number; height?: number; resizable?: boolean; }
export interface AppManifest {
  id: string; name: string; version?: string; icon: string; main?: any;
  windows?: { main?: AppWindowSpec };
}
export class AppService {
  private apps = new Map<string, AppManifest>();
  async getInstalledApps(): Promise<AppManifest[]> { return [...this.apps.values()]; }
  installApp(m: AppManifest){ this.apps.set(m.id, m); }
  async loadApp(m: AppManifest){ /* hook for lazy import; here NOP */ return true; }
}
