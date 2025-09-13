import React, { useState } from "react";
import { useQuery, queryManager } from "dquery-react";
import "./App.css";


queryManager.registerFetcher(["todos"], {
  fetcher: async () => {
    console.log("🔄 Fetching todos...");
    const response = await fetch("https://jsonplaceholder.typicode.com/todos");
    return response.json();
  }
});

// Test non-React usage
function testNonReactUsage() {
  console.log("Testing non-React usage with throttling:");

  // Test rapid successive calls (should be throttled)
  console.log("1. Rapid successive getQueryData calls:");
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      console.log(`getQueryData call ${i + 1}:`);
      const data = queryManager.getQueryData(["todos"], { enabled: true });
      console.log("Data:", data);
    }, i * 10); // 10ms apart - within throttle window
  }

  // Test calls outside throttle window
  setTimeout(() => {
    console.log("2. getQueryData call after throttle window:");
    const data = queryManager.getQueryData(["todos"], { enabled: true });
    console.log("Data:", data);
  }, 200); // 200ms later - outside throttle window

  // Test getQueryState
  setTimeout(() => {
    console.log("3. getQueryState call:");
    const state = queryManager.getQueryState(["todos"]);
    console.log("State:", state);
  }, 300);

  // Test subscribeQuery (triggers mount logic)
  setTimeout(() => {
    console.log("4. subscribeQuery call:");
    const unsubscribe = queryManager.subscribeQuery(["todos"], () => {
      console.log("Subscription callback triggered");
    });

    // Clean up
    setTimeout(() => {
      unsubscribe();
      console.log("Unsubscribed");
    }, 1000);
  }, 400);
}


export default function App() {
  const [showSecondComponent, setShowSecondComponent] = useState(false);
  const [showThirdComponent, setShowThirdComponent] = useState(false);

  const { data, isLoading, error } = useQuery<any>(["todos"], {
    refetchOnSubscribe: "stale", // Default behavior - refetch if stale
    staleTime: 0, // Data is stale immediately (like TanStack Query default)
  });

  return (
    <div className="app">
      <h1>D-Query Test App</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setShowSecondComponent(!showSecondComponent)}>
          {showSecondComponent ? 'Hide' : 'Show'} Second Component
        </button>
        <button onClick={() => setShowThirdComponent(!showThirdComponent)} style={{ marginLeft: '10px' }}>
          {showThirdComponent ? 'Hide' : 'Show'} Third Component (Disabled)
        </button>
        <button onClick={testNonReactUsage} style={{ marginLeft: '10px' }}>
          Test Non-React Usage
        </button>
        <p>This tests multiple component subscriptions to the same query and non-React usage.</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Component 1 (First, Enabled)</h2>
        {isLoading && <div>Loading...</div>}
        {error && <div>Error: {error.message}</div>}
        {data && <div>Todo count: {data?.length}</div>}
        {data?.slice(0, 3).map((todo) => (
          <div key={todo.id}>{todo.title}</div>
        ))}
      </div>

      {showSecondComponent && (
        <div>
          <h2>Component 2 (Subsequent, Enabled, refetchOnSubscribe: false)</h2>
          <SecondComponent />
        </div>
      )}

      {showThirdComponent && (
        <div>
          <h2>Component 3 (Subsequent, Disabled)</h2>
          <ThirdComponent />
        </div>
      )}
    </div>
  );
}

function SecondComponent() {
  const { data, isLoading, error } = useQuery<any>(["todos"], {
    refetchOnSubscribe: false, // This component won't trigger refetch on subscribe
  });

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && <div>Todo count: {data?.length}</div>}
      {data?.slice(3, 6).map((todo) => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  );
}

function ThirdComponent() {
  const { data, isLoading, error } = useQuery<any>(["todos"], {
    enabled: false, // This component is disabled
  });

  return (
    <div>
      <p>This component is disabled and should not trigger any fetches.</p>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && <div>Todo count: {data?.length}</div>}
      {data?.slice(6, 9).map((todo) => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  );
}