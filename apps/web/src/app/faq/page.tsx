'use client';

import Navbar from '../../components/Navbar';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const defaultFaqs = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        q: "How long will it take to receive my custom frame?",
        a: "Typically, custom frames take 3-5 business days to craft. Shipping takes an additional 2-4 days depending on your location. You will receive a tracking number once your order is on its way."
      },
      {
        q: "Do you offer international shipping?",
        a: "Currently, we only ship within the contiguous United States to ensure our frames arrive in perfect condition without exorbitant shipping costs."
      }
    ]
  },
  {
    category: "Products & Materials",
    questions: [
      {
        q: "What type of glass do you use?",
        a: "We offer three types of glazing: Standard Acrylic (lightweight and shatter-resistant), Non-Glare Acrylic, and premium Museum Glass (99% UV protection and virtually invisible)."
      },
      {
        q: "Are the frames made of real wood?",
        a: "Yes, all our wooden frames are crafted from solid wood mouldings sourced from sustainable forests."
      }
    ]
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        q: "What if my frame arrives damaged?",
        a: "If your frame arrives damaged, please contact us within 48 hours of delivery with photos of the damage and the packaging. We will expedite a replacement to you at no additional cost."
      },
      {
        q: "Can I return a custom frame?",
        a: "Because custom frames are made specifically to your dimensions, we cannot accept returns for buyer's remorse or measurement errors. However, if we made a mistake, we will make it right."
      }
    ]
  }
];

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<any[]>(defaultFaqs);

  // Load from localStorage if available
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('piks_support_content');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.faqs && JSON.stringify(faqs) !== JSON.stringify(parsed.faqs)) {
        setFaqs(parsed.faqs);
      }
    }
  }

  const toggleQuestion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-20">
      <Navbar className="w-full z-50 py-4 px-8 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-stone-200 sticky top-0" />

      <section className="relative pt-12 pb-12 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-stone-600">
            Find answers to our most common questions below. If you can't find what you're looking for, feel free to contact our support team.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 md:px-12 pb-20">
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          {faqs.map((category, catIdx) => (
            <div key={catIdx}>
              <h2 className="text-2xl font-bold text-stone-900 mb-6">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((item: any, qIdx: number) => {
                  const id = `${catIdx}-${qIdx}`;
                  const isOpen = openIndex === id;
                  return (
                    <div key={qIdx} className="bg-white border border-stone-200 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
                      <button
                        onClick={() => toggleQuestion(id)}
                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                      >
                        <span className="font-semibold text-lg text-stone-900">{item.q}</span>
                        <ChevronDown className={`w-5 h-5 text-stone-500 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-6 pt-0 text-stone-600 leading-relaxed">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
