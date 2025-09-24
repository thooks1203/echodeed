// MINIMAL JAVASCRIPT TEST - NO IMPORTS
console.log('=== MAIN.TSX EXECUTING ===');

// Change background immediately
document.body.style.backgroundColor = 'red';
document.body.style.color = 'white';

// Create debug message
const debugDiv = document.createElement('div');
debugDiv.innerHTML = 'MAIN.TSX IS RUNNING! If you see this, JavaScript works but imports fail.';
debugDiv.style.position = 'fixed';
debugDiv.style.top = '50%';
debugDiv.style.left = '50%';
debugDiv.style.transform = 'translate(-50%, -50%)';
debugDiv.style.padding = '20px';
debugDiv.style.backgroundColor = 'black';
debugDiv.style.color = 'lime';
debugDiv.style.border = '3px solid lime';
debugDiv.style.fontSize = '18px';
debugDiv.style.zIndex = '9999';
debugDiv.style.textAlign = 'center';
document.body.appendChild(debugDiv);

// Test if we can find root
const root = document.getElementById("root");
if (root) {
  root.innerHTML = '<h1 style="color: lime; text-align: center; padding: 50px;">BASIC JAVASCRIPT WORKS!<br>The problem is with React imports.</h1>';
  debugDiv.innerHTML += '<br>✅ Found root div';
} else {
  debugDiv.innerHTML += '<br>❌ No root div found';
}

// Try to load React AFTER we know basic JS works
setTimeout(() => {
  debugDiv.innerHTML += '<br>Now testing imports...';
  try {
    import('./App')
      .then(() => {
        debugDiv.innerHTML += '<br>✅ App import works';
      })
      .catch((err) => {
        debugDiv.innerHTML += '<br>❌ App import failed: ' + err.message;
      });
  } catch (err) {
    debugDiv.innerHTML += '<br>❌ Import syntax failed: ' + (err as Error).message;
  }
}, 1000);
