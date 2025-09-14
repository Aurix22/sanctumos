import { ipcMain, app, screen, powerMonitor, clipboard, dialog, BrowserWindow } from "electron";
import * as os from "os";
import * as fs from "fs/promises";
import type { SystemInfo, BatteryInfo, DisplayInfo } from "../hal/types";

export function setupHALHandlers(){
  // System
  ipcMain.handle("hal:get-system-info", async (): Promise<SystemInfo> => ({
    platform: process.platform,
    arch: process.arch,
    version: app.getVersion(),
    hostname: os.hostname(),
    uptime: os.uptime()
  }));

  ipcMain.handle("hal:get-platform", async () => process.platform);

  ipcMain.handle("hal:get-cpu-info", async () => {
    const cpus = os.cpus(); return { model: cpus?.[0]?.model ?? "Unknown", cores: cpus?.length ?? 0, speed: cpus?.[0]?.speed ?? 0 };
  });

  ipcMain.handle("hal:get-memory-info", async () => {
    const total = os.totalmem(), free = os.freemem(); return { total, free, used: total - free };
  });

  ipcMain.handle("hal:get-storage-info", async () => ({ total: 0, free: 0, used: 0 })); // TODO: implement platform-specific

  ipcMain.handle("hal:get-network-interfaces", async () => {
    const ifs = os.networkInterfaces();
    return Object.entries(ifs).map(([name, addresses]) => ({ name, addresses: addresses ?? [] }));
  });

  // Battery (sync in Electron)
  ipcMain.handle("hal:get-battery-info", async (): Promise<BatteryInfo|null> => {
    try {
      const level = powerMonitor.getBatteryLevel(); // 0..1 (or -1 if unknown)
      const onBattery = powerMonitor.isOnBatteryPower();
      if (level < 0) return null;
      return { level, isCharging: !onBattery };
    } catch { return null; }
  });

  // Displays
  ipcMain.handle("hal:get-displays", async (): Promise<DisplayInfo[]> => {
    return screen.getAllDisplays().map(d => ({
      id: d.id, bounds: d.bounds, workArea: d.workArea, scaleFactor: d.scaleFactor, rotation: d.rotation, internal: (d as any).internal
    }));
  });

  // FS
  ipcMain.handle("hal:read-file", async (_e, p: string) => fs.readFile(p, "utf-8"));
  ipcMain.handle("hal:write-file", async (_e, p: string, c: string) => { await fs.writeFile(p, c, "utf-8"); });
  ipcMain.handle("hal:list-directory", async (_e, p: string) => fs.readdir(p));
  ipcMain.handle("hal:create-directory", async (_e, p: string) => fs.mkdir(p, { recursive: true }));
  ipcMain.handle("hal:delete-file", async (_e, p: string) => fs.unlink(p));
  ipcMain.handle("hal:get-file-info", async (_e, p: string) => {
    const st = await fs.stat(p); return { size: st.size, created: st.birthtime, modified: st.mtime, isDirectory: st.isDirectory(), isFile: st.isFile() };
  });

  // Clipboard & Dialogs
  ipcMain.handle("hal:read-clipboard", async () => clipboard.readText());
  ipcMain.handle("hal:write-clipboard", async (_e, t: string) => { clipboard.writeText(t); });
  ipcMain.handle("hal:show-open-dialog", async (_e, o:any) => {
    const r = await dialog.showOpenDialog(o); return r.canceled ? null : r.filePaths;
  });
  ipcMain.handle("hal:show-save-dialog", async (_e, o:any) => {
    const r = await dialog.showSaveDialog(o); return r.canceled ? null : r.filePath ?? null;
  });
  ipcMain.handle("hal:show-message-box", async (_e, o:any) => (await dialog.showMessageBox(o)).response);

  // Native window mgmt
  const windowMap = new Map<number, BrowserWindow>(); let nextId = 1;
  ipcMain.handle("hal:create-window", async (_e, opts:any) => { const w=new BrowserWindow(opts); const id=nextId++; windowMap.set(id,w); w.on("closed",()=>windowMap.delete(id)); return id; });
  ipcMain.handle("hal:close-window", async (_e, id:number)=>{ windowMap.get(id)?.close(); });
  ipcMain.handle("hal:focus-window", async (_e, id:number)=>{ windowMap.get(id)?.focus(); });
  ipcMain.handle("hal:minimize-window", async (_e, id:number)=>{ windowMap.get(id)?.minimize(); });
  ipcMain.handle("hal:maximize-window", async (_e, id:number)=>{ const w=windowMap.get(id); if(!w) return; w.isMaximized()?w.unmaximize():w.maximize(); });

  // Realtime events
  const pushBattery = () => {
    const level = powerMonitor.getBatteryLevel();
    const isCharging = !powerMonitor.isOnBatteryPower();
    for (const w of BrowserWindow.getAllWindows()) w.webContents.send("hal:battery-changed", { level, isCharging });
  };
  powerMonitor.on("on-battery", () => pushBattery());
  powerMonitor.on("on-ac", () => pushBattery());

  const pushDisplays = () => {
    const displays = screen.getAllDisplays().map(d => ({
      id:d.id, bounds:d.bounds, workArea:d.workArea, scaleFactor:d.scaleFactor, rotation:d.rotation, internal:(d as any).internal
    }));
    for (const w of BrowserWindow.getAllWindows()) w.webContents.send("hal:display-changed", displays);
  };
  screen.on("display-added", () => pushDisplays());
  screen.on("display-removed", () => pushDisplays());
  screen.on("display-metrics-changed", () => pushDisplays());
}
