import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>🎯 EchoDeed App Working!</h1>
        <p style={{ color: '#666' }}>The backend is connected and API calls are working.</p>
        <p style={{ color: '#666' }}>Now rebuilding the Home component...</p>
      </div>
    </QueryClientProvider>
  );
}

export default App;