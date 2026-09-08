import { z } from 'zod';

export const createSchoolSchema = z.object({
  name: z.string().min(2, 'School name must be at least 2 characters'),
  code: z.string().min(2, 'School code must be at least 2 characters').toUpperCase(),
  slug: z.string().min(2, 'School slug must be at least 2 characters').toLowerCase().regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  logo: z.string().optional(),
  email: z.string().email('Invalid school email address'),
  phone: z.string().min(7, 'Invalid phone number'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().default('India'),
  timezone: z.string().default('Asia/Kolkata'),
  currency: z.string().default('INR'),
  planId: z.enum(['starter', 'pro', 'enterprise']).default('pro'),
  settings: z.record(z.any()).optional(),
  // Initial school admin credentials (provisioned by Super Admin)
  initialAdmin: z
    .object({
      name: z.string().min(2, 'Admin name must be at least 2 characters'),
      email: z.string().email('Invalid admin email'),
      phone: z.string().optional(),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    })
    .optional(),
});

export const updateSchoolSchema = z.object({
  name: z.string().min(2).optional(),
  logo: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  planId: z.enum(['starter', 'pro', 'enterprise']).optional(),
  settings: z.record(z.any()).optional(),
  status: z.enum(['TRIAL', 'ACTIVE', 'SUSPENDED', 'ARCHIVED']).optional(),
});

export const schoolQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  status: z.enum(['TRIAL', 'ACTIVE', 'SUSPENDED', 'ARCHIVED']).optional(),
  planId: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
