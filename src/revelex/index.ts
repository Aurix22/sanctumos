import { RevelexApps, RevelexDefaults, getAutostartApps } from './generated';
import type { AppManifest } from '@/services/AppService';

export function appsFromRevelex(): AppManifest[] {
  return RevelexApps.map(app => ({
    id: app.id,
    name: app.name,
    version: app.version,
    description: app.name,
    author: 'Revelex',
    icon: app.icon || 'app',
    // main: string path -> dynamic import function
    main: () => import(/* @vite-ignore */ app.main).then(m => m.default ?? m),
    permissions: app.permissions || [],
    windows: { main: app.windows?.main || { ...RevelexDefaults.window } },
    autostart: !!app.autostart
  }));
}

export function autostartIds(): string[] {
  return getAutostartApps().map(a => a.id);
}
