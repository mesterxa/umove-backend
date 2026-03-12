import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import deliveriesRouter from "./routes/deliveries";

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

  const httpServer = createServer(app);

  return httpServer;
}
