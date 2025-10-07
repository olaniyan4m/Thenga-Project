import { z } from 'zod';
import { AddressSchema, BankDetailsSchema, PhoneNumberSchema, EmailSchema } from './common';

export const MerchantSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  businessName: z.string().min(1),
  businessType: z.string().min(1),
  address: AddressSchema,
  phone: PhoneNumberSchema,
  email: EmailSchema.optional(),
  website: z.string().url().optional(),
  bankDetails: BankDetailsSchema.optional(),
  settings: z.object({
    currency: z.literal('ZAR').default('ZAR'),
    timezone: z.string().default('Africa/Johannesburg'),
    language: z.string().default('en'),
    notifications: z.object({
      whatsapp: z.boolean().default(true),
      sms: z.boolean().default(true),
      email: z.boolean().default(false),
      push: z.boolean().default(true),
    }),
    paymentMethods: z.array(z.string()).default(['card', 'eft', 'qr']),
    autoConfirmOrders: z.boolean().default(false),
    requireCustomerDetails: z.boolean().default(true),
  }),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateMerchantSchema = z.object({
  businessName: z.string().min(1),
  businessType: z.string().min(1),
  address: AddressSchema,
  phone: PhoneNumberSchema,
  email: EmailSchema.optional(),
  website: z.string().url().optional(),
  bankDetails: BankDetailsSchema.optional(),
});

export const UpdateMerchantSchema = z.object({
  businessName: z.string().min(1).optional(),
  businessType: z.string().min(1).optional(),
  address: AddressSchema.optional(),
  phone: PhoneNumberSchema.optional(),
  email: EmailSchema.optional(),
  website: z.string().url().optional(),
  bankDetails: BankDetailsSchema.optional(),
  settings: z.object({
    currency: z.literal('ZAR').optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    notifications: z.object({
      whatsapp: z.boolean().optional(),
      sms: z.boolean().optional(),
      email: z.boolean().optional(),
      push: z.boolean().optional(),
    }).optional(),
    paymentMethods: z.array(z.string()).optional(),
    autoConfirmOrders: z.boolean().optional(),
    requireCustomerDetails: z.boolean().optional(),
  }).optional(),
});

export type Merchant = z.infer<typeof MerchantSchema>;
export type CreateMerchant = z.infer<typeof CreateMerchantSchema>;
export type UpdateMerchant = z.infer<typeof UpdateMerchantSchema>;
