import { z } from 'zod';
import { OrderStatus, PhoneNumberSchema, EmailSchema, AddressSchema } from './common';

export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  variant: z.object({
    id: z.string().uuid(),
    name: z.string(),
    attributes: z.record(z.string()),
  }).optional(),
});

export const CustomerDetailsSchema = z.object({
  name: z.string().min(1),
  phone: PhoneNumberSchema,
  email: EmailSchema.optional(),
  address: AddressSchema.optional(),
});

export const OrderSchema = z.object({
  id: z.string().uuid(),
  merchantId: z.string().uuid(),
  orderNumber: z.string(),
  customerDetails: CustomerDetailsSchema,
  items: z.array(OrderItemSchema),
  subtotal: z.number().positive(),
  tax: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  totalAmount: z.number().positive(),
  currency: z.literal('ZAR').default('ZAR'),
  status: z.nativeEnum(OrderStatus),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
  confirmedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export const CreateOrderSchema = z.object({
  customerDetails: CustomerDetailsSchema,
  items: z.array(OrderItemSchema),
  notes: z.string().optional(),
  metadata: z.record(z.any()).default({}),
});

export const UpdateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const OrderSummarySchema = z.object({
  totalOrders: z.number().int().min(0),
  totalRevenue: z.number().min(0),
  averageOrderValue: z.number().min(0),
  pendingOrders: z.number().int().min(0),
  completedOrders: z.number().int().min(0),
  cancelledOrders: z.number().int().min(0),
});

export type Order = z.infer<typeof OrderSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type CustomerDetails = z.infer<typeof CustomerDetailsSchema>;
export type OrderSummary = z.infer<typeof OrderSummarySchema>;
