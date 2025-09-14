import { ComponentType } from 'react';

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon: string;
  main: string | ComponentType<any> | (() => Promise<any>);
  permissions?: string[];
  windows?: {
    main?: {
      width?: number;
      height?: number;
      minWidth?: number;
      minHeight?: number;
      resizable?: boolean;
      title?: string;
    };
  };
  services?: string[];
  autostart?: boolean;
}

export class AppService {
  private installedApps: Map<string, AppManifest> = new Map();
  private loadedComponents: Map<string, ComponentType<any>> = new Map();
  private appInstances: Map<string, any> = new Map();

  constructor() {
    this.loadCoreApps();
  }

  private loadCoreApps() {
    const coreApps: AppManifest[] = [
      { id: 'system.desktop', name: 'Desktop', version: '1.0.0', description: 'System desktop environment', author: 'Sanctum Team', icon: 'desktop', main: 'Desktop', autostart: true },
      { id: 'system.dock',     name: 'Dock',    version: '1.0.0', description: 'Application dock',        author: 'Sanctum Team', icon: 'dock',    main: 'Dock',    autostart: true },
      {
        id: 'system.files',
        name: 'Files',
        version: '1.0.0',
        description: 'File manager',
        author: 'Sanctum Team',
        icon: 'folder',
        main: () => import('../apps/Files'),
        windows: { main: { width: 800, height: 600, minWidth: 400, minHeight: 300, resizable: true } },
        permissions: ['filesystem.read', 'filesystem.write']
      },
      {
        id: 'system.terminal',
        name: 'Terminal',
        version: '1.0.0',
        description: 'System terminal',
        author: 'Sanctum Team',
        icon: 'terminal',
        main: () => import('../apps/Terminal'),
        windows: { main: { width: 800, height: 500, minWidth: 400, minHeight: 200, resizable: true } },
        permissions: ['system.execute']
      }
    ];
    coreApps.forEach(app => this.installedApps.set(app.id, app));
  }

  async getInstalledApps(): Promise<AppManifest[]> {
    return Array.from(this.installedApps.values());
  }

  async installApp(manifest: AppManifest): Promise<void> {
    if (!manifest.id || !manifest.name || !manifest.main) throw new Error('Invalid app manifest');
    if (this.installedApps.has(manifest.id)) throw new Error(`App ${manifest.id} is already installed`);
    this.installedApps.set(manifest.id, manifest);
    await this.persistInstalledApps();
  }

  async uninstallApp(appId: string): Promise<void> {
    if (!this.installedApps.has(appId)) throw new Error(`App ${appId} is not installed`);
    if (appId.startsWith('system.')) throw new Error('Cannot uninstall system apps');
    this.installedApps.delete(appId);
    this.loadedComponents.delete(appId);
    this.appInstances.delete(appId);
    await this.persistInstalledApps();
  }

  async loadApp(manifest: AppManifest): Promise<ComponentType<any>> {
    if (this.loadedComponents.has(manifest.id)) return this.loadedComponents.get(manifest.id)!;

    let component: ComponentType<any>;
    const main = manifest.main;

    if (typeof main === 'function' && !(main as any).$$typeof) {
      const mod = await (main as () => Promise<any>)();
      component = (mod.default ?? mod) as ComponentType<any>;
    } else if (typeof main === 'string') {
      throw new Error('String-based app loading not implemented yet');
    } else {
      component = main as ComponentType<any>;
    }

    this.loadedComponents.set(manifest.id, component);
    return component;
  }

  async createAppInstance(appId: string, instanceId: string): Promise<any> {
    const manifest = this.installedApps.get(appId);
    if (!manifest) throw new Error(`App ${appId} not found`);
    await this.loadApp(manifest);

    const instance = {
      id: instanceId,
      appId,
      manifest,
      permissions: new Set(manifest.permissions || []),
      storage: this.createAppStorage(appId),
      api: this.createAppAPI(manifest.permissions || [])
    };

    this.appInstances.set(instanceId, instance);
    return instance;
  }

  private createAppStorage(appId: string) {
    const prefix = `app:${appId}:`;
    return {
      get: (key: string) => { const v = localStorage.getItem(prefix + key); return v ? JSON.parse(v) : null; },
      set: (key: string, value: any) => localStorage.setItem(prefix + key, JSON.stringify(value)),
      remove: (key: string) => localStorage.removeItem(prefix + key),
      clear: () => Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k))
    };
  }

  private createAppAPI(permissions: string[]) {
    const api: any = {};
    if (permissions.includes('filesystem.read'))  api.readFile = async (p: string) => console.log('readFile', p);
    if (permissions.includes('filesystem.write')) api.writeFile = async (p: string, c: string) => console.log('writeFile', p, c);
    if (permissions.includes('network.access'))   api.fetch = async (u: string, o?: any) => fetch(u, o);
    if (permissions.includes('system.execute'))   api.execute = async (cmd: string) => console.log('execute', cmd);
    return api;
  }

  private async persistInstalledApps() {
    const apps = Array.from(this.installedApps.values()).filter(a => !a.id.startsWith('system.'));
    localStorage.setItem('sanctum:installed-apps', JSON.stringify(apps));
  }

  async loadPersistedApps() {
    const saved = localStorage.getItem('sanctum:installed-apps');
    if (saved) {
      try { (JSON.parse(saved) as AppManifest[]).forEach(a => this.installedApps.set(a.id, a)); }
      catch (e) { console.error('Failed to load persisted apps:', e); }
    }
  }
}
