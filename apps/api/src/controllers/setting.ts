import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Setting from '../models/Setting';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(__dirname, '../../data/settings.json');

const readLocalSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading local settings', err);
  }
  return {};
};

const writeLocalSettings = (settings: any) => {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local settings', err);
  }
};

const DEFAULT_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=300&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&q=80",
  "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=300&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&q=80",
  "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=300&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80",
  "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=300&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&q=80",
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=300&q=80",
  "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=300&q=80",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=300&q=80",
  "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=300&q=80",
  "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=300&q=80"
];

export const getHeroImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      res.status(200).json({ success: true, data: localSettings['hero_images'] || DEFAULT_HERO_IMAGES });
      return;
    }

    const setting = await Setting.findOne({ key: 'hero_images' });
    
    if (!setting) {
      res.status(200).json({ success: true, data: DEFAULT_HERO_IMAGES });
      return;
    }

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateHeroImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { images } = req.body;
    
    if (!images || !Array.isArray(images) || images.length !== 20) {
      res.status(400).json({ success: false, error: 'Exactly 20 images are required' });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      localSettings['hero_images'] = images;
      writeLocalSettings(localSettings);
      res.status(200).json({ success: true, data: images });
      return;
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'hero_images' },
      { value: images },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const DEFAULT_LANDING_PAGE_IMAGES = {
  curation: [
    "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520333789090-1afc82db536a?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"
  ],
  bestSellers: [
    "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1577083165275-c0f5f7eb75bb?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop"
  ],
  community: [
    "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop"
  ]
};

export const getLandingPageImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      res.status(200).json({ success: true, data: localSettings['landing_page_images'] || DEFAULT_LANDING_PAGE_IMAGES });
      return;
    }

    const setting = await Setting.findOne({ key: 'landing_page_images' });
    
    if (!setting) {
      res.status(200).json({ success: true, data: DEFAULT_LANDING_PAGE_IMAGES });
      return;
    }

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateLandingPageImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { images } = req.body;
    
    if (!images || typeof images !== 'object') {
      res.status(400).json({ success: false, error: 'Images object is required' });
      return;
    }

    // Basic validation
    if (!Array.isArray(images.curation) || !Array.isArray(images.bestSellers) || !Array.isArray(images.community)) {
      res.status(400).json({ success: false, error: 'Images object must contain curation, bestSellers, and community arrays' });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      localSettings['landing_page_images'] = images;
      writeLocalSettings(localSettings);
      res.status(200).json({ success: true, data: images });
      return;
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'landing_page_images' },
      { value: images },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const DEFAULT_TESTIMONIALS = [
  {
    id: '1',
    authorName: 'Sarah Jenkins',
    text: 'The quality of these frames is unmatched. They transformed my simple photos into gallery-worthy art pieces. Absolutely stunning craftsmanship.',
    rating: 5,
    verified: true,
    initials: 'SJ'
  },
  {
    id: '2',
    authorName: 'Michael Chen',
    text: 'I ordered the custom walnut frame for our wedding photo and it exceeded all expectations. The wood grain is beautiful and the mounting is perfect.',
    rating: 5,
    verified: true,
    initials: 'MC'
  },
  {
    id: '3',
    authorName: 'Emily Rodriguez',
    text: 'Piks makes gifting so easy. I sent a framed memory to my parents for their anniversary and they were moved to tears. Thank you!',
    rating: 5,
    verified: true,
    initials: 'ER'
  }
];

