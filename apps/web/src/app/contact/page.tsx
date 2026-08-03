'use client';

import Navbar from '../../components/Navbar';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Film, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export default function ContactPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [defaultDetails, setDefaultDetails] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('orderId');
      if (orderId) {
        setDefaultDetails(`Hello 👋🏻 Piks Media,\n\nI need help updating the customized photo for my Order #${orderId}. Please assist with replacing the uploaded image.`);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const newRequest = {
      id: `CR-${Math.floor(Math.random() * 10000)}`,
      name: formData.get('name'),
      email: formData.get('email'),
      mobile: formData.get('mobile'),
      width: formData.get('width'),
      height: formData.get('height'),
      details: formData.get('details'),
      status: 'new',
      date: new Date().toISOString(),
      images: files.map(file => URL.createObjectURL(file))
    };

    const existing = JSON.parse(localStorage.getItem('piks_contact_requests') || '[]');
    localStorage.setItem('piks_contact_requests', JSON.stringify([newRequest, ...existing]));

    setShowSuccess(true);
    formRef.current?.reset();
    setFiles([]);
  };
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-20">
      {/* Navigation */}
      <Navbar className="w-full z-50 py-4 px-8 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-stone-200 sticky top-0" />

      {/* Header Section */}
      <section className="relative pt-12 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Ready to bring your vision to life? Fill out the form below with your requirements, and our design team will get back to you with a quote within 24 hours*.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="bg-white border-y border-stone-200 py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-12">

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 bg-[#FDFBF7] p-8 md:p-10 rounded-3xl border border-stone-100 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Name *</label>
              <input type="text" name="name" required className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all" placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
              <input type="email" name="email" className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all" placeholder="john@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Mobile Number *</label>
              <input type="tel" name="mobile" required className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all" placeholder="+91 98765 43210" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Width (inches)</label>
                <input type="number" name="width" className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all" placeholder="18" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Height (inches)</label>
                <input type="number" name="height" className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all" placeholder="24" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Project Details & Preferences *</label>
              <textarea
                name="details"
                required
                rows={4}
                value={defaultDetails}
                onChange={(e) => setDefaultDetails(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all resize-none"
                placeholder="I'm looking for a solid oak frame with a 2-inch white matting..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Images & Videos (Optional)</label>
              <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-stone-50 file:text-stone-900 hover:file:bg-stone-100" />

              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {files.map((file, index) => (
                    <div key={index} className="relative group bg-white border border-stone-200 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 bg-stone-50 border border-stone-100 rounded-lg flex items-center justify-center text-stone-400 overflow-hidden">
                        {file.type.startsWith('video/') ? (
                          <Film className="w-5 h-5" />
                        ) : file.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{file.name}</p>
                        <p className="text-xs text-stone-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button type="button" onClick={() => removeFile(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-stone-800">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="w-full bg-stone-900 text-white py-4 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10">
              Submit Request
            </button>
          </form>
        </div>
      </section>

      {/* Success Popup Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-3">Request Submitted!</h3>
            <p className="text-stone-600 mb-8">
              Thank you for reaching out. Our design team has received your custom frame request and will be in touch with a quote within 24 hours*.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
