import { Request, Response, NextFunction } from "express";
import { adminDb } from "../firebase-admin";

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"];
  const serverKey = process.env.PARTNER_API_KEY;

  if (!serverKey) {
    console.error("PARTNER_API_KEY is not configured on the server.");
    return res.status(500).json({ error: "Server misconfiguration: API key not set." });
  }

  if (!apiKey || apiKey !== serverKey) {
    return res.status(401).json({ error: "Unauthorized: invalid or missing x-api-key header." });
  }

  next();
}

export async function requireApprovedPartner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const driverId = req.headers["x-driver-id"] as string | undefined;

  if (!driverId) {
    return res.status(400).json({ error: "Missing x-driver-id header." });
  }

  try {
    if (!adminDb) {
      return res.status(500).json({ error: "Firestore not initialized." });
    }

    const userDoc = await adminDb.collection("users").doc(driverId).get();

    if (!userDoc.exists) {
      return res.status(403).json({ error: "Driver account not found." });
    }

    const userData = userDoc.data()!;

    if (userData.role !== "partner") {
      return res.status(403).json({ error: "Access denied: account is not a partner." });
    }

    if (userData.isApproved !== true) {
      return res.status(403).json({ error: "Access denied: partner account is not yet approved." });
    }

    (req as any).driverId = driverId;
    (req as any).driverData = userData;

    next();
  } catch (err) {
    console.error("partnerAuth error:", err);
    return res.status(500).json({ error: "Failed to verify partner credentials." });
  }
}
