import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { Server } from "node:http";
import { adminDb } from "./firebase-admin";
import { haversineDistanceKm } from "./utils/haversine";

const NOTIFY_RADIUS_KM = 10;

interface PartnerConnection {
  ws: WebSocket;
  driverId: string;
  lat: number;
  lng: number;
}

const connectedPartners = new Map<string, PartnerConnection>();

export function initWebSocketServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/partners" });

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    const driverId = url.searchParams.get("driverId");
    const lat = parseFloat(url.searchParams.get("lat") ?? "");
    const lng = parseFloat(url.searchParams.get("lng") ?? "");

    if (!driverId || isNaN(lat) || isNaN(lng)) {
      ws.close(4000, "Missing or invalid driverId, lat, or lng query parameters.");
      return;
    }

    try {
      if (!adminDb) {
        ws.close(4001, "Server error: Firestore not available.");
        return;
      }

      const userDoc = await adminDb.collection("users").doc(driverId).get();

      if (!userDoc.exists || userDoc.data()?.role !== "partner" || userDoc.data()?.isApproved !== true) {
        ws.close(4003, "Forbidden: not an approved partner.");
        return;
      }
    } catch (err) {
      console.error("[WS] Failed to verify partner:", err);
      ws.close(4002, "Server error during partner verification.");
      return;
    }

    connectedPartners.set(driverId, { ws, driverId, lat, lng });
    console.log(`[WS] Partner connected: ${driverId} at (${lat}, ${lng}). Total: ${connectedPartners.size}`);

    ws.send(JSON.stringify({ type: "connected", message: "You are now receiving live order updates." }));

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "location_update" && typeof msg.lat === "number" && typeof msg.lng === "number") {
          const partner = connectedPartners.get(driverId);
          if (partner) {
            partner.lat = msg.lat;
            partner.lng = msg.lng;
          }
        }
      } catch {
      }
    });

    ws.on("close", () => {
      connectedPartners.delete(driverId);
      console.log(`[WS] Partner disconnected: ${driverId}. Total: ${connectedPartners.size}`);
    });

    ws.on("error", (err) => {
      console.error(`[WS] Error for partner ${driverId}:`, err);
      connectedPartners.delete(driverId);
    });
  });

  console.log("[WS] WebSocket server initialized on /ws/partners");
  return wss;
}

export function notifyNearbyPartners(orderData: Record<string, unknown>, pickupLat: number, pickupLng: number): number {
  const payload = JSON.stringify({
    type: "new_order",
    order: orderData,
  });

  let notified = 0;

  for (const [, partner] of connectedPartners) {
    const distKm = haversineDistanceKm(partner.lat, partner.lng, pickupLat, pickupLng);

    if (distKm <= NOTIFY_RADIUS_KM && partner.ws.readyState === WebSocket.OPEN) {
      partner.ws.send(payload);
      notified++;
    }
  }

  console.log(`[WS] Notified ${notified} partner(s) within ${NOTIFY_RADIUS_KM}km of new order.`);
  return notified;
}
