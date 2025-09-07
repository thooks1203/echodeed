import { storage } from './storage';

export async function initializeSampleRewardData() {
  try {
    // Check if sample data already exists
    const existingPartners = await storage.getRewardPartners({});
    if (existingPartners.length > 0) {
      console.log('Sample reward data already exists, skipping initialization');
      return;
    }

    console.log('Initializing sample reward partner data...');

    // Create sample reward partners with external API configurations
    const partners = [
      {
        partnerName: 'Starbucks',
        partnerLogo: 'https://logos-world.net/wp-content/uploads/2020/09/Starbucks-Logo.png',
        partnerType: 'food',
        websiteUrl: 'https://www.starbucks.com',
        description: 'America\'s favorite coffee chain offering gift cards redeemable at any location.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 500, // 500 $ECHO = $5 gift card
        maxRedemptionAmount: 10000, // 10,000 $ECHO = $100 gift card
        contactEmail: 'partnerships@starbucks.com',
        apiEndpoint: 'https://api.starbucks.com/gift-cards/create', // Mock endpoint
        apiKey: 'sk_test_starbucks_api_key_12345' // Mock API key
      },
      {
        partnerName: 'Amazon',
        partnerLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        partnerType: 'retail',
        websiteUrl: 'https://www.amazon.com',
        description: 'The world\'s largest online marketplace offering gift cards for millions of products.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 250, // 250 $ECHO = $2.50 gift card
        maxRedemptionAmount: 20000, // 20,000 $ECHO = $200 gift card
        contactEmail: 'partnerships@amazon.com',
        apiEndpoint: 'https://api.amazon.com/gift-cards/issue', // Mock endpoint
        apiKey: 'amzn_api_key_67890_production' // Mock API key
      },
      {
        partnerName: 'Stripe Cashback',
        partnerLogo: 'https://logos-world.net/wp-content/uploads/2021/03/Stripe-Logo.png',
        partnerType: 'cashback',
        websiteUrl: 'https://stripe.com',
        description: 'Direct cashback to your bank account or debit card through Stripe\'s secure platform.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 1000, // 1,000 $ECHO = $10 cashback
        maxRedemptionAmount: 50000, // 50,000 $ECHO = $500 cashback
        contactEmail: 'partnerships@stripe.com',
        apiEndpoint: 'https://api.stripe.com/v1/transfers',
        apiKey: 'sk_live_stripe_api_key_cashback_12345' // Mock API key
      },
      {
        partnerName: 'Target',
        partnerLogo: 'https://corporate.target.com/_media/TargetCorp/about/Target_Bullseye-Logo_Red_sRGB.png',
        partnerType: 'retail',
        websiteUrl: 'https://www.target.com',
        description: 'Popular retail chain offering gift cards for in-store and online shopping.',
        isActive: 1,
        isFeatured: 0,
        minRedemptionAmount: 500, // 500 $ECHO = $5 gift card
        maxRedemptionAmount: 15000, // 15,000 $ECHO = $150 gift card
        contactEmail: 'partnerships@target.com',
        apiEndpoint: 'https://api.target.com/gift-cards/generate', // Mock endpoint
        apiKey: 'tgt_api_key_98765_production' // Mock API key
      },
      {
        partnerName: 'Wellness Plus',
        partnerLogo: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=W%2B',
        partnerType: 'wellness',
        websiteUrl: 'https://www.wellnessplus.com',
        description: 'Mental health and wellness services including meditation apps and therapy sessions.',
        isActive: 1,
        isFeatured: 0,
        minRedemptionAmount: 750, // 750 $ECHO = $7.50 credit
        maxRedemptionAmount: 12000, // 12,000 $ECHO = $120 credit
        contactEmail: 'partnerships@wellnessplus.com',
        // No API integration - manual fulfillment
      },
      {
        partnerName: 'GrubHub',
        partnerLogo: 'https://logos-world.net/wp-content/uploads/2020/11/Grubhub-Logo.png',
        partnerType: 'food',
        websiteUrl: 'https://www.grubhub.com',
        description: 'Food delivery service offering gift cards and discount codes for meal delivery.',
        isActive: 1,
        isFeatured: 0,
        minRedemptionAmount: 300, // 300 $ECHO = $3 discount
        maxRedemptionAmount: 8000, // 8,000 $ECHO = $80 discount
        contactEmail: 'partnerships@grubhub.com',
        apiEndpoint: 'https://api.grubhub.com/v1/discount-codes', // Mock endpoint
        apiKey: 'gh_api_key_56789_live' // Mock API key
      }
    ];

    const createdPartners = [];
    for (const partnerData of partners) {
      const partner = await storage.createRewardPartner(partnerData);
      createdPartners.push(partner);
      console.log(`✓ Created partner: ${partner.partnerName}`);
    }

    console.log('Creating sample reward offers...');

    // Create sample reward offers for each partner
    const offers = [
      // Starbucks Offers
      {
        partnerId: createdPartners[0].id, // Starbucks
        offerType: 'gift_card',
        title: '$5 Starbucks Gift Card',
        description: 'Enjoy your favorite coffee drink with this $5 Starbucks gift card. Redeemable at any Starbucks location.',
        offerValue: '$5',
        echoCost: 500,
        maxRedemptions: 100,
        currentRedemptions: 23,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        termsAndConditions: 'Valid at participating Starbucks locations. Cannot be combined with other offers.',
        imageUrl: 'https://via.placeholder.com/300/00704A/FFFFFF?text=Starbucks+%245'
      },
      {
        partnerId: createdPartners[0].id, // Starbucks
        offerType: 'gift_card',
        title: '$10 Starbucks Gift Card',
        description: 'Treat yourself to multiple coffee visits with this $10 Starbucks gift card.',
        offerValue: '$10',
        echoCost: 950, // 5% discount for larger amount
        maxRedemptions: 50,
        currentRedemptions: 8,
        isActive: 1,
        isFeatured: 0,
        requiresVerification: 1, // Requires kindness verification
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid at participating Starbucks locations. Requires verification of recent kindness act.',
        imageUrl: 'https://via.placeholder.com/300/00704A/FFFFFF?text=Starbucks+%2410'
      },
      
      // Amazon Offers
      {
        partnerId: createdPartners[1].id, // Amazon
        offerType: 'gift_card',
        title: '$15 Amazon Gift Card',
        description: 'Shop millions of products on Amazon with this $15 gift card.',
        offerValue: '$15',
        echoCost: 1400, // Slight discount
        maxRedemptions: 75,
        currentRedemptions: 34,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        termsAndConditions: 'Valid for Amazon.com purchases. Cannot be used for Prime membership.',
        imageUrl: 'https://via.placeholder.com/300/FF9900/FFFFFF?text=Amazon+%2415'
      },

      // Stripe Cashback Offers  
      {
        partnerId: createdPartners[2].id, // Stripe Cashback
        offerType: 'cashback',
        title: '$10 Direct Cashback',
        description: 'Get $10 deposited directly to your bank account or debit card.',
        offerValue: '$10',
        echoCost: 1000,
        maxRedemptions: 30,
        currentRedemptions: 12,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 1, // Requires kindness verification
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        termsAndConditions: 'Cashback processed within 3-5 business days. Valid bank account required.',
        imageUrl: 'https://via.placeholder.com/300/635BFF/FFFFFF?text=Cash+Back+%2410'
      },

      // Target Offers
      {
        partnerId: createdPartners[3].id, // Target
        offerType: 'discount',
        title: '15% Off Target Purchase',
        description: 'Save 15% on your next Target purchase (up to $25 discount).',
        offerValue: '15%',
        echoCost: 800,
        maxRedemptions: 60,
        currentRedemptions: 21,
        isActive: 1,
        isFeatured: 0,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        termsAndConditions: 'Maximum discount $25. Valid for in-store and online purchases.',
        imageUrl: 'https://via.placeholder.com/300/CC0000/FFFFFF?text=Target+15%25+Off'
      },

      // Wellness Plus Offers
      {
        partnerId: createdPartners[4].id, // Wellness Plus
        offerType: 'experience',
        title: 'Free Meditation Session',
        description: 'Enjoy a free 30-minute guided meditation session with a certified instructor.',
        offerValue: 'Free Session',
        echoCost: 750,
        maxRedemptions: 25,
        currentRedemptions: 7,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        termsAndConditions: 'Session must be scheduled within 30 days. Subject to instructor availability.',
        imageUrl: 'https://via.placeholder.com/300/4CAF50/FFFFFF?text=Free+Meditation'
      },

      // GrubHub Offers
      {
        partnerId: createdPartners[5].id, // GrubHub
        offerType: 'discount',
        title: '$7 Off Food Delivery',
        description: 'Get $7 off your next GrubHub order of $20 or more.',
        offerValue: '$7',
        echoCost: 650,
        maxRedemptions: 40,
        currentRedemptions: 18,
        isActive: 1,
        isFeatured: 0,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
        termsAndConditions: 'Minimum order $20. Valid for delivery orders only.',
        imageUrl: 'https://via.placeholder.com/300/F63440/FFFFFF?text=GrubHub+%247+Off'
      }
    ];

    for (const offerData of offers) {
      const offer = await storage.createRewardOffer(offerData);
      console.log(`✓ Created offer: ${offer.title}`);
    }

    console.log('✓ Sample reward data initialization completed');
    console.log(`✓ Created ${createdPartners.length} partners and ${offers.length} offers`);

  } catch (error) {
    console.error('Error initializing sample reward data:', error);
  }
}