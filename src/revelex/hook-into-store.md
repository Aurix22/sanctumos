In useSystemStore.actions.boot():
1) import { appsFromRevelex, autostartIds } from '@/revelex';
2) Nach appService.getInstalledApps():
   - appsFromRevelex().forEach(m => state.actions.installApp(m));
3) Autostarts danach:
   - autostartIds().forEach(id => state.actions.launchApp(id));
