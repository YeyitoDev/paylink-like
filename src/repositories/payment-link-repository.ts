import type { CreatePaymentLinkInput } from '../schemas/payment-link.js'

export type PaymentLinkStatus = 'pending' | 'paid' | 'expired' | 'cancelled'

export type PaymentLink = CreatePaymentLinkInput & {
  id: string
  status: PaymentLinkStatus
  createdAt: Date
}

// Define the interface for the PaymentLinkRepository
// This interface outlines the methods that any implementation of the repository must provide
export interface PaymentLinkRepository {
  create(input: CreatePaymentLinkInput): Promise<PaymentLink>
  findById(id: string): Promise<PaymentLink | null>
}


// Implement an in-memory version of the PaymentLinkRepository
// Returns copies so callers can't mutate stored links, the same as a real database would behave
export class InMemoryPaymentLinkRepository implements PaymentLinkRepository {
  private readonly links = new Map<string, PaymentLink>()

  async create(input: CreatePaymentLinkInput): Promise<PaymentLink> {
    const link: PaymentLink = {
      ...input,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
    }
    this.links.set(link.id, link)
    return structuredClone(link)
  }

  async findById(id: string): Promise<PaymentLink | null> {
    const link = this.links.get(id)
    return link ? structuredClone(link) : null
  }
}