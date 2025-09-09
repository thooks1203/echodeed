import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Home from "@/pages/home";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>🎯 EchoDeed App Loading...</h1>
        <Home />
      </div>
    </QueryClientProvider>
  );
}

export default App;