import { z } from 'zod';

// Shared Error Response
export const ErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
});

// Common API Response Wrapper
export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: ErrorResponseSchema.optional(),
  });
}

// User Schema
export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'LOCKED']),
  version: z.number(),
  created_at: z.string(),
  role: z.string(),
  is_backup: z.number(),
  requested_by: z.string(),
  company_id: z.string(),
  company_name: z.string().optional(),
  sanctions_status: z.enum(['CLEARED', 'FLAGGED', 'BLOCKED']).default('CLEARED'),
});

// Claim Submission Schema (for Phase 5 additions)
export const ClaimSubmitSchema = z.object({
  projectId: z.string().min(1),
  companyId: z.string().min(1),
  documents: z.array(z.any()), // Can be refined later
  // We'll add ICV and VO fields here as we implement them
});

// Export inferred types
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type UserData = z.infer<typeof UserSchema>;
