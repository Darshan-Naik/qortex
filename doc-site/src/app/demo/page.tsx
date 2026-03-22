"use client";

import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Database, RefreshCw, Moon, Sun, Wifi, WifiOff, CheckCircle2,
  Circle, LayoutGrid, LayoutList, ChevronLeft, MoreHorizontal,
  LayoutDashboard, Server, Paintbrush, Activity, Zap, Plus, 
  TerminalSquare, Search, Filter, BarChart3, Hash, Clock
} from "lucide-react";

// Qortex Ecosystem Imports
import { createDB } from "qortex-db";
import { createQueryPersister } from "qortex-db/query";
import { createStorePersister } from "qortex-db/store";
import { useQuery, setDefaultConfig, setQueryData, invalidateQuery } from "qortex-query-react";
import { createStore, useStore } from "qortex-store-react";

// --- TYPES & RAW DATA ---
type Workspace = "Frontend Core" | "Backend API" | "Design System";
type TaskStatus = "todo" | "in-progress" | "done";
type PriorityLevel = "High" | "Medium" | "Low";
type AssigneeFilter = "All" | "You" | "Others";

interface Issue {
  id: string;
  title: string;
  status: TaskStatus;
  priority: PriorityLevel;
  assignee: string;
  tags: string[];
  updatedAt: string;
}

interface WorkspaceMetrics {
  total: number;
  completed: number;
  velocity: number; // issues per week
  health: "Good" | "Warning" | "Critical";
}

const CURRENT_USER = "You";

// A larger, more complex dataset
const RAW_ISSUES: Record<Workspace, Issue[]> = {
  "Frontend Core": [
    { id: "FE-101", title: "Migrate global state to qortex-store", status: "done", priority: "High", assignee: CURRENT_USER, tags: ["refactor", "state"], updatedAt: "2h ago" },
    { id: "FE-102", title: "Implement optimistic glassmorphism UI", status: "in-progress", priority: "Medium", assignee: "Alex", tags: ["ui", "design"], updatedAt: "10m ago" },
    { id: "FE-103", title: "Fix cache hydration race condition", status: "todo", priority: "High", assignee: CURRENT_USER, tags: ["bug", "core"], updatedAt: "1d ago" },
    { id: "FE-104", title: "Reduce bundle size by dropping legacy context", status: "todo", priority: "Low", assignee: "David", tags: ["perf"], updatedAt: "3h ago" },
    { id: "FE-105", title: "Virtualize the main task board columns", status: "in-progress", priority: "High", assignee: CURRENT_USER, tags: ["perf", "ui"], updatedAt: "5m ago" },
    { id: "FE-106", title: "Audit accessibility for screen readers", status: "todo", priority: "Medium", assignee: "Sarah", tags: ["a11y"], updatedAt: "2d ago" },
  ],
  "Backend API": [
    { id: "BE-201", title: "Optimize Postgres indexing for user lookup", status: "in-progress", priority: "High", assignee: "Michael", tags: ["db", "perf"], updatedAt: "1h ago" },
    { id: "BE-202", title: "Add rate limiting middleware", status: "todo", priority: "Medium", assignee: CURRENT_USER, tags: ["security"], updatedAt: "4h ago" },
    { id: "BE-203", title: "Implement v3 WebSocket syncing", status: "todo", priority: "High", assignee: "Michael", tags: ["feature", "realtime"], updatedAt: "5d ago" },
    { id: "BE-204", title: "Rotate JWT signing keys", status: "done", priority: "High", assignee: "Chris", tags: ["security"], updatedAt: "1w ago" },
  ],
  "Design System": [
    { id: "DS-301", title: "Audit color tokens for dark mode", status: "done", priority: "Medium", assignee: "Emma", tags: ["design", "a11y"], updatedAt: "2w ago" },
    { id: "DS-302", title: "Add micro-interactions to buttons", status: "in-progress", priority: "Low", assignee: "Emma", tags: ["ui", "polish"], updatedAt: "1d ago" },
    { id: "DS-303", title: "Standardize spacing variables (base-4)", status: "todo", priority: "Medium", assignee: CURRENT_USER, tags: ["design", "system"], updatedAt: "3h ago" },
  ]
};

