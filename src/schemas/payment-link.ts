import { z } from 'zod'

// Define the schema for creating a payment link
// zod is a TypeScript-first schema declaration and validation library
// The schema ensures that the data conforms to the expected structure and types

const createPaymentLinkSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['USD', 'MXN', 'COP']).default('MXN'),
  description: z.string().max(140).optional(),
  expiresAt: z.date().refine((date) => date > new Date(), {
    message: 'Expiration date must be in the future',
  }),
})
 
export type CreatePaymentLinkInput = z.infer<typeof createPaymentLinkSchema>