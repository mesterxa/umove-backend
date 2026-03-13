import { Router, Request, Response } from "express";
import { adminDb } from "../firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { requireApiKey, requireApprovedPartner } from "../middleware/partnerAuth";
import { haversineDistanceKm } from "../utils/haversine";
import { notifyNearbyPartners } from "../websocket";
import { CreateOrderSchema, UpdateOrderStatusSchema } from "../../shared/orderSchema";

const router = Router();
const COLLECTION = "orders";

const ACTIVE_STATUSES = ["accepted", "arrived", "in_transit"];

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
    clientId: data.clientId ?? null,
    timestamp: formatTimestamp(data.timestamp),
    updatedAt: formatTimestamp(data.updatedAt),
  };
}

async function setDriverBusy(db: FirebaseFirestore.Firestore, driverId: string, busy: boolean) {
  try {
    await db.collection("users").doc(driverId).update({ isBusy: busy });
  } catch (err) {
    console.error(`Failed to set driver ${driverId} isBusy=${busy}:`, err);
  }
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

    const orderData: Record<string, any> = {
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

    if (input.clientId) {
      orderData.clientId = input.clientId;
    }

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
router.get("/", requireApiKey, requireApprovedPartner, async (req: Request, res: Response) => {
  try {
    const driverLat = parseFloat(req.query.lat as string);
    const driverLng = parseFloat(req.query.lng as string);
    const hasCoords = !isNaN(driverLat) && !isNaN(driverLng);

    const db = getDb();

    const snapshot = await db
      .collection(COLLECTION)
      .where("status", "==", "searching")
      .get();

    let orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      const order = formatOrder(doc.id, data);

      const distanceKm =
        hasCoords &&
        data.pickupLocation?.lat != null &&
        data.pickupLocation?.lng != null
          ? haversineDistanceKm(
              driverLat,
              driverLng,
              data.pickupLocation.lat,
              data.pickupLocation.lng
            )
          : null;

      return { ...order, distanceKm };
    });

    orders.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm === null && b.distanceKm !== null) return 1;
      if (a.distanceKm !== null && b.distanceKm === null) return -1;
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tb - ta;
    });

    return res.json({ success: true, total: orders.length, orders });
  } catch (error) {
    console.error("GET /api/deliveries error:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PATCH /api/deliveries/:id — Update order status (partner-only)
router.patch("/:id", requireApiKey, requireApprovedPartner, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
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

    const orderData = doc.data()!;

    // ── Yassir Dispatch Logic: Driver Lock ──────────────────────────────────
    if (status === "accepted") {
      // Check if the driver already has an active order
      const activeOrdersSnap = await db
        .collection(COLLECTION)
        .where("driverId", "==", driverId)
        .where("status", "in", ACTIVE_STATUSES)
        .get();

      if (!activeOrdersSnap.empty) {
        return res.status(409).json({
          error: "Driver is already on an active order. Complete or wait for the current order to finish.",
        });
      }
    }

    const updatePayload: Record<string, any> = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status === "accepted") {
      updatePayload.driverId = bodyDriverId ?? driverId;
    }

    await docRef.update(updatePayload);

    // ── isBusy Sync ──────────────────────────────────────────────────────────
    if (status === "accepted") {
      await setDriverBusy(db, driverId, true);
    } else if (status === "completed" || status === "cancelled") {
      const effectiveDriverId = orderData.driverId ?? driverId;
      if (effectiveDriverId) {
        await setDriverBusy(db, effectiveDriverId, false);
      }
    }

    const updated = await docRef.get();
    return res.json({ success: true, order: formatOrder(updated.id, updated.data()!) });
  } catch (error) {
    console.error(`PATCH /api/deliveries/${req.params.id} error:`, error);
    return res.status(500).json({ error: "Failed to update order status" });
  }
});

// POST /api/deliveries/:id/cancel — Customer cancellation (requires Firebase Auth token)
router.post("/:id/cancel", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    // Verify Firebase Auth ID token from Authorization header
    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return res.status(401).json({ error: "Authorization token required." });
    }

    let decodedToken: { uid: string };
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ error: "Invalid or expired authorization token." });
    }

    const db = getDb();
    const docRef = db.collection(COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: `Order ${id} not found.` });
    }

    const orderData = docSnap.data()!;

    // Only allow cancellation if the order belongs to this customer
    if (orderData.clientId && orderData.clientId !== decodedToken.uid) {
      return res.status(403).json({ error: "You can only cancel your own orders." });
    }

    // Only allow cancellation of non-terminal orders
    if (orderData.status === "completed" || orderData.status === "cancelled") {
      return res.status(400).json({ error: `Order is already ${orderData.status}.` });
    }

    await docRef.update({
      status: "cancelled",
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Free up the assigned driver
    if (orderData.driverId) {
      await setDriverBusy(db, orderData.driverId, false);
    }

    const updated = await docRef.get();
    return res.json({ success: true, order: formatOrder(updated.id, updated.data()!) });
  } catch (error) {
    console.error(`POST /api/deliveries/${req.params.id}/cancel error:`, error);
    return res.status(500).json({ error: "Failed to cancel order." });
  }
});

export default router;
