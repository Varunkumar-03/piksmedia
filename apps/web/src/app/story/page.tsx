'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Heart, Star, Award, ShieldCheck, Sparkles, Truck, Ruler } from 'lucide-react';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const DEFAULT_CONTENT = {
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

const featureIcons = [Sparkles, Ruler, Truck, ShieldCheck];
const coreValueIcons = [Heart, Star, Award];

export default function WhyUsPage() {
  const [content, setContent] = useState<any>(DEFAULT_CONTENT);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings/why-us`);
        if (res.data?.success && res.data?.data) {
          setContent((prev: any) => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error('Failed to load Why Us page settings', err);
      }
    };
    fetchContent();
  }, []);

  const hero = content.hero || DEFAULT_CONTENT.hero;
  const features = content.features || DEFAULT_CONTENT.features;
  const showcase = content.showcase || DEFAULT_CONTENT.showcase;
  const coreValues = content.coreValues || DEFAULT_CONTENT.coreValues;
  const founder = content.founder || DEFAULT_CONTENT.founder;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-20">
      {/* Navigation */}
      <Navbar className="w-full z-50 py-4 px-8 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-stone-200 sticky top-0" />

      {/* Hero Section */}
      <section className="relative pt-6 pb-12 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-stone-100 via-transparent to-transparent opacity-70"></div>
        <div className="max-w-3xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="text-xs uppercase tracking-widest font-semibold text-stone-500 mb-3 block">{hero.tagline || 'The Piks Advantage'}</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            {(hero.title || 'Why Piks Media?').includes('Piks Media') ? (
              <>
                {(hero.title || 'Why Piks Media?').split('Piks Media')[0]}
                <span className="text-stone-500 italic font-serif">Piks Media</span>
                {(hero.title || 'Why Piks Media?').split('Piks Media')[1]}
              </>
            ) : (
              hero.title || 'Why Piks Media?'
            )}
          </h1>
          <p className="text-lg md:text-xl text-stone-600 mb-8 leading-relaxed whitespace-pre-wrap">
            {hero.description}
          </p>
        </div>
      </section>

      {/* Feature Grid: Key Reasons */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {(features || []).map((feat: any, idx: number) => {
            const IconComp = featureIcons[idx % featureIcons.length];
            return (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mb-6 text-stone-900">
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Image Showcase */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 aspect-[16/9] rounded-3xl overflow-hidden bg-stone-200 animate-in fade-in slide-in-from-left-4 duration-1000 delay-150">
            <img src={showcase.image1 || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000'} alt="Craftsmanship" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="aspect-square md:aspect-auto rounded-3xl overflow-hidden bg-stone-200 animate-in fade-in slide-in-from-right-4 duration-1000 delay-300">
            <img src={showcase.image2 || 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=800'} alt="Details" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 mb-24">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-16">Our Core Values</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {(coreValues || []).map((val: any, idx: number) => {
            const IconComp = coreValueIcons[idx % coreValueIcons.length];
            return (
              <div key={idx} className="text-center group">
                <div className="w-16 h-16 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-stone-900 group-hover:text-white transition-all duration-300">
                  <IconComp className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{val.title}</h3>
                <p className="text-stone-600 whitespace-pre-wrap">{val.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Founder Section */}
      <section className="bg-stone-900 text-stone-50 py-10 md:py-12 rounded-3xl max-w-5xl mx-auto px-6 md:px-10 my-12 shadow-xl border border-stone-800">
        <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-12">
          <div className="w-44 md:w-56 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden relative shadow-lg border border-stone-700/60">
            <img src={founder.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800'} alt={founder.name || 'Founder'} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 text-stone-100 leading-snug">
              {founder.quote}
            </h2>
            <p className="text-stone-400 text-sm md:text-base mb-6 leading-relaxed whitespace-pre-wrap">
              {founder.description}
            </p>
            <div className="border-t border-stone-800/80 pt-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-base text-stone-200">{founder.name}</p>
                <p className="text-stone-500 text-xs font-medium">{founder.role}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to experience the Piks difference?</h2>
        <p className="text-stone-600 mb-10 max-w-lg mx-auto">Explore our curated collection of custom frames and find the perfect match for your home.</p>
        <Link href="/shop" className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-full font-medium hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/20">
          Shop Collection <ChevronRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
