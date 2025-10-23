// Anonymous session management for $ECHO tokens
// No personal data stored, just a random session ID

export function getSessionId(): string {
  const SESSION_KEY = 'echodeed_session';
  
  // Check if session exists in localStorage
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    // Generate new anonymous session ID
    sessionId = 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

export function clearSession(): void {
  const SESSION_KEY = 'echodeed_session';
  localStorage.removeItem(SESSION_KEY);
}

// Add session ID to fetch headers
export function addSessionHeaders(headers: HeadersInit = {}): HeadersInit {
  // PRODUCTION DEMO MODE FIX: Always use demo session when DEMO_MODE is enabled
  // This ensures production demos (www.echodeed.com) work without real authentication
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || 
                     window.location.hostname === 'www.echodeed.com' ||
                     window.location.hostname.includes('echodeed.com');
  
  const userRole = localStorage.getItem('echodeed_demo_role') || 'student';
  const sessionId = isDemoMode ? 'demo-session' : getSessionId();
  
  return {
    ...headers,
    'X-Session-ID': sessionId,
    'X-Demo-Role': userRole, // Send user's actual role to server
  };
}