// --- QORTEX SYSTEM INIT ---
let dbInstance: any = null;
let globalStoreInstance: any = null;
let queryConfigured = false;
const DEMO_VERSION = "v14_complex";

const getDB = () => {
  if (typeof window === "undefined") return null;
  if (!dbInstance) {
    dbInstance = createDB({ name: `qortex_${DEMO_VERSION}`, driver: "indexedDB" });
  }
  return dbInstance;
};

interface AppState {
  theme: "dark" | "light";
  workspace: Workspace;
  isOffline: boolean;
  // Complex Filters
  searchQuery: string;
  priorityFilter: "All" | PriorityLevel;
  assigneeFilter: AssigneeFilter;
  
  setTheme: (t: "dark" | "light") => void;
  setWorkspace: (w: Workspace) => void;
  setOffline: (o: boolean) => void;
  setSearchQuery: (q: string) => void;
  setPriorityFilter: (p: "All" | PriorityLevel) => void;
  setAssigneeFilter: (a: AssigneeFilter) => void;
}

const getGlobalStore = () => {
  if (!globalStoreInstance) {
    const db = getDB();
    globalStoreInstance = createStore<AppState>(
      (set) => ({
        theme: "dark",
        workspace: "Frontend Core",
        isOffline: false,
        searchQuery: "",
        priorityFilter: "All",
        assigneeFilter: "All",
        setTheme: (theme) => set({ theme }),
        setWorkspace: (workspace) => set({ workspace }),
        setOffline: (isOffline) => set({ isOffline }),
        setSearchQuery: (searchQuery) => set({ searchQuery }),
        setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
        setAssigneeFilter: (assigneeFilter) => set({ assigneeFilter }),
      }),
      {
        persister: db ? createStorePersister(db, { storageKey: `app_state_${DEMO_VERSION}` }) : undefined,
      }
    );
  }
  return globalStoreInstance;
};

const setupQuerySystem = () => {
  if (queryConfigured) return;
  const db = getDB();
  if (db) {
    setDefaultConfig({
      persister: createQueryPersister(db, {
        storageKey: `query_cache_${DEMO_VERSION}`,
        burstKey: DEMO_VERSION,
      }),
      staleTime: 1000 * 60 * 5, // 5 mins
    });
    queryConfigured = true;
  }
};

// --- HELPERS ---
const useRenderCount = () => {
  const count = useRef(0);
  useEffect(() => { count.current += 1; });
  return count.current + 1;
};

const RenderBadge = memo(({ count }: { count: number }) => (
  <div className="px-1.5 py-0.5 rounded outline outline-1 outline-current text-[8px] font-black tracking-widest flex items-center gap-1 opacity-50 w-fit">
    <Zap className="w-2 h-2" /> RENDS: {count}
  </div>
));

const useEcosystemLog = () => {
  const [logs, setLogs] = useState<{ id: number; mod: string; msg: string; time: string }[]>([]);
  const logCounter = useRef(0);
  const addLog = useCallback((mod: string, msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ id: ++logCounter.current, mod, msg, time }, ...prev].slice(0, 15));
  }, []);
  return { logs, addLog };
};

// --- UI COMPONENTS ---

const StatusIcon = ({ status }: { status: TaskStatus }) => {
  if (status === "done") return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === "in-progress") return <Clock className="w-4 h-4 text-amber-500" />;
  return <Circle className="w-4 h-4 text-slate-400" />;
};

const PriorityIndicator = ({ priority }: { priority: PriorityLevel }) => {
  const colors = {
    High: "bg-rose-500",
    Medium: "bg-amber-500",
    Low: "bg-indigo-500"
  };
  return <span className={`w-2 h-2 rounded-full ${colors[priority]}`} title={`${priority} Priority`} />;
};

const IssueCard = memo(({ 
  issue, 
  onToggleStatus,
  theme 
}: { 
  issue: Issue, 
  onToggleStatus: (id: string, currentStatus: TaskStatus) => void,
  theme: 'dark' | 'light' 
}) => {
  const renders = useRenderCount();
  const isDark = theme === "dark";

  return (
    <div className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer group flex flex-col justify-between shadow-sm min-h-[140px] ${
      isDark ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-500' : 
               'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
    }`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{issue.id}</span>
            <PriorityIndicator priority={issue.priority} />
          </div>
          <RenderBadge count={renders} />
        </div>
        <h4 className={`text-sm font-bold leading-snug line-clamp-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          {issue.title}
        </h4>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {issue.tags.map(tag => (
            <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono uppercase tracking-tight ${
              isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-100 text-slate-500'
            }`}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleStatus(issue.id, issue.status); }}
          className={`p-1.5 rounded-lg border transition-colors ${
            isDark ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-100'
          }`}
        >
          <StatusIcon status={issue.status} />
        </button>
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{issue.updatedAt}</span>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
             issue.assignee === CURRENT_USER 
               ? 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30'
               : (isDark ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-100 text-slate-600 border-slate-200')
          }`}>
            {issue.assignee[0]}
          </div>
        </div>
      </div>
    </div>
  );
});

const BoardColumn = memo(({ 
  title, 
  issues, 
  status, 
  theme,
  onToggleStatus
}: { 
  title: string, 
  issues: Issue[], 
  status: TaskStatus, 
  theme: "dark" | "light",
  onToggleStatus: (id: string, s: TaskStatus) => void
}) => {
  const isDark = theme === "dark";
  const renders = useRenderCount();
  
  return (
    <div className={`flex flex-col gap-3 rounded-3xl p-4 h-full ${isDark ? 'bg-slate-900/40 border border-slate-800/50' : 'bg-slate-50 border border-slate-100'}`}>
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-2">
          <StatusIcon status={status} />
          <h3 className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{title}</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
            {issues.length}
          </span>
        </div>
        <RenderBadge count={renders} />
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto scroller-subtle pb-4 pr-1">
        {issues.map(issue => (
          <IssueCard key={issue.id} issue={issue} onToggleStatus={onToggleStatus} theme={theme} />
        ))}
        {issues.length === 0 && (
          <div className={`text-[11px] font-medium p-8 text-center border-2 border-dashed rounded-2xl ${isDark ? 'text-slate-600 border-slate-800' : 'text-slate-400 border-slate-200'}`}>
            No tasks match your exact complex filter criteria.
          </div>
        )}
      </div>
    </div>
  );
});

// --- FILTER BAR ---
const FilterBar = memo(({ theme, logger }: { theme: 'dark' | 'light', logger: any }) => {
  const store = getGlobalStore();
  const { searchQuery, priorityFilter, assigneeFilter, setSearchQuery, setPriorityFilter, setAssigneeFilter } = useStore(store as any) as AppState;
  const isDark = theme === "dark";

  return (
    <div className={`px-8 pb-6 flex flex-wrap items-center gap-4 ${isDark ? 'text-sm' : 'text-sm'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[200px] transition-colors focus-within:border-indigo-500 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
        <Search className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        <input 
          placeholder="Filter issues..." 
          className="bg-transparent border-none outline-none w-full text-sm placeholder:text-slate-500 text-inherit"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.length % 3 === 0) logger("STORE", `Debounced search: "${e.target.value}"`);
          }}
        />
      </div>

      <div className={`flex items-center gap-2 rounded-xl border p-1 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
        <Filter className={`w-4 h-4 ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        <select 
          className={`bg-transparent outline-none cursor-pointer py-1 pr-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value as any);
            logger("STORE", `Filters mutated: Priority -> ${e.target.value}`);
          }}
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className={`flex items-center rounded-xl border p-1 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
        {(['All', 'You', 'Others'] as AssigneeFilter[]).map(type => (
          <button 
            key={type}
            onClick={() => {
               setAssigneeFilter(type);
               logger("STORE", `Filters mutated: Assignee -> ${type}`);
            }}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              assigneeFilter === type 
                ? (isDark ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-800 shadow-sm')
                : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
});

// --- METRICS PANE ---
const WorkspaceMetricsBox = memo(({ workspace, theme, logger }: { workspace: Workspace, theme: 'dark'|'light', logger: any }) => {
  const isDark = theme === "dark";
  const { isOffline } = useStore(getGlobalStore() as any) as AppState;
  
  // Parallel Query showing qortex managing multiple async dependencies
  const metricsKey = ["metrics", workspace];
  const { data, isFetching } = useQuery<WorkspaceMetrics>(metricsKey, {
    fetcher: async () => {
      logger("QUERY", `[Parallel] Fetching analytical metrics for ${workspace}...`);
      if (isOffline) throw new Error("Offline");
      await new Promise(r => setTimeout(r, 1200)); // Metrics take longer
      const wsIssues = RAW_ISSUES[workspace];
      const completed = wsIssues.filter((i: Issue) => i.status === "done").length;
      return {
        total: wsIssues.length,
        completed,
        velocity: Math.floor(Math.random() * 10) + 2,
        health: completed / wsIssues.length > 0.5 ? "Good" : "Warning"
      };
    }
  });

  if (!data) return null;

  return (
    <div className={`mb-6 mx-8 p-4 rounded-2xl flex items-center justify-between border shadow-sm ${isDark ? 'bg-slate-800/20 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
           <BarChart3 className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
           <span className="text-xs font-black uppercase tracking-widest opacity-60">Analytics</span>
        </div>
        <div className="flex items-center gap-8 text-sm">
          <div className="flex flex-col">
            <span className="opacity-50 text-[10px] font-bold uppercase">Completion</span>
            <span className="font-mono font-bold text-indigo-500 text-lg leading-none mt-1">
              {Math.round((data.completed / (data.total || 1)) * 100)}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="opacity-50 text-[10px] font-bold uppercase">Weekly Velocity</span>
            <span className="font-mono font-bold leading-none mt-1">{data.velocity} issues</span>
          </div>
          <div className="flex flex-col">
            <span className="opacity-50 text-[10px] font-bold uppercase">Sprint Health</span>
            <span className={`font-black uppercase leading-none mt-1 text-xs ${data.health === 'Good' ? 'text-emerald-500' : 'text-amber-500'}`}>
              {data.health}
            </span>
          </div>
        </div>
      </div>
      {isFetching && <RefreshCw className="w-4 h-4 animate-spin text-slate-400 opacity-50" />}
    </div>
  );
});


const IssueBoard = memo(({ logger }: { logger: any }) => {
  const store = getGlobalStore();
  const { workspace, theme, isOffline, searchQuery, priorityFilter, assigneeFilter } = useStore(store as any) as AppState;
  const isDark = theme === "dark";
  
  // 1. Complex Fetching Logic (qortex-query-react)
  // The query key is a flattened array of dependencies to ensure perfect cache resolution
  const queryKey = useMemo<string[]>(() => ["issues", workspace, searchQuery, priorityFilter, assigneeFilter], [workspace, searchQuery, priorityFilter, assigneeFilter]);
  
  const { data, isFetching } = useQuery<Issue[]>(queryKey, {
    fetcher: async () => {
      logger("QUERY", `Executing server-side filtering for ${workspace}...`);
      if (isOffline) throw new Error("Offline"); 
      await new Promise(r => setTimeout(r, 600)); // Fake network latency

      let results = [...RAW_ISSUES[workspace]];
      
      // Server-side filtering
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        results = results.filter(i => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.tags.some(t => t.includes(q)));
      }
      if (priorityFilter !== "All") {
        results = results.filter(i => i.priority === priorityFilter);
      }
      if (assigneeFilter !== "All") {
        if (assigneeFilter === "You") results = results.filter(i => i.assignee === CURRENT_USER);
        if (assigneeFilter === "Others") results = results.filter(i => i.assignee !== CURRENT_USER);
      }

      logger("NETWORK", `200 OK - Returned ${results.length} filtered items`);
      return results;
    }
  });

  const issues = data || [];

  // Optimistic Mutation Logic 
  // (In complex apps, we optimistically update the Exact View we are looking at)
  const handleToggleStatus = useCallback((id: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === "todo" ? "in-progress" : currentStatus === "in-progress" ? "done" : "todo";
    logger("STORE", `Optimistic UI: Updating ${id} to ${nextStatus}`);
    
    // 1. Immediately update UI Cache for THIS exact filtered view
    setQueryData<Issue[]>(queryKey, (prev) => {
      if (!prev) return [];
      return prev.map(issue => issue.id === id ? { ...issue, status: nextStatus, updatedAt: "Just now" } : issue);
    });

    // 2. Perform fake network request
    setTimeout(() => {
      if (isOffline) {
        logger("DB", `Offline Mode: DB Queued mutation for ${id}`);
      } else {
        logger("NETWORK", `200 OK - Synced ${id} to ${nextStatus}`);
        // Optionally invalidate the generic ["issues", workspace] if qortex supports prefix invalidation, 
        // but since we are mocking, the exact key update is enough to show off instantaneous UI.
      }
    }, 600);
  }, [queryKey, isOffline, logger]);

  const handleNewIssue = useCallback(() => {
    const prefix = workspace.split(' ')[0].toUpperCase().substring(0, 2);
    const newId = `${prefix}-${Math.floor(Math.random() * 1000)}`;
    const newIssue: Issue = {
      id: newId,
      title: "New auto-generated ecosystem task",
      status: "todo",
      priority: priorityFilter === "All" ? "Medium" : priorityFilter,
      assignee: assigneeFilter === "Others" ? "Alex" : CURRENT_USER,
      tags: ["new"],
      updatedAt: "Just now"
    };

    logger("STORE", `Optimistic UI: Created new issue ${newId}`);

    setQueryData<Issue[]>(queryKey, (prev) => {
      const existing = prev || [];
      return [newIssue, ...existing];
    });

    setTimeout(() => {
      if (isOffline) {
        logger("DB", `Offline Mode: DB Queued creation for ${newId}`);
      } else {
        logger("NETWORK", `201 Created - Synced ${newId}`);
      }
    }, 600);
  }, [workspace, queryKey, priorityFilter, assigneeFilter, isOffline, logger]);

  const todo = issues.filter((i: Issue) => i.status === "todo");
  const inProgress = issues.filter((i: Issue) => i.status === "in-progress");
  const done = issues.filter((i: Issue) => i.status === "done");

  return (
    <div className="h-full flex flex-col pt-8">
      <div className="flex items-center justify-between mb-6 px-8">
        <div>
          <h1 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-3`}>
            {workspace} 
            {isFetching && <RefreshCw className="w-6 h-6 animate-spin text-slate-400 opacity-50" />}
          </h1>
          <p className={`text-sm mt-1 mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Complex parameterized fetching with Qortex Query (Sub-millisecond cache hits for filters)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleNewIssue} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
            <Plus className="w-4 h-4" /> Create Issue
          </button>
        </div>
      </div>

      <FilterBar theme={theme} logger={logger} />
      <WorkspaceMetricsBox workspace={workspace} theme={theme} logger={logger} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 px-8 pb-8 min-h-0 overflow-y-auto">
         <BoardColumn title="To Do" issues={todo} status="todo" theme={theme} onToggleStatus={handleToggleStatus} />
         <BoardColumn title="In Progress" issues={inProgress} status="in-progress" theme={theme} onToggleStatus={handleToggleStatus} />
         <BoardColumn title="Completed" issues={done} status="done" theme={theme} onToggleStatus={handleToggleStatus} />
      </div>
    </div>
  );
});

// --- TRACER TERMINAL ---
const EcosystemTracer = memo(({ logs, theme }: { logs: any[], theme: string }) => {
  const isDark = theme === "dark";
  return (
    <div className={`w-80 h-full border-l flex flex-col ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <TerminalSquare className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>System Tracer</h3>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>
      <div className="flex-1 p-4 font-mono text-[10px] space-y-3 overflow-y-auto scroller-subtle">
        {logs.length === 0 && (
          <div className="text-slate-500 italic mt-2 text-center">Listening to Qortex Core...</div>
        )}
        {logs.map(log => (
          <div key={log.id} className="animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <span>{log.time}</span>
              <span className={`font-bold ${
                log.mod === 'STORE' ? 'text-purple-400' :
                log.mod === 'QUERY' ? 'text-blue-400' :
                log.mod === 'DB' ? 'text-emerald-400' :
                log.mod === 'NETWORK' ? 'text-amber-400' : 'text-slate-400'
              }`}>[{log.mod}]</span>
            </div>
            <div className={`${isDark ? 'text-slate-300 bg-slate-900' : 'text-slate-800 bg-white'} p-2 rounded-lg leading-relaxed border shadow-sm ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              {log.msg}
            </div>
          </div>
        ))}
      </div>
      <div className={`p-4 border-t text-[9px] uppercase tracking-wider font-bold text-center ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
        Qortex Reactive Core running
      </div>
    </div>
  );
});

function DashboardContent({ logs, addLog }: { logs: any[], addLog: any }) {
  const renders = useRenderCount();
  const store = getGlobalStore();
  const { theme, workspace, isOffline, setTheme, setWorkspace, setOffline, setSearchQuery } = useStore(store as any) as AppState;
  const isDark = theme === "dark";

  const handleWorkspaceSwitch = (ws: Workspace) => {
    addLog("STORE", `User Action: Workspace changed to ${ws}`);
    setSearchQuery(""); // clear search on change
    setWorkspace(ws);
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-300 font-sans ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-800'}`}>
      
      {/* SIDEBAR */}
      <div className={`w-64 border-r flex flex-col shadow-xl z-20 ${isDark ? 'border-slate-800 bg-slate-900/80 backdrop-blur-xl' : 'border-slate-200 bg-slate-50/90 backdrop-blur-xl'}`}>
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 w-fit group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Database className="w-4 h-4" />
            </div>
            <span className={`font-black tracking-tight text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Qortex<span className="text-indigo-500">Tracker</span></span>
          </Link>
        </div>
        
        <div className="px-4 py-2 flex-1">
          <span className={`text-[10px] font-black uppercase tracking-widest pl-2 mb-3 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Engineering Projects</span>
          <div className="space-y-1.5">
            {[
              { name: "Frontend Core", icon: LayoutDashboard },
              { name: "Backend API", icon: Server },
              { name: "Design System", icon: Paintbrush }
            ].map(ws => (
              <button
                key={ws.name}
                onClick={() => handleWorkspaceSwitch(ws.name as Workspace)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  workspace === ws.name 
                    ? (isDark ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20') 
                    : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100')
                }`}
              >
                <ws.icon className="w-4 h-4" />
                {ws.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
          <div className={`p-4 rounded-2xl border flex flex-col gap-4 shadow-inner ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800 border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">App State Matrix</span>
              <RenderBadge count={renders} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Network Driver</span>
              <button 
                onClick={() => { addLog("STORE", "Toggled Offline Simulator"); setOffline(!isOffline); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${isOffline ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : isDark ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-emerald-600 shadow-sm'}`}
                title={isOffline ? "Go Online" : "Go Offline"}
              >
                {isOffline ? <><WifiOff className="w-3 h-3" /> Offline</> : <><Wifi className="w-3 h-3" /> Online</>}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Color Mode</span>
              <button 
                onClick={() => { addLog("STORE", "Toggled Theme"); setTheme(isDark ? "light" : "dark"); }}
                className={`p-2 rounded-lg transition-all ${isDark ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 shadow-sm text-indigo-600'}`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN BOARD */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0 mix-blend-overlay" style={{ backgroundImage: "url('/grid.svg')" }} />
        <div className="relative z-10 flex-1 overflow-auto bg-gradient-to-br from-transparent to-slate-500/5">
           <IssueBoard logger={addLog} />
        </div>
      </div>

      {/* TRACER TERMINAL (RIGHT PANEL) */}
      <EcosystemTracer logs={logs} theme={theme} />

    </div>
  );
}

// --- MAIN DASHBOARD APP ---

export default function AppDashboard() {
  const [isClient, setIsClient] = useState(false);
  const { logs, addLog } = useEcosystemLog();
  
  useEffect(() => {
    setIsClient(true);
    setupQuerySystem();
  }, []);

  if (!isClient) return null;

  return <DashboardContent logs={logs} addLog={addLog} />;
}
