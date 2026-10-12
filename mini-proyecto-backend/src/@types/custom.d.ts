// src/@types/custom.d.ts
export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id?: string;
        userId?: string;
        username?: string;
        email?: string;
        rights?: string[];
      };
    }
  }
}
