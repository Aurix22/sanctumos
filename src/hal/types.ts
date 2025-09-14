export interface BatteryInfo { level: number; isCharging: boolean }
export interface DisplayInfo {
  id: number;
  bounds: { x:number; y:number; width:number; height:number };
  workArea: { x:number; y:number; width:number; height:number };
  scaleFactor: number;
  rotation: number;
  internal?: boolean;
}
export interface SystemInfo {
  platform: string; arch: string; version: string; hostname: string; uptime: number;
}
export interface HardwareAbstractionLayer {
  initialize(): Promise<void>;
  getSystemInfo(): Promise<SystemInfo>;
  getBatteryInfo(): Promise<BatteryInfo | null>;
  getDisplays(): Promise<DisplayInfo[]>;
  getPlatform(): Promise<string>;
  getCPUInfo(): Promise<any>;
  getMemoryInfo(): Promise<any>;
  getStorageInfo(): Promise<any>;
  getNetworkInterfaces(): Promise<any[]>;

  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  listDirectory(path: string): Promise<string[]>;
  createDirectory(path: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  getFileInfo(path: string): Promise<any>;

  readClipboard(): Promise<string>;
  writeClipboard(text: string): Promise<void>;

  showOpenDialog(options: any): Promise<string[] | null>;
  showSaveDialog(options: any): Promise<string | null>;
  showMessageBox(options: any): Promise<number>;

  createNativeWindow(options: any): Promise<number>;
  closeNativeWindow(id: number): Promise<void>;
  focusNativeWindow(id: number): Promise<void>;
  minimizeNativeWindow(id: number): Promise<void>;
  maximizeNativeWindow(id: number): Promise<void>;

  onBatteryInfoChange?(cb: (battery: BatteryInfo) => void): void;
  onDisplaysChange?(cb: (displays: DisplayInfo[]) => void): void;
}
