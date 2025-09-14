import { contextBridge, ipcRenderer } from "electron";

/** Schlanke, sichere Bridge für HAL */
contextBridge.exposeInMainWorld("sanctum", {
  hal: {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, listener: (...args:any[]) => void) =>
      ipcRenderer.on(channel, (_evt, ...payload) => listener(...payload)),
    off: (channel: string, listener: any) => ipcRenderer.removeListener(channel, listener),
  }
});

declare global {
  interface Window {
    sanctum: {
      hal: {
        invoke: (channel: string, ...args:any[]) => Promise<any>;
        on: (channel: string, listener: (...args:any[]) => void) => void;
        off: (channel: string, listener: any) => void;
      }
    }
  }
}
