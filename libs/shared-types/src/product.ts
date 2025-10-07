import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().uuid(),
  merchantId: z.string().uuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  cost: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).default([]),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isDigital: z.boolean().default(false),
  weight: z.number().positive().optional(), // in grams
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }).optional(),
  variants: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    attributes: z.record(z.string()),
  })).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  cost: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).default([]),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isDigital: z.boolean().default(false),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }).optional(),
  variants: z.array(z.object({
    name: z.string(),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    attributes: z.record(z.string()),
  })).default([]),
});

export const UpdateProductSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isDigital: z.boolean().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }).optional(),
  variants: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    attributes: z.record(z.string()),
  })).optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
