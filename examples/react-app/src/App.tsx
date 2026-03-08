import React, { useState, useEffect, useRef } from "react";
import "./App.css";

import { useQuery, useMutate } from "qortex-query-react";
import { createStore, useStore } from "qortex-store-react";

// --- COMPLEX STORE DEFINITION ---

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

interface UserSettings {
  theme: "light" | "dark";
  notifications: boolean;
  fontSize: number;
}

interface UserState {
  user: UserProfile;
  settings: UserSettings;
  status: "online" | "offline" | "away";
  lastUpdated: number;

  // Actions
  updateName: (name: string) => void;
  toggleTheme: () => void;
  toggleNotifications: () => void;
  setStatus: (status: UserState["status"]) => void;
  resetSettings: () => void;
}

const userStore = createStore<UserState>((set, get) => ({
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "👤",
  },
  settings: {
    theme: "light",
    notifications: true,
    fontSize: 14,
  },
  status: "online",
  lastUpdated: Date.now(),

  updateName: (name) => set((state) => ({
    user: { ...state.user, name },
    lastUpdated: Date.now()
  })),

  toggleTheme: () => set((state) => ({
    settings: { ...state.settings, theme: state.settings.theme === "light" ? "dark" : "light" },
    lastUpdated: Date.now()
  })),

  toggleNotifications: () => set((state) => ({
    settings: { ...state.settings, notifications: !state.settings.notifications },
    lastUpdated: Date.now()
  })),

  setStatus: (status) => set({ status, lastUpdated: Date.now() }),

  resetSettings: () => set({
    settings: { theme: "light", notifications: true, fontSize: 14 },
    lastUpdated: Date.now()
  }),
}));

// --- UTILITY COMPONENT FOR RENDERING INDICATOR ---

function RenderCount({ name }: { name: string }) {
  const count = useRef(0);
  count.current++;

  return (
    <div style={{
      fontSize: '10px',
      color: '#888',
      marginTop: '4px',
      fontFamily: 'monospace'
    }}>
      {name} renders: <span style={{ color: '#ff4757', fontWeight: 'bold' }}>{count.current}</span>
    </div>
  );
}

// --- SELECTIVE SUBSCRIPTION COMPONENTS ---

function ProfileCard() {
  // Only subscribes to user object
  const user = useStore(userStore, (s) => s.user);
  const { updateName } = userStore.get();

  return (
    <div className="card" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
      <h4>Profile (Subscribed to User Only)</h4>
      <div style={{ fontSize: '24px' }}>{user.avatar}</div>
      <p>Name: <strong>{user.name}</strong></p>
      <input
        type="text"
        value={user.name}
        onChange={(e) => updateName(e.target.value)}
        placeholder="Change name..."
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <RenderCount name="ProfileCard" />
    </div>
  );
}

function SettingsCard() {
  // Only subscribes to settings object
  const settings = useStore(userStore, (s) => s.settings);
  const { toggleTheme, toggleNotifications } = userStore.get();

  return (
    <div className="card" style={{
      border: '1px solid #ddd',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '10px',
      backgroundColor: settings.theme === 'dark' ? '#2f3542' : '#ffffff',
      color: settings.theme === 'dark' ? '#ffffff' : '#2f3542'
    }}>
      <h4>Settings (Subscribed to Settings Only)</h4>
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        <button onClick={toggleTheme}>
          Switch to {settings.theme === "light" ? "Dark" : "Light"} Mode
        </button>
        <button onClick={toggleNotifications}>
          Notifications: {settings.notifications ? "ON" : "OFF"}
        </button>
      </div>
      <RenderCount name="SettingsCard" />
    </div>
  );
}

function StatusCard() {
  // Only subscribes to status property
  const status = useStore(userStore, (s) => s.status);
  const { setStatus } = userStore.get();

  return (
    <div className="card" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
      <h4>Status (Subscribed to Status String Only)</h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
        <span style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: status === 'online' ? '#2ed573' : status === 'away' ? '#eccc68' : '#747d8c'
        }} />
        <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{status}</span>
      </div>
      <div style={{ marginTop: '10px', display: 'flex', gap: '5px', justifyContent: 'center' }}>
        <button onClick={() => setStatus('online')}>Online</button>
        <button onClick={() => setStatus('away')}>Away</button>
        <button onClick={() => setStatus('offline')}>Offline</button>
      </div>
      <RenderCount name="StatusCard" />
    </div>
  );
}

function DashboardInfo() {
  // Subscribes to the entire store
  const state = useStore(userStore);

  return (
    <div className="card" style={{
      border: '2px solid #3742fa',
      padding: '15px',
      borderRadius: '8px',
      marginTop: '20px',
      backgroundColor: '#f1f2f6'
    }}>
      <h4>Dashboard (Subscribed to Everything)</h4>
      <p style={{ fontSize: '12px' }}>Last Updated: {new Date(state.lastUpdated).toLocaleTimeString()}</p>
      <div style={{ textAlign: 'left', fontSize: '12px', backgroundColor: '#dfe4ea', padding: '10px', borderRadius: '4px' }}>
        <pre>{JSON.stringify({
          user: state.user,
          status: state.status,
          settings: state.settings
        }, null, 2)}</pre>
      </div>
      <RenderCount name="DashboardInfo" />
    </div>
  );
}

// --- MAIN APP ---

export default function App() {
  return (
    <div className="app" style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#3742fa', margin: 0 }}>Qortex Performance Demo</h1>
        <p style={{ color: '#57606f' }}>Verification of selective re-renders and complex state management</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="column">
          <ProfileCard />
          <StatusCard />
        </div>
        <div className="column">
          <SettingsCard />
          <button
            style={{ width: '100%', padding: '15px', backgroundColor: '#ffa502', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => userStore.get().resetSettings()}
          >
            Reset All Settings
          </button>
        </div>
      </div>

      <DashboardInfo />

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
        <h4>💡 Verification Instructions</h4>
        <ul style={{ textAlign: 'left', display: 'inline-block', fontSize: '14px', lineHeight: '1.6' }}>
          <li>Type in the <strong>Name input</strong>: Only Profile component and Dashboard should re-render.</li>
          <li>Change <strong>Theme</strong>: Only Settings component and Dashboard should re-render.</li>
          <li>Change <strong>Status</strong>: Only Status component and Dashboard should re-render.</li>
          <li>Notice how <strong>ProfileCard</strong> doesn't flicker when you change <strong>Status</strong>!</li>
        </ul>
      </div>
    </div>
  );
}
