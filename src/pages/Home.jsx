import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
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
      number: '01',
      domain: 'GROWTH',
      question: 'Where should the next rupee of acquisition spend go?',
      analysis: 'Inspect contribution margin after payment processing, packaging and returns before increasing budget. Scale only audiences clearing break-even economics.'
    },
    {
      number: '02',
      domain: 'ECONOMICS',
      question: "Are we actually making money on the growth we're buying?",
      analysis: 'Blanket promotions erode unit margin faster than volume can compensate. Model gross profit per SKU to identify which products subsidise the catalogue.'
    },
    {
      number: '03',
      domain: 'OPERATIONS',
      question: 'Can the business support the growth it is generating?',
      analysis: 'Stockouts on hero SKUs lock working capital in slow-moving inventory while delayed shipping compounds refunds, chargebacks and customer churn.'
    },
    {
      number: '04',
      domain: 'CHANNELS',
      question: 'Is marketplace expansion incremental or cannibalistic?',
      analysis: 'New platforms introduce fee structures and operational drag. Define clear pilot metrics and exit criteria before committing inventory to third-party channels.'
    }
  ];

  return (
    <>
      {/* 1. LARGE PHOTOGRAPHIC HERO WITH OVERLAID EDITORIAL TYPOGRAPHY */}
      <section className="relative min-h-[85vh] w-full overflow-hidden bg-[#141310] px-[5vw] py-16 md:py-24 flex items-end">
        {/* Background Image with subtle editorial grade */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=85"
            alt="Retail and commerce operations"
            className="h-full w-full object-cover object-center opacity-45 filter contrast-110 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141310] via-[#141310]/60 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:items-end">
            {/* Left Headline */}
            <div>
              <Reveal>
                <h1 className="display-hero text-[#fcfbf8]">
                  Better decisions <br />
                  <span className="font-serif italic font-normal text-[#dcd7cb]">
                    for the business
                  </span>{' '}
                  <br />
                  behind the storefront.
                </h1>
                <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#dcd7cb]/90">
                  Sind &amp; Sind helps founders and commercial leaders isolate the economic constraints in pricing, acquisition, inventory and expansion.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-6">
                  <Link to="/consultant" className="editorial-link-light">
                    Run a decision diagnosis <span>→</span>
                  </Link>
                  <Link to="/expertise" className="editorial-link-light text-[#dcd7cb]">
                    Explore practice areas <span>→</span>
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Right Overlaid Editorial Cards */}
            <div className="space-y-4">
              <Reveal>
                <Link
                  to="/insights"
                  className="group block border border-[#ded8cb]/25 bg-[#141310]/80 p-5 backdrop-blur-md transition-all hover:border-[#c5301a] hover:bg-[#141310]/95"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#c5301a]">
                      01 / Paid Acquisition
                    </span>
                    <span className="font-mono text-xs text-[#ded8cb] transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                  <p className="mt-2.5 font-serif text-lg text-[#fcfbf8]">
                    “ROAS is not a profitability metric.”
                  </p>
                  <span className="mt-2 inline-block font-mono text-[11px] text-[#ded8cb]/70 underline underline-offset-4 group-hover:text-[#fcfbf8]">
                    Read perspective
                  </span>
                </Link>
              </Reveal>

              <Reveal>
                <Link
                  to="/expertise/pricing-and-margin"
                  className="group block border border-[#ded8cb]/25 bg-[#141310]/80 p-5 backdrop-blur-md transition-all hover:border-[#c5301a] hover:bg-[#141310]/95"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#c5301a]">
                      02 / Unit Economics
                    </span>
                    <span className="font-mono text-xs text-[#ded8cb] transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                  <p className="mt-2.5 font-serif text-lg text-[#fcfbf8]">
                    When growth starts destroying contribution margin.
                  </p>
                  <span className="mt-2 inline-block font-mono text-[11px] text-[#ded8cb]/70 underline underline-offset-4 group-hover:text-[#fcfbf8]">
                    Explore practice area
                  </span>
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROGRESSIVE SCROLL TEXT / STATEMENT SECTION */}
      <section
        ref={statementRef}
        className="border-b border-[#ded8cb] bg-[#fcfbf8] px-[5vw] py-28 md:py-36"
      >
        <div className="mx-auto max-w-5xl text-center md:text-left">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a]">
            Core Operating Philosophy
          </span>

          <h2 className="statement-title mt-8">
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

      {/* 3. SCROLL-DRIVEN STICKY IMAGE + TEXT SECTION */}
      <section className="border-b border-[#ded8cb] bg-[#f4f0e6] px-[5vw] py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.35fr]">
            {/* Left Column (Sticky Anchor) */}
            <div className="lg:sticky lg:top-28 lg:h-fit">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a]">
                Decision Lenses
              </span>
              <h2 className="section-title mt-4">
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
            <div className="space-y-10">
              {decisions.map((item, index) => {
                const isActive = activeDecisionIndex === index;
                return (
                  <div
                    key={item.number}
                    ref={el => (decisionsRef.current[index] = el)}
                    className={`border border-[#ded8cb] bg-[#fcfbf8] p-8 md:p-10 transition-all duration-300 ${
                      isActive
                        ? 'border-[#141310] shadow-sm'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a]">
                        {item.number} / {item.domain}
                      </span>
                      <span className="font-mono text-[11px] text-[#6e6a60]">
                        CORE INQUIRY
                      </span>
                    </div>
                    <h3 className="mt-6 font-serif text-2xl md:text-3xl text-[#141310]">
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

      {/* 4. LARGE EDITORIAL IMAGE BREAK */}
      <section className="relative w-full overflow-hidden bg-[#141310] py-28 md:py-40">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=2000&q=80"
            alt="Logistics and supply chain infrastructure"
            className="h-full w-full object-cover object-center opacity-40 filter contrast-125 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141310]/90 via-[#141310]/60 to-[#141310]/90" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-[5vw] text-center">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a]">
              Sind &amp; Sind / Operations
            </span>
            <blockquote className="display mt-6 text-[#fcfbf8]">
              “Growth eventually becomes an operations problem.”
            </blockquote>
            <p className="mx-auto mt-6 max-w-2xl text-base text-[#dcd7cb]/80">
              When sales volume outpaces fulfillment architecture, supplier lead times and cash flow cycle, scaling accelerates failure rather than profitability.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 5. SIX-CAPABILITY EDITORIAL DIRECTORY WITH IMAGE HOVER */}
      <section className="border-b border-[#ded8cb] bg-[#fcfbf8] px-[5vw] py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a]">
                Capabilities Directory
              </span>
              <h2 className="section-title mt-3">Practice Areas</h2>
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
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#141310]">
                <img
                  src={expertise[activeCapabilityIndex]?.image}
                  alt={expertise[activeCapabilityIndex]?.title}
                  className="h-full w-full object-cover transition-opacity duration-300"
                />
              </div>
              <div className="mt-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#c5301a]">
                  {expertise[activeCapabilityIndex]?.number} / PRACTICE FOCUS
                </span>
                <p className="mt-1 font-serif text-base text-[#141310]">
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

      {/* 6. METHODOLOGY & POINT OF VIEW (HIGH CONTRAST SECTION) */}
      <section className="bg-[#141310] px-[5vw] py-24 text-[#fcfbf8] md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr]">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a]">
                Methodology &amp; Standards
              </span>
              <h2 className="section-title mt-4 text-[#fcfbf8]">
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
                <span className="font-mono text-xs text-[#c5301a]">01</span>
                <h3 className="mt-2 font-serif text-xl text-[#fcfbf8]">
                  Order-Level Contribution
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#dcd7cb]/80">
                  We measure true economics after shipping, payment processing fees, discounts and expected return rates rather than vanity top-line GMV.
                </p>
              </Reveal>

              <Reveal>
                <span className="font-mono text-xs text-[#c5301a]">02</span>
                <h3 className="mt-2 font-serif text-xl text-[#fcfbf8]">
                  Deterministic Playbooks
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#dcd7cb]/80">
                  Every recommendation links directly to an audited decision rule so operators understand the exact logic and tradeoffs behind the advice.
                </p>
              </Reveal>

              <Reveal>
                <span className="font-mono text-xs text-[#c5301a]">03</span>
                <h3 className="mt-2 font-serif text-xl text-[#fcfbf8]">
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

      {/* 7. PROPRIETARY DECISION DIAGNOSTIC FEATURE SPOTLIGHT */}
      <section className="border-b border-[#ded8cb] bg-[#f4f0e6] px-[5vw] py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="border border-[#ded8cb] bg-[#fcfbf8] p-8 md:p-14">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a]">
                  Proprietary Diagnostic Engine
                </span>
                <h2 className="section-title mt-4">
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
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6e6a60]">
                  EXAMPLE TEST SCENARIOS
                </span>
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

      {/* 8. SELECTED PERSPECTIVES & FIELD RESEARCH */}
      <section className="border-b border-[#ded8cb] bg-[#fcfbf8] px-[5vw] py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a]">
                Field Research
              </span>
              <h2 className="section-title mt-3">Perspectives &amp; Insights</h2>
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

      {/* 9. CLOSING ENGAGEMENT STATEMENT */}
      <section className="bg-[#fcfbf8] px-[5vw] py-24 md:py-32 text-center">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a]">
              Sind &amp; Sind Advisory
            </span>
            <h2 className="display mt-6">
              Every commercial decision has an economic constraint.
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-[#45423b]">
              Evaluate your business problem against our structured decision playbooks before committing capital.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              <Link to="/consultant" className="button-primary">
                Run a decision diagnosis <span>→</span>
              </Link>
              <Link to="/about" className="button-secondary">
                About our methodology <span>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
