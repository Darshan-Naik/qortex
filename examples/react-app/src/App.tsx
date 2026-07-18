import React from "react";
import "./App.css";

// 1. Import all ecosystem packages
import { createDB } from "qortex-db";
import { createQueryPersister } from "qortex-db/query";
import { createStorePersister } from "qortex-db/store";
import { useQuery, setDefaultConfig } from "qortex-query-react";
import { createStore, useStore } from "qortex-store-react";

// Import the new Resource Section component
import ResourceSection from "./ResourceSection";

// 2. Initialize Unified Database
const db = createDB({
  name: "qortex_demo_db",
  driver: "indexedDB", // High performance async storage
});

// 3. Configure qortex-query with persistence
// This automatically handles hydration and background syncing
setDefaultConfig({
  persister: createQueryPersister(db, {
    storageKey: "main_cache",
    burstKey: "v2.0", // Invalidate cache if schema changes
  }),
  staleTime: 1000 * 60 * 5, // 5 minutes cache
});

// 4. Create a Global Store with automatic persistence
interface GlobalState {
  theme: "dark" | "light";
  username: string;
  updateUsername: (name: string) => void;
  toggleTheme: () => void;
}

const globalStore = createStore<GlobalState>(
  (set) => ({
    theme: "dark",
    username: "Qortex User",
    updateUsername: (username) => set({ username }),
    toggleTheme: () =>
      set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
  }),
  {
    // Simple wiring: just pass the persister and forget!
    persister: createStorePersister(db, { storageKey: "user_settings" }),
  }
);

// --- UI COMPONENTS ---

const QuerySection = () => {
  const { data, isLoading, isError, refetch } = useQuery(["todo_list"], {
    fetcher: async () => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));
      const res = await fetch(
        "https://jsonplaceholder.typicode.com/todos?_limit=3"
      );
      return res.json();
    },
  });

  return (
    <div className="section-card">
      <div className="package-info">qortex-query + qortex-db/query</div>
      <h2>
        <span>📦</span> Remote Data Fetching
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
        Data is fetched once, cached in memory, and persisted to IndexedDB.
        Refresh the page and it loads instantly without a network call.
      </p>

      {isLoading && !data && <p>Fetching from network...</p>}
      {data && (
        <div className="query-results">
          {(data as any[]).map((todo: any) => (
            <div key={todo.id} className="query-item">
              <div>
                <h4>{todo.title}</h4>
                <p>Status: {todo.completed ? "✅ Done" : "⏳ Pending"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && <p style={{ color: "var(--danger)" }}>Failed to fetch data.</p>}

      <div className="controls">
        <button className="btn" onClick={() => refetch()}>
          🔄 Refetch Data
        </button>
      </div>
    </div>
  );
};

const StoreSection = () => {
  const { theme, username, updateUsername, toggleTheme } = useStore(globalStore);

  return (
    <div className="section-card" style={{ borderColor: theme === "light" ? "var(--primary)" : "#334155" }}>
      <div className="package-info">qortex-store + qortex-db/store</div>
      <h2>
        <span>🧠</span> Global State
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
        This state is synchronized across the app and persisted automatically.
        Try changing the name or theme and refresh!
      </p>

      <div style={{ marginTop: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600" }}>Current Username:</label>
        <input
          className="store-input"
          value={username}
          onChange={(e) => updateUsername(e.target.value)}
        />
      </div>

      <div className="controls">
        <button className="btn btn-outline" onClick={toggleTheme}>
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div style={{ marginTop: "20px", padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
        <pre style={{ fontSize: "11px", margin: 0 }}>
          {JSON.stringify({ theme, username }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>Qortex Ecosystem Demo</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)" }}>
            Building high-performance, persistent applications with ease.
          </p>
        </div>
        <div className="status-badge">
          <div className="status-dot"></div>
          <span>Persistence Layer: IndexedDB (Active)</span>
        </div>
      </header>

      <main className="dashboard-grid">
        <QuerySection />
        <StoreSection />
        <ResourceSection />
      </main>

      <div style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
        <button className="btn" style={{ background: "#475569" }} onClick={() => window.location.reload()}>
          🚀 Full Page Reload (Test Persistence)
        </button>
      </div>

      <footer className="footer">
        <h3>💡 Why this is complex handling "made easy"</h3>
        <ul>
          <li>
            <strong>Async-Safe Hydration</strong>: The UI doesn't overwrite DB data if network fetches finish before DB loads. Qortex manages the <code>hydrationPromise</code> internally.
          </li>
          <li>
            <strong>Inter-package Synergy</strong>: Notice how <code>qortex-db</code> acts as a bridge for both <code>query</code> and <code>store</code> with zero tight coupling.
          </li>
          <li>
            <strong>Tree-Shaking</strong>: Everything is modular. If you only needed Store, you wouldn't bundle the Query logic.
          </li>
          <li>
            <strong>Performance</strong>: Persistence uses debounced IndexedDB writes to ensure UI smoothness even with massive state changes.
          </li>
        </ul>
      </footer>
    </div>
  );
}
