import React from 'react';

// Simple test component to verify React is working
function TestApp() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontSize: '24px',
      color: '#333'
    }}>
      <h1>🚀 React is Working!</h1>
      <p>This is a simple test to verify React is mounting correctly.</p>
      <button onClick={() => alert('Click works!')}>Test Button</button>
    </div>
  );
}

export default TestApp;