import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor, Settings, Folder, Globe, Terminal, Bell, Battery,
  Wifi, Volume2, Search, X, Minus, Square
} from "lucide-react";

// =============================================================
// Sanctum.OS Desktop – Dark Glass UI Prototype
// =============================================================

const SettingsContent = () => (
  <div className="grid grid-cols-5 gap-4 text-white">
    <div className="col-span-2 space-y-2">
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-xs font-semibold mb-2">Aussehen</div>
        <div className="space-y-2 text-xs">
          <div>Theme: <span className="font-medium">Sanctum Dark</span></div>
          <div>Akzentfarbe: <span className="inline-block align-middle h-3 w-3 rounded-full bg-cyan-500"/></div>
          <div>Icon-Pack: <span className="font-medium">Lucide</span></div>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-xs font-semibold mb-2">System</div>
        <div className="text-xs space-y-1">
          <div>Kernel: <span className="font-mono">sanctum-core 0.0.1</span></div>
          <div>Display: <span className="font-mono">Wayland (mock)</span></div>
          <div>WM: <span className="font-mono">Sanctum Shell</span></div>
        </div>
      </div>
    </div>
    <div className="col-span-3">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
        <div className="font-semibold mb-2">Kurzanpassungen</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> Transparente Leisten</label>
          <label className="flex items-center gap-2"><input type="checkbox"/> Große Icons</label>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> Dock Auto-Hide</label>
          <label className="flex items-center gap-2"><input type="checkbox"/> Haptisches Feedback</label>
        </div>
      </div>
    </div>
  </div>
);

const FilesContent = () => (
  <div className="grid grid-cols-4 gap-3 text-sm">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 text-white cursor-pointer">
        <div className="flex items-center gap-2"><Folder className="h-4 w-4 text-cyan-400"/> Projekt {i+1}</div>
        <div className="text-xs text-white/60 mt-1">Ordner</div>
      </div>
    ))}
  </div>
);

const TerminalContent = () => (
  <pre className="font-mono bg-black/80 text-green-400 rounded-lg p-3 text-sm h-full whitespace-pre-wrap">
    {`$ echo "Welcome to Sanctum Shell"\nWelcome to Sanctum Shell\n$ uname -a\nsanctum-core 0.0.1 #1 SMP PREEMPT\n$ `}
  </pre>
);

const WebContent = () => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-4 h-full text-white">
    <div className="text-sm">Dies ist ein Mock eines internen Browsers. In der echten Shell würden wir WebView/Embed einsetzen.</div>
  </div>
);

const WINDOW_DATA = {
  settings: { icon: Settings, title: "Einstellungen", content: <SettingsContent/> },
  files: { icon: Folder, title: "Dateien", content: <FilesContent/> },
  terminal: { icon: Terminal, title: "Konsole", content: <TerminalContent/> },
  web: { icon: Globe, title: "Navigator", content: <WebContent/> },
};

function Window({ icon: Icon, title, children, onClose, onFocus, zIndex, index }: any) {
  const offset = index * 25;
  return (
    <motion.div
      drag
      dragHandle=".drag-handle"
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      onMouseDown={onFocus}
      style={{ zIndex, top: `calc(7rem + ${offset}px)`, left: `calc(50% - 360px + ${offset}px)` }}
      className="absolute w-[720px] max-w-[90vw] h-[450px] flex flex-col rounded-xl shadow-2xl bg-slate-800/70 backdrop-blur-xl border border-white/10 overflow-hidden text-white"
    >
      <div className="drag-handle h-10 flex items-center justify-between px-3 border-b border-white/10 bg-black/30 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2 text-sm font-medium pointer-events-none">
          <Icon className="h-4 w-4"/> {title}
        </div>
        <div className="flex items-center gap-1">
          <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-white/10" title="Minimize"><Minus className="h-4 w-4"/></button>
          <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-white/10" title="Maximize"><Square className="h-4 w-4"/></button>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-md hover:bg-red-500" title="Close"><X className="h-4 w-4"/></button>
        </div>
      </div>
      <div className="p-4 flex-grow overflow-y-auto">{children}</div>
    </motion.div>
  );
}

export default function SanctumDesktop(){
  const [openWindows, setOpenWindows] = useState<string[]>(['files','settings']);

  const handleOpen = (id:string) => setOpenWindows(prev => [...prev.filter(w=>w!==id), id]);
  const handleClose = (id:string) => setOpenWindows(prev => prev.filter(w=>w!==id));

  const dockItems = [
    { id:'files', icon: Folder },
    { id:'web', icon: Globe },
    { id:'terminal', icon: Terminal },
    { id:'settings', icon: Settings },
  ];

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl"/>
        <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"/>
      </div>

      <div className="h-11 px-3 flex items-center justify-between bg-black/30 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5"/>
          <span className="font-semibold tracking-wide">Sanctum.OS</span>
          <div className="ml-3 hidden md:flex items-center gap-2 bg-white/10 rounded-xl px-2 py-1 text-xs">
            <Search className="h-3.5 w-3.5"/><span>Suche…</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Wifi className="h-4 w-4"/>
          <Volume2 className="h-4 w-4"/>
          <Battery className="h-4 w-4"/>
          <Bell className="h-4 w-4"/>
          <span className="opacity-80">22:54</span>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 bg-black/30 backdrop-blur rounded-2xl border border-white/10 px-3 py-2 flex items-center gap-3 shadow-2xl">
        {dockItems.map(({id,icon:Icon})=>(
          <button key={id} className="p-2 rounded-xl hover:bg-white/10" onClick={()=>handleOpen(id)}>
            <Icon className="h-6 w-6"/>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {openWindows.map((id,index)=>{
          const w = WINDOW_DATA[id as keyof typeof WINDOW_DATA];
          if(!w) return null;
          return (
            <Window key={id} icon={w.icon} title={w.title} index={index} onClose={()=>handleClose(id)} onFocus={()=>handleOpen(id)} zIndex={index+10}>{w.content}</Window>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