export const getTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      res.status(200).json({ success: true, data: localSettings['testimonials'] || DEFAULT_TESTIMONIALS });
      return;
    }

    const setting = await Setting.findOne({ key: 'testimonials' });
    
    if (!setting) {
      res.status(200).json({ success: true, data: DEFAULT_TESTIMONIALS });
      return;
    }

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testimonials } = req.body;
    
    if (!testimonials || !Array.isArray(testimonials)) {
      res.status(400).json({ success: false, error: 'Testimonials array is required' });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      localSettings['testimonials'] = testimonials;
      writeLocalSettings(localSettings);
      res.status(200).json({ success: true, data: testimonials });
      return;
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'testimonials' },
      { value: testimonials },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const DEFAULT_FOOTER_SETTINGS = {
  brand: {
    name: 'Piks Media',
    description: 'Transforming your cherished memories into museum-quality, handcrafted frames. We believe every great moment deserves a beautiful display.',
    email: 'hello@piksmedia.com',
    phone: '+91 (800) 123-4567',
    address: '123 Gallery Lane, Art District\nMumbai, MH 400001'
  },
  shopLinks: [
    { label: 'All Frames', url: '/shop' },
    { label: 'Custom Framing', url: '/custom' },
    { label: 'Best Sellers', url: '/shop?category=bestsellers' },
    { label: 'New Arrivals', url: '/shop?category=new' },
    { label: 'Gift Cards', url: '/gift-cards' }
  ],
  supportLinks: [
    { label: 'Why Us?', url: '/story' },
    { label: 'FAQs', url: '/faq' },
    { label: 'Shipping & Returns', url: '/shipping-returns' },
    { label: 'Track Your Order', url: '/track-order' },
    { label: 'Contact Us', url: '/contact' },
    { label: 'Size Guide', url: '/size-guide' }
  ],
  socials: {
    twitter: '#',
    instagram: '#'
  },
  newsletter: {
    title: 'STAY IN THE LOOP',
    description: 'Subscribe for exclusive offers, inspiration, and 10% off your first order.'
  }
};

export const getFooterSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      res.status(200).json({ success: true, data: localSettings['footer_settings'] || DEFAULT_FOOTER_SETTINGS });
      return;
    }

    const setting = await Setting.findOne({ key: 'footer_settings' });
    
    if (!setting) {
      res.status(200).json({ success: true, data: DEFAULT_FOOTER_SETTINGS });
      return;
    }

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateFooterSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { footer } = req.body;
    
    if (!footer) {
      res.status(400).json({ success: false, error: 'Footer data is required' });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      localSettings['footer_settings'] = footer;
      writeLocalSettings(localSettings);
      res.status(200).json({ success: true, data: footer });
      return;
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'footer_settings' },
      { value: footer },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const DEFAULT_LEGAL_SETTINGS = {
  privacyPolicy: "Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information when you use our services.\n\n1. Information Collection\nWe collect information you provide directly to us.\n\n2. Use of Information\nWe use the information we collect to provide, maintain, and improve our services.\n\n3. Contact Us\nIf you have any questions about this Privacy Policy, please contact us.",
  termsOfService: "Welcome to Piks Media. By accessing or using our website, you agree to be bound by these Terms of Service.\n\n1. Use of Services\nYou agree to use our services only for lawful purposes.\n\n2. Intellectual Property\nAll content on this website is the property of Piks Media.\n\n3. Limitation of Liability\nPiks Media shall not be liable for any indirect, incidental, or consequential damages.\n\n4. Changes to Terms\nWe reserve the right to modify these terms at any time.",
  privacyPolicyUpdatedAt: new Date().toISOString(),
  termsOfServiceUpdatedAt: new Date().toISOString()
};

export const getLegalSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      res.status(200).json({ success: true, data: localSettings['legal_settings'] || DEFAULT_LEGAL_SETTINGS });
      return;
    }

    const setting = await Setting.findOne({ key: 'legal_settings' });
    
    if (!setting) {
      res.status(200).json({ success: true, data: DEFAULT_LEGAL_SETTINGS });
      return;
    }

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateLegalSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { legal } = req.body;
    
    if (!legal) {
      res.status(400).json({ success: false, error: 'Legal data is required' });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      localSettings['legal_settings'] = legal;
      writeLocalSettings(localSettings);
      res.status(200).json({ success: true, data: legal });
      return;
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'legal_settings' },
      { value: legal },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDeliveryLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      res.status(200).json({ success: true, data: localSettings['delivery_locations'] || [] });
      return;
    }

    let setting = await Setting.findOne({ key: 'delivery_locations' });
    if (!setting) {
      setting = await Setting.create({ key: 'delivery_locations', value: [] });
    }

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDeliveryLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locations } = req.body;
    
    if (!Array.isArray(locations)) {
      res.status(400).json({ success: false, error: 'Locations array is required' });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      localSettings['delivery_locations'] = locations;
      writeLocalSettings(localSettings);
      res.status(200).json({ success: true, data: locations });
      return;
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'delivery_locations' },
      { value: locations },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const DEFAULT_WHY_US_SETTINGS = {
  hero: {
    tagline: 'The Piks Advantage',
    title: 'Why Piks Media?',
    description: 'Every frame in our collection is premium-imported and meticulously handcrafted, while all our featured artworks, sketches, and paintings are individually hand-drawn and hand-painted by master artists. We combine authentic craftsmanship with museum-grade materials to elevate your space into a living gallery.'
  },
  features: [
    { title: 'Imported & Handcrafted', description: 'Every single frame is imported from premier workshops and meticulously assembled by hand for unmatched precision.' },
    { title: 'Hand-Drawn Artwork', description: 'All paintings and portrait sketches are 100% hand-drawn and hand-painted by skilled artists with fine brushwork.' },
    { title: 'Pincode Delivery', description: 'Enjoy verified delivery checking across major pincodes with free delivery options available for qualifying orders.' },
    { title: 'Zero Risk Guarantee', description: 'If your frame or artwork arrives damaged or with any flaw, our team replaces it immediately at no extra cost.' }
  ],
  showcase: {
    image1: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000',
    image2: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=800'
  },
  coreValues: [
    { title: 'Made with Love', description: 'Every frame is hand-assembled by our team of artisans who care about your memories as much as you do.' },
    { title: 'Premium Quality', description: 'We source only the finest sustainable woods, acid-free mats, and UV-protective acrylic to ensure longevity.' },
    { title: 'Lifetime Guarantee', description: 'We stand by our craftsmanship. If anything ever goes wrong with your frame, we\'ll make it right.' }
  ],
  founder: {
    quote: '"Frames shouldn\'t just hold pictures, they should elevate your space."',
    description: 'When I couldn\'t find a high-quality, modern frame for my parents\' anniversary portrait, I decided to build one myself. What started in a small workshop has grown into Piks Media, helping thousands beautifully display their favorite moments.',
    name: 'Varun',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800'
  }
};

