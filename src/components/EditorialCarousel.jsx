import React, { useState, useEffect, useRef, useCallback } from 'react';

export const OPERATING_LIFECYCLE_SLIDES = [
  {
    id: 'discover',
    phase: 'DISCOVER',
    title: 'Storefront Architecture & Digital Merchandising',
    description: 'Product presentation, catalogue discovery, and customer acquisition efficiency before the cart.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
    metricLabel: 'Attributed Acquisition CAC',
    metricValue: '₹2,521'
  },
  {
    id: 'price',
    phase: 'PRICE',
    title: 'Pricing Architecture & Contribution Floors',
    description: 'List price vs discounts, contribution threshold modeling, and SKU-level margin preservation.',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=85',
    metricLabel: 'Gross Margin Average',
    metricValue: '64.9%'
  },
  {
    id: 'convert',
    phase: 'CONVERT',
    title: 'Checkout Flow & Transaction Economics',
    description: 'Payment gateway take-rates, average order value expansion, and cart completion velocity.',
    image: 'https://images.unsplash.com/photo-1556742049-0a67e557b447?auto=format&fit=crop&w=1600&q=85',
    metricLabel: 'Average Order Value',
    metricValue: '₹5,194'
  },
  {
    id: 'fulfil',
    phase: 'FULFIL',
    title: 'Warehouse Operations & Inventory Custody',
    description: 'Storage density, multi-facility pick/pack throughput, and capital tied up in stock.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85',
    metricLabel: 'Storage Capacity Utilisation',
    metricValue: '61.9%'
  },
  {
    id: 'deliver',
    phase: 'DELIVER',
    title: 'Freight Corridors & Carrier Transit SLAs',
    description: 'Corridor dispatch speed, courier transit SLA compliance, and regional freight costs.',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=85',
    metricLabel: 'On-Time Delivery SLA',
    metricValue: '88.5%'
  },
  {
    id: 'return',
    phase: 'RETURN',
    title: 'Returns & Post-Purchase Friction',
    description: 'Reverse logistics costs, sizing variance diagnostics, customer refunds, and recovery rates.',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1600&q=85',
    metricLabel: 'Post-Purchase Return Rate',
    metricValue: '37.9%'
  },
  {
    id: 'understand',
    phase: 'UNDERSTAND',
    title: 'Commercial Intelligence & Operating Levers',
    description: 'Cross-functional tension detection, cash conversion timing, and deterministic leadership actions.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
    metricLabel: 'Cash Conversion Exposure',
    metricValue: '48.9 Days'
  }
];

export default function EditorialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % OPERATING_LIFECYCLE_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + OPERATING_LIFECYCLE_SLIDES.length) % OPERATING_LIFECYCLE_SLIDES.length);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    }
  };

  const currentSlide = OPERATING_LIFECYCLE_SLIDES[currentIndex];

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="E-commerce Operating Lifecycle Carousel"
      className="relative w-full overflow-hidden border border-[#ded8cb] bg-[#141310] focus:outline-none focus:ring-1 focus:ring-[#c5301a]"
    >
      {/* Visual Canvas Area */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden bg-[#141310]">
        {OPERATING_LIFECYCLE_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                loading={idx === 0 ? 'eager' : 'lazy'}
                className={`h-full w-full object-cover object-center filter contrast-[1.03] brightness-[0.95] transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141310]/90 via-[#141310]/40 to-transparent" />
            </div>
          );
        })}

        {/* Content Overlay — Crisp Editorial Card */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-4 sm:p-6 md:p-8 flex items-end">
          <div className="w-full bg-[#141310]/85 backdrop-blur-md border border-[#ded8cb]/20 p-6 sm:p-8 text-[#fcfbf8] flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-lg">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c5301a]"></span>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a]">
                  0{currentIndex + 1} / {currentSlide.phase}
                </span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-medium text-[#fcfbf8] leading-tight">
                {currentSlide.title}
              </h3>
              <p className="text-sm md:text-base text-[#dcd7cb]/90 max-w-xl leading-relaxed">
                {currentSlide.description}
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-end gap-4 border-t md:border-t-0 md:border-l border-[#ded8cb]/20 pt-4 md:pt-0 md:pl-6">
              <div className="font-mono text-left md:text-right">
                <span className="text-[10px] text-[#ded8cb]/70 uppercase block">{currentSlide.metricLabel}</span>
                <span className="text-xl md:text-2xl font-serif text-[#fcfbf8] font-medium">{currentSlide.metricValue}</span>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="h-8 w-8 border border-[#ded8cb]/40 bg-[#141310] hover:bg-[#c5301a] hover:border-[#c5301a] text-[#fcfbf8] font-mono text-xs transition-colors flex items-center justify-center cursor-pointer"
                >
                  ←
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="h-8 w-8 border border-[#ded8cb]/40 bg-[#141310] hover:bg-[#c5301a] hover:border-[#c5301a] text-[#fcfbf8] font-mono text-xs transition-colors flex items-center justify-center cursor-pointer"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Dots Bar */}
      <div className="bg-[#141310] border-t border-[#ded8cb]/20 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto">
          {OPERATING_LIFECYCLE_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}: ${slide.phase}`}
              className={`h-1.5 transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-8 bg-[#c5301a]'
                  : 'w-2 bg-[#ded8cb]/30 hover:bg-[#ded8cb]/60'
              }`}
            />
          ))}
        </div>
        <span className="font-mono text-[10px] text-[#ded8cb]/60 uppercase tracking-wider">
          Operating Lifecycle 0{currentIndex + 1} / 0{OPERATING_LIFECYCLE_SLIDES.length}
        </span>
      </div>
    </div>
  );
}
