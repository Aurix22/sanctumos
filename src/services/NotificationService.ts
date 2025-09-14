import { Notification } from "../core/types";
export class NotificationService {
  private items = new Map<string, Notification>();
  private listeners = new Set<(list: Notification[]) => void>();

  show(data: Omit<Notification,'id'|'timestamp'>): string {
    const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
    const n: Notification = { ...data, id, timestamp: Date.now() };
    this.items.set(id, n); this.notify();
    if (n.priority === 'normal') setTimeout(()=> this.dismiss(id), 5000);
    return id;
  }
  dismiss(id: string){ this.items.delete(id); this.notify(); }
  clear(){ this.items.clear(); this.notify(); }
  getAll(){ return [...this.items.values()].sort((a,b)=> b.timestamp-a.timestamp); }
  subscribe(fn:(n:Notification[])=>void){ this.listeners.add(fn); return ()=>this.listeners.delete(fn); }
  private notify(){ const list=this.getAll(); this.listeners.forEach(fn=>fn(list)); }
}
export type { Notification } from "../core/types";
