import { z } from 'zod';
import { PaginationSchema, ApiResponse } from './common';

// Auth API types
export const LoginRequestSchema = z.object({
  phone: z.string(),
  password: z.string().min(6),
});

export const RegisterRequestSchema = z.object({
  name: z.string().min(1),
  phone: z.string(),
  password: z.string().min(6),
  businessName: z.string().min(1),
  businessType: z.string().min(1),
});

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    phone: z.string(),
    role: z.string(),
    kycStatus: z.string(),
  }),
  merchant: z.object({
    id: z.string().uuid(),
    businessName: z.string(),
    isVerified: z.boolean(),
  }).optional(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

// Product API types
export const ProductListQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  isActive: z.boolean().optional(),
}).merge(PaginationSchema);

export const ProductListResponseSchema = z.object({
  products: z.array(z.any()), // Product type from product.ts
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// Order API types
export const OrderListQuerySchema = z.object({
  status: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  customerPhone: z.string().optional(),
}).merge(PaginationSchema);

export const OrderListResponseSchema = z.object({
  orders: z.array(z.any()), // Order type from order.ts
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// Payment API types
export const PaymentListQuerySchema = z.object({
  status: z.string().optional(),
  method: z.string().optional(),
  provider: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
}).merge(PaginationSchema);

export const PaymentListResponseSchema = z.object({
  payments: z.array(z.any()), // Payment type from payment.ts
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// Webhook types
export const WebhookEventSchema = z.object({
  event: z.string(),
  timestamp: z.string(),
  data: z.record(z.any()),
  signature: z.string().optional(),
});

// File upload types
export const FileUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(['product_image', 'document', 'invoice']),
  metadata: z.record(z.any()).default({}),
});

export const FileUploadResponseSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
  size: z.number(),
  mimeType: z.string(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type ProductListQuery = z.infer<typeof ProductListQuerySchema>;
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
export type OrderListQuery = z.infer<typeof OrderListQuerySchema>;
export type OrderListResponse = z.infer<typeof OrderListResponseSchema>;
export type PaymentListQuery = z.infer<typeof PaymentListQuerySchema>;
export type PaymentListResponse = z.infer<typeof PaymentListResponseSchema>;
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;
