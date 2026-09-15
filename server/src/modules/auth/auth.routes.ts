import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from './auth.validation.js';

const router = Router();

// Rate limiting for auth endpoints (brute-force defense)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 30, // limit each IP to 30 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

router.post(
  '/login',
  authLimiter,
  validateRequest({ body: loginSchema }),
  AuthController.login
);

router.post(
  '/send-otp',
  authLimiter,
  validateRequest({ body: sendOtpSchema }),
  AuthController.sendOtp
);

router.post(
  '/verify-otp',
  authLimiter,
  validateRequest({ body: verifyOtpSchema }),
  AuthController.verifyOtp
);

router.post(
  '/refresh-token',
  validateRequest({ body: refreshTokenSchema }),
  AuthController.refreshToken
);

router.post('/logout', AuthController.logout);

router.get('/me', authenticate, AuthController.me);

router.post(
  '/change-password',
  authenticate,
  validateRequest({ body: changePasswordSchema }),
  AuthController.changePassword
);

export const authRoutes = router;
