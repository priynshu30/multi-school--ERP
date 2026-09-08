import { Role } from '../constants/roles.js';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: Role;
  schoolId?: string | null;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
      schoolId?: string; // Resolved active tenant
    }
  }
}
