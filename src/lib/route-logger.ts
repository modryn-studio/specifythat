export interface RouteLogContext {
  reqId: string;
  reqStart: number;
}

export interface RouteLogger {
  /** Call at the top of the handler — prints separator + START line, returns context */
  begin(): RouteLogContext;
  /** Log an info line under the current request */
  info(reqId: string, message: string, data?: Record<string, unknown>): void;
  /** Log a warning line */
  warn(reqId: string, message: string, data?: Record<string, unknown>): void;
  /** Wrap a completed response — prints ✅ timing line and returns the response */
  end(ctx: RouteLogContext, response: Response, data?: Record<string, unknown>): Response;
  /** Log an error with elapsed time */
  err(ctx: RouteLogContext, error: unknown): void;
}

export function createRouteLogger(routeName: string): RouteLogger {
  const tag = `[${routeName}]`;

  return {
    begin() {
      const reqId = Math.random().toString(36).slice(2, 7).toUpperCase();
      const reqStart = Date.now();
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`${tag} ▶ START [${reqId}] ${new Date().toISOString()}`);
      return { reqId, reqStart };
    },

    info(reqId, message, data) {
      if (data && Object.keys(data).length > 0) {
        console.log(`${tag} [${reqId}] ${message}`, data);
      } else {
        console.log(`${tag} [${reqId}] ${message}`);
      }
    },

    warn(reqId, message, data) {
      if (data && Object.keys(data).length > 0) {
        console.warn(`${tag} [${reqId}] ⚠️  ${message}`, data);
      } else {
        console.warn(`${tag} [${reqId}] ⚠️  ${message}`);
      }
    },

    end({ reqId, reqStart }, response, data) {
      const elapsed = Date.now() - reqStart;
      const logData = { ...data, elapsedMs: elapsed, status: response.status };
      console.log(`${tag} [${reqId}] ✅ Done`, logData);
      return response;
    },

    err({ reqId, reqStart }, error) {
      const elapsed = Date.now() - reqStart;
      console.error(`${tag} [${reqId}] ❌ Error after ${elapsed}ms:`, error);
    },
  };
}
