import React from "react";
import { useQuery } from "qortex-react";
import "./App.css";


const fetcher = async () => {
  console.log('Fetching...')
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [{ id: 1, title: "Todo 1" }, { id: 2, title: "Todo 2" }, { id: 3, title: "Todo 3" }];
}

export default function App() {

  const { isError, refetch, isFetching } = useQuery(["todos"], {
    staleTime: 200,
    fetcher: fetcher,
  });

  console.log(isError)

  return (
    <div className="app">
      <h1>D-Query Test App</h1>


      <div style={{ marginBottom: '20px' }}>
        <h2>Component 1 (First, Enabled)</h2>
        {isError && <div>Loading...</div>}
        <button onClick={refetch} >Refecth</button>
      </div>

    </div>
  );
}
