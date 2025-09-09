import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import HomeSimple from "@/pages/home-simple";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeSimple />
    </QueryClientProvider>
  );
}

export default App;
