import { createRoot } from "react-dom/client";

// Minimal test to see if React can mount at all
const TestApp = () => {
  return (
    <div style={{ padding: '40px', background: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'green', fontSize: '48px' }}>✅ React IS Working!</h1>
      <p style={{ fontSize: '24px' }}>If you can see this, React is mounting correctly.</p>
      <p>The issue is somewhere in the App component or its dependencies.</p>
    </div>
  );
};

console.log("main.tsx is executing!");
const root = document.getElementById("root");
console.log("Root element:", root);

if (root) {
  createRoot(root).render(<TestApp />);
  console.log("React app mounted successfully!");
} else {
  console.error("Root element not found!");
}
