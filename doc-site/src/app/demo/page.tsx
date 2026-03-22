"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import {
  Database,
  RefreshCw,
  Brain,
  Zap,
  Package,
  ShieldCheck,
  ChevronLeft,
  Moon,
  Sun,
  User as UserIcon,
  Wifi,
  WifiOff,
  CheckCircle2,
  Network,
  Activity,
  Layers,
  ArrowRight,
  Monitor,
  Search,
  ListChecks,
  ChevronRight,
  MousePointer2,
  Gauge,
  Cpu,
  Terminal,
  FastForward,
  HardDriveDownload,
  Eye,
  Settings2
} from "lucide-react";

// 1. Import all ecosystem packages
import { createDB } from "qortex-db";
import { createQueryPersister } from "qortex-db/query";
import { createStorePersister } from "qortex-db/store";
import { useQuery, setDefaultConfig, setQueryData } from "qortex-query-react";
import { createStore, useStore } from "qortex-store-react";

// --- GLOBAL PERSISTENCE INITIALIZATION ---

interface GlobalState {
  theme: "dark" | "light";
  username: string;
  userRole: "Guest" | "Pro" | "Admin";
  updateUsername: (name: string) => void;
  updateRole: (role: "Guest" | "Pro" | "Admin") => void;
  toggleTheme: () => void;
}

let dbInstance: any = null;
let globalStoreInstance: any = null;
let queryConfigured = false;

const getDB = () => {
  if (typeof window === "undefined") return null;
  if (!dbInstance) {
    dbInstance = createDB({
      name: "qortex_demo_v12", // Bumping to v12 for 2.2.0 Baseline
      driver: "indexedDB",
    });
  }
  return dbInstance;
};

const getGlobalStore = () => {
  if (!globalStoreInstance) {
    const db = getDB();
    globalStoreInstance = createStore<GlobalState>(
      (set) => ({
        theme: "dark",
        username: "Qortex User",
        userRole: "Guest",
        updateUsername: (username) => set({ username }),
        updateRole: (userRole) => set({ userRole }),
        toggleTheme: () =>
          set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      }),
      {
        persister: db
          ? createStorePersister(db, { storageKey: "demo_user_settings_v12" })
          : undefined,
      }
    );
  }
  return globalStoreInstance;
};

const setupQuery = () => {
  if (queryConfigured) return;
  const db = getDB();
  if (db) {
    setDefaultConfig({
      persister: createQueryPersister(db, {
        storageKey: "demo_query_cache_v12",
        burstKey: "v3.0",
      }),
      staleTime: 1000 * 60 * 5,
    });
    queryConfigured = true;
  }
};

// --- DATA TYPES ---
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// --- RENDER MONITORING HELPERS ---

const useRenderCount = () => {
  const count = useRef(0);
  useEffect(() => { count.current += 1; });
  return count.current + 1;
};

const RenderBadge = memo(({ count, theme }: { count: number, theme: string }) => (
  <div className={`px-2 py-0.5 rounded-lg border text-[9px] font-black flex items-center gap-1.5 transition-all shadow-sm ${count > 8 ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    }`}>
    <Activity className="w-3 h-3" /> RENDERS: {count}
  </div>
));

// --- HELPER FOR NETWORK LOGS ---
const useNetworkLog = () => {
  const [logs, setLogs] = useState<{ id: number; type: string; msg: string; time: string }[]>([]);
  const logCounter = useRef(0);

  const addLog = useCallback((type: string, msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ id: ++logCounter.current, type, msg, time }, ...prev].slice(0, 10));
  }, []);

  return { logs, addLog };
};

const NetworkLog = memo(({ logs }: { logs: any[] }) => (
  <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
    <div className="bg-slate-800/50 px-4 py-2 flex items-center justify-between border-b border-slate-700/50">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <Cpu className="w-3 h-3 text-indigo-400" /> System Tracer
      </span>
      <div className="flex gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
      </div>
    </div>
    <div className="p-4 h-[120px] overflow-y-auto font-mono text-[10px] space-y-1 scroller-subtle">
      {logs.length === 0 && <div className="text-slate-600 italic">Listening for ecosystem events...</div>}
      {logs.map(log => (
        <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300 text-slate-400">
          <span className="text-slate-500 shrink-0">{log.time}</span>
          <span className={`font-bold shrink-0 ${log.type === 'NETWORK' ? 'text-amber-400' :
              log.type === 'CACHE' ? 'text-emerald-400' :
                log.type === 'SUCCESS' ? 'text-indigo-400' : 'text-rose-400'
            }`}>[{log.type}]</span>
          <span className="truncate">{log.msg}</span>
        </div>
      ))}
    </div>
  </div>
));

