import { z } from 'zod';

// Common enums
export enum UserRole {
  MERCHANT = 'merchant',
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  EFT = 'eft',
  QR = 'qr',
  CASH = 'cash',
  WALLET = 'wallet',
}

export enum NotificationChannel {
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push',
}

export enum KYCStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  REQUIRES_REVIEW = 'requires_review',
}

// Common schemas
export const PhoneNumberSchema = z.string().regex(/^\+27[0-9]{9}$/, 'Invalid South African phone number');
export const EmailSchema = z.string().email();
export const IDNumberSchema = z.string().regex(/^[0-9]{13}$/, 'Invalid South African ID number');

// Common types
export type PhoneNumber = z.infer<typeof PhoneNumberSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type IDNumber = z.infer<typeof IDNumberSchema>;

// Address type
export const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  province: z.string(),
  postalCode: z.string().regex(/^[0-9]{4}$/, 'Invalid South African postal code'),
  country: z.literal('ZA'),
});

export type Address = z.infer<typeof AddressSchema>;

// Bank details
export const BankDetailsSchema = z.object({
  bankName: z.string(),
  accountNumber: z.string(),
  branchCode: z.string(),
  accountType: z.enum(['cheque', 'savings', 'business']),
});

export type BankDetails = z.infer<typeof BankDetailsSchema>;

// Pagination
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Webhook payload
export interface WebhookPayload<T = any> {
  event: string;
  timestamp: string;
  data: T;
  signature?: string;
}
