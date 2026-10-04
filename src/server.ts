import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { InMemoryPaymentLinkRepository } from './repositories/payment-link-repository.js'

const app = createApp(new InMemoryPaymentLinkRepository())

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
