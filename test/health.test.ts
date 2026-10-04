import { expect, test } from 'vitest'

import { createApp } from '../src/app.js'
import { InMemoryPaymentLinkRepository } from '../src/repositories/payment-link-repository.js'

const app = createApp(new InMemoryPaymentLinkRepository())

test('GET /health', async () => {
  const request = new Request('http://localhost/health')
  const response = await app.fetch(request)
  const data = await response.json()
  const header = response.headers.get('content-type')

  expect(response.status).toBe(200)
  expect(data).toEqual({ status: 'ok' })
  expect(header).toBe('application/json')
})


test('GET Unknown routes', async () => {
  const request = new Request('http://localhost/no-route')
  const response = await app.fetch(request)


  expect(response.status).toBe(404)

})