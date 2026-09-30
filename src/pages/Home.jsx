import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import EditorialCarousel from '../components/EditorialCarousel.jsx';
import { expertise, insights } from '../content.js';

export default function Home() {
  const [activeCapabilityIndex, setActiveCapabilityIndex] = useState(0);
  const [activeDecisionIndex, setActiveDecisionIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const statementRef = useRef(null);
  const decisionsRef = useRef([]);

  // Scroll text progress observer
  useEffect(() => {
    const handleScroll = () => {
      if (!statementRef.current) return;
      const rect = statementRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const start = windowHeight * 0.85;
      const end = windowHeight * 0.2;
      const total = start - end;
      const current = start - rect.top;
      const progress = Math.min(Math.max(current / total, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sticky decisions section observer
  useEffect(() => {
    const observers = [];
    decisionsRef.current.forEach((el, index) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveDecisionIndex(index);
          }
        },
        { threshold: 0.5, rootMargin: '-10% 0px -40% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  const decisions = [
    {
      question: 'Where should the next rupee of acquisition spend go?',
      analysis: 'Inspect contribution margin after payment processing, packaging and returns before increasing budget. Scale only audiences clearing break-even economics.'
    },
    {
      question: "Are we actually making money on the growth we're buying?",
      analysis: 'Blanket promotions erode unit margin faster than volume can compensate. Model gross profit per SKU to identify which products subsidise the catalogue.'
    },
    {
      question: 'Can the business support the growth it is generating?',
      analysis: 'Stockouts on hero SKUs lock working capital in slow-moving inventory while delayed shipping compounds refunds, chargebacks and customer churn.'
    },
    {
      question: 'Is marketplace expansion incremental or cannibalistic?',
      analysis: 'New platforms introduce fee structures and operational drag. Define clear pilot metrics and exit criteria before committing inventory to third-party channels.'
    }
  ];

  return (
    <>
      {/* 1. SPLIT EDITORIAL HERO (OLIVER WYMAN DIRECTION) */}
      <section className="relative border-b border-[#ded8cb] bg-[#fcfbf8] overflow-hidden">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] items-stretch min-h-[82vh]">
            
            {/* Left Column: Solid #FCFBF8, Confident Black Serif Typography, Generous Whitespace */}
            <div className="bg-[#fcfbf8] px-[5vw] py-14 sm:py-20 lg:py-24 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#ded8cb]">
              <div className="space-y-6 max-w-2xl">
                <Reveal>
                  <div className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c5301a]"></span>
                    <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a]">
                      Operating &amp; Economic Intelligence
                    </span>
                  </div>
                </Reveal>

                <Reveal>
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.85rem] text-[#141310] leading-[1.08] tracking-tight font-medium">
                    Growth becomes expensive <br className="hidden sm:inline" />
                    when the operating system <br className="hidden sm:inline" />
                    <span className="italic font-normal text-[#45423b]">cannot keep pace.</span>
                  </h1>
                </Reveal>

                <Reveal>
                  <p className="mt-6 max-w-xl text-lg sm:text-xl leading-relaxed text-[#45423b]">
                    Sind &amp; Sind isolates structural constraints across pricing architecture, acquisition economics, warehouse custody, transit SLAs, and cash conversion.
                  </p>
                </Reveal>

                <Reveal>
                  <div className="pt-4 flex flex-wrap items-center gap-5">
                    <Link to="/app" className="button-primary">
                      Launch Operating Console <span>→</span>
                    </Link>
                    <Link to="/consultant" className="editorial-link">
                      Run decision diagnosis <span>→</span>
                    </Link>
                    <Link to="/expertise" className="editorial-link text-[#6e6a60]">
                      Explore practice areas <span>→</span>
                    </Link>
                  </div>
                </Reveal>
              </div>

              {/* Bottom Featured Perspectives / Quick Entry */}
              <div className="mt-14 pt-8 border-t border-[#ded8cb] grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Reveal>
                  <Link to="/insights" className="group block">
                    <span className="font-mono text-[10px] uppercase text-[#c5301a] tracking-wider block">Featured Perspective</span>
                    <span className="font-serif text-base text-[#141310] group-hover:text-[#c5301a] transition-colors leading-snug block mt-1">
                      “ROAS is not a profitability metric.”
                    </span>
                    <span className="font-mono text-[11px] text-[#6e6a60] group-hover:text-[#141310] mt-1 inline-block">
                      Read article →
                    </span>
                  </Link>
                </Reveal>

                <Reveal>
                  <Link to="/expertise/pricing-and-margin" className="group block">
                    <span className="font-mono text-[10px] uppercase text-[#c5301a] tracking-wider block">Core Practice Area</span>
                    <span className="font-serif text-base text-[#141310] group-hover:text-[#c5301a] transition-colors leading-snug block mt-1">
                      Pricing Architecture &amp; Unit Economics
                    </span>
                    <span className="font-mono text-[11px] text-[#6e6a60] group-hover:text-[#141310] mt-1 inline-block">
                      Explore discipline →
                    </span>
                  </Link>
                </Reveal>
              </div>
            </div>

            {/* Right Column: High-Quality Colour Editorial Photograph */}
            <div className="relative bg-[#f4f0e6] min-h-[440px] sm:min-h-[520px] lg:min-h-full w-full overflow-hidden group flex flex-col justify-end p-6 sm:p-10">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85"
                alt="Curated retail merchandising and commerce operations"
                className="absolute inset-0 h-full w-full object-cover object-center filter contrast-[1.03] brightness-[0.98] transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              
              {/* Solid High-Contrast Editorial Information Card */}
              <div className="relative z-10 bg-[#fcfbf8]/95 backdrop-blur-xs border border-[#ded8cb] p-5 shadow-xs max-w-md">
                <div className="flex items-center justify-between border-b border-[#ded8cb] pb-2 mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#c5301a]">Physical Operations</span>
                  <span className="font-mono text-[10px] text-[#6e6a60]">ARCH-01</span>
                </div>
                <p className="font-serif text-sm text-[#141310] font-medium leading-snug">
                  Storefront Merchandising, Fulfilment Velocity &amp; True Contribution
                </p>
                <p className="mt-1 text-xs text-[#45423b] leading-relaxed">
                  Connecting digital customer discovery to warehouse floor throughput and real cash realization.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. PROGRESSIVE SCROLL TEXT / STATEMENT SECTION */}
      <section
        ref={statementRef}
        className="border-b border-[#ded8cb] bg-[#fcfbf8] px-[5vw] py-24 md:py-32"
      >
        <div className="mx-auto max-w-5xl text-center md:text-left">
          <h2 className="statement-title">
            <span
              style={{
                color: scrollProgress > 0.25 ? '#141310' : 'rgba(20, 19, 16, 0.25)',
                transition: 'color 0.4s ease'
              }}
            >
              Most e-commerce problems aren’t solved by doing more.{' '}
            </span>
            <span
              style={{
                color: scrollProgress > 0.65 ? '#141310' : 'rgba(20, 19, 16, 0.25)',
                transition: 'color 0.4s ease'
              }}
            >
              They’re solved by figuring out what matters first.
            </span>
          </h2>

          <div className="mt-12 grid gap-8 border-t border-[#ded8cb] pt-8 md:grid-cols-2">
            <p className="text-base leading-relaxed text-[#45423b]">
              Before scaling media spend, entering a new marketplace, or adjusting pricing, high-performing operators isolate the economic constraint governing the business.
            </p>
            <p className="text-base leading-relaxed text-[#45423b]">
              Sind &amp; Sind provides a transparent, rules-based advisory framework to diagnose commercial trade-offs without black-box guesswork or agency bias.
            </p>
          </div>
        </div>
      </section>

      {/* 3. OPERATING LIFECYCLE CAROUSEL */}
      <section className="border-b border-[#ded8cb] bg-[#f4f0e6] px-[5vw] py-20 md:py-28">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-6">
            <div>
              <h2 className="section-title">
                The E-Commerce Operating Lifecycle
              </h2>
              <p className="mt-2 text-base text-[#45423b] max-w-2xl">
                From storefront discovery and pricing architecture to warehouse custody, transit SLAs, return friction, and cash conversion.
              </p>
            </div>
            <Link to="/app" className="button-primary text-xs">
              Open Operating Intelligence Console →
            </Link>
          </div>

          <EditorialCarousel />
        </div>
      </section>

      {/* 4. SCROLL-DRIVEN STICKY IMAGE + TEXT SECTION */}
      <section className="border-b border-[#ded8cb] bg-[#fcfbf8] px-[5vw] py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.35fr]">
            {/* Left Column (Sticky Anchor) */}
            <div className="lg:sticky lg:top-28 lg:h-fit">
              <h2 className="section-title">
                The decisions <br />
                behind the numbers.
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-[#45423b]">
                Tactical execution is only as effective as the underlying decision economics. We structure every engagement around four critical operational tensions.
              </p>

              <div className="mt-8 pt-6 border-t border-[#ded8cb]">
                <Link to="/consultant" className="editorial-link">
                  Test a decision live <span>→</span>
                </Link>
              </div>
            </div>

            {/* Right Column (Scrolling Sequential Decisions) */}
            <div className="space-y-8">
              {decisions.map((item, index) => {
                const isActive = activeDecisionIndex === index;
                return (
                  <div
                    key={item.question}
                    ref={el => (decisionsRef.current[index] = el)}
                    className={`border border-[#ded8cb] bg-[#fcfbf8] p-8 md:p-10 transition-all duration-300 ${
                      isActive
                        ? 'border-[#141310] shadow-sm'
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    <h3 className="font-serif text-2xl md:text-3xl text-[#141310] leading-snug">
                      {item.question}
                    </h3>
                    <p className="mt-5 text-base leading-relaxed text-[#45423b]">
                      {item.analysis}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL FEATURE STORY (SPLIT STRUCTURE) */}
      <section className="border-b border-[#ded8cb] bg-[#141310] text-[#fcfbf8] overflow-hidden">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] items-stretch">
            
            {/* Left Column: Solid #141310, Confident Typography, Clear Contrast */}
            <div className="p-10 sm:p-14 md:p-20 lg:p-24 flex flex-col justify-center space-y-6">
              <Reveal>
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c5301a]"></span>
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a]">
                    Operational Reality
                  </span>
                </div>
              </Reveal>

              <Reveal>
                <blockquote className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#fcfbf8] leading-tight font-medium">
                  “Growth eventually becomes an operations problem.”
                </blockquote>
              </Reveal>

              <Reveal>
                <p className="mt-4 max-w-xl text-base sm:text-lg text-[#dcd7cb]/90 leading-relaxed">
                  When sales volume outpaces fulfillment architecture, supplier lead times, and cash flow cycles, scaling accelerates friction rather than enterprise profitability.
                </p>
              </Reveal>

              <Reveal>
                <div className="pt-4">
                  <Link to="/expertise/operations-and-retention" className="editorial-link-light">
                    Explore inventory &amp; fulfilment practice <span>→</span>
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Right Column: High-Quality Colour Photography (Warehouse & Supply Chain) */}
            <div className="relative bg-[#22201c] min-h-[380px] lg:min-h-full w-full overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85"
                alt="Organized e-commerce logistics facility and multi-tier pallet racking"
                className="absolute inset-0 h-full w-full object-cover object-center filter contrast-[1.05] brightness-[0.95] transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141310]/80 via-transparent to-transparent lg:hidden" />
              <div className="absolute bottom-6 left-6 right-6 lg:hidden z-10">
                <span className="font-mono text-[10px] uppercase text-[#ded8cb]/80 tracking-wider">
                  Logistics &amp; Warehouse Custody
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. SIX-CAPABILITY EDITORIAL DIRECTORY WITH IMAGE HOVER */}
      <section className="border-b border-[#ded8cb] bg-[#fcfbf8] px-[5vw] py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
            <div>
              <h2 className="section-title">Practice Areas</h2>
              <p className="text-sm text-[#6e6a60] mt-1">Core disciplines across e-commerce economics, marketing, and operations</p>
            </div>
            <Link to="/expertise" className="editorial-link">
              View all capabilities <span>→</span>
            </Link>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            {/* Capabilities List */}
            <div className="divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
              {expertise.map((item, index) => {
                const isHovered = activeCapabilityIndex === index;
                return (
                  <Link
                    key={item.slug}
                    to={`/expertise/${item.slug}`}
                    onMouseEnter={() => setActiveCapabilityIndex(index)}
                    className={`capability-row group block py-6 transition-all ${
                      isHovered ? 'bg-[#f4f0e6]' : ''
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="flex items-baseline gap-4 md:gap-6">
                        <span className="font-mono text-xs text-[#c5301a]">
                          {item.number}
                        </span>
                        <div>
                          <h3 className="font-serif text-xl md:text-2xl text-[#141310] group-hover:text-[#c5301a] transition-colors">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm text-[#45423b] max-w-lg">
                            {item.summary}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-sm text-[#141310] transition-transform group-hover:translate-x-1.5">
                        ↗
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Dedicated Hover Preview Image Panel */}
            <div className="hidden lg:sticky lg:top-28 lg:block overflow-hidden border border-[#ded8cb] bg-[#f4f0e6] p-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#141310] group">
                <img
                  src={expertise[activeCapabilityIndex]?.image}
                  alt={expertise[activeCapabilityIndex]?.title}
                  className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="mt-4">
                <p className="font-serif text-base font-medium text-[#141310]">
                  {expertise[activeCapabilityIndex]?.title}
                </p>
                <p className="mt-1 text-xs text-[#6e6a60]">
                  {expertise[activeCapabilityIndex]?.tagline}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. METHODOLOGY & POINT OF VIEW (HIGH CONTRAST SECTION) */}
      <section className="bg-[#141310] px-[5vw] py-24 text-[#fcfbf8] md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr]">
            <Reveal>
              <h2 className="section-title text-[#fcfbf8]">
                Why explainable decision frameworks outperform black-box promises.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#dcd7cb]">
                When high-stakes commercial decisions are at issue, statistical clarity and deterministic business rules are far more valuable than speculative AI summaries.
              </p>
              <div className="mt-10">
                <Link to="/about" className="editorial-link-light">
                  Read our methodology <span>→</span>
                </Link>
              </div>
            </Reveal>

            <div className="space-y-8 border-l border-[#ded8cb]/20 pl-6 md:pl-10">
              <Reveal>
                <h3 className="font-serif text-xl text-[#fcfbf8]">
                  Order-Level Contribution
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#dcd7cb]/80">
                  We measure true economics after shipping, payment processing fees, discounts and expected return rates rather than vanity top-line GMV.
                </p>
              </Reveal>

              <Reveal>
                <h3 className="font-serif text-xl text-[#fcfbf8]">
                  Deterministic Playbooks
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#dcd7cb]/80">
                  Every recommendation links directly to an audited decision rule so operators understand the exact logic and tradeoffs behind the advice.
                </p>
              </Reveal>

              <Reveal>
                <h3 className="font-serif text-xl text-[#fcfbf8]">
                  Defined Exit Conditions
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#dcd7cb]/80">
                  Before recommending capital commitments to new channels or campaigns, we establish explicit thresholds for when to scale, pause or discontinue.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PROPRIETARY DECISION DIAGNOSTIC FEATURE SPOTLIGHT */}
      <section className="border-b border-[#ded8cb] bg-[#f4f0e6] px-[5vw] py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="border border-[#ded8cb] bg-[#fcfbf8] p-8 md:p-14">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <h2 className="section-title">
                  Bring us a commercial decision.
                </h2>
                <p className="mt-6 text-base leading-relaxed text-[#45423b]">
                  Describe your commercial question in plain language and receive a structured decision advisory note with Situation Assessment, Strategic Recommendation, and Operational Risk guardrails.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <Link to="/consultant" className="button-primary">
                    Open the consultant <span>→</span>
                  </Link>
                  <span className="font-mono text-xs text-[#6e6a60]">
                    Free · Rules-Based · No Login Required
                  </span>
                </div>
              </div>

              <div className="border border-[#ded8cb] bg-[#f4f0e6] p-6 space-y-4 font-mono text-xs">
                <div className="space-y-3">
                  <p className="border-l-2 border-[#c5301a] bg-[#fcfbf8] p-3 text-[#141310]">
                    “My supplier raised prices 20%. What margin levers should I evaluate before raising prices?”
                  </p>
                  <p className="border-l-2 border-[#ded8cb] bg-[#fcfbf8] p-3 text-[#141310]">
                    “Should we scale ad spend or fix checkout funnel drop-off first?”
                  </p>
                  <p className="border-l-2 border-[#ded8cb] bg-[#fcfbf8] p-3 text-[#141310]">
                    “We want to expand to Amazon; how do we test incrementality without cannibalising DTC?”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SELECTED PERSPECTIVES & FIELD RESEARCH */}
      <section className="border-b border-[#ded8cb] bg-[#fcfbf8] px-[5vw] py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
            <div>
              <h2 className="section-title">Perspectives &amp; Insights</h2>
            </div>
            <Link to="/insights" className="editorial-link">
              Read all perspectives <span>→</span>
            </Link>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {insights.map((item) => (
              <Reveal key={item.title} className="h-full">
                <article className="group flex h-full flex-col justify-between border border-[#ded8cb] bg-[#fcfbf8] p-6 transition-all hover:border-[#141310] hover:bg-[#f4f0e6]">
                  <div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#6e6a60]">
                      <span className="uppercase text-[#c5301a]">{item.category}</span>
                      <span>{item.readTime}</span>
                    </div>
                    <h3 className="mt-6 font-serif text-xl leading-snug text-[#141310] group-hover:text-[#c5301a] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-[#45423b]">
                      {item.excerpt}
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-[#ded8cb]">
                    <span className="font-mono text-xs text-[#141310] group-hover:text-[#c5301a] transition-colors">
                      Read perspective →
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CLOSING ENGAGEMENT STATEMENT */}
      <section className="bg-[#fcfbf8] px-[5vw] py-24 md:py-32 text-center">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="display">
              Every commercial decision has an economic constraint.
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-[#45423b]">
              Evaluate your business problem against our structured decision playbooks before committing capital.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              <Link to="/app" className="button-primary">
                Open Operating Console <span>→</span>
              </Link>
              <Link to="/consultant" className="button-secondary">
                Run a decision diagnosis <span>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

