import { z } from 'zod';
import { UserRole, KYCStatus, PhoneNumberSchema, EmailSchema, IDNumberSchema, AddressSchema } from './common';

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  phone: PhoneNumberSchema,
  email: EmailSchema.optional(),
  role: z.nativeEnum(UserRole),
  kycStatus: z.nativeEnum(KYCStatus),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  phone: PhoneNumberSchema,
  email: EmailSchema.optional(),
  role: z.nativeEnum(UserRole).default(UserRole.MERCHANT),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: EmailSchema.optional(),
  isActive: z.boolean().optional(),
});

export const UserKYCDataSchema = z.object({
  idNumber: IDNumberSchema,
  address: AddressSchema,
  businessName: z.string().min(1),
  businessType: z.string().min(1),
  taxNumber: z.string().optional(),
  documents: z.array(z.object({
    type: z.enum(['id_front', 'id_back', 'proof_of_address', 'business_registration']),
    url: z.string().url(),
    uploadedAt: z.date(),
  })),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserKYCData = z.infer<typeof UserKYCDataSchema>;
