export class FileSystemService {
  private mem = new Map<string,string>();
  private ls = typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;

  async readFile(path: string): Promise<string> {
    if (this.ls) { const v = this.ls.getItem(path); if (v != null) return v; }
    if (this.mem.has(path)) return this.mem.get(path)!;
    throw new Error(`ENOENT: ${path}`);
  }
  async writeFile(path: string, content: string){ if (this.ls) this.ls.setItem(path, content); this.mem.set(path, content); }
  async listDirectory(prefix: string): Promise<string[]>{
    const keys = new Set<string>();
    if (this.ls) for (let i=0;i<this.ls.length;i++){ const k=this.ls.key(i)!; if(k.startsWith(prefix)) keys.add(k); }
    for (const k of this.mem.keys()) if (k.startsWith(prefix)) keys.add(k);
    return [...keys].sort();
  }
}
