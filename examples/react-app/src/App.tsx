import React from "react";
import "./App.css";

import { useQuery, useMutate } from "@qortex/query-react";
import { createStore, useStore } from "@qortex/store-react";

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

// 1. Create a store for the counter
const counterStore = createStore<CounterState>((set, get) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 }),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

const fetcher = async () => {
  console.log("fetching data");
  await new Promise(resolve => setTimeout(resolve, 1000));
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  return response.json();
}

function Counter() {
  const count = useStore(counterStore, (s: CounterState) => s.count);
  const { increment, decrement, reset } = counterStore.getState();

  return (
    <div className="counter-card" style={{
      padding: '20px',
      borderRadius: '12px',
      background: '#f0f4f8',
      border: '1px solid #d1d9e6',
      marginBottom: '20px'
    }}>
      <h3>Simple Counter (@qortex/store-react)</h3>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>{count}</div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={decrement}>- Decrement</button>
        <button onClick={reset}>Reset</button>
        <button onClick={increment}>+ Increment</button>
      </div>
    </div>
  );
}

export default function App() {
  const { data, isLoading, isError } = useQuery(["posts"], { fetcher });

  const { mutate } = useMutate(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("mutating data");
  }, {
    queryKey: ["posts"],
  })

  return (
    <div className="app" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
      <h1>Qortex Example App</h1>

      <Counter />

      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: '#fff',
        border: '1px solid #eaeaea',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <h3>Data Fetching (@qortex/query-react)</h3>
        <p>Posts in cache: <strong>{data?.length || 0}</strong></p>
        <p>Status: {isLoading ? "⏳ Loading..." : "✅ Ready"}</p>
        {isError && <p style={{ color: 'red' }}>❌ Error fetching data</p>}
        <button
          onClick={() => mutate()}
          style={{ width: '100%', marginTop: '10px' }}
          disabled={isLoading}
        >
          Refetch Posts
        </button>
      </div>
    </div>
  );
}
