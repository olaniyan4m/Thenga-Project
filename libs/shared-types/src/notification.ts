import { z } from 'zod';
import { NotificationChannel, PhoneNumberSchema, EmailSchema } from './common';

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  targetUser: z.string().uuid(),
  channel: z.nativeEnum(NotificationChannel),
  type: z.string(),
  title: z.string().optional(),
  message: z.string(),
  payload: z.record(z.any()).default({}),
  status: z.enum(['pending', 'sent', 'delivered', 'failed']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  scheduledAt: z.date().optional(),
  sentAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  failedAt: z.date().optional(),
  retryCount: z.number().int().min(0).default(0),
  maxRetries: z.number().int().min(0).default(3),
  error: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateNotificationSchema = z.object({
  targetUser: z.string().uuid(),
  channel: z.nativeEnum(NotificationChannel),
  type: z.string(),
  title: z.string().optional(),
  message: z.string(),
  payload: z.record(z.any()).default({}),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  scheduledAt: z.date().optional(),
});

export const WhatsAppTemplateSchema = z.object({
  name: z.string(),
  language: z.string().default('en'),
  category: z.enum(['AUTHENTICATION', 'MARKETING', 'UTILITY']),
  components: z.array(z.object({
    type: z.enum(['HEADER', 'BODY', 'FOOTER', 'BUTTONS']),
    text: z.string().optional(),
    buttons: z.array(z.object({
      type: z.enum(['QUICK_REPLY', 'URL', 'PHONE_NUMBER']),
      text: z.string(),
      url: z.string().optional(),
      phone_number: z.string().optional(),
    })).optional(),
  })),
});

export const WhatsAppMessageSchema = z.object({
  to: PhoneNumberSchema,
  template: z.string(),
  language: z.string().default('en'),
  parameters: z.array(z.string()).default([]),
});

export const SMSSchema = z.object({
  to: PhoneNumberSchema,
  message: z.string(),
  sender: z.string().optional(),
});

export const EmailSchema = z.object({
  to: EmailSchema,
  subject: z.string(),
  html: z.string().optional(),
  text: z.string().optional(),
  from: z.string().optional(),
});

export const PushNotificationSchema = z.object({
  to: z.string(), // FCM token
  title: z.string(),
  body: z.string(),
  data: z.record(z.any()).default({}),
  image: z.string().url().optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;
export type CreateNotification = z.infer<typeof CreateNotificationSchema>;
export type WhatsAppTemplate = z.infer<typeof WhatsAppTemplateSchema>;
export type WhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;
export type SMS = z.infer<typeof SMSSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type PushNotification = z.infer<typeof PushNotificationSchema>;
