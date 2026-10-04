import { Hono } from 'hono'
import { createPaymentLinkRoutes } from './routes/payment-links.js'
import type { PaymentLinkRepository } from './repositories/payment-link-repository.js'

// The repository is injected so the server, tests and (later) Prisma can each provide their own
export function createApp(repository: PaymentLinkRepository) {
  const app = new Hono()

  app.get('/health', (c) => {
    return c.json({ status: 'ok' })
  })

  app.route('/payment-links', createPaymentLinkRoutes(repository))

  return app
}
