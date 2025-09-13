import React from "react";
import { queryManager, useQuery } from "d-query-react";

// Register a simple fetcher in runtime (simulates host bootstrap)
queryManager.registerFetcher("hello", {
  fetcher: async ({ signal }) => {
    // simulate network delay
    await new Promise((r) => setTimeout(r, 3000));
    return [{ id: 1, text: "Hello from d-query!" }];
  },
  staleTime: 10000
});

export default function App() {
  const { data, isLoading, isFetching, refetch } = useQuery("hello", {
    placeholderData: [{ id: 0, text: "Loading..." }],
    usePlaceholderOnError: true,
    refetchOnSubscribe: "stale"
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>d-query React Example</h1>
      <button onClick={() => refetch()}>Refetch</button>
      {isLoading && <p>Loading initial...</p>}
      {isFetching && <p>Refreshing...</p>}
      <ul>
        {data?.map((item: any) => <li key={item.id}>{item.text}</li>)}
      </ul>
    </div>
  );
}
