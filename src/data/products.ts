export interface ProductColor {
  name: string;
  image: string;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  type: 'featured' | 'new' | 'bestseller';
  category: string;
  subcategory?: string;
  image: string;
  images?: string[];
  isNew?: boolean;
  discount?: number;
  colors?: ProductColor[];
  size?: string;
  fabric?: string;
  care?: string;
  description?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  subcategories: Subcategory[];
  count: number;
}

// Updated Categories with Subcategories (from spreadsheet)
export const categories: Category[] = [
  {
    id: "new-arrival",
    name: "New Arrival",
    slug: "new-arrival",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop",
    subcategories: [],
    count: 30,
  },
  {
    id: "best-seller",
    name: "Best Seller",
    slug: "best-seller",
    image: "https://images.unsplash.com/photo-1610189025028-2a58f49d8f78?w=200&h=200&fit=crop",
    subcategories: [],
    count: 25,
  },
  {
    id: "mens-wear",
    name: "Men's Wear",
    slug: "mens-wear",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop",
    subcategories: [
      { id: "sherwani", name: "Sherwani", slug: "sherwani" },
      { id: "indo-western", name: "Indo-Western", slug: "indo-western" },
      { id: "jodhpuri-suits", name: "Jodhpuri Suits", slug: "jodhpuri-suits" },
      { id: "tuxedos", name: "Tuxedos", slug: "tuxedos" },
      { id: "party-wear-blazers", name: "Party Wear Blazers", slug: "party-wear-blazers" },
      { id: "nehru-jackets", name: "Nehru Jackets", slug: "nehru-jackets" },
      { id: "kurta-pajama", name: "Kurta Pajama", slug: "kurta-pajama" },
      { id: "formal-blazers", name: "Formal Blazers", slug: "formal-blazers" },
    ],
    count: 85,
  },
  {
    id: "indo-western-cat",
    name: "Indo-Western",
    slug: "indo-western-cat",
    image: "https://images.unsplash.com/photo-1609748340878-acb8ed3eee7a?w=200&h=200&fit=crop",
    subcategories: [],
    count: 40,
  },
  {
    id: "readymade-dresses",
    name: "Readymade Dresses",
    slug: "readymade-dresses",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&h=200&fit=crop",
    subcategories: [
      { id: "anarkali-suits", name: "Anarkali Suits", slug: "anarkali-suits" },
      { id: "formal-suits", name: "Formal Suits", slug: "formal-suits" },
      { id: "partywear-suits", name: "Partywear Suits", slug: "partywear-suits" },
      { id: "co-ord-sets", name: "Co-Ord Sets", slug: "co-ord-sets" },
      { id: "crop-top", name: "Crop Top", slug: "crop-top" },
      { id: "gowns", name: "Gowns", slug: "gowns" },
      { id: "tunics", name: "Tunics", slug: "tunics" },
    ],
    count: 95,
  },
  {
    id: "sarees",
    name: "Sarees",
    slug: "sarees",
    image: "https://images.unsplash.com/photo-1610189025028-2a58f49d8f78?w=200&h=200&fit=crop",
    subcategories: [
      { id: "bridal-sarees", name: "Bridal Sarees", slug: "bridal-sarees" },
      { id: "silk-sarees", name: "Silk Sarees", slug: "silk-sarees" },
      { id: "designer-sarees", name: "Designer Sarees", slug: "designer-sarees" },
      { id: "ready-to-wear", name: "Ready to Wear", slug: "ready-to-wear" },
      { id: "formal-sarees", name: "Formal Sarees", slug: "formal-sarees" },
    ],
    count: 120,
  },
  {
    id: "occasion-wear",
    name: "Occasion Wear",
    slug: "occasion-wear",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop",
    subcategories: [
      { id: "bridal-lehanga", name: "Bridal Lehanga", slug: "bridal-lehanga" },
      { id: "engagement-gown", name: "Engagement Gown", slug: "engagement-gown" },
      { id: "engagement-dresses", name: "Engagement Dresses", slug: "engagement-dresses" },
      { id: "haldi", name: "Haldi", slug: "haldi" },
      { id: "mehandi", name: "Mehandi", slug: "mehandi" },
      { id: "cocktail-night", name: "Cocktail Night", slug: "cocktail-night" },
    ],
    count: 75,
  },
  {
    id: "unstitched-fabric",
    name: "Unstitched Fabric",
    slug: "unstitched-fabric",
    image: "https://images.unsplash.com/photo-1604006852748-903fccbc4019?w=200&h=200&fit=crop",
    subcategories: [
      { id: "bridal-suits", name: "Bridal Suits", slug: "bridal-suits" },
      { id: "designer-suit", name: "Designer Suit", slug: "designer-suit" },
      { id: "formal-suit", name: "Formal Suit", slug: "formal-suit" },
      { id: "cotton-premium", name: "Cotton Premium", slug: "cotton-premium" },
    ],
    count: 60,
  },
];

