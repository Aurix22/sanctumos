import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { SanctumKernel } from '../core/kernel';
import type { Window as WinType, Process } from '../core/types';
import { AppService, type AppManifest } from '../services/AppService';
import { NotificationService, type Notification } from '../services/NotificationService';
import { FileSystemService } from '../services/FileSystemService';
import { ElectronHAL } from '../hal/ElectronHAL';

// Singletons
const hal = new ElectronHAL();
const kernel = new SanctumKernel();
const appService = new AppService();
const notificationService = new NotificationService();
const fsService = new FileSystemService();

interface SystemState {
  isBooted: boolean;
  windows: Map<string, WinType>;
  processes: Map<number, Process>;
  notifications: Notification[];
  apps: Map<string, AppManifest>;
  systemInfo: { battery: { level: number; isCharging: boolean } | null; platform: string; version: string; };
  actions: {
    boot: () => Promise<void>;
    shutdown: () => void;
    // apps
    launchApp: (appId: string) => Promise<number>;
    closeApp: (pid: number) => void;
    installApp: (manifest: AppManifest) => void;
    // windows
    createWindow: (pid: number, config: Partial<WinType>) => string;
    closeWindow: (windowId: string) => void;
    focusWindow: (windowId: string) => void;
    minimizeWindow: (windowId: string) => void;
    maximizeWindow: (windowId: string) => void;
    updateWindowPosition: (windowId: string, x: number, y: number) => void;
    updateWindowSize: (windowId: string, width: number, height: number) => void;
    // notifications
    showNotification: (title: string, message: string, priority?: 'low'|'normal'|'high'|'urgent') => void;
    dismissNotification: (id: string) => void;
    // fs
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    listDirectory: (path: string) => Promise<string[]>;
  };
}

export const useSystemStore = create<SystemState>()(
  subscribeWithSelector((set, get) => ({
    isBooted: false,
    windows: new Map(),
    processes: new Map(),
    notifications: [],
    apps: new Map(),
    systemInfo: { battery: null, platform: 'unknown', version: '0.0.1' },

    actions: {
      boot: async () => {
        if (get().isBooted) return;
        await hal.initialize();
        const [battery, platform] = await Promise.all([hal.getBatteryInfo(), hal.getPlatform()]);
        set({ systemInfo: { battery, platform: platform || 'unknown', version: '0.0.1' } });

        // Kernel event subscriptions
        kernel.on('window:created', (e: any) => {
          const { id, window } = e.detail; set(s => ({ windows: new Map(s.windows).set(id, window) }));
        });
        kernel.on('window:closed', (e: any) => {
          const { id } = e.detail; set(s => { const m = new Map(s.windows); m.delete(id); return { windows: m }; });
        });
        kernel.on('window:updated', (e: any) => {
          const { id, window } = e.detail; set(s => ({ windows: new Map(s.windows).set(id, window) }));
        });
        kernel.on('process:created', (e: any) => {
          const { pid, process } = e.detail; set(s => ({ processes: new Map(s.processes).set(pid, process) }));
        });
        kernel.on('process:terminated', (e: any) => {
          const { pid } = e.detail;
          set(s => {
            const procs = new Map(s.processes); procs.delete(pid);
            const wins = new Map(s.windows); [...wins.entries()].forEach(([wid,w])=>{ if (w.pid===pid) wins.delete(wid); });
            return { processes: procs, windows: wins };
          });
        });

        // Notifications
        notificationService.subscribe(list => set({ notifications: list }));

        // Apps (in-memory; optional)
        const installed = await appService.getInstalledApps();
        set({ apps: new Map(installed.map(a => [a.id, a])) });

        set({ isBooted: true });
        get().actions.showNotification('System Ready', 'Sanctum.OS boot complete', 'normal');
      },

      shutdown: () => {
        get().windows.forEach((_, id) => kernel.closeWindow(id));
        get().processes.forEach((_, pid) => { /* will close its windows */ });
        notificationService.clear();
        set({ isBooted: false, windows: new Map(), processes: new Map(), notifications: [] });
      },

      // Apps
      launchApp: async (appId: string) => {
        const app = get().apps.get(appId);
        if (!app) throw new Error(`App not found: ${appId}`);
        const pid = kernel.createProcess(app.name, app.icon);
        await appService.loadApp(app);
        if (app.windows?.main) {
          kernel.createWindow(pid, {
            title: app.name,
            width: app.windows.main.width ?? 800,
            height: app.windows.main.height ?? 600,
            flags: { resizable: app.windows.main.resizable !== false, closable: true, minimizable: true, maximizable: true, alwaysOnTop: false }
          } as any);
        }
        return pid;
      },
      closeApp: (pid: number) => { /* let kernel handle via terminate if implemented; here close windows only */ },
      installApp: (m: AppManifest) => {
        appService.installApp(m);
        set(s => ({ apps: new Map(s.apps).set(m.id, m) }));
        get().actions.showNotification('App Installed', `${m.name} installed`, 'low');
      },

      // Windows
      createWindow: (pid: number, config: Partial<WinType>) => kernel.createWindow(pid, config as any),
      closeWindow: (windowId: string) => kernel.closeWindow(windowId),
      focusWindow: (windowId: string) => {
        const w = get().windows.get(windowId); if (!w) return;
        kernel.updateWindow(windowId, { focused: true, zIndex: (w.zIndex||1) + 1 } as any);
      },
      minimizeWindow: (windowId: string) => kernel.updateWindow(windowId, { state: 'minimized' } as any),
      maximizeWindow: (windowId: string) => {
        const w = get().windows.get(windowId); if (!w) return;
        kernel.updateWindow(windowId, { state: (w.state === 'maximized' ? 'normal' : 'maximized') } as any);
      },
      updateWindowPosition: (windowId: string, x: number, y: number) => kernel.updateWindow(windowId, { x, y } as any),
      updateWindowSize: (windowId: string, width: number, height: number) => kernel.updateWindow(windowId, { width, height } as any),

      // Notifications (unified with NotificationService shape)
      showNotification: (title: string, message: string, priority: 'low'|'normal'|'high'|'urgent'='normal') => {
        notificationService.show({ appId: 'system', title, body: message, priority });
      },
      dismissNotification: (id: string) => notificationService.dismiss(id),

      // FS
      readFile: (path: string) => fsService.readFile(path),
      writeFile: (path: string, content: string) => fsService.writeFile(path, content),
      listDirectory: (path: string) => fsService.listDirectory(path),
    }
  }))
);

// Convenience selectors
export const useWindows = () => useSystemStore(s => s.windows);
export const useProcesses = () => useSystemStore(s => s.processes);
export const useNotifications = () => useSystemStore(s => s.notifications);
export const useSystemInfo = () => useSystemStore(s => s.systemInfo);
export const useSystemActions = () => useSystemStore(s => s.actions);
