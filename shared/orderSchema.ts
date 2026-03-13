import { z } from "zod";

export const GeoPointSchema = z.object({
  address: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const OrderStatusSchema = z.enum([
  "searching",
  "accepted",
  "arrived",
  "in_transit",
  "completed",
  "cancelled",
]);

export const PaymentMethodSchema = z.enum(["cash", "card", "mobile_payment"]);

export const CreateOrderSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientPhone: z.string().min(9, "Valid phone number is required"),
  pickupLocation: GeoPointSchema,
  dropoffLocation: GeoPointSchema,
  estimatedPrice: z.number().positive("Price must be positive"),
  paymentMethod: PaymentMethodSchema.default("cash"),
  clientId: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
  driverId: z.string().optional(),
});

export const CancelOrderSchema = z.object({
  clientIdToken: z.string().min(1),
});

export type GeoPoint = z.infer<typeof GeoPointSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

export interface Order {
  orderId: string;
  clientName: string;
  clientPhone: string;
  pickupLocation: GeoPoint;
  dropoffLocation: GeoPoint;
  estimatedPrice: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  driverId: string | null;
  clientId?: string | null;
  timestamp: FirebaseFirestore.Timestamp | null;
  updatedAt: FirebaseFirestore.Timestamp | null;
}
