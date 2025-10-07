import { z } from 'zod';

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  entityType: z.string(),
  entityId: z.string().uuid(),
  action: z.string(),
  userId: z.string().uuid().optional(),
  userRole: z.string().optional(),
  changes: z.record(z.any()).optional(),
  metadata: z.record(z.any()).default({}),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.date(),
});

export const CreateAuditLogSchema = z.object({
  entityType: z.string(),
  entityId: z.string().uuid(),
  action: z.string(),
  userId: z.string().uuid().optional(),
  userRole: z.string().optional(),
  changes: z.record(z.any()).optional(),
  metadata: z.record(z.any()).default({}),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;
export type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>;
