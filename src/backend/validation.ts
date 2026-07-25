import { z } from 'zod';
import express from 'express';

// Strict Data-Contract Validation Layer
export const claimSubmitSchema = z.object({
  claimId: z.string().optional(),
  contractorName: z.string().optional(),
  title: z.string().min(1).optional(),
  companyId: z.string().min(1),
  wbs: z.string().regex(/^[A-Z0-9]+(\.[A-Z0-9]+)*$/, "WBS must conform to standard structural dot-notation string representation format (e.g. WAHA.DD.01)"),
  claimedValue: z.number().positive("Claimed value must be a positive float"),
  documents: z.array(z.any()).optional()
});

export const wbsNodeSchema = z.object({
  progress: z.number().min(0).max(100, "Progress percentage must be scaled precisely between 0 and 100")
});

export function validateRequest(schema: z.ZodSchema) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Context details",
            details: error.issues
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Validation processing failed"
          }
        });
      }
    }
  };
}
