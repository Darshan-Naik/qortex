import React from "react";
import { useQuery,queryManager } from "qortex-react";
import "./App.css";




export default function App() {

  const { data, isLoading, error } = useQuery(["todos"], {
    staleTime: 200,
    fetcher: async () => {
      console.log("fetcher called");
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [{ id: 1, title: "Todo 1" }, { id: 2, title: "Todo 2" }, { id: 3, title: "Todo 3" }];
    }
  });
  queryManager.clearCache();

  return (
    <div className="app">
      <h1>D-Query Test App</h1>


      <div style={{ marginBottom: '20px' }}>
        <h2>Component 1 (First, Enabled)</h2>
        {isLoading && <div>Loading...</div>}
        {error && <div>Error: {error.message}</div>}
        {data && <div>Todo count: {data?.length}</div>}
        {data?.map((todo) => (
          <div key={todo.id}>{todo.title}</div>
        ))}
      </div>

    </div>
  );
}
