import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category';
import Subcategory from '../models/Subcategory';

dotenv.config();

const categoriesData = [
  {
    name: 'New Arrival',
    slug: 'new-arrival',
    description: 'Latest arrivals in ethnic and bridal wear',
    sortOrder: 1,
    subcategories: []
  },
  {
    name: 'Best Seller',
    slug: 'best-seller',
    description: 'Our most popular products',
    sortOrder: 2,
    subcategories: []
  },
  {
    name: "Men's Wear",
    slug: 'mens-wear',
    description: 'Traditional and modern menswear collection',
    sortOrder: 3,
    subcategories: [
      { name: 'Sherwani', slug: 'sherwani' },
      { name: 'Indo-Western', slug: 'mens-indo-western' },
      { name: 'Jodhpuri Suits', slug: 'jodhpuri-suits' },
      { name: 'Tuxedos', slug: 'tuxedos' },
      { name: 'Party Wear Blazers', slug: 'party-wear-blazers' },
      { name: 'Nehru Jackets', slug: 'nehru-jackets' },
      { name: 'Kurta Pajama', slug: 'kurta-pajama' },
      { name: 'Formal Blazers', slug: 'formal-blazers' }
    ]
  },
  {
    name: 'Indo-Western',
    slug: 'indo-western',
    description: 'Fusion of Indian and Western styles',
    sortOrder: 4,
    subcategories: []
  },
  {
    name: 'Readymade Dresses',
    slug: 'readymade-dresses',
    description: 'Ready to wear designer dresses',
    sortOrder: 5,
    subcategories: [
      { name: 'Anarkali Suits', slug: 'anarkali-suits' },
      { name: 'Formal Suits', slug: 'formal-suits' },
      { name: 'Partywear Suits', slug: 'partywear-suits' },
      { name: 'Co-ord Sets', slug: 'co-ord-sets' },
      { name: 'Crop Top', slug: 'crop-top' },
      { name: 'Gowns', slug: 'gowns' },
      { name: 'Tunics', slug: 'tunics' }
    ]
  },
  {
    name: 'Sarees',
    slug: 'sarees',
    description: 'Elegant saree collection',
    sortOrder: 6,
    subcategories: [
      { name: 'Bridal Sarees', slug: 'bridal-sarees' },
      { name: 'Silk Sarees', slug: 'silk-sarees' },
      { name: 'Designer Sarees', slug: 'designer-sarees' },
      { name: 'Ready to Wear', slug: 'ready-to-wear-sarees' },
      { name: 'Formal Sarees', slug: 'formal-sarees' }
    ]
  },
  {
    name: 'Occasion Wear',
    slug: 'occasion-wear',
    description: 'Special occasion outfits',
    sortOrder: 7,
    subcategories: [
      { name: 'Bridal Lehanga', slug: 'bridal-lehanga' },
      { name: 'Engagement Gown', slug: 'engagement-gown' },
      { name: 'Designer Lehanga', slug: 'designer-lehanga' },
      { name: 'Haldi', slug: 'haldi' },
      { name: 'Mehandi', slug: 'mehandi' },
      { name: 'Cocktail Night', slug: 'cocktail-night' }
    ]
  },
  {
    name: 'Unstitched Suits',
    slug: 'unstitched-suits',
    description: 'Unstitched fabric collections',
    sortOrder: 8,
    subcategories: [
      { name: 'Bridal Suits', slug: 'bridal-suits' },
      { name: 'Designer Suit', slug: 'designer-suit' },
      { name: 'Formal Suit', slug: 'formal-suit-unstitched' },
      { name: 'Cotton Premium', slug: 'cotton-premium' }
    ]
  }
];

async function seedCategories() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in environment');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    for (const catData of categoriesData) {
      let category = await Category.findOne({ slug: catData.slug });
      
      if (!category) {
        category = await Category.create({
          name: catData.name,
          slug: catData.slug,
          description: catData.description,
          sortOrder: catData.sortOrder,
          isActive: true
        });
        console.log(`Created category: ${catData.name}`);
      } else {
        console.log(`Category exists: ${catData.name}`);
      }

      for (let i = 0; i < catData.subcategories.length; i++) {
        const subData = catData.subcategories[i];
        const existingSub = await Subcategory.findOne({ slug: subData.slug });
        
        if (!existingSub) {
          await Subcategory.create({
            categoryId: category._id,
            name: subData.name,
            slug: subData.slug,
            sortOrder: i + 1,
            isActive: true
          });
          console.log(`  Created subcategory: ${subData.name}`);
        } else {
          console.log(`  Subcategory exists: ${subData.name}`);
        }
      }
    }

    console.log('\nSeeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedCategories();