export const getWhyUsSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      res.status(200).json({ success: true, data: localSettings['why_us'] || DEFAULT_WHY_US_SETTINGS });
      return;
    }

    let setting = await Setting.findOne({ key: 'why_us' });
    if (!setting) {
      setting = await Setting.create({ key: 'why_us', value: DEFAULT_WHY_US_SETTINGS });
    }

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateWhyUsSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { whyUs } = req.body;
    
    if (!whyUs) {
      res.status(400).json({ success: false, error: 'whyUs settings object is required' });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      localSettings['why_us'] = whyUs;
      writeLocalSettings(localSettings);
      res.status(200).json({ success: true, data: whyUs });
      return;
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'why_us' },
      { value: whyUs },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      res.status(200).json({ success: true, data: localSettings['coupons'] || [] });
      return;
    }

    const setting = await Setting.findOne({ key: 'coupons' });
    if (!setting) {
      res.status(200).json({ success: true, data: [] });
      return;
    }
    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { coupons } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      localSettings['coupons'] = coupons;
      writeLocalSettings(localSettings);
      res.status(200).json({ success: true, data: coupons });
      return;
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'coupons' },
      { value: coupons },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOffers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      res.status(200).json({ success: true, data: localSettings['offers'] || [] });
      return;
    }

    const setting = await Setting.findOne({ key: 'offers' });
    if (!setting) {
      res.status(200).json({ success: true, data: [] });
      return;
    }
    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateOffers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { offers } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      localSettings['offers'] = offers;
      writeLocalSettings(localSettings);
      res.status(200).json({ success: true, data: offers });
      return;
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'offers' },
      { value: offers },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const DEFAULT_SHIPPING_RETURN_ADDRESS = {
  companyName: "PIKS MEDIA INDUSTRIES-",
  addressLine1: "75C DLF Industrial Area Phase 1 old Share Sha Sun Road",
  addressLine2: "Faridabad Haryana 121003. Faridabad - 121003, Haryana, INDIA."
};

export const getShippingReturnAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      res.status(200).json({ success: true, data: localSettings['shipping_return_address'] || DEFAULT_SHIPPING_RETURN_ADDRESS });
      return;
    }

    const setting = await Setting.findOne({ key: 'shipping_return_address' });
    
    if (!setting) {
      res.status(200).json({ success: true, data: DEFAULT_SHIPPING_RETURN_ADDRESS });
      return;
    }

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateShippingReturnAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.body;
    
    if (!address) {
      res.status(400).json({ success: false, error: 'Address data is required' });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      const localSettings = readLocalSettings();
      localSettings['shipping_return_address'] = address;
      writeLocalSettings(localSettings);
      res.status(200).json({ success: true, data: address });
      return;
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'shipping_return_address' },
      { value: address },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: setting.value });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
