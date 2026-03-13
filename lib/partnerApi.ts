import Constants from "expo-constants";

export interface ApiGeoPoint {
  address: string;
  lat: number;
  lng: number;
}

export interface ApiOrder {
  orderId: string;
  clientName: string;
  clientPhone: string;
  pickupLocation: ApiGeoPoint;
  dropoffLocation: ApiGeoPoint;
  estimatedPrice: number;
  paymentMethod: "cash" | "card" | "mobile_payment";
  status: "searching" | "accepted" | "arrived" | "in_transit" | "completed";
  driverId: string | null;
  timestamp: string | null;
  distanceKm: number | null;
}

function getBaseUrl(): string {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl) return apiUrl.replace(/\/$/, "");

  const domain =
    process.env.EXPO_PUBLIC_DOMAIN ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_DOMAIN ||
    "localhost:5000";

  if (domain.startsWith("http")) return domain.replace(/\/$/, "");
  const cleanDomain = domain.replace(/:\d+$/, "");
  return `https://${cleanDomain}`;
}

function getApiKey(): string {
  return (
    process.env.EXPO_PUBLIC_PARTNER_API_KEY ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_PARTNER_API_KEY ||
    ""
  );
}

export async function fetchAvailableOrders(
  driverId: string,
  lat?: number,
  lng?: number
): Promise<ApiOrder[]> {
  const base = getBaseUrl();
  const apiKey = getApiKey();

  const params = new URLSearchParams();
  if (lat != null && lng != null) {
    params.set("lat", String(lat));
    params.set("lng", String(lng));
  }

  const url = `${base}/api/deliveries${params.toString() ? `?${params}` : ""}`;

  const res = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
      "x-driver-id": driverId,
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();

  let body: any = {};
  try {
    body = JSON.parse(text);
  } catch {
    // Server returned non-JSON (HTML error page, etc.)
    throw Object.assign(
      new Error(
        `Server returned non-JSON response (HTTP ${res.status}). ` +
          `Check the API URL: ${url}`
      ),
      { status: res.status }
    );
  }

  if (!res.ok) {
    throw Object.assign(new Error(body.error || `HTTP ${res.status}`), {
      status: res.status,
    });
  }

  return (body.orders ?? []) as ApiOrder[];
}

async function patchOrder(
  orderId: string,
  driverId: string,
  payload: Record<string, unknown>
): Promise<ApiOrder> {
  const base = getBaseUrl();
  const apiKey = getApiKey();
  const url = `${base}/api/deliveries/${orderId}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "x-api-key": apiKey,
      "x-driver-id": driverId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let body: any = {};
  try {
    body = JSON.parse(text);
  } catch {
    throw Object.assign(
      new Error(
        `Server returned non-JSON response (HTTP ${res.status}). URL: ${url}`
      ),
      { status: res.status }
    );
  }

  if (!res.ok) {
    throw Object.assign(new Error(body.error || `HTTP ${res.status}`), {
      status: res.status,
    });
  }

  return body.order as ApiOrder;
}

export async function acceptOrder(
  orderId: string,
  driverId: string
): Promise<ApiOrder> {
  return patchOrder(orderId, driverId, { status: "accepted", driverId });
}

export async function updateOrderStatus(
  orderId: string,
  driverId: string,
  status: "arrived" | "in_transit" | "completed"
): Promise<ApiOrder> {
  return patchOrder(orderId, driverId, { status });
}