// --- CACHE INSPECTOR COMPONENT ---
const CacheInspector = memo(({ theme }: { theme: string }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const refreshCache = async () => {
    setLoading(true);
    const db = getDB();
    if (db) {
      const qCache = await db.get("demo_query_cache_v12");
      const sCache = await db.get("demo_user_settings_v12");
      setData({ query: qCache, store: sCache });
    }
    setLoading(false);
  };

  useEffect(() => { refreshCache(); }, []);

  return (
    <div className={`p-8 rounded-[2rem] border transition-all h-full ${theme === 'light' ? 'bg-white border-indigo-100' : 'bg-slate-900 border-slate-800'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-emerald-400" />
          <h3 className="font-black text-xs uppercase tracking-widest">Manual DB Inspector</h3>
        </div>
        <button onClick={refreshCache} className={`p-2 rounded-xl active:scale-95 transition-all ${loading ? 'animate-spin' : ''}`}>
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className={`p-4 rounded-2xl font-mono text-[10px] h-[300px] overflow-y-auto scroller-subtle ${theme === 'light' ? 'bg-slate-50 text-slate-600' : 'bg-black/40 text-emerald-400'}`}>
        <div className="mb-4">
          <div className="text-indigo-400 font-bold mb-1">// GLOBAL_USER_STORE</div>
          <pre className="whitespace-pre-wrap">{data?.store ? JSON.stringify(data.store, null, 2) : 'null'}</pre>
        </div>
        <div>
          <div className="text-indigo-400 font-bold mb-1">// QUERY_CACHE_ENTRIES</div>
          <pre className="whitespace-pre-wrap">{data?.query ? JSON.stringify(data.query, null, 2).slice(0, 1000) + '...' : 'null'}</pre>
        </div>
      </div>
    </div>
  );
});

// --- STRESS TEST COMPONENT ---
const StressTest = memo(({ onLog, theme }: { onLog: any, theme: string }) => {
  const renderCount = useRenderCount();
  const [count, setCount] = useState(0);
  const [isHammering, setIsHammering] = useState(false);

  const hammerPersistence = async () => {
    setIsHammering(true);
    const start = performance.now();
    const db = getDB();
    onLog('NETWORK', 'Hammering IndexedDB: 2,000 Writes...');

    // Simulating multiple rapid mutations
    for (let i = 0; i < 2000; i++) {
      setQueryData(["stress_key", i], { val: Math.random() });
    }

    const end = performance.now();
    onLog('SUCCESS', `Batched 2k items in ${(end - start).toFixed(2)}ms`);
    setCount(prev => prev + 2000);
    setIsHammering(false);
  };

  return (
    <div className={`border rounded-3xl p-6 shadow-lg ${theme === 'light' ? 'bg-white border-indigo-100' : 'bg-slate-800/40 border-slate-700/50'}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${theme === 'light' ? 'text-indigo-950' : 'text-white'}`}>
            <FastForward className="w-5 h-5 text-rose-500" /> Store Stress Test
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 uppercase font-bold tracking-wider">High-Frequency Writes</p>
        </div>
        <RenderBadge count={renderCount} theme={theme} />
      </div>
      <div className={`mb-4 p-4 rounded-xl border flex items-center justify-between ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-black uppercase">Buffered Entries</span>
          <span className="text-2xl font-black">{count.toLocaleString()}</span>
        </div>
        <HardDriveDownload className={`w-8 h-8 ${isHammering ? 'text-rose-500 animate-bounce' : 'text-slate-700'}`} />
      </div>
      <button onClick={hammerPersistence} disabled={isHammering} className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-xs active:scale-95 transition-all disabled:opacity-50">
        {isHammering ? 'WRITING TO DISK...' : 'INJECT 2,000 RECORDS'}
      </button>
    </div>
  );
});

// --- SCENARIO COMPONENTS (REST) ---

const OptimisticDemo = memo(({ onLog, theme }: { onLog: any, theme: string }) => {
  const renderCount = useRenderCount();
  const [offline, setOffline] = useState(false);
  const key = ["optimistic_v12"];
  const { data } = useQuery<Todo>(key, { fetcher: async () => ({ id: 1, title: "Initialize Core Engine", completed: false }) });

  const handleToggle = () => {
    if (!data) return;
    const ns = !data.completed;
    onLog('CACHE', `Toggle: ${ns ? 'Done' : 'Active'}`);
    setQueryData<Todo>(key, (prev) => prev ? ({ ...prev, completed: ns }) : { id: 1, title: "Initialize Core Engine", completed: ns });
    if (!offline) {
      onLog('NETWORK', 'Syncing...');
      setTimeout(() => onLog('SUCCESS', 'Server Cloud Matched.'), 1000);
    } else onLog('ERROR', 'Offline. Pooled in DB.');
  };

  return (
    <div className={`border rounded-3xl p-6 shadow-lg ${theme === 'light' ? 'bg-white border-indigo-100' : 'bg-slate-800/40 border-slate-700/50'}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${theme === 'light' ? 'text-indigo-950' : 'text-white'}`}>
            <Zap className="w-5 h-5 text-amber-400" /> Optimistic Sync
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 uppercase font-bold tracking-wider">0ms Latency UI</p>
        </div>
        <RenderBadge count={renderCount} theme={theme} />
      </div>
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
        <div className="flex items-center gap-4">
          <button onClick={handleToggle} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${data?.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-400'}`}>
            {data?.completed && <CheckCircle2 className="w-5 h-5" />}
          </button>
          <span className={`text-sm font-bold ${data?.completed ? 'text-slate-400 line-through' : theme === 'light' ? 'text-indigo-950' : 'text-slate-100'}`}>{data ? data.title : '...'}</span>
        </div>
        <button onClick={() => setOffline(!offline)} className={`p-2 rounded-xl transition-all ${offline ? 'bg-red-500 text-white' : 'bg-slate-200/50'}`}><Wifi className="w-3 h-3" /></button>
      </div>
    </div>
  );
});

const SearchCacheDemo = memo(({ onLog, theme }: { onLog: any, theme: string }) => {
  const renderCount = useRenderCount();
  const [query, setQuery] = useState("");
  const { data, isFetching } = useQuery(["search_v12", query], {
    enabled: query.length >= 2,
    fetcher: async () => {
      onLog('NETWORK', `Query: "${query}"`);
      await new Promise(r => setTimeout(r, 600));
      return [`${query} Results`];
    }
  });

  return (
    <div className={`border rounded-3xl p-6 shadow-lg ${theme === 'light' ? 'bg-white border-indigo-100' : 'bg-slate-800/40 border-slate-700/50'}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-lg font-bold flex items-center gap-2 ${theme === 'light' ? 'text-indigo-950' : 'text-white'}`}>
          <Search className="w-5 h-5 text-indigo-400" /> Instant Lookup
        </h3>
        <RenderBadge count={renderCount} theme={theme} />
      </div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Type fast..." className={`w-full px-4 py-3 rounded-xl border text-sm mb-4 bg-transparent ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'}`} />
      <div className="space-y-2 min-h-[40px]">
        {data?.map((r, i) => <div key={i} className="text-[11px] bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10 text-slate-400 font-mono italic">{r}</div>)}
        {isFetching && <div className="text-[10px] text-indigo-400 animate-pulse font-bold tracking-widest uppercase">Fetching from cloud...</div>}
      </div>
    </div>
  );
});

// Final wrapper for existing ones to keep logic
const LegacyGrid = ({ onLog, theme }: { onLog: any, theme: string }) => {
  return (
    <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
      <OptimisticDemo onLog={onLog} theme={theme} />
      <SearchCacheDemo onLog={onLog} theme={theme} />
      <div className="grid gap-8">
        <NetworkLog logs={onLog.logs} />
        <div className={`p-8 rounded-3xl border text-center shadow-xl flex flex-col items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-slate-900/60 border-slate-800'}`}>
          <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest">Global Persistence</h4>
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs active:scale-95 transition-all flex items-center justify-center gap-3">
            <RefreshCw className="w-4 h-4" /> Full Re-Hydration
          </button>
        </div>
      </div>
      <StressTest onLog={onLog} theme={theme} />
      <CacheInspector theme={theme} />
      <SyncDemo onLog={onLog} theme={theme} />
    </div>
  )
}

const SyncDemo = memo(({ onLog, theme }: { onLog: any, theme: string }) => {
  const renderCount = useRenderCount();
  const { userRole, updateRole } = useStore(getGlobalStore() as any) as GlobalState;
  const { data, isLoading } = useQuery(["sync_v12", userRole], { fetcher: async () => { onLog('NETWORK', `Role: ${userRole}`); await new Promise(r => setTimeout(r, 600)); return [userRole]; } });

  return (
    <div className={`border rounded-3xl p-6 shadow-lg ${theme === 'light' ? 'bg-white border-indigo-100' : 'bg-slate-800/40 border-slate-700/50'}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${theme === 'light' ? 'text-indigo-950' : 'text-white'}`}>
            <Network className="w-5 h-5 text-indigo-400" /> Cross-Package
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Reactive Wiring</p>
        </div>
        <RenderBadge count={renderCount} theme={theme} />
      </div>
      <div className="flex gap-2 mb-4">
        {["Guest", "Pro", "Admin"].map((r: any) => (
          <button key={r} onClick={() => updateRole(r)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${userRole === r ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-800 text-slate-500'}`}>{r}</button>
        ))}
      </div>
      <div className="text-[10px] font-mono text-emerald-400 italic">{isLoading ? 'FETCHING...' : `PERMISSIONS_NODE: [${data?.join(', ')}]`}</div>
    </div>
  );
});

export default function DemoPage() {
  const [isClient, setIsClient] = useState(false);
  const [fakeRenders, setFakeRenders] = useState(0);
  const { logs, addLog } = useNetworkLog();
  const globalStore = getGlobalStore();
  const { theme, toggleTheme, username, updateUsername } = useStore(globalStore as any) as GlobalState;

  useEffect(() => {
    setIsClient(true);
    setupQuery();
  }, []);

  if (!isClient) return null;

  // Enhancing the addLog to be passed down
  const logger: any = addLog;
  logger.logs = logs;

  return (
    <div className={`min-h-screen transition-all duration-700 selection:bg-indigo-500/30 ${theme === 'light' ? 'bg-indigo-50 text-indigo-950' : 'bg-slate-950 text-slate-200'}`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-25 blur-[140px] transition-colors duration-1000 ${theme === 'light' ? 'bg-indigo-400' : 'bg-indigo-900'}`} />
        <div className={`absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-25 blur-[140px] transition-colors duration-1000 ${theme === 'light' ? 'bg-indigo-300' : 'bg-emerald-900'}`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <nav className="flex justify-between items-center mb-16">
          <Link href="/" className={`flex items-center gap-2 group transition-colors ${theme === 'light' ? 'text-indigo-600 hover:text-indigo-800' : 'text-slate-400 hover:text-white'}`}>
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> <span className="font-black tracking-tight uppercase text-xs">Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-3 ${theme === 'light' ? 'bg-white border-indigo-100 shadow-sm' : 'bg-slate-900/50 border-slate-800'}`}>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry: 2.2.0 Runtime</span>
            </div>
            <button onClick={toggleTheme} className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 active:scale-90 ${theme === 'dark' ? 'invert' : ''}`}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 mb-20 items-end">
          <div>
            <h1 className={`text-6xl md:text-8xl font-black mb-6 tracking-tight leading-[0.85] ${theme === 'light' ? 'text-indigo-950' : 'text-white'}`}>
              Pure <span className="text-indigo-600 italic underline decoration-indigo-400/30">Ecosystem</span>.
            </h1>
            <p className={`text-lg leading-relaxed max-w-xl ${theme === 'light' ? 'text-indigo-800/70' : 'text-slate-400'}`}>
              Qortex eliminates the gap between memory and disk. Mutate the Store, Query the DB, Hammer the Disk—all in one high-perf runtime.
            </p>
          </div>
          <div className="space-y-4">
            <div className={`p-8 rounded-[2rem] border shadow-2xl backdrop-blur-xl ${theme === 'light' ? 'bg-white border-indigo-100' : 'bg-slate-900/60 border-slate-800/80'}`}>
              <div className="flex items-center gap-2 mb-6">
                <Settings2 className="w-4 h-4 text-indigo-500" />
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Node Configuration</h3>
              </div>
              <input className={`w-full px-5 py-4 rounded-xl border text-sm mb-6 bg-transparent outline-none transition-all focus:border-indigo-500 ${theme === 'light' ? 'border-indigo-100' : 'border-slate-700'}`} value={username} onChange={(e) => updateUsername(e.target.value)} placeholder="Username..." />
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">DRIVER: IDB_V12</div>
            </div>
          </div>
        </div>

        <div className={`mb-12 p-12 rounded-[2.5rem] border ${theme === 'light' ? 'bg-indigo-600 text-white shadow-3xl shadow-indigo-600/20' : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-100'}`}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <Gauge className="w-10 h-10 text-amber-400" />
                <h2 className="text-4xl font-black tracking-tight leading-none">Render Isolation Dashboard</h2>
              </div>
              <p className="text-indigo-100/70 text-base leading-relaxed max-w-xl">
                Trigger a <b>Parent Update</b>. Qortex components are precision-memoized. Notice how the <span className="text-amber-400 font-bold italic">RENDERS BADGE</span> on each card stays fixed.
              </p>
            </div>
            <div className="flex gap-6 shrink-0 lg:-mr-4">
              <div className="bg-black/20 p-8 rounded-[2rem] flex flex-col items-center border border-white/10 shadow-inner">
                <span className="text-[10px] font-black uppercase opacity-50 mb-2">Virtual DOM Reset</span>
                <span className="text-6xl font-black mb-4">{fakeRenders}</span>
                <button onClick={() => setFakeRenders(r => r + 1)} className="px-6 py-2.5 bg-white text-indigo-900 rounded-xl font-black text-[10px] transition-all active:scale-95 uppercase shadow-xl">Trigger Re-Render</button>
              </div>
            </div>
          </div>
        </div>

        <LegacyGrid onLog={logger} theme={theme} />

      </div>
      <style jsx global>{`
        .scroller-subtle::-webkit-scrollbar { width: 4px; }
        .scroller-subtle::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
