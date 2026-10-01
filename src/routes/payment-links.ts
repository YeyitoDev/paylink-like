import { Hono } from 'hono'
import type { Context } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import { createPaymentLinkSchema } from '../schemas/payment-link.js'
import type { PaymentLinkRepository } from '../repositories/payment-link-repository.js'

const idParamSchema = z.object({ id: z.uuid() })

// zValidator llama a esta función después de validar.
// Si devuelve una respuesta, esa se envía; si no devuelve nada, sigue al handler.
type ValidationResult =
  | { success: true }
  | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } }

const validationHook = (result: ValidationResult, c: Context) => {
  if (!result.success) {
    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request',
          details: result.error.issues.map((issue) => ({
            path: issue.path.map(String).join('.'),
            message: issue.message,
          })),
        },
      },                                                  
      400,
    )                                                 }
} 


export function createPaymentLinkRoutes(repository: PaymentLinkRepository) {
  const routes = new Hono()



    routes.post('/', zValidator('json', 
        createPaymentLinkSchema, 
        validationHook), async (c) => {
            const input = c.req.valid('json')
            // TODO 1: guarda el link con repository.create(...)   (es async)
            const link = await repository.create(input)
            // TODO 2: header Location → c.header('Location', `/payment-links/${...}`)
            c.header('Location', `/payment-links/${link.id}`)
            // TODO 3: responde el link con status 201 → c.json(..., 201)
            return c.json(link, 201)
  })

  routes.get('/:id', zValidator('param', idParamSchema, validationHook), async (c) => {
    const { id } = c.req.valid('param')
    // TODO 1: busca con repository.findById(id)
    const link = await repository.findById(id)
    // TODO 2: si es null → c.json({ error: { code: 'NOT_FOUND', message: ... } }, 404)
    if (!link) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Payment link not found' } }, 404)
    }
    // TODO 3: si existe → c.json(link)   (200 es el default)
    return c.json(link)
  })

  return routes
}
