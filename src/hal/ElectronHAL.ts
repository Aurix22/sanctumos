import type { HardwareAbstractionLayer, SystemInfo, BatteryInfo, DisplayInfo } from "./types";

type HalBridge = {
  invoke: (channel: string, ...args:any[]) => Promise<any>;
  on: (channel: string, cb: (...args:any[]) => void) => void;
  off: (channel: string, cb: any) => void;
};

export class ElectronHAL implements HardwareAbstractionLayer {
  private initialized = false;
  private bridge(): HalBridge {
    const b = (window as any)?.sanctum?.hal;
    if (!b) throw new Error("HAL bridge not available (preload not loaded)");
    return b as HalBridge;
  }

  private onBatteryCb?: (battery: BatteryInfo)=>void;
  private onDisplayCb?: (d: DisplayInfo[])=>void;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    const br = this.bridge();
    br.on("hal:battery-changed", (battery: BatteryInfo) => this.onBatteryCb?.(battery));
    br.on("hal:display-changed", (displays: DisplayInfo[]) => this.onDisplayCb?.(displays));
    this.initialized = true;
  }

  // System
  getSystemInfo(): Promise<SystemInfo> { return this.bridge().invoke("hal:get-system-info"); }
  getBatteryInfo(): Promise<BatteryInfo|null> { return this.bridge().invoke("hal:get-battery-info"); }
  getDisplays(): Promise<DisplayInfo[]> { return this.bridge().invoke("hal:get-displays"); }
  getPlatform(): Promise<string> { return this.bridge().invoke("hal:get-platform"); }
  getCPUInfo(): Promise<any> { return this.bridge().invoke("hal:get-cpu-info"); }
  getMemoryInfo(): Promise<any> { return this.bridge().invoke("hal:get-memory-info"); }
  getStorageInfo(): Promise<any> { return this.bridge().invoke("hal:get-storage-info"); }
  getNetworkInterfaces(): Promise<any[]> { return this.bridge().invoke("hal:get-network-interfaces"); }

  // FS
  readFile(p:string){ return this.bridge().invoke("hal:read-file", p); }
  writeFile(p:string,c:string){ return this.bridge().invoke("hal:write-file", p, c); }
  listDirectory(p:string){ return this.bridge().invoke("hal:list-directory", p); }
  createDirectory(p:string){ return this.bridge().invoke("hal:create-directory", p); }
  deleteFile(p:string){ return this.bridge().invoke("hal:delete-file", p); }
  getFileInfo(p:string){ return this.bridge().invoke("hal:get-file-info", p); }

  // Clipboard & Dialogs
  readClipboard(){ return this.bridge().invoke("hal:read-clipboard"); }
  writeClipboard(t:string){ return this.bridge().invoke("hal:write-clipboard", t); }
  showOpenDialog(o:any){ return this.bridge().invoke("hal:show-open-dialog", o); }
  showSaveDialog(o:any){ return this.bridge().invoke("hal:show-save-dialog", o); }
  showMessageBox(o:any){ return this.bridge().invoke("hal:show-message-box", o); }

  // Windows
  createNativeWindow(o:any){ return this.bridge().invoke("hal:create-window", o); }
  closeNativeWindow(id:number){ return this.bridge().invoke("hal:close-window", id); }
  focusNativeWindow(id:number){ return this.bridge().invoke("hal:focus-window", id); }
  minimizeNativeWindow(id:number){ return this.bridge().invoke("hal:minimize-window", id); }
  maximizeNativeWindow(id:number){ return this.bridge().invoke("hal:maximize-window", id); }

  // Event handlers registration
  onBatteryInfoChange(cb:(b:BatteryInfo)=>void){ this.onBatteryCb = cb; }
  onDisplaysChange(cb:(d:DisplayInfo[])=>void){ this.onDisplayCb = cb; }
}
