'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/useToast';

interface Service {
  id: string;
  name: string;
  description: string;
  pricing: number;
  image_urls: string[];
  category: string;
}

interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  service_category: string;
}

interface ColorCard {
  id: string;
  name: string;
  hex: string;
  brand: string;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  createdAt?: string;
}

interface HomePageClientProps {
  featuredServices: Service[];
  recentGallery: GalleryItem[];
  colorCards?: ColorCard[];
  reviews?: Review[];
}

export default function HomePageClient({ featuredServices, recentGallery, colorCards = [], reviews = [] }: HomePageClientProps) {
  const [showPreloader, setShowPreloader] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeClass, setFadeClass] = useState('opacity-100');

  const slides = [
    { src: '/front.jpg', title: 'Welcome to Madina Paint Store', subtitle: 'Khanewal’s Premium Paint & Spectrometer Color Matching Destination' },
    { src: '/storefront.jpg', title: 'Professional Site Consultations', subtitle: 'Schedule an estimate with our vetted local painting experts' },
    { src: '/interior.jpg', title: 'Top International & Local Brands', subtitle: 'Authorized Dealer of Master, Berger, ICI Dulux, Jotun & More' }
  ];

  // Check sessionStorage on load to skip if already shown in this session
  useEffect(() => {
    const isShown = sessionStorage.getItem('preloader_shown');
    if (isShown) {
      setShowPreloader(false);
    }
  }, []);

  // Slideshow interval
  useEffect(() => {
    if (!showPreloader) return;
    const interval = setInterval(() => {
      setFadeClass('opacity-0');
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setFadeClass('opacity-100');
      }, 500);
    }, 4500);

    return () => clearInterval(interval);
  }, [showPreloader]);

  const handleEnterStore = () => {
    sessionStorage.setItem('preloader_shown', 'true');
    const overlay = document.getElementById('preloader-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transform = 'scale(1.05)';
      setTimeout(() => {
        setShowPreloader(false);
      }, 700);
    }
  };

  // Color Picker State
  const defaultColors = [
    { id: 'd1', name: 'Madina Forest Green', hex: '#2D5016', brand: 'Exclusive Store Color' },
    { id: 'd2', name: 'Imperial Sun Gold', hex: '#E8B44D', brand: 'Premium Gold Finish' },
    { id: 'd3', name: 'Soft Cream Silk', hex: '#FDFBF7', brand: 'ICI Dulux' },
    { id: 'd4', name: 'Jotun Desert Rose', hex: '#C29B96', brand: 'Jotun' },
    { id: 'd5', name: 'Berger Ocean Mist', hex: '#9BB8C2', brand: 'Berger Paints' },
    { id: 'd6', name: 'Master Royal Velvet', hex: '#583F66', brand: 'Master Paints' },
  ];

  const availableColors = colorCards.length > 0 ? colorCards : defaultColors;
  const displayedColors = availableColors.slice(0, 9);
  const [selectedColor, setSelectedColor] = useState(displayedColors[0]);
  const [customColor, setCustomColor] = useState('#2D5016');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyHex = () => {
    const hexToCopy = isCustomMode ? customColor : selectedColor.hex;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hexToCopy)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          fallbackCopyText(hexToCopy);
        });
    } else {
      fallbackCopyText(hexToCopy);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
  };

  const toast = useToast();

  const defaultTestimonials = [
    {
      id: 't1',
      name: 'Muhammad Ali',
      rating: 5,
      text: 'Madina Paint Store provided exceptional service. The spectrometer color matching matched my living room walls perfectly! Vetted painters did a super clean job.',
    },
    {
      id: 't2',
      name: 'Sarah Khan',
      rating: 5,
      text: 'Highly professional team. They helped me choose the right paint grade for my commercial store facade. Recommended for fast and clean painting work.',
    },
    {
      id: 't3',
      name: 'Usman Sheikh',
      rating: 5,
      text: 'Fast, on-time, and reliable estimates. They explained all material differences clearly and completed the job within budget. Very satisfied with my bedroom renovation.',
    }
  ];

  const [activeReviews, setActiveReviews] = useState<Review[]>([]);
  
  useEffect(() => {
    setActiveReviews(reviews.length > 0 ? reviews : defaultTestimonials);
  }, [reviews]);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) {
      toast.error('Please enter your name and review text');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newReviewName,
          rating: newReviewRating,
          text: newReviewText,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      const data = await res.json();

      const localReview: Review = {
        id: data.id,
        name: newReviewName,
        rating: newReviewRating,
        text: newReviewText,
        createdAt: new Date().toISOString(),
      };

      // Add to local state so user sees it instantly at the top
      setActiveReviews((prev) => [localReview, ...prev]);

      toast.success('Thank you! Your review has been submitted.');
      
      // Reset form
      setNewReviewName('');
      setNewReviewRating(5);
      setNewReviewText('');
      setShowReviewForm(false);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      toast.error(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 scroll-smooth">
      {/* Preloader Slideshow Overlay */}
      {showPreloader && (
        <div
          id="preloader-overlay"
          className="fixed inset-0 z-[9999] flex flex-col justify-center items-center text-white select-none transition-all duration-700 ease-out"
          style={{ backgroundColor: '#0A0E06' }}
        >
          {/* Background Slideshow */}
          <div className="absolute inset-0 z-0">
            <div
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out ${fadeClass}`}
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(10,14,6,0.85), rgba(10,14,6,0.9)), url('${slides[currentSlide].src}')`,
              }}
            />
          </div>

          {/* Floating Blur Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <div className="absolute top-10 left-10 w-96 h-96 bg-[#2D5016]/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#E8B44D]/5 rounded-full blur-[100px] animate-pulse"></div>
          </div>

          {/* Overlay Content */}
          <div className="relative z-20 max-w-2xl px-6 text-center flex flex-col items-center">
            <span className="bg-[#E8B44D]/10 border border-[#E8B44D]/30 text-[#E8B44D] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6">
              Khanewal, Punjab
            </span>

            {/* Title & Subtitle */}
            <div className="h-44 md:h-52 flex flex-col justify-center">
              <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight transition-opacity duration-500 ${fadeClass}`}>
                {slides[currentSlide].title}
              </h1>
              <p className={`text-base md:text-lg text-gray-300 max-w-xl mx-auto leading-relaxed transition-opacity duration-500 ${fadeClass}`}>
                {slides[currentSlide].subtitle}
              </p>
            </div>

            {/* Enter CTA Button */}
            <button
              onClick={handleEnterStore}
              className="group relative inline-flex items-center gap-3 bg-[#E8B44D] hover:bg-[#d4a03b] text-gray-900 font-bold px-10 py-4 rounded-full text-base transition duration-300 shadow-[0_8px_30px_rgb(232,180,77,0.3)] hover:shadow-[0_12px_40px_rgb(232,180,77,0.5)] cursor-pointer mt-8"
            >
              <span>Enter Store</span>
              <span className="text-xl transition-transform duration-300 group-hover:translate-x-1.5">➔</span>
              <span className="absolute inset-0 rounded-full border-2 border-[#E8B44D]/40 scale-100 group-hover:scale-110 opacity-100 group-hover:opacity-0 transition duration-500"></span>
            </button>

            {/* Dot Indicators */}
            <div className="flex gap-2.5 mt-16">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'w-8 bg-[#E8B44D]' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1. Hero Section */}
      <section 
        className="relative bg-black text-white py-24 md:py-36 px-4 bg-cover bg-center overflow-hidden border-b border-gray-100"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.75), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-[#2D5016]/10 mix-blend-multiply"></div>
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 drop-shadow-md">
            Professional Painting Services For <span className="text-[#E8B44D]">Your Spaces</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto font-medium drop-shadow">
            Experience perfect spectrometer color matching and premium quality paints. Schedule your consultation with our vetted local painting experts.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/booking"
              className="w-full sm:w-auto bg-[#E8B44D] hover:bg-[#d4a03b] text-gray-900 font-bold px-8 py-3.5 rounded-lg transition shadow-lg cursor-pointer text-center"
            >
              Book Now
            </Link>
            <Link
              href="/gallery"
              className="w-full sm:w-auto border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold px-8 py-3.5 rounded-lg transition-all cursor-pointer text-center"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Featured Services Section */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Featured Services</h2>
            <p className="text-gray-500 mt-2 font-medium">Explore some of our top painting services available to book today.</p>
          </div>

          {featuredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No services loaded. Visit the services catalog for more detail.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredServices.map((service) => (
                <div 
                  key={service.id} 
                  className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-48 bg-gray-100">
                    <OptimizedImage 
                      src={service.image_urls?.[0] || ''} 
                      alt={service.name} 
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{service.description}</p>
                    </div>
                    <div className="mt-4">
                      <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-4">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Starting from</span>
                        <span className="text-xl font-extrabold text-[#2D5016]">Rs. {service.pricing.toLocaleString()}</span>
                      </div>
                      <Link 
                        href="/services"
                        className="block w-full text-center bg-[#2D5016]/10 hover:bg-[#2D5016] hover:text-white text-[#2D5016] py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Color Picker Sub-Section */}
          <div className="border-t border-gray-150 pt-16 mt-16">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-[#2D5016] uppercase tracking-[0.2em] bg-[#2D5016]/10 px-4 py-1.5 rounded-full mb-3 inline-block">
                Digital Spectrometer
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Interactive Color Picker & Matching
              </h3>
              <p className="text-gray-500 mt-2 font-medium max-w-xl mx-auto text-sm">
                Explore our catalog of premium brand shades or mix a custom tone. Select a color to copy its Hex code or book an exact match consultation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200">
              
              {/* Left Column: Preset Color Cards (7 spans) */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-2">Preset Color Cards</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {displayedColors.map((color) => {
                    const isPicked = !isCustomMode && selectedColor.id === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => {
                          setSelectedColor(color);
                          setIsCustomMode(false);
                        }}
                        className={`bg-white p-3 rounded-xl border transition-all duration-200 text-left hover:shadow-md cursor-pointer ${
                          isPicked
                            ? 'border-2 border-[#2D5016] shadow-[0_4px_16px_rgba(45,80,22,0.15)] scale-[1.02]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="h-16 rounded-lg mb-3 shadow-inner border border-gray-100"
                          style={{ backgroundColor: color.hex }}
                        />
                        <h5 className="font-bold text-gray-900 text-xs truncate leading-tight">{color.name}</h5>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 truncate">{color.brand}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Selector trigger */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div>
                    <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Custom Color Scanner</h5>
                    <p className="text-[11px] text-gray-400 mt-0.5">Drag the color wheel to mix any custom shade dynamically.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setIsCustomMode(true);
                      }}
                      className="w-12 h-10 border border-gray-200 rounded-lg p-0 cursor-pointer"
                    />
                    <button
                      onClick={() => setIsCustomMode(true)}
                      className={`px-4 py-2 rounded-lg font-bold text-xs transition duration-200 cursor-pointer ${
                        isCustomMode
                          ? 'bg-[#2D5016] text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      Use Custom
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Selection Preview (5 spans) */}
              <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4 self-start">Active Match Selection</h4>
                
                <div 
                  className="w-full h-44 rounded-xl shadow-inner mb-6 border border-gray-200 relative"
                  style={{ backgroundColor: isCustomMode ? customColor : selectedColor.hex }}
                >
                  <span className="absolute bottom-3 right-3 bg-white/95 text-gray-900 px-3 py-1 rounded-md text-xs font-bold font-mono shadow-sm border border-gray-100">
                    {isCustomMode ? customColor : selectedColor.hex}
                  </span>
                </div>

                <h4 className="text-xl font-extrabold text-gray-900 truncate max-w-full">
                  {isCustomMode ? 'Custom Mixed Shade' : selectedColor.name}
                </h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1 mb-6">
                  {isCustomMode ? 'Personalized Code' : selectedColor.brand}
                </p>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={handleCopyHex}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg text-xs transition cursor-pointer"
                  >
                    {copied ? '✓ Copied' : '📋 Copy Hex'}
                  </button>
                  <Link
                    href={`/booking?service=Color%20Matching&color=${encodeURIComponent(
                      isCustomMode ? customColor : `${selectedColor.name} (${selectedColor.hex})`
                    )}`}
                    className="bg-[#2D5016] hover:bg-[#203a10] text-white font-bold py-3 rounded-lg text-xs transition cursor-pointer flex items-center justify-center"
                  >
                    📅 Match Color
                  </Link>
                </div>
              </div>

              {/* View All Colors Button (Aligned to bottom-right of the container) */}
              <div className="lg:col-span-12 flex justify-end border-t border-gray-150 pt-4 mt-2">
                <Link
                  href="/colors"
                  className="bg-[#2D5016]/10 hover:bg-[#2D5016] text-[#2D5016] hover:text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md"
                >
                  🌈 View All Colors
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us Section */}
      <section className="py-16 md:py-24 px-4 bg-gray-50 border-t border-b border-gray-100">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Why Choose Us</h2>
            <p className="text-gray-500 mt-2 font-medium">Why we are the preferred choice for homeowners and builders in the area.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Experience */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-[#2D5016]/10 text-[#2D5016] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🏆
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Proven Experience</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Years of executing complex industrial coating and decorative house painting setups.
              </p>
            </div>

            {/* Quality */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-[#E8B44D]/15 text-[#d4a03b] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ✨
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Computer-aided spectrometer color matches and durable top-grade paints catalog.
              </p>
            </div>

            {/* Speed */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-[#DC2626]/10 text-[#DC2626] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fast & On-Time</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Disciplined cleanup workflows ensuring schedules are met without disruption.
              </p>
            </div>

            {/* Reliability */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🤝
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Vetted Painters</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Professional local staff committed to transparent pricing and reliable estimate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Recent Gallery Section */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Recent Projects Showcase</h2>
            <p className="text-gray-500 mt-2 font-medium font-sans">A glimpse of our latest completed painting and matching projects.</p>
          </div>

          {recentGallery.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No project showcase loaded. Check back later.</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentGallery.map((item) => (
                  <div 
                    key={item.id}
                    className="group relative overflow-hidden rounded-xl shadow-md border border-gray-100 aspect-video bg-gray-100 cursor-pointer"
                  >
                    <OptimizedImage 
                      src={item.image_url} 
                      alt={item.title} 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-4">
                      <h4 className="text-white font-bold text-sm leading-snug">{item.title}</h4>
                      <p className="text-gray-300 text-xs mt-1 capitalize font-medium">{item.service_category}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link
                  href="/gallery"
                  className="inline-block border border-gray-300 hover:border-[#2D5016] text-gray-700 hover:text-[#2D5016] font-bold px-8 py-3 rounded-lg text-sm transition shadow-sm cursor-pointer"
                >
                  View Full Gallery
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. What Our Clients Say Section */}
      <section className="py-16 md:py-24 px-4 bg-gray-50 border-t border-b border-gray-100">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">What Our Clients Say</h2>
              <p className="text-gray-500 mt-2 font-medium">Read verified feedback reviews from residential and commercial shop clients.</p>
            </div>
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-[#2D5016] hover:bg-[#203a10] text-white px-5 py-3 rounded-lg font-bold text-sm transition shadow-md hover:shadow-lg shrink-0 cursor-pointer self-start md:self-auto"
            >
              ✍️ Write a Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeReviews.slice(0, 6).map((test) => {
              const initials = test.name
                ? test.name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'U';

              return (
                <div 
                  key={test.id}
                  className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300 animate-fade-in"
                >
                  <div>
                    {/* Rating Stars */}
                    <div className="flex space-x-1 text-[#E8B44D] mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-xl">
                          {i < test.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed italic mb-6">"{test.text}"</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#2D5016]/10 text-[#2D5016] flex items-center justify-center font-bold text-sm shadow-sm border border-[#2D5016]/20">
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-none">{test.name}</h4>
                      <p className="text-xs text-gray-400 mt-1 font-medium">Verified Customer</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write Review Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in no-print">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
              {/* Modal Header */}
              <div className="bg-[#2D5016] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-lg">Submit Your Feedback</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-white/80 hover:text-white transition font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    placeholder="e.g. Muhammad Rehan"
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:border-[#2D5016] focus:bg-white outline-none text-gray-850"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rating *</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="text-2xl transition hover:scale-110 focus:outline-none cursor-pointer"
                      >
                        {star <= newReviewRating ? (
                          <span className="text-[#E8B44D]">★</span>
                        ) : (
                          <span className="text-gray-300 hover:text-[#E8B44D]">★</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Review *</label>
                  <textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Tell us about your experience..."
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:border-[#2D5016] focus:bg-white outline-none text-gray-850 resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-[#2D5016] hover:bg-[#203a10] text-white px-5 py-2.5 rounded-lg font-bold text-xs shadow transition disabled:opacity-50 cursor-pointer"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

      {/* 6. Call to Action Section */}
      <section className="bg-gradient-to-r from-[#2D5016] to-[#203a10] text-white py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Transform Your Space?</h2>
          <p className="text-lg text-gray-200 mb-8 max-w-lg mx-auto font-medium">
            Contact us for expert spectrometer matching advice or schedule a detailed painting estimate online.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/booking"
              className="w-full sm:w-auto bg-[#E8B44D] hover:bg-[#d4a03b] text-gray-900 font-bold px-8 py-3.5 rounded-lg transition shadow-lg cursor-pointer text-center text-sm"
            >
              Book Now
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto border-2 border-white/80 hover:bg-white hover:text-gray-900 text-white font-bold px-8 py-3.5 rounded-lg transition-all cursor-pointer text-center text-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
