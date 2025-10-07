import { z } from 'zod';
import { PaymentStatus, PaymentMethod } from './common';

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  provider: z.string(), // 'payfast', 'yoco', 'snapscan', etc.
  providerTransactionId: z.string().optional(),
  amount: z.number().positive(),
  currency: z.literal('ZAR').default('ZAR'),
  method: z.nativeEnum(PaymentMethod),
  status: z.nativeEnum(PaymentStatus),
  isReconciled: z.boolean().default(false),
  paymentUrl: z.string().url().optional(),
  qrCode: z.string().optional(),
  reference: z.string().optional(),
  metadata: z.record(z.any()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
  processedAt: z.date().optional(),
  failedAt: z.date().optional(),
  refundedAt: z.date().optional(),
});

export const CreatePaymentSchema = z.object({
  orderId: z.string().uuid(),
  provider: z.string(),
  amount: z.number().positive(),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().optional(),
  metadata: z.record(z.any()).default({}),
});

export const PaymentWebhookSchema = z.object({
  provider: z.string(),
  transactionId: z.string(),
  status: z.nativeEnum(PaymentStatus),
  amount: z.number().positive(),
  currency: z.string(),
  reference: z.string().optional(),
  metadata: z.record(z.any()).default({}),
  signature: z.string().optional(),
  timestamp: z.string(),
});

export const RefundSchema = z.object({
  id: z.string().uuid(),
  paymentId: z.string().uuid(),
  amount: z.number().positive(),
  reason: z.string().min(1),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  reference: z.string().optional(),
  createdAt: z.date(),
  processedAt: z.date().optional(),
});

export const CreateRefundSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().positive(),
  reason: z.string().min(1),
});

export const PaymentReconciliationSchema = z.object({
  id: z.string().uuid(),
  paymentId: z.string().uuid(),
  providerTransactionId: z.string(),
  amount: z.number().positive(),
  status: z.enum(['matched', 'unmatched', 'discrepancy']),
  discrepancy: z.number().optional(),
  notes: z.string().optional(),
  reconciledAt: z.date(),
  reconciledBy: z.string().uuid(),
});

export type Payment = z.infer<typeof PaymentSchema>;
export type CreatePayment = z.infer<typeof CreatePaymentSchema>;
export type PaymentWebhook = z.infer<typeof PaymentWebhookSchema>;
export type Refund = z.infer<typeof RefundSchema>;
export type CreateRefund = z.infer<typeof CreateRefundSchema>;
export type PaymentReconciliation = z.infer<typeof PaymentReconciliationSchema>;
