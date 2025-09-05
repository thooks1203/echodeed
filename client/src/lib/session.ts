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
  return {
    ...headers,
    'X-Session-ID': getSessionId(),
  };
}