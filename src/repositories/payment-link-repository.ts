import type { CreatePaymentLinkInputSchema } from '../schemas/payment-link.js'

export type PaymentLinkStatus = 'pending' | 'paid' | 'expired' | 'cancelled'

export type PaymentLink = CreatePaymentLinkInputSchema & {
  id: string
  status: PaymentLinkStatus
  createdAt: Date
}

// Define the interface for the PaymentLinkRepository
// This interface outlines the methods that any implementation of the repository must provide
export interface PaymentLinkRepository {
  create(input: CreatePaymentLinkInputSchema): Promise<PaymentLink>
  findById(id: string): Promise<PaymentLink | null>
}


// Implement an in-memory version of the PaymentLinkRepository
export class InMemoryPaymentLinkRepository implements PaymentLinkRepository {
  private readonly links = new Map<string, PaymentLink>()

  async create(input: CreatePaymentLinkInputSchema): Promise<PaymentLink> {
    const link: PaymentLink = {
      ...input,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
    }
    this.links.set(link.id, link)
    return link
  }

  async findById(id: string): Promise<PaymentLink | null> {
    return this.links.get(id) ?? null
  }
}