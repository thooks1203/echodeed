import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { addSessionHeaders } from './session';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: addSessionHeaders(data ? { "Content-Type": "application/json" } : {}),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add retry logic for demo authentication timing issues
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      const res = await fetch(queryKey.join("/") as string, {
        headers: addSessionHeaders(),
        credentials: "include",
        cache: 'no-store' // Prevent 304 responses that cause blank screens
      });

      // If 401 on first attempt, wait a bit and retry (demo timing issue)
      if (res.status === 401 && attempts < maxAttempts - 1) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100 * attempts)); // 100ms, then 200ms
        continue;
      }

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // Always fresh
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
