import { z } from 'zod'

// Define the schema for creating a payment link
// zod is a TypeScript-first schema declaration and validation library
// The schema ensures that the data conforms to the expected structure and types

export const createPaymentLinkSchema = z.object({
  amount: z.int().positive().max(1000000), // amount must be a positive integer
  currency: z.enum(['USD', 'MXN', 'COP','PEN','EUR','GBP']), // currency must be one of the specified values
  description: z.string().trim().min(1).max(140).optional(), // description is optional and must be a string with a max length of 140
  expiresAt: z.iso
  .datetime()
  .refine((value) => Date.parse(value) > Date.now(), {
    error: 'Expiration date must be in the future',
  })
  .optional(),
})

export type CreatePaymentLinkInput = z.infer<typeof createPaymentLinkSchema>