// Story slider categories (circular icons)
export const storyCategories = [
  { id: "new-arrival", name: "New Arrival", image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop" },
  { id: "best-seller", name: "Best Seller", image: "https://images.unsplash.com/photo-1610189025028-2a58f49d8f78?w=200&h=200&fit=crop" },
  { id: "mens-wear", name: "Men's Wear", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop" },
  { id: "indo-western-cat", name: "Indo-Western", image: "https://images.unsplash.com/photo-1609748340878-acb8ed3eee7a?w=200&h=200&fit=crop" },
  { id: "sarees", name: "Sarees", image: "https://images.unsplash.com/photo-1610189025028-2a58f49d8f78?w=200&h=200&fit=crop" },
  { id: "occasion-wear", name: "Occasion Wear", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop" },
  { id: "readymade-dresses", name: "Readymade", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&h=200&fit=crop" },
  { id: "unstitched-fabric", name: "Unstitched", image: "https://images.unsplash.com/photo-1604006852748-903fccbc4019?w=200&h=200&fit=crop" },
];

// Grid categories for homepage (below slider)
export const gridCategories = [
  { id: "sarees", name: "Sarees", image: "https://images.unsplash.com/photo-1610189025028-2a58f49d8f78?w=400&h=400&fit=crop" },
  { id: "occasion-wear", name: "Occasion Wear", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop" },
  { id: "readymade-dresses", name: "Readymade Dresses", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop" },
  { id: "mens-wear", name: "Men's Wear", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop" },
  { id: "indo-western-cat", name: "Indo-Western", image: "https://images.unsplash.com/photo-1609748340878-acb8ed3eee7a?w=400&h=400&fit=crop" },
  { id: "unstitched-fabric", name: "Unstitched Fabric", image: "https://images.unsplash.com/photo-1604006852748-903fccbc4019?w=400&h=400&fit=crop" },
];

export const products: Product[] = [
  {
    id: 1,
    name: "Royal Bridal Lehenga Set",
    price: 24990,
    originalPrice: 32990,
    type: "featured",
    category: "occasion-wear",
    subcategory: "bridal-lehanga",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1610189025028-2a58f49d8f78?w=600&h=800&fit=crop",
    ],
    isNew: true,
    discount: 25,
    colors: [
      { name: "Red", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop", price: 24990 },
      { name: "Maroon", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop", price: 24990 },
      { name: "Pink", image: "https://images.unsplash.com/photo-1610189025028-2a58f49d8f78?w=400&h=500&fit=crop", price: 25990 },
    ],
    size: "Custom Stitching Available",
    fabric: "Heavy Silk with Zari Work",
    care: "Dry Clean Only",
    description: "This stunning royal bridal lehenga features intricate zari embroidery and traditional craftsmanship. Perfect for your special day."
  },
  {
    id: 2,
    name: "Designer Anarkali Suit",
    price: 8490,
    type: "featured",
    category: "readymade-dresses",
    subcategory: "anarkali-suits",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop",
    ],
    isNew: true,
    fabric: "Georgette",
    care: "Dry Clean Recommended",
    size: "Free size till Large",
  },
  {
    id: 3,
    name: "Premium Sherwani Set",
    price: 15990,
    originalPrice: 19990,
    type: "featured",
    category: "mens-wear",
    subcategory: "sherwani",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=800&fit=crop",
    ],
    discount: 20,
    colors: [
      { name: "Ivory", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop", price: 15990 },
      { name: "Gold", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=500&fit=crop", price: 16990 },
    ],
    fabric: "Jacquard Silk",
    size: "S, M, L, XL, XXL",
  },
  {
    id: 4,
    name: "Silk Banarasi Saree",
    price: 12490,
    type: "featured",
    category: "sarees",
    subcategory: "silk-sarees",
    image: "https://images.unsplash.com/photo-1610189025028-2a58f49d8f78?w=400&h=500&fit=crop",
    fabric: "Pure Banarasi Silk",
    care: "Dry Clean Only",
    description: "Authentic Banarasi silk saree with traditional motifs and rich pallu work."
  },
  {
    id: 5,
    name: "Embroidered Kurta Set",
    price: 4290,
    type: "new",
    category: "readymade-dresses",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=500&fit=crop",
    isNew: true,
    fabric: "Cotton Blend",
    size: "S, M, L, XL",
  },
  {
    id: 6,
    name: "Festive Palazzo Suit",
    price: 5990,
    type: "new",
    category: "readymade-dresses",
    subcategory: "co-ord-sets",
    image: "https://images.unsplash.com/photo-1609748340878-acb8ed3eee7a?w=400&h=500&fit=crop",
    isNew: true,
    fabric: "Rayon",
  },
  {
    id: 7,
    name: "Cotton Printed Suit",
    price: 2990,
    type: "new",
    category: "unstitched-fabric",
    subcategory: "cotton-premium",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop",
    isNew: true,
    fabric: "Pure Cotton",
    care: "Machine Washable",
  },
  {
    id: 8,
    name: "Georgette Sharara Set",
    price: 7490,
    type: "new",
    category: "readymade-dresses",
    subcategory: "partywear-suits",
    image: "https://images.unsplash.com/photo-1594938328870-9623159c8c99?w=400&h=500&fit=crop",
    isNew: true,
    fabric: "Georgette",
  },
  {
    id: 9,
    name: "Heavy Bridal Dupatta",
    price: 3990,
    type: "bestseller",
    category: "occasion-wear",
    subcategory: "bridal-lehanga",
    image: "https://images.unsplash.com/photo-1610030469668-9d1b2b6c3c6d?w=400&h=500&fit=crop",
    fabric: "Net with Heavy Embroidery",
  },
  {
    id: 10,
    name: "Pathani Kurta Set",
    price: 4490,
    type: "bestseller",
    category: "mens-wear",
    subcategory: "kurta-pajama",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=500&fit=crop",
    fabric: "Cotton Silk",
    size: "S, M, L, XL, XXL",
  },
  {
    id: 11,
    name: "Chanderi Silk Suit",
    price: 6790,
    type: "bestseller",
    category: "unstitched-fabric",
    subcategory: "designer-suit",
    image: "https://images.unsplash.com/photo-1604006852748-903fccbc4019?w=400&h=500&fit=crop",
    fabric: "Chanderi Silk",
  },
  {
    id: 12,
    name: "Velvet Sherwani",
    price: 18990,
    originalPrice: 24990,
    type: "bestseller",
    category: "mens-wear",
    subcategory: "sherwani",
    image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=500&fit=crop",
    discount: 25,
    fabric: "Premium Velvet",
    size: "M, L, XL, XXL",
  },
  {
    id: 13,
    name: "Engagement Gown Collection",
    price: 34990,
    originalPrice: 44990,
    type: "featured",
    category: "occasion-wear",
    subcategory: "engagement-gown",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
    discount: 22,
    fabric: "Raw Silk with Resham Work",
    isNew: true,
    description: "Stunning engagement gown with exquisite hand embroidery and modern silhouette."
  },
  {
    id: 14,
    name: "Mehandi Special Suit",
    price: 8990,
    type: "new",
    category: "occasion-wear",
    subcategory: "mehandi",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop",
    isNew: true,
    colors: [
      { name: "Green", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop", price: 8990 },
      { name: "Yellow", image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=500&fit=crop", price: 8990 },
    ],
    fabric: "Silk Blend",
  },
  {
    id: 15,
    name: "Haldi Ceremony Outfit",
    price: 7490,
    type: "new",
    category: "occasion-wear",
    subcategory: "haldi",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=500&fit=crop",
    isNew: true,
    fabric: "Cotton Silk",
  },
  {
    id: 16,
    name: "Indo Western Gown",
    price: 11990,
    type: "featured",
    category: "indo-western-cat",
    image: "https://images.unsplash.com/photo-1609748340878-acb8ed3eee7a?w=400&h=500&fit=crop",
    fabric: "Imported Fabric",
    description: "Perfect fusion of Indian and Western styles for the modern woman."
  },
  {
    id: 17,
    name: "Nehru Jacket Set",
    price: 6990,
    type: "bestseller",
    category: "mens-wear",
    subcategory: "nehru-jackets",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=500&fit=crop",
    fabric: "Cotton Silk",
    size: "S, M, L, XL",
  },
  {
    id: 18,
    name: "Ready to Wear Saree",
    price: 4990,
    type: "new",
    category: "sarees",
    subcategory: "ready-to-wear",
    image: "https://images.unsplash.com/photo-1610189025028-2a58f49d8f78?w=400&h=500&fit=crop",
    isNew: true,
    fabric: "Lycra",
    description: "Pre-pleated, ready to wear saree for the busy modern woman."
  },
  {
    id: 19,
    name: "Bridal Lehenga with Trail",
    price: 45990,
    originalPrice: 55990,
    type: "featured",
    category: "occasion-wear",
    subcategory: "bridal-lehanga",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop",
    discount: 18,
    fabric: "Heavy Satin Silk",
    description: "Statement bridal lehenga with beautiful trail and heavy embellishments."
  },
  {
    id: 20,
    name: "Kurta Pajama Set",
    price: 3490,
    type: "bestseller",
    category: "mens-wear",
    subcategory: "kurta-pajama",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
    fabric: "Pure Cotton",
    size: "S, M, L, XL, XXL",
    care: "Machine Washable",
  },
  {
    id: 21,
    name: "Printed Palazzo Set",
    price: 2490,
    type: "new",
    category: "readymade-dresses",
    subcategory: "co-ord-sets",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop",
    isNew: true,
    fabric: "Rayon",
  },
  {
    id: 22,
    name: "Heavy Embroidered Suit",
    price: 9990,
    type: "featured",
    category: "unstitched-fabric",
    subcategory: "bridal-suits",
    image: "https://images.unsplash.com/photo-1594938328870-9623159c8c99?w=400&h=500&fit=crop",
    fabric: "Faux Georgette with Santoon",
  },
  {
    id: 23,
    name: "Wedding Sherwani Collection",
    price: 22990,
    originalPrice: 28990,
    type: "featured",
    category: "mens-wear",
    subcategory: "sherwani",
    image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=500&fit=crop",
    discount: 21,
    fabric: "Brocade Silk",
    colors: [
      { name: "Cream", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=500&fit=crop", price: 22990 },
      { name: "Maroon", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop", price: 23990 },
    ],
  },
  {
    id: 24,
    name: "Chikankari Cotton Suit",
    price: 5490,
    type: "bestseller",
    category: "unstitched-fabric",
    subcategory: "cotton-premium",
    image: "https://images.unsplash.com/photo-1604006852748-903fccbc4019?w=400&h=500&fit=crop",
    fabric: "Pure Cotton with Chikankari",
    care: "Hand Wash Recommended",
  },
  {
    id: 25,
    name: "Cocktail Night Gown",
    price: 15990,
    type: "featured",
    category: "occasion-wear",
    subcategory: "cocktail-night",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
    fabric: "Sequin Georgette",
    description: "Glamorous cocktail gown perfect for evening parties."
  },
  {
    id: 26,
    name: "Designer Bridal Saree",
    price: 18990,
    originalPrice: 24990,
    type: "featured",
    category: "sarees",
    subcategory: "bridal-sarees",
    image: "https://images.unsplash.com/photo-1610189025028-2a58f49d8f78?w=400&h=500&fit=crop",
    discount: 24,
    fabric: "Kanjivaram Silk",
  },
  {
    id: 27,
    name: "Jodhpuri Suit",
    price: 12990,
    type: "new",
    category: "mens-wear",
    subcategory: "jodhpuri-suits",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
    isNew: true,
    fabric: "Terry Wool",
    size: "S, M, L, XL, XXL",
  },
  {
    id: 28,
    name: "Party Wear Blazer",
    price: 8990,
    type: "new",
    category: "mens-wear",
    subcategory: "party-wear-blazers",
    image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=500&fit=crop",
    isNew: true,
    fabric: "Velvet",
  },
];

export const brands = [
  { id: 1, name: "Shree Balaji Exclusive", logo: "✨" },
  { id: 2, name: "Royal Ethnic", logo: "👑" },
  { id: 3, name: "Vastra Luxe", logo: "💎" },
  { id: 4, name: "Balaji Bridal", logo: "💍" },
  { id: 5, name: "Heritage Menswear", logo: "🎩" },
  { id: 6, name: "Festive Finesse", logo: "🌟" },
];

// Customer Reviews
export const customerReviews = [
  {
    id: 1,
    name: "Priya Sharma",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
    review: "Amazing collection of bridal lehengas! Got my dream outfit for my wedding.",
    location: "Delhi",
  },
  {
    id: 2,
    name: "Anjali Verma",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
    review: "Best ethnic wear store in Rohtak. Quality and service both are exceptional.",
    location: "Rohtak",
  },
  {
    id: 3,
    name: "Meera Gupta",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    rating: 5,
    review: "Loved the Banarasi saree collection. Authentic and beautiful designs.",
    location: "Gurgaon",
  },
  {
    id: 4,
    name: "Sunita Rani",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    rating: 5,
    review: "Perfect place for wedding shopping. Custom tailoring service is excellent.",
    location: "Sonipat",
  },
];

// Store Information
export const storeInfo = {
  name: "Shree Balaji Vastralya",
  tagline: "(Sanghi Wale)",
  gst: "06AAUPK8751E1ZB",
  address: {
    street: "Railway Road",
    area: "",
    city: "Rohtak",
    state: "Haryana",
    pincode: "124001",
    full: "Shree Balaji Vastralya (Sanghi Wale), Railway Road, Rohtak-124001"
  },
  phone: "079889 49131",
  phoneLink: "tel:07988949131",
  email: "support@Shreebalajivastralya.com",
  distance: "1 hr 43 mins from Delhi",
  social: {
    instagram: "https://www.instagram.com/reel/DATKa-yyl2E/",
    youtube: "https://www.youtube.com/@shreebalajivastralya",
    facebook: "https://www.facebook.com/ShreeBalajiVastralya/",
  },
  description: "Rooted in tradition since 1974, Shree Balaji Vastralya has been dressing generations with trust, style, and craftsmanship. What began as a small family-run showroom has grown into a destination where families come to shop for their most special moments."
};
