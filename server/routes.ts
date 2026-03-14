import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import deliveriesRouter from "./routes/deliveries";
import { initWebSocketServer } from "./websocket";
import { firebaseConnected } from "./firebase-admin";

function buildAdminPortalHtml(): string {
  const fbStatus = firebaseConnected
    ? `<span class="badge ok">🟢 Connected</span>`
    : `<span class="badge err">🔴 Not Connected — check FIREBASE_SERVICE_ACCOUNT secret</span>`;

  const apiBase = process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}:5000`
    : "http://localhost:5000";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UMOVE ANNABA — Admin Portal</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f4f8; color: #1a202c; min-height: 100vh; }
    header { background: linear-gradient(135deg, #042770 0%, #0A3D8F 60%, #F47A20 100%); color: #fff; padding: 28px 32px; display: flex; align-items: center; gap: 16px; }
    header h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.5px; }
    header .sub { font-size: 0.85rem; opacity: 0.8; margin-top: 2px; }
    .logo { font-size: 2rem; }
    main { max-width: 900px; margin: 32px auto; padding: 0 20px; display: grid; gap: 20px; }
    .card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    .card h2 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.8px; color: #718096; margin-bottom: 16px; font-weight: 600; }
    .row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f7fafc; gap: 12px; flex-wrap: wrap; }
    .row:last-child { border-bottom: none; }
    .label { font-size: 0.9rem; color: #4a5568; font-weight: 500; }
    .value { font-size: 0.9rem; color: #1a202c; font-family: monospace; word-break: break-all; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
    .badge.ok { background: #f0fff4; color: #276749; }
    .badge.err { background: #fff5f5; color: #c53030; }
    .endpoint { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f7fafc; flex-wrap: wrap; }
    .endpoint:last-child { border-bottom: none; }
    .method { padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; font-family: monospace; }
    .GET { background: #ebf8ff; color: #2b6cb0; }
    .POST { background: #f0fff4; color: #276749; }
    .PATCH { background: #fffaf0; color: #c05621; }
    .path { font-family: monospace; font-size: 0.85rem; color: #2d3748; flex: 1; }
    .desc { font-size: 0.8rem; color: #718096; }
    .test-btn { text-decoration: none; background: #0A3D8F; color: #fff; padding: 4px 12px; border-radius: 8px; font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
    .test-btn:hover { background: #042770; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 600px) { .grid2 { grid-template-columns: 1fr; } }
    .info-box { background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 12px; padding: 16px 20px; font-size: 0.85rem; color: #2c5282; line-height: 1.6; }
    .info-box strong { display: block; margin-bottom: 6px; font-size: 0.9rem; }
    time { font-size: 0.78rem; color: #a0aec0; }
  </style>
</head>
<body>
  <header>
    <div class="logo">🚛</div>
    <div>
      <h1>UMOVE ANNABA — Admin Portal</h1>
      <div class="sub">Server Dashboard &nbsp;·&nbsp; <time id="ts"></time></div>
    </div>
  </header>

  <main>
    <!-- Status -->
    <div class="card">
      <h2>Server Status</h2>
      <div class="row">
        <span class="label">API Server</span>
        <span class="badge ok">🟢 Running on port 5000</span>
      </div>
      <div class="row">
        <span class="label">Firebase Admin SDK</span>
        ${fbStatus}
      </div>
      <div class="row">
        <span class="label">Server Time</span>
        <span class="value" id="stime">${new Date().toISOString()}</span>
      </div>
      <div class="row">
        <span class="label">Environment</span>
        <span class="value">${process.env.NODE_ENV ?? "development"}</span>
      </div>
    </div>

    <!-- API Endpoints -->
    <div class="card">
      <h2>API Endpoints</h2>

      <div class="endpoint">
        <span class="method GET">GET</span>
        <span class="path">/api/health</span>
        <span class="desc">Server health check</span>
        <a class="test-btn" href="${apiBase}/api/health" target="_blank">Test ↗</a>
      </div>

      <div class="endpoint">
        <span class="method GET">GET</span>
        <span class="path">/api/deliveries</span>
        <span class="desc">Partner: list searching orders (requires x-api-key + x-driver-id)</span>
      </div>

      <div class="endpoint">
        <span class="method POST">POST</span>
        <span class="path">/api/deliveries</span>
        <span class="desc">Create new order (client-facing)</span>
      </div>

      <div class="endpoint">
        <span class="method PATCH">PATCH</span>
        <span class="path">/api/deliveries/:id</span>
        <span class="desc">Advance order status (partner only)</span>
      </div>

      <div class="endpoint">
        <span class="method POST">POST</span>
        <span class="path">/api/deliveries/:id/cancel</span>
        <span class="desc">Customer cancellation (Bearer token)</span>
      </div>
    </div>

    <div class="grid2">
      <!-- Config -->
      <div class="card">
        <h2>Configuration</h2>
        <div class="row">
          <span class="label">Project ID</span>
          <span class="value">${process.env.FIREBASE_PROJECT_ID ?? "—"}</span>
        </div>
        <div class="row">
          <span class="label">Partner API Key</span>
          <span class="value">${process.env.PARTNER_API_KEY ? process.env.PARTNER_API_KEY.slice(0, 8) + "••••••••" : "⚠️ NOT SET"}</span>
        </div>
        <div class="row">
          <span class="label">Port</span>
          <span class="value">${process.env.PORT ?? "5000"}</span>
        </div>
      </div>

      <!-- Mobile App -->
      <div class="card">
        <h2>Mobile App Admin</h2>
        <div class="info-box">
          <strong>Full admin controls are in the mobile app.</strong>
          Log in with the admin account (<code>mening25071999@gmail.com</code>) in Expo Go to access:
          <ul style="margin-top:8px;padding-left:18px;list-style:disc">
            <li>Approve / reject driver accounts</li>
            <li>View all orders in real time</li>
            <li>Manage users</li>
          </ul>
        </div>
      </div>
    </div>
  </main>

  <script>
    const ts = new Date();
    document.getElementById('ts').textContent = ts.toLocaleString();
    document.getElementById('stime').textContent = ts.toISOString();
  </script>
</body>
</html>`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), firebase: firebaseConnected });
  });

  app.use("/api/deliveries", deliveriesRouter);

  // Catch-all: any /api/* route not matched above returns JSON 404
  app.use("/api", (_req: Request, res: Response) => {
    res.status(404).json({ error: "API endpoint not found." });
  });

  // HTML Admin Portal — accessible at /admin-portal
  app.get("/admin-portal", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(buildAdminPortalHtml());
  });

  const httpServer = createServer(app);
  initWebSocketServer(httpServer);
  return httpServer;
}
