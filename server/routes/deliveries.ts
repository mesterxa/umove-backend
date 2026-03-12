import { Router, Request, Response } from "express";
import { adminDb } from "../firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const router = Router();

// التعديل الأساسي: التوافق مع اسم المجموعة في Firestore لديك
const COLLECTION = "orders";

type DeliveryStatus = "pending" | "in-transit" | "delivered" | "cancelled";

interface CreateDeliveryBody {
  customerName: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
}

interface UpdateStatusBody {
  status: DeliveryStatus;
}

function getDb() {
  if (!adminDb) {
    throw new Error("Firestore is not initialized. Check Firebase credentials.");
  }
  return adminDb;
}

// 1. إضافة طلب جديد (POST)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { customerName, phone, pickupLocation, dropoffLocation } =
      req.body as CreateDeliveryBody;

    if (!customerName || !phone || !pickupLocation || !dropoffLocation) {
      return res.status(400).json({
        error: "Missing required fields: customerName, phone, pickupLocation, dropoffLocation",
      });
    }

    const db = getDb();

    const delivery = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      pickupLocation: pickupLocation.trim(),
      dropoffLocation: dropoffLocation.trim(),
      status: "pending" as DeliveryStatus,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTION).add(delivery);

    return res.status(201).json({
      id: docRef.id,
      ...delivery,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("POST /api/deliveries error:", error);
    return res.status(500).json({ error: "Failed to create order request" });
  }
});

// 2. جلب جميع الطلبات (GET)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const db = getDb();

    // تم إزالة الفلتر لضمان جلب البيانات الحالية من مجموعة orders
    const snapshot = await db
      .collection(COLLECTION)
      .orderBy("createdAt", "desc")
      .get();

    const deliveries = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return res.json({ 
      success: true,
      deliveries, 
      total: deliveries.length 
    });
  } catch (error) {
    console.error("GET /api/deliveries error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch orders from Firestore" });
  }
});

// 3. تحديث حالة الطلب (PATCH)
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as UpdateStatusBody;

    const validStatuses: DeliveryStatus[] = [
      "pending",
      "in-transit",
      "delivered",
      "cancelled",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const db = getDb();
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: `Order ${id} not found` });
    }

    await docRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updated = await docRef.get();
    const data = updated.data()!;

    return res.json({
      id: updated.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
    });
  } catch (error) {
    console.error(`PATCH /api/deliveries/${req.params.id} error:`, error);
    return res
      .status(500)
      .json({ error: "Failed to update order status" });
  }
});

export default router;
