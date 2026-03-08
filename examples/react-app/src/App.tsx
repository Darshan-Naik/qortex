import React from "react";
import "./App.css";

import { useQuery, useMutate } from "@qortex/query-react";

const fetcher = async () => {
  console.log("fetching data");
  await new Promise(resolve => setTimeout(resolve, 1000));
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  return response.json();
}



export default function App() {
  const { data, isLoading, isError, error } = useQuery(["posts"], { fetcher });

  const { mutate } = useMutate(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("mutating data");
  }, {
    queryKey: ["posts"],
  })

  return (
    <div className="app">
      <h1>D-Query Test App</h1>


      <div style={{ marginBottom: '20px' }}>
        <h2>{data?.length}</h2>
        <h2>{isLoading ? "Loading..." : "Not Loading"}</h2>
        <h2>{isError ? "Error" : "No Error"}</h2>
        <button onClick={mutate}>Mutate</button>
      </div>

    </div>
  );
}
