import { beforeEach, describe, expect, test } from 'vitest'
import { createApp } from '../src/app.js'
import { InMemoryPaymentLinkRepository } from '../src/repositories/payment-link-repository.js'

type App = ReturnType<typeof createApp>

const oneHourFromNow = () => new Date(Date.now() + 1000 * 60 * 60).toISOString()

const validBody = {
  amount: 1000,
  currency: 'USD',
  description: 'Test payment link',
}

function postPaymentLink(app: App, body: unknown) {
  return app.request('/payment-links', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// A fresh app (and repository) per test, so no test depends on another one's data
let app: App

beforeEach(() => {
  app = createApp(new InMemoryPaymentLinkRepository())
})

describe('POST /payment-links', () => {
  test('creates a pending link and returns 201 with its Location', async () => {
    const expiresAt = oneHourFromNow()
    const response = await postPaymentLink(app, { ...validBody, expiresAt })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(response.headers.get('content-type')).toBe('application/json')
    expect(data).toEqual({
      ...validBody,
      expiresAt,
      id: expect.any(String),
      status: 'pending',
      createdAt: expect.any(String),
    })
    expect(response.headers.get('location')).toBe(`/payment-links/${data.id}`)
  })

  test('ignores id and status sent by the client', async () => {
    const response = await postPaymentLink(app, { ...validBody, id: 'fixed-id', status: 'paid' })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).not.toBe('fixed-id')
    expect(data.status).toBe('pending')
  })

  test.each([
    { field: 'amount', value: 1000.5, rule: 'a decimal amount' },
    { field: 'amount', value: -100, rule: 'a negative amount' },
    { field: 'currency', value: 'PEX', rule: 'an unsupported currency' },
    { field: 'expiresAt', value: new Date(Date.now() - 1000 * 60).toISOString(), rule: 'an expiresAt in the past' },
  ])('returns 400 for $rule', async ({ field, value }) => {
    const response = await postPaymentLink(app, { ...validBody, [field]: value })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details).toEqual([{ path: field, message: expect.any(String) }])
  })
})

describe('GET /payment-links/:id', () => {
  test('returns the link created at the Location of the POST', async () => {
    const created = await postPaymentLink(app, validBody)
    const location = created.headers.get('location')!

    const response = await app.request(location)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(await created.json())
  })

  test('returns 404 for an id that does not exist', async () => {
    const response = await app.request(`/payment-links/${crypto.randomUUID()}`)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  test('returns 400 for an id that is not a UUID', async () => {
    const response = await app.request('/payment-links/abc')
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details).toEqual([{ path: 'id', message: expect.any(String) }])
  })
})
