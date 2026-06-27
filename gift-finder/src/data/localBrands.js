/**
 * Local Nigerian brands featured on GiftFinder.
 * Products from these brands appear in recommendations with a "Local Brand" badge.
 * To add a new brand, copy the structure below and append to the array.
 */

export const localBrands = [
  {
    id: 'ebuntofunmi',
    name: 'Ebun Tofunmi',
    handle: '@ebuntofunmi',
    tagline: 'Luxury African fashion & beauty, made in Nigeria.',
    category: 'Fashion & Beauty',
    emoji: '👑',
    bg: 'from-amber-400 to-orange-600',
    instagram: 'https://www.instagram.com/ebuntofunmi',
    whatsapp: null, // add WhatsApp link e.g. 'https://wa.me/2348012345678'
    website: null,
    products: [
      {
        id: 'eb-001',
        title: 'Ebun Tofunmi Ankara Scarf',
        description: 'Hand-woven Ankara print scarf in vibrant, unique patterns',
        reason: 'Proudly Nigerian, handcrafted, and utterly beautiful.',
        recipient: ['girlfriend', 'mum', 'sister', 'friend'],
        occasion: ['birthday', 'christmas', 'eid', 'just-because'],
        interests: ['fashion', 'beauty', 'art'],
        budget_min: 6000,
        budget_max: 15000,
        price_label: '₦6,000 – ₦15,000',
        gift_type: ['romantic', 'personalized', 'luxury'],
        emoji: '🧣',
        bg: 'from-orange-400 to-red-600',
        affiliate_link: 'https://www.instagram.com/ebuntofunmi',
        score: 9,
        isLocal: true,
        brand: 'Ebun Tofunmi',
        brandId: 'ebuntofunmi',
      },
      {
        id: 'eb-002',
        title: 'Ebun Tofunmi Beaded Jewelry Set',
        description: 'Handcrafted Nigerian beaded necklace and earring set',
        reason: 'A one-of-a-kind statement piece celebrating African heritage.',
        recipient: ['girlfriend', 'mum', 'sister'],
        occasion: ['birthday', 'anniversary', 'valentine', 'graduation'],
        interests: ['fashion', 'beauty'],
        budget_min: 8000,
        budget_max: 18000,
        price_label: '₦8,000 – ₦18,000',
        gift_type: ['romantic', 'luxury', 'personalized'],
        emoji: '📿',
        bg: 'from-yellow-500 to-amber-600',
        affiliate_link: 'https://www.instagram.com/ebuntofunmi',
        score: 9,
        isLocal: true,
        brand: 'Ebun Tofunmi',
        brandId: 'ebuntofunmi',
      },
      {
        id: 'eb-003',
        title: 'Ebun Tofunmi Skin Glow Oil',
        description: 'Premium natural body oil blend with African botanicals',
        reason: 'All-natural Nigerian skincare — glow that speaks culture.',
        recipient: ['girlfriend', 'mum', 'sister', 'friend'],
        occasion: ['birthday', 'valentine', 'christmas', 'just-because'],
        interests: ['beauty'],
        budget_min: 5000,
        budget_max: 12000,
        price_label: '₦5,000 – ₦12,000',
        gift_type: ['romantic', 'practical'],
        emoji: '✨',
        bg: 'from-amber-300 to-yellow-500',
        affiliate_link: 'https://www.instagram.com/ebuntofunmi',
        score: 8,
        isLocal: true,
        brand: 'Ebun Tofunmi',
        brandId: 'ebuntofunmi',
      },
    ],
  },

  // ── Template for adding new brands ─────────────────────────
  // {
  //   id: 'your-brand-id',
  //   name: 'Brand Name',
  //   handle: '@handle',
  //   tagline: 'One-line brand tagline.',
  //   category: 'Fashion & Beauty',
  //   emoji: '🎁',
  //   bg: 'from-rose-400 to-pink-600',
  //   instagram: 'https://www.instagram.com/yourbrand',
  //   whatsapp: null,
  //   website: null,
  //   products: [],
  // },
]

/** Flat list of all local brand products — merged into the recommendation engine */
export const localBrandProducts = localBrands.flatMap(b => b.products)
