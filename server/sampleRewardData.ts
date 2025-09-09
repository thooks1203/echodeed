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

    // BURLINGTON, NC KID-FRIENDLY REWARD PARTNERS - Local & National Sponsors
    const partners = [
      // LOCAL BURLINGTON, NC PARTNERS
      {
        partnerName: 'Burlington City Park Carousel',
        partnerLogo: 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=400',
        partnerType: 'local_entertainment',
        websiteUrl: 'https://www.burlingtonnc.gov/parks',
        description: 'Historic carousel rides and family fun in downtown Burlington, NC.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 100, // 100 $ECHO = 2 free carousel rides
        maxRedemptionAmount: 500, // 500 $ECHO = 10 free rides
        contactEmail: 'parks@burlingtonnc.gov',
        location: 'Burlington, NC'
      },
      {
        partnerName: 'Putt-Putt Fun Center Burlington',
        partnerLogo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        partnerType: 'local_entertainment',
        websiteUrl: 'https://www.puttputt.com',
        description: 'Mini golf and family entertainment for kids and families in Burlington.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 200, // 200 $ECHO = 1 mini golf game
        maxRedemptionAmount: 1000, // 1000 $ECHO = family 4-pack
        contactEmail: 'info@puttputt.com',
        location: 'Burlington, NC'
      },
      {
        partnerName: 'Burlington Sock Puppets Baseball',
        partnerLogo: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=400',
        partnerType: 'local_sports',
        websiteUrl: 'https://www.burlingtonsockpuppets.com',
        description: 'Minor league baseball fun for families and kids in Burlington.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 300, // 300 $ECHO = 1 game ticket
        maxRedemptionAmount: 1500, // 1500 $ECHO = family 4-pack tickets
        contactEmail: 'info@sockpuppets.com',
        location: 'Burlington, NC'
      },
      {
        partnerName: 'Sir Pizza Burlington',
        partnerLogo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
        partnerType: 'local_dining',
        websiteUrl: 'https://www.sirpizza.com',
        description: 'Local pizza chain with family-friendly atmosphere and kids menu.',
        isActive: 1,
        isFeatured: 0,
        minRedemptionAmount: 250, // 250 $ECHO = $5 kids meal
        maxRedemptionAmount: 1000, // 1000 $ECHO = family pizza party
        contactEmail: 'catering@sirpizza.com',
        location: 'Burlington, NC'
      },
      {
        partnerName: 'Alamance County Public Libraries',
        partnerLogo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        partnerType: 'educational',
        websiteUrl: 'https://www.alamancelibraries.org',
        description: 'Reading programs, storytimes, and educational activities for kids.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 150, // 150 $ECHO = special reading program
        maxRedemptionAmount: 600, // 600 $ECHO = summer reading prize pack
        contactEmail: 'info@alamancelibraries.org',
        location: 'Burlington, NC'
      },
      {
        partnerName: 'Chick-fil-A Burlington',
        partnerLogo: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
        partnerType: 'local_dining',
        websiteUrl: 'https://www.chick-fil-a.com',
        description: 'Family restaurant with kids meals and playground - Garden Rd & University Dr.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 200, // 200 $ECHO = kids meal
        maxRedemptionAmount: 800, // 800 $ECHO = family meal
        contactEmail: 'manager@cfaburlington.com',
        location: 'Burlington, NC'
      },
      // NATIONAL KID-FRIENDLY PARTNERS
      {
        partnerName: 'Scholastic Books',
        partnerLogo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        partnerType: 'educational',
        websiteUrl: 'https://www.scholastic.com',
        description: 'America\'s largest publisher of children\'s books and educational materials.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 300, // 300 $ECHO = $5 book credit
        maxRedemptionAmount: 2000, // 2000 $ECHO = $25 book bundle
        contactEmail: 'partnerships@scholastic.com',
        isDualReward: 1 // DUAL REWARD: Kid gets book, parent gets Amazon credit
      },
      {
        partnerName: 'Target Education',
        partnerLogo: 'https://corporate.target.com/_media/TargetCorp/about/Target_Bullseye-Logo_Red_sRGB.png',
        partnerType: 'retail_family',
        websiteUrl: 'https://www.target.com/c/school-office-supplies',
        description: 'Supporting students and families with quality school supplies and rewards.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 400, // 400 $ECHO = school supplies bundle
        maxRedemptionAmount: 2500, // 2500 $ECHO = premium supply pack
        contactEmail: 'education@target.com',
        isDualReward: 1 // DUAL REWARD: Kid gets supplies, parent gets Target credit
      },
      {
        partnerName: 'LEGO Education',
        partnerLogo: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
        partnerType: 'educational_toys',
        websiteUrl: 'https://education.lego.com',
        description: 'Creative building sets that inspire learning and family fun.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 600, // 600 $ECHO = small LEGO set
        maxRedemptionAmount: 3000, // 3000 $ECHO = premium education kit
        contactEmail: 'education@lego.com',
        isDualReward: 1 // DUAL REWARD: Kid gets LEGO set, parent gets Amazon credit
      },
      {
        partnerName: 'Amazon Family',
        partnerLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        partnerType: 'retail_family',
        websiteUrl: 'https://www.amazon.com/family',
        description: 'Books, educational materials, and family rewards for character education.',
        isActive: 1,
        isFeatured: 0,
        minRedemptionAmount: 350, // 350 $ECHO = educational book
        maxRedemptionAmount: 2000, // 2000 $ECHO = learning bundle
        contactEmail: 'family@amazon.com',
        isDualReward: 1 // DUAL REWARD: Kid gets educational item, parent gets credit
      }
    ];

    const createdPartners = [];
    for (const partnerData of partners) {
      const partner = await storage.createRewardPartner(partnerData);
      createdPartners.push(partner);
      console.log(`✓ Created partner: ${partner.partnerName}`);
    }

    console.log('Creating sample reward offers...');

    // KID-FRIENDLY DUAL REWARD OFFERS - Burlington, NC Focus
    const offers = [
      // Burlington City Park Carousel Offers
      {
        partnerId: createdPartners[0].id, // Burlington Carousel
        offerType: 'experience',
        title: '2 Free Carousel Rides',
        description: 'Enjoy 2 free rides on Burlington\'s historic carousel for showing kindness!',
        offerValue: '2 Rides',
        echoCost: 100,
        maxRedemptions: 200,
        currentRedemptions: 15,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        termsAndConditions: 'Valid during park operating hours. Must be accompanied by adult.',
        imageUrl: 'https://via.placeholder.com/300/FF6B9D/FFFFFF?text=Carousel+Rides'
      },

      // Putt-Putt Fun Center Offers
      {
        partnerId: createdPartners[1].id, // Putt-Putt
        offerType: 'experience',
        title: 'Mini Golf Game Pass',
        description: 'One free round of mini golf for being kind to others!',
        offerValue: '1 Game',
        echoCost: 200,
        maxRedemptions: 150,
        currentRedemptions: 28,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid weekdays after 3pm and weekends. Must be used within 90 days.',
        imageUrl: 'https://via.placeholder.com/300/00BCD4/FFFFFF?text=Mini+Golf'
      },

      // Burlington Sock Puppets Baseball Offers
      {
        partnerId: createdPartners[2].id, // Sock Puppets
        offerType: 'ticket',
        title: 'Family Game Ticket',
        description: 'One ticket to a Burlington Sock Puppets baseball game for the whole family!',
        offerValue: '1 Ticket',
        echoCost: 300,
        maxRedemptions: 100,
        currentRedemptions: 12,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 1, // Requires kindness verification
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid for home games only. Subject to availability.',
        imageUrl: 'https://via.placeholder.com/300/FF9800/FFFFFF?text=Baseball+Game'
      },

      // Sir Pizza Burlington Offers
      {
        partnerId: createdPartners[3].id, // Sir Pizza
        offerType: 'meal',
        title: 'Kids Meal Deal',
        description: 'Free kids meal with drink and activity book at Sir Pizza Burlington!',
        offerValue: 'Kids Meal',
        echoCost: 250,
        maxRedemptions: 80,
        currentRedemptions: 22,
        isActive: 1,
        isFeatured: 0,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Kids 12 and under. Must be accompanied by adult.',
        imageUrl: 'https://via.placeholder.com/300/FF5722/FFFFFF?text=Kids+Meal'
      },

      // Alamance Libraries Offers
      {
        partnerId: createdPartners[4].id, // Libraries
        offerType: 'educational',
        title: 'Special Reading Program',
        description: 'VIP access to special reading programs and storytimes at Alamance County Libraries!',
        offerValue: 'Program Access',
        echoCost: 150,
        maxRedemptions: 120,
        currentRedemptions: 35,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Library card required. Subject to program availability.',
        imageUrl: 'https://via.placeholder.com/300/9C27B0/FFFFFF?text=Reading+Program'
      },

      // Chick-fil-A Burlington Offers
      {
        partnerId: createdPartners[5].id, // Chick-fil-A
        offerType: 'meal',
        title: 'Kids Meal + Playground Time',
        description: 'Kids meal with playground access at Chick-fil-A Burlington!',
        offerValue: 'Kids Meal',
        echoCost: 200,
        maxRedemptions: 100,
        currentRedemptions: 18,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid at Burlington locations only. Kids 12 and under.',
        imageUrl: 'https://via.placeholder.com/300/E91E63/FFFFFF?text=CFA+Kids+Meal'
      },

      // DUAL REWARD OFFERS - National Partners
      {
        partnerId: createdPartners[6].id, // Scholastic Books
        offerType: 'dual_reward',
        title: 'Book Bundle + Parent Amazon Credit',
        description: 'Kid gets $10 Scholastic book bundle, parent gets $10 Amazon gift card!',
        offerValue: 'Book + $10 Credit',
        echoCost: 600,
        maxRedemptions: 50,
        currentRedemptions: 8,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 1,
        isDualReward: 1,
        kidReward: '$10 Scholastic Book Bundle',
        parentReward: '$10 Amazon Gift Card',
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Parent must provide email for Amazon credit. Books age-appropriate.',
        imageUrl: 'https://via.placeholder.com/300/4CAF50/FFFFFF?text=Dual+Book+Reward'
      },

      {
        partnerId: createdPartners[7].id, // Target Education
        offerType: 'dual_reward',
        title: 'School Supplies + Parent Target Credit',
        description: 'Kid gets school supply bundle, parent gets $15 Target gift card!',
        offerValue: 'Supplies + $15 Credit',
        echoCost: 800,
        maxRedemptions: 40,
        currentRedemptions: 5,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 1,
        isDualReward: 1,
        kidReward: 'Premium School Supply Bundle',
        parentReward: '$15 Target Gift Card',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Supply bundle varies by grade level. Target credit via email.',
        imageUrl: 'https://via.placeholder.com/300/2196F3/FFFFFF?text=Dual+Supply+Reward'
      },

      {
        partnerId: createdPartners[8].id, // LEGO Education
        offerType: 'dual_reward',
        title: 'LEGO Set + Parent Amazon Credit',
        description: 'Kid gets educational LEGO set, parent gets $20 Amazon gift card!',
        offerValue: 'LEGO + $20 Credit',
        echoCost: 1200,
        maxRedemptions: 30,
        currentRedemptions: 3,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 1,
        isDualReward: 1,
        kidReward: 'Age-Appropriate LEGO Education Set',
        parentReward: '$20 Amazon Gift Card',
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'LEGO set selected based on child age. Amazon credit via email.',
        imageUrl: 'https://via.placeholder.com/300/FF9800/FFFFFF?text=Dual+LEGO+Reward'
      },

      {
        partnerId: createdPartners[9].id, // Amazon Family
        offerType: 'dual_reward',
        title: 'Educational Book + Parent Credit',
        description: 'Kid gets educational book, parent gets $8 Amazon credit!',
        offerValue: 'Book + $8 Credit',
        echoCost: 500,
        maxRedemptions: 60,
        currentRedemptions: 12,
        isActive: 1,
        isFeatured: 0,
        requiresVerification: 0,
        isDualReward: 1,
        kidReward: 'Age-Appropriate Educational Book',
        parentReward: '$8 Amazon Gift Card',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Book selection based on reading level. Amazon credit via email.',
        imageUrl: 'https://via.placeholder.com/300/8BC34A/FFFFFF?text=Dual+Book+Reward'
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