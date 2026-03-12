import { Router, Request, Response } from "express";
import { adminDb } from "../firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { requireApiKey, requireApprovedPartner } from "../middleware/partnerAuth";
import { haversineDistanceKm } from "../utils/haversine";
import { notifyNearbyPartners } from "../websocket";
import { CreateOrderSchema, UpdateOrderStatusSchema } from "../../shared/orderSchema";

const router = Router();
const COLLECTION = "orders";

function getDb() {
  if (!adminDb) throw new Error("Firestore is not initialized. Check Firebase credentials.");
  return adminDb;
}

function formatTimestamp(ts: any): string | null {
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate().toISOString();
  return ts;
}

function formatOrder(docId: string, data: FirebaseFirestore.DocumentData) {
  return {
    orderId: docId,
    clientName: data.clientName,
    clientPhone: data.clientPhone,
    pickupLocation: data.pickupLocation,
    dropoffLocation: data.dropoffLocation,
    estimatedPrice: data.estimatedPrice,
    paymentMethod: data.paymentMethod,
    status: data.status,
    driverId: data.driverId ?? null,
    timestamp: formatTimestamp(data.timestamp),
    updatedAt: formatTimestamp(data.updatedAt),
  };
}

// POST /api/deliveries — Create a new order (client-facing, no auth required)
router.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = CreateOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }

    const input = parsed.data;
    const db = getDb();

    const orderData = {
      clientName: input.clientName.trim(),
      clientPhone: input.clientPhone.trim(),
      pickupLocation: input.pickupLocation,
      dropoffLocation: input.dropoffLocation,
      estimatedPrice: input.estimatedPrice,
      paymentMethod: input.paymentMethod,
      status: "searching",
      driverId: null,
      timestamp: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTION).add(orderData);

    const responseOrder = {
      orderId: docRef.id,
      ...orderData,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    notifyNearbyPartners(responseOrder, input.pickupLocation.lat, input.pickupLocation.lng);

    return res.status(201).json({ success: true, order: responseOrder });
  } catch (error) {
    console.error("POST /api/deliveries error:", error);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

// GET /api/deliveries — Partner-only: returns searching orders sorted by proximity
// Headers required:
//   x-api-key     — server-side partner API key
//   x-driver-id   — driver's Firebase UID (verified against Firestore)
// Query params:
//   lat, lng      — driver's current coordinates for proximity sorting
router.get("/", requireApiKey, requireApprovedPartner, async (req: Request, res: Response) => {
  try {
    const driverLat = parseFloat(req.query.lat as string);
    const driverLng = parseFloat(req.query.lng as string);
    const hasCoords = !isNaN(driverLat) && !isNaN(driverLng);

    const db = getDb();

    const snapshot = await db
      .collection(COLLECTION)
      .where("status", "==", "searching")
      .orderBy("timestamp", "desc")
      .get();

    let orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      const order = formatOrder(doc.id, data);

      const distanceKm = hasCoords && data.pickupLocation?.lat != null && data.pickupLocation?.lng != null
        ? haversineDistanceKm(driverLat, driverLng, data.pickupLocation.lat, data.pickupLocation.lng)
        : null;

      return { ...order, distanceKm };
    });

    if (hasCoords) {
      orders.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return res.json({ success: true, total: orders.length, orders });
  } catch (error) {
    console.error("GET /api/deliveries error:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PATCH /api/deliveries/:id — Update order status (partner-only)
// Supports full state machine: searching → accepted → arrived → in_transit → completed
router.patch("/:id", requireApiKey, requireApprovedPartner, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = UpdateOrderStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }

    const { status, driverId: bodyDriverId } = parsed.data;
    const driverId = (req as any).driverId as string;

    const db = getDb();
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: `Order ${id} not found` });
    }

    const updatePayload: Record<string, any> = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status === "accepted") {
      updatePayload.driverId = bodyDriverId ?? driverId;
    }

    await docRef.update(updatePayload);

    const updated = await docRef.get();
    return res.json({ success: true, order: formatOrder(updated.id, updated.data()!) });
  } catch (error) {
    console.error(`PATCH /api/deliveries/${req.params.id} error:`, error);
    return res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;
