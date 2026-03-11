import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCheckoutDto } from './billing.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createCheckoutSession(userId: string, dto: CreateCheckoutDto) {
    await this.verifyOrgMembership(userId, dto.orgId);

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      this.logger.warn('STRIPE_SECRET_KEY not set — returning stub checkout session');
      return { url: '/billing/stub-checkout' };
    }

    // When Stripe is configured, use the Stripe SDK here:
    // const stripe = new Stripe(stripeKey);
    // const org = await this.prisma.org.findUniqueOrThrow({ where: { id: dto.orgId } });
    // const session = await stripe.checkout.sessions.create({
    //   customer: org.stripeCustomerId || undefined,
    //   mode: 'subscription',
    //   line_items: [{ price: dto.priceId, quantity: 1 }],
    //   success_url: dto.successUrl,
    //   cancel_url: dto.cancelUrl,
    //   metadata: { orgId: dto.orgId },
    // });
    // return { url: session.url };

    this.logger.log(`Stripe checkout session would be created for org ${dto.orgId}`);
    return { url: '/billing/stub-checkout' };
  }

  async getSubscription(orgId: string) {
    const org = await this.prisma.org.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        plan: true,
        stripeCustomerId: true,
        stripeSubId: true,
      },
    });

    if (!org) {
      throw new NotFoundException(`Org ${orgId} not found`);
    }

    return {
      orgId: org.id,
      plan: org.plan,
      stripeCustomerId: org.stripeCustomerId,
      stripeSubId: org.stripeSubId,
    };
  }

  async handleWebhookEvent(payload: string, signature: string) {
    this.logger.log(`Received Stripe webhook (signature: ${signature ? 'present' : 'missing'})`);

    let event: { type: string; data?: { object?: Record<string, unknown> } };
    try {
      event = JSON.parse(payload);
    } catch {
      this.logger.error('Failed to parse webhook payload');
      throw new Error('Invalid webhook payload');
    }

    const eventType = event.type;
    this.logger.log(`Processing Stripe event: ${eventType}`);

    switch (eventType) {
      case 'customer.subscription.created': {
        this.logger.log('Subscription created event received');
        // When Stripe is live: update org with stripeSubId and plan
        break;
      }
      case 'customer.subscription.updated': {
        this.logger.log('Subscription updated event received');
        // When Stripe is live: update org plan based on subscription status
        break;
      }
      case 'customer.subscription.deleted': {
        this.logger.log('Subscription deleted event received');
        // When Stripe is live: downgrade org plan to "free"
        break;
      }
      case 'invoice.paid': {
        this.logger.log('Invoice paid event received');
        // When Stripe is live: confirm payment and log
        break;
      }
      case 'invoice.payment_failed': {
        this.logger.log('Invoice payment failed event received');
        // When Stripe is live: flag org for payment issues
        break;
      }
      default: {
        this.logger.log(`Unhandled Stripe event type: ${eventType}`);
      }
    }

    return { received: true, type: eventType };
  }

  async getUsageSummary(orgId: string) {
    const org = await this.prisma.org.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException(`Org ${orgId} not found`);
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const submissionCount = await this.prisma.formSubmission.count({
      where: {
        form: { orgId },
        createdAt: { gte: monthStart },
      },
    });

    const validationMeters = await this.prisma.validationMeter.findMany({
      where: {
        orgId,
        month: currentMonth,
      },
    });

    const validationCounts: Record<string, number> = {};
    for (const meter of validationMeters) {
      validationCounts[meter.verificationType] = meter.count;
    }

    return {
      orgId,
      month: currentMonth,
      submissions: submissionCount,
      validations: validationCounts,
    };
  }

  async cancelSubscription(userId: string, orgId: string) {
    await this.verifyOrgMembership(userId, orgId);

    const org = await this.prisma.org.findUnique({
      where: { id: orgId },
      select: { stripeSubId: true },
    });

    if (!org) {
      throw new NotFoundException(`Org ${orgId} not found`);
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey || !org.stripeSubId) {
      this.logger.warn('STRIPE_SECRET_KEY not set or no subscription — returning stub cancel');
      return { cancelled: true, stub: true };
    }

    // When Stripe is configured:
    // const stripe = new Stripe(stripeKey);
    // await stripe.subscriptions.cancel(org.stripeSubId);

    this.logger.log(`Stripe subscription ${org.stripeSubId} would be cancelled for org ${orgId}`);
    return { cancelled: true, stub: true };
  }

  private async verifyOrgMembership(userId: string, orgId: string) {
    const membership = await this.prisma.orgMembership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    return membership;
  }
}
