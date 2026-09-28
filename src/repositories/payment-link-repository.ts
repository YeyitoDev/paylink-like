import type { CreatePaymentLinkInput } from '../schemas/payment-link.js'

export type PaymentLinkStatus = 'pending' | 'paid' | 'expired' | 'cancelled'

export type PaymentLink = CreatePaymentLinkInput & {
  id: string
  status: PaymentLinkStatus
  createdAt: Date
}

export interface PaymentLinkRepository {
  create(input: CreatePaymentLinkInput): Promise<PaymentLink>
  findById(id: string): Promise<PaymentLink | null>
}

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
    return link
  }

  async findById(id: string): Promise<PaymentLink | null> {
    return this.links.get(id) ?? null
  }
}