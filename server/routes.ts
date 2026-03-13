import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import deliveriesRouter from "./routes/deliveries";
import { initWebSocketServer } from "./websocket";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/deliveries", deliveriesRouter);

  app.get("/admin-portal", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      message: "UMOVE ANNABA Admin Portal",
      timestamp: new Date().toISOString(),
    });
  });

  // Catch-all: any /api/* route that wasn't matched above returns JSON 404
  // This prevents the static HTML landing page from leaking into API consumers.
  app.use("/api", (_req: Request, res: Response) => {
    res.status(404).json({ error: "API endpoint not found." });
  });

  const httpServer = createServer(app);

  initWebSocketServer(httpServer);

  return httpServer;
}
