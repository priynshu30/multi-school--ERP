import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const sendOtpSchema = z.object({
  identifier: z.string().min(3, 'Email or phone number is required'),
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(3, 'Email or phone number is required'),
  otp: z.string().min(4, 'OTP must be at least 4 characters').max(8),
});
