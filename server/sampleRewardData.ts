import { storage } from './storage';
import { db } from './db';
import { rewardRedemptions } from '../shared/schema';

export async function initializeSampleRewardData() {
  try {
    // FORCE COMPREHENSIVE RE-SEEDING FOR COMPLETE DEMO DATA
    console.log('🔄 FORCE RE-SEEDING: Creating comprehensive reward partner data');
    const existingPartners = await storage.getRewardPartners({});
    if (existingPartners.length > 0) {
      console.log('🔄 Re-creating reward data for comprehensive demo');
    }

    console.log('Initializing sample reward partner data...');

    // GREENSBORO, NC HIGH SCHOOL REWARD PARTNERS - Local & National Sponsors
    const partners = [
      // LOCAL GREENSBORO, NC PARTNERS
      {
        partnerName: 'A Special Blend Coffee',
        partnerLogo: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
        partnerType: 'local_dining',
        websiteUrl: 'https://www.aspecialblend.org',
        description: 'Mission-driven nonprofit coffee shop employing adults with disabilities - Community in a Cup.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 150, // 150 $ECHO = coffee + pastry
        maxRedemptionAmount: 600, // 600 $ECHO = weekly coffee card
        contactEmail: 'info@aspecialblend.org',
        location: 'Greensboro, NC'
      },
      {
        partnerName: 'Tate Street Coffee House',
        partnerLogo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
        partnerType: 'local_dining',
        websiteUrl: 'https://tatestreetcoffeehouse.com',
        description: 'Organic fair-trade coffee near UNCG - student-friendly study spot.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 120, // 120 $ECHO = coffee + snack
        maxRedemptionAmount: 500, // 500 $ECHO = study session card
        contactEmail: 'info@tatestreetcoffee.com',
        location: 'Greensboro, NC'
      },
      {
        partnerName: 'Greensboro Grasshoppers',
        partnerLogo: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=400',
        partnerType: 'local_sports',
        websiteUrl: 'https://www.gsohoppers.com',
        description: 'Minor league baseball fun for students and families in Greensboro.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 300, // 300 $ECHO = 1 game ticket
        maxRedemptionAmount: 1500, // 1500 $ECHO = family 4-pack tickets
        contactEmail: 'info@gsohoppers.com',
        location: 'Greensboro, NC'
      },
      {
        partnerName: 'Chez Genèse',
        partnerLogo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
        partnerType: 'local_dining',
        websiteUrl: 'https://www.chezgenese.com',
        description: 'French-inspired restaurant employing adults with intellectual disabilities - community & connection.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 400, // 400 $ECHO = meal credit
        maxRedemptionAmount: 1200, // 1200 $ECHO = family dinner
        contactEmail: 'info@chezgenese.com',
        location: 'Greensboro, NC'
      },
      {
        partnerName: 'Greensboro Science Center',
        partnerLogo: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
        partnerType: 'educational',
        websiteUrl: 'https://www.greensboroscience.org',
        description: 'Award-winning aquarium, zoo, and museum with hands-on exhibits.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 350, // 350 $ECHO = student admission
        maxRedemptionAmount: 1500, // 1500 $ECHO = family pass
        contactEmail: 'info@greensboroscience.org',
        location: 'Greensboro, NC'
      },
      {
        partnerName: 'Chick-fil-A Greensboro',
        partnerLogo: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
        partnerType: 'local_dining',
        websiteUrl: 'https://www.chick-fil-a.com',
        description: 'Family restaurant with meals and refreshments near Dudley High School.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 200, // 200 $ECHO = meal
        maxRedemptionAmount: 800, // 800 $ECHO = family meal
        contactEmail: 'manager@cfagreensboro.com',
        location: 'Greensboro, NC'
      },
      {
        partnerName: 'Cook Out',
        partnerLogo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        partnerType: 'local_dining',
        websiteUrl: 'https://cookout.com',
        description: 'NC fast food institution - student favorite for burgers, shakes, and fries!',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 150, // 150 $ECHO = combo meal
        maxRedemptionAmount: 600, // 600 $ECHO = group meal
        contactEmail: 'greensboro@cookout.com',
        location: 'Greensboro, NC (Multiple Locations)'
      },
      {
        partnerName: "Dames Chicken & Waffles",
        partnerLogo: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
        partnerType: 'local_dining',
        websiteUrl: 'https://www.dameschickenwaffles.com',
        description: 'Downtown Greensboro favorite - famous chicken & waffles "shmears" near Dudley HS!',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 250, // 250 $ECHO = meal
        maxRedemptionAmount: 1000, // 1000 $ECHO = family meal
        contactEmail: 'info@dameschickenwaffles.com',
        location: '301 Martin Luther King Jr Dr, Greensboro'
      },
      {
        partnerName: "Dave's Hot Chicken",
        partnerLogo: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
        partnerType: 'local_dining',
        websiteUrl: 'https://www.daveshotchicken.com',
        description: 'Trending Nashville-style hot chicken spot - super popular with students!',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 200, // 200 $ECHO = combo
        maxRedemptionAmount: 800, // 800 $ECHO = group meal
        contactEmail: 'greensboro@daveshotchicken.com',
        location: 'W. Market Street, Greensboro'
      },
      {
        partnerName: 'Boxcar Bar + Arcade',
        partnerLogo: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400',
        partnerType: 'entertainment',
        websiteUrl: 'https://www.boxcarbar.com',
        description: 'Downtown pizza & retro arcade games - perfect hangout spot near Dudley!',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 300, // 300 $ECHO = pizza + games
        maxRedemptionAmount: 1200, // 1200 $ECHO = group party
        contactEmail: 'greensboro@boxcarbar.com',
        location: 'Downtown Greensboro'
      },
      {
        partnerName: 'Yum Yum Better Ice Cream',
        partnerLogo: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
        partnerType: 'local_dining',
        websiteUrl: 'https://www.yumyumbettericecream.com',
        description: 'Greensboro tradition since 1906 - ice cream & hot dogs near UNCG!',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 120, // 120 $ECHO = ice cream treat
        maxRedemptionAmount: 500, // 500 $ECHO = group treat
        contactEmail: 'info@yumyumbetter.com',
        location: '1219 Spring Garden St, Greensboro'
      },
      {
        partnerName: 'Red Cinemas',
        partnerLogo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
        partnerType: 'entertainment',
        websiteUrl: 'https://www.redcinemas.com',
        description: 'Upscale downtown theater - indie films, craft snacks, reserved seating.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 350, // 350 $ECHO = movie ticket
        maxRedemptionAmount: 1400, // 1400 $ECHO = group tickets
        contactEmail: 'info@redcinemas.com',
        location: 'Downtown Greensboro'
      },
      {
        partnerName: 'Triad Lanes',
        partnerLogo: 'https://images.unsplash.com/photo-1594717527389-b0e4219556ba?w=400',
        partnerType: 'entertainment',
        websiteUrl: 'https://triadlanes.com',
        description: 'Bowling fun for students - lanes, arcade, and food!',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 250, // 250 $ECHO = bowling game
        maxRedemptionAmount: 1000, // 1000 $ECHO = party package
        contactEmail: 'info@triadlanes.com',
        location: 'Greensboro, NC 27407'
      },
      {
        partnerName: 'Urban Air Trampoline Park',
        partnerLogo: 'https://images.unsplash.com/photo-1610041321420-a148f17fe5d1?w=400',
        partnerType: 'entertainment',
        websiteUrl: 'https://www.urbanairtrampolinepark.com',
        description: 'Indoor trampoline park - climbing walls, arcade, and active fun!',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 400, // 400 $ECHO = admission
        maxRedemptionAmount: 1600, // 1600 $ECHO = group package
        contactEmail: 'greensboro@urbanair.com',
        location: 'Greensboro, NC'
      },
      {
        partnerName: 'YMCA of Greensboro',
        partnerLogo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
        partnerType: 'recreation',
        websiteUrl: 'https://www.ymcagreensboro.org',
        description: 'Youth development programs, fitness, and leadership opportunities.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 250, // 250 $ECHO = day pass
        maxRedemptionAmount: 1000, // 1000 $ECHO = program enrollment
        contactEmail: 'info@ymcagreensboro.org',
        location: 'Greensboro, NC'
      },
      {
        partnerName: 'Barnes & Noble UNCG',
        partnerLogo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        partnerType: 'educational',
        websiteUrl: 'https://www.bncollege.com/uncg',
        description: 'Books, school supplies, and study materials near campus.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 300, // 300 $ECHO = book/supply credit
        maxRedemptionAmount: 1200, // 1200 $ECHO = semester supplies
        contactEmail: 'uncg@bncollege.com',
        location: 'Greensboro, NC'
      },
      {
        partnerName: 'Common Grounds Coffee',
        partnerLogo: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
        partnerType: 'local_dining',
        websiteUrl: 'https://www.commongroundscoffee.com',
        description: 'Student-friendly coffee shop with indoor/outdoor seating and wifi.',
        isActive: 1,
        isFeatured: 0,
        minRedemptionAmount: 100, // 100 $ECHO = coffee + snack
        maxRedemptionAmount: 400, // 400 $ECHO = weekly coffee card
        contactEmail: 'info@commongroundscoffee.com',
        location: 'Greensboro, NC'
      },
      {
        partnerName: 'Recovery Café Greensboro',
        partnerLogo: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
        partnerType: 'community',
        websiteUrl: 'https://www.recoverycafegso.org',
        description: 'Community-based support cafe offering meals and connection.',
        isActive: 1,
        isFeatured: 0,
        minRedemptionAmount: 150, // 150 $ECHO = community meal
        maxRedemptionAmount: 500, // 500 $ECHO = meal pass
        contactEmail: 'info@recoverycafegso.org',
        location: 'Greensboro, NC'
      },
      {
        partnerName: 'SHIELD Mentor Program',
        partnerLogo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400',
        partnerType: 'youth_programs',
        websiteUrl: 'https://www.shieldmentor.org',
        description: 'Youth mentoring, leadership development, and robotics programs.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 400, // 400 $ECHO = program registration
        maxRedemptionAmount: 1500, // 1500 $ECHO = semester enrollment
        contactEmail: 'info@shieldmentor.org',
        location: 'Greensboro, NC'
      },
      {
        partnerName: 'Greensboro Public Library',
        partnerLogo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        partnerType: 'educational',
        websiteUrl: 'https://www.greensborolibrary.org',
        description: 'Reading programs, study spaces, and educational resources for students.',
        isActive: 1,
        isFeatured: 1,
        minRedemptionAmount: 120, // 120 $ECHO = library card benefits
        maxRedemptionAmount: 500, // 500 $ECHO = reading program bundle
        contactEmail: 'info@greensborolibrary.org',
        location: 'Greensboro, NC'
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

    // HIGH SCHOOL REWARD OFFERS - Greensboro, NC Focus
    const offers = [
      // A Special Blend Coffee Offers
      {
        partnerId: createdPartners[0].id, // A Special Blend
        offerType: 'food',
        title: 'Coffee & Pastry Combo',
        description: 'Free coffee and pastry at A Special Blend - supporting community employment!',
        offerValue: 'Coffee + Pastry',
        echoCost: 150,
        maxRedemptions: 200,
        currentRedemptions: 45,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid during business hours. One per student per week.',
        imageUrl: 'https://via.placeholder.com/300/8D6E63/FFFFFF?text=Coffee+Time'
      },

      // Tate Street Coffee House Offers
      {
        partnerId: createdPartners[1].id, // Tate Street Coffee
        offerType: 'food',
        title: 'Study Session Bundle',
        description: 'Fair-trade coffee and snack for productive study sessions near UNCG!',
        offerValue: 'Coffee + Snack',
        echoCost: 120,
        maxRedemptions: 150,
        currentRedemptions: 38,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid weekdays 7am-9pm. WiFi available for studying.',
        imageUrl: 'https://via.placeholder.com/300/6D4C41/FFFFFF?text=Study+Fuel'
      },

      // Greensboro Grasshoppers Baseball Offers
      {
        partnerId: createdPartners[2].id, // Grasshoppers
        offerType: 'ticket',
        title: 'Baseball Game Ticket',
        description: 'Ticket to a Greensboro Grasshoppers game for showing kindness!',
        offerValue: '1 Ticket',
        echoCost: 300,
        maxRedemptions: 100,
        currentRedemptions: 22,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 1,
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid for home games only. Subject to availability.',
        imageUrl: 'https://via.placeholder.com/300/2E7D32/FFFFFF?text=Baseball+Game'
      },

      // Chez Genèse Offers
      {
        partnerId: createdPartners[3].id, // Chez Genèse
        offerType: 'meal',
        title: 'Restaurant Credit',
        description: '$15 meal credit at Chez Genèse - community-focused dining!',
        offerValue: '$15 Credit',
        echoCost: 400,
        maxRedemptions: 80,
        currentRedemptions: 18,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid for dine-in or takeout. Cannot be combined with other offers.',
        imageUrl: 'https://via.placeholder.com/300/D84315/FFFFFF?text=Restaurant'
      },

      // Greensboro Science Center Offers
      {
        partnerId: createdPartners[4].id, // Science Center
        offerType: 'educational',
        title: 'Science Center Pass',
        description: 'Admission to aquarium, zoo, and museum at Greensboro Science Center!',
        offerValue: 'Admission',
        echoCost: 350,
        maxRedemptions: 120,
        currentRedemptions: 28,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid for student admission. Check website for hours.',
        imageUrl: 'https://via.placeholder.com/300/0288D1/FFFFFF?text=Science+Center'
      },

      // Chick-fil-A Greensboro Offers
      {
        partnerId: createdPartners[5].id, // Chick-fil-A
        offerType: 'meal',
        title: 'Meal Voucher',
        description: 'Free meal at Chick-fil-A Greensboro near Dudley High School!',
        offerValue: 'Meal',
        echoCost: 200,
        maxRedemptions: 100,
        currentRedemptions: 31,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid at Greensboro locations only. Student ID may be required.',
        imageUrl: 'https://via.placeholder.com/300/E53935/FFFFFF?text=CFA+Meal'
      },

      // Cook Out Offers - NC FAVORITE!
      {
        partnerId: createdPartners[6].id, // Cook Out
        offerType: 'meal',
        title: 'Cook Out Combo Meal',
        description: 'NC fast food legend - burger, sides & legendary milkshake!',
        offerValue: 'Combo Meal',
        echoCost: 150,
        maxRedemptions: 200,
        currentRedemptions: 67,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid at all Greensboro locations. Student favorite!',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
      },

      // Dames Chicken & Waffles - DOWNTOWN FAVORITE
      {
        partnerId: createdPartners[7].id, // Dames Chicken & Waffles
        offerType: 'meal',
        title: 'Chicken & Waffles Meal',
        description: 'Famous "shmears" at downtown Greensboro favorite near Dudley HS!',
        offerValue: 'Signature Meal',
        echoCost: 250,
        maxRedemptions: 100,
        currentRedemptions: 34,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid at 301 MLK Jr Dr location. Dine-in or takeout.',
        imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400'
      },

      // Dave's Hot Chicken - TRENDING SPOT
      {
        partnerId: createdPartners[8].id, // Dave's Hot Chicken
        offerType: 'meal',
        title: 'Hot Chicken Combo',
        description: 'Nashville-style hot chicken - super popular with students!',
        offerValue: 'Chicken Combo',
        echoCost: 200,
        maxRedemptions: 150,
        currentRedemptions: 52,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid at W. Market St location. Choose your heat level!',
        imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400'
      },

      // Boxcar Bar + Arcade - DOWNTOWN HANGOUT
      {
        partnerId: createdPartners[9].id, // Boxcar Bar + Arcade
        offerType: 'entertainment',
        title: 'Pizza & Arcade Games',
        description: 'Downtown pizza & retro arcade - perfect Dudley student hangout!',
        offerValue: 'Pizza + Game Tokens',
        echoCost: 300,
        maxRedemptions: 80,
        currentRedemptions: 28,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid at downtown Greensboro location. All ages welcome!',
        imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400'
      },

      // Yum Yum Better Ice Cream - GREENSBORO TRADITION SINCE 1906
      {
        partnerId: createdPartners[10].id, // Yum Yum
        offerType: 'treat',
        title: 'Ice Cream Treat',
        description: 'Greensboro tradition since 1906 - ice cream near UNCG!',
        offerValue: 'Ice Cream',
        echoCost: 120,
        maxRedemptions: 180,
        currentRedemptions: 74,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Choice of flavors and toppings. Perfect for celebrating kindness!',
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'
      },

      // Red Cinemas - UPSCALE DOWNTOWN THEATER
      {
        partnerId: createdPartners[11].id, // Red Cinemas
        offerType: 'entertainment',
        title: 'Movie Ticket + Snacks',
        description: 'Upscale downtown theater - indie films, craft snacks, reserved seating!',
        offerValue: 'Ticket + Snack',
        echoCost: 350,
        maxRedemptions: 90,
        currentRedemptions: 41,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid at downtown Greensboro location. Reserved seating included!',
        imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400'
      },

      // Triad Lanes - BOWLING & ARCADE
      {
        partnerId: createdPartners[12].id, // Triad Lanes
        offerType: 'entertainment',
        title: 'Bowling & Arcade Package',
        description: 'Bowling, arcade games, and food - complete student hangout!',
        offerValue: 'Bowling + Arcade',
        echoCost: 250,
        maxRedemptions: 100,
        currentRedemptions: 37,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Includes shoe rental, lane time, and arcade tokens.',
        imageUrl: 'https://images.unsplash.com/photo-1594717527389-b0e4219556ba?w=400'
      },

      // Urban Air Trampoline Park - ACTIVE FUN
      {
        partnerId: createdPartners[13].id, // Urban Air
        offerType: 'entertainment',
        title: 'Trampoline Park Pass',
        description: 'Indoor trampoline park - climbing walls, arcade, active fun!',
        offerValue: 'Park Admission',
        echoCost: 400,
        maxRedemptions: 70,
        currentRedemptions: 22,
        isActive: 1,
        isFeatured: 1,
        requiresVerification: 0,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid at Greensboro location. Waiver required for first visit.',
        imageUrl: 'https://images.unsplash.com/photo-1610041321420-a148f17fe5d1?w=400'
      },

      // DUAL REWARD OFFERS - National Partners
      {
        partnerId: createdPartners[13].id, // Scholastic Books
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
        partnerId: createdPartners[14].id, // Target Education
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
        partnerId: createdPartners[15].id, // LEGO Education
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
        partnerId: createdPartners[16].id, // Amazon Family
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

    const createdOffers = [];
    for (const offerData of offers) {
      const offer = await storage.createRewardOffer(offerData);
      createdOffers.push(offer);
      console.log(`✓ Created offer: ${offer.title}`);
    }

    console.log('✓ Sample reward data initialization completed');
    console.log(`✓ Created ${createdPartners.length} partners and ${createdOffers.length} offers`);

    // ===== CREATE DEMO REDEMPTIONS FOR STUDENT EMMA =====
    console.log('🎁 Creating demo student redemptions for realistic demo...');
    
    // 🚀 FORCE RE-SEEDING: Always recreate redemptions for comprehensive demo
    console.log('🔄 Re-creating demo redemptions for comprehensive Monday demo');
    
    // Clear existing redemptions for clean demo
    await db.delete(rewardRedemptions);
    
    const forceCreateRedemptions = true;
    
    if (forceCreateRedemptions) {
      // Add redemptions for current demo user (Emma Johnson) for Monday demo
      const demoRedemptions = [
        {
          userId: 'student-001', // Emma Johnson (current demo user)
          offerId: createdOffers[5].id, // Chick-fil-A Kids Meal + Playground Time
          partnerId: createdPartners[5].id, // Chick-fil-A Burlington
          echoSpent: 200,
          redemptionCode: 'CFA2025SEPT',
          status: 'active', // Ready to use - perfect for demo
          redeemedAt: new Date('2025-09-22T11:30:00Z'),
          expiresAt: new Date('2025-10-22T23:59:59Z')
        },
        {
          userId: 'student-001', // Emma Johnson
          offerId: createdOffers[1].id, // Putt-Putt Mini Golf Game Pass
          partnerId: createdPartners[1].id, // Putt-Putt Fun Center Burlington
          echoSpent: 250,
          redemptionCode: 'GOLF2025',
          status: 'pending', // Shows pending status
          redeemedAt: new Date('2025-09-21T14:15:00Z'),
          expiresAt: new Date('2025-11-21T23:59:59Z')
        },
        {
          userId: 'student-001', // Emma Johnson
          offerId: createdOffers[12].id, // Muffin's Ice Cream Shoppe
          partnerId: createdPartners[12].id, // Muffin's Ice Cream Shoppe
          echoSpent: 120,
          redemptionCode: 'ICECREAM24',
          status: 'used', // Shows completed redemption
          redeemedAt: new Date('2025-09-18T16:00:00Z'),
          usedAt: new Date('2025-09-19T15:30:00Z'),
          expiresAt: new Date('2025-10-18T23:59:59Z')
        }
      ];

      await db.insert(rewardRedemptions).values(demoRedemptions);
      console.log('✅ Demo redemptions created for Emma Johnson - shows working reward system!');
      console.log(`✓ Emma has 3 redemptions: 1 active (CFA), 1 pending (Golf), 1 used (Ice Cream)`);
    } else {
      console.log('📋 Demo redemptions already exist, skipping initialization');
    }

  } catch (error) {
    console.error('Error initializing sample reward data:', error);
  }
}