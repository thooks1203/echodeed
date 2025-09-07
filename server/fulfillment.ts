import { RewardPartner, RewardOffer, RewardRedemption } from '@/shared/schema';

export interface FulfillmentProvider {
  name: string;
  processRedemption(offer: RewardOffer, partner: RewardPartner, redemption: RewardRedemption): Promise<FulfillmentResult>;
  checkRedemptionStatus(redemptionId: string, externalId: string): Promise<RedemptionStatus>;
  handleWebhook(payload: any, partner: RewardPartner): Promise<WebhookResult>;
}

export interface FulfillmentResult {
  success: boolean;
  externalId?: string;
  redemptionCode?: string;
  error?: string;
  retryAfter?: number;
}

export interface RedemptionStatus {
  status: 'pending' | 'active' | 'used' | 'expired' | 'refunded' | 'failed';
  externalId?: string;
  redemptionCode?: string;
  expiresAt?: Date;
  usedAt?: Date;
  error?: string;
}

export interface WebhookResult {
  redemptionId?: string;
  newStatus?: string;
  processed: boolean;
}

// Stripe Cashback Provider
export class StripeCashbackProvider implements FulfillmentProvider {
  name = 'stripe_cashback';

  async processRedemption(offer: RewardOffer, partner: RewardPartner, redemption: RewardRedemption): Promise<FulfillmentResult> {
    try {
      if (!partner.apiKey) {
        throw new Error('Stripe API key not configured for partner');
      }

      // Create Stripe transfer or payout for cashback
      const response = await fetch('https://api.stripe.com/v1/transfers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${partner.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: (redemption.echoSpent * 0.01).toString(), // Convert $ECHO to USD cents
          currency: 'usd',
          destination: 'acct_connected_account', // This would be user's connected account
          metadata: JSON.stringify({
            redemption_id: redemption.id,
            offer_id: offer.id,
            echo_spent: redemption.echoSpent.toString()
          })
        })
      });

      const transfer = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: transfer.error?.message || 'Stripe transfer failed',
          retryAfter: 300 // Retry after 5 minutes
        };
      }

      return {
        success: true,
        externalId: transfer.id,
        redemptionCode: `CASH-${transfer.id.slice(-8).toUpperCase()}`
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message,
        retryAfter: 600 // Retry after 10 minutes on error
      };
    }
  }

  async checkRedemptionStatus(redemptionId: string, externalId: string): Promise<RedemptionStatus> {
    // Implementation for checking Stripe transfer status
    return { status: 'active' };
  }

  async handleWebhook(payload: any, partner: RewardPartner): Promise<WebhookResult> {
    // Handle Stripe webhook events for transfer status updates
    return { processed: true };
  }
}

// Gift Card Provider (Amazon, Starbucks, etc.)
export class GiftCardProvider implements FulfillmentProvider {
  name = 'gift_card';

  async processRedemption(offer: RewardOffer, partner: RewardPartner, redemption: RewardRedemption): Promise<FulfillmentResult> {
    try {
      if (!partner.apiEndpoint || !partner.apiKey) {
        throw new Error('Gift card API configuration missing for partner');
      }

      // Generic gift card API call
      const response = await fetch(partner.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${partner.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: this.calculateGiftCardAmount(redemption.echoSpent, offer),
          currency: 'USD',
          recipient_email: 'anonymous@echodeed.com', // Anonymous delivery
          message: 'Your EchoDeed™ kindness reward!',
          metadata: {
            redemption_id: redemption.id,
            offer_id: offer.id,
            echo_spent: redemption.echoSpent
          }
        })
      });

      const giftCard = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: giftCard.error || 'Gift card creation failed',
          retryAfter: 180 // Retry after 3 minutes
        };
      }

      return {
        success: true,
        externalId: giftCard.id || giftCard.card_id,
        redemptionCode: giftCard.code || giftCard.gift_card_code
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message,
        retryAfter: 300
      };
    }
  }

  private calculateGiftCardAmount(echoSpent: number, offer: RewardOffer): number {
    // Convert $ECHO tokens to gift card value based on offer
    const baseValue = echoSpent * 0.01; // 1 $ECHO = $0.01 USD
    
    // Apply offer multiplier if any
    if (offer.offerValue.includes('%')) {
      const bonus = parseInt(offer.offerValue.replace('%', '')) / 100;
      return Math.round((baseValue * (1 + bonus)) * 100) / 100;
    }
    
    return Math.round(baseValue * 100) / 100;
  }

  async checkRedemptionStatus(redemptionId: string, externalId: string): Promise<RedemptionStatus> {
    return { status: 'active' };
  }

  async handleWebhook(payload: any, partner: RewardPartner): Promise<WebhookResult> {
    return { processed: true };
  }
}

// Discount Code Provider
export class DiscountCodeProvider implements FulfillmentProvider {
  name = 'discount_code';

  async processRedemption(offer: RewardOffer, partner: RewardPartner, redemption: RewardRedemption): Promise<FulfillmentResult> {
    try {
      if (!partner.apiEndpoint || !partner.apiKey) {
        // For partners without API, generate a static code
        const staticCode = this.generateStaticCode(offer, redemption);
        return {
          success: true,
          redemptionCode: staticCode,
          externalId: redemption.id
        };
      }

      // For partners with API integration
      const response = await fetch(partner.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${partner.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discount_type: offer.offerType,
          discount_value: offer.offerValue,
          expires_at: offer.expiresAt,
          usage_limit: 1,
          metadata: {
            redemption_id: redemption.id,
            offer_id: offer.id
          }
        })
      });

      const discountCode = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: discountCode.error || 'Discount code creation failed',
          retryAfter: 120
        };
      }

      return {
        success: true,
        externalId: discountCode.id,
        redemptionCode: discountCode.code
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message,
        retryAfter: 180
      };
    }
  }

  private generateStaticCode(offer: RewardOffer, redemption: RewardRedemption): string {
    const prefix = offer.offerValue.includes('%') ? 'PCT' : 'USD';
    const value = offer.offerValue.replace(/[^0-9]/g, '');
    const suffix = redemption.id.slice(-6).toUpperCase();
    return `${prefix}${value}-${suffix}`;
  }

  async checkRedemptionStatus(redemptionId: string, externalId: string): Promise<RedemptionStatus> {
    return { status: 'active' };
  }

  async handleWebhook(payload: any, partner: RewardPartner): Promise<WebhookResult> {
    return { processed: true };
  }
}

// Main Fulfillment Service
export class RewardFulfillmentService {
  private providers: Map<string, FulfillmentProvider> = new Map();
  private retryQueue: Array<{ redemptionId: string; retryAt: Date; attempts: number }> = [];

  constructor() {
    // Register available providers
    this.providers.set('stripe_cashback', new StripeCashbackProvider());
    this.providers.set('gift_card', new GiftCardProvider());
    this.providers.set('discount_code', new DiscountCodeProvider());
    
    // Start retry processor
    this.startRetryProcessor();
  }

  async fulfillRedemption(offer: RewardOffer, partner: RewardPartner, redemption: RewardRedemption): Promise<FulfillmentResult> {
    const providerName = this.determineProvider(offer, partner);
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      return { success: false, error: `No provider available for ${providerName}` };
    }

    try {
      const result = await provider.processRedemption(offer, partner, redemption);
      
      if (!result.success && result.retryAfter) {
        this.scheduleRetry(redemption.id, result.retryAfter);
      }
      
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private determineProvider(offer: RewardOffer, partner: RewardPartner): string {
    // Determine which provider to use based on offer type and partner configuration
    if (offer.offerType === 'cashback') {
      return 'stripe_cashback';
    } else if (['gift_card', 'freebie'].includes(offer.offerType)) {
      return 'gift_card';
    } else {
      return 'discount_code';
    }
  }

  private scheduleRetry(redemptionId: string, retryAfterSeconds: number): void {
    const existingRetry = this.retryQueue.find(r => r.redemptionId === redemptionId);
    
    if (existingRetry) {
      existingRetry.retryAt = new Date(Date.now() + (retryAfterSeconds * 1000));
      existingRetry.attempts += 1;
    } else {
      this.retryQueue.push({
        redemptionId,
        retryAt: new Date(Date.now() + (retryAfterSeconds * 1000)),
        attempts: 1
      });
    }
  }

  private startRetryProcessor(): void {
    setInterval(async () => {
      const now = new Date();
      const readyToRetry = this.retryQueue.filter(r => r.retryAt <= now && r.attempts < 5);
      
      for (const retry of readyToRetry) {
        console.log(`Processing retry for redemption ${retry.redemptionId} (attempt ${retry.attempts + 1})`);
        // This would trigger the fulfillment process again
        // Implementation depends on how you want to hook into the main system
      }
      
      // Remove completed or max attempts reached
      this.retryQueue = this.retryQueue.filter(r => r.retryAt > now && r.attempts < 5);
    }, 30000); // Check every 30 seconds
  }

  async handleWebhook(partnerName: string, payload: any, partner: RewardPartner): Promise<WebhookResult> {
    const providerName = this.determineProviderFromPartner(partner);
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      return { processed: false };
    }
    
    return await provider.handleWebhook(payload, partner);
  }

  private determineProviderFromPartner(partner: RewardPartner): string {
    // Logic to determine provider based on partner configuration
    if (partner.partnerType === 'cashback') return 'stripe_cashback';
    if (['retail', 'food', 'wellness'].includes(partner.partnerType)) return 'gift_card';
    return 'discount_code';
  }
}

export const fulfillmentService = new RewardFulfillmentService();