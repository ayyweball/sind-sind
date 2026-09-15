import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import { insights } from '../content.js';

export default function Insights() {
  return (
    <section className="px-[5vw] py-16 md:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a]">
            Perspectives &amp; Analysis
          </span>
          <h1 className="display mt-4 max-w-4xl">
            A better question often changes the answer.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[#45423b]">
            Strategic notes, contribution models, and operating theses for leaders building and scaling e-commerce enterprises.
          </p>
        </Reveal>

        {/* Lead Research Article */}
        {insights[0] && (
          <Reveal className="mt-16 border border-[#ded8cb] bg-[#fcfbf8] p-8 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <div className="flex items-center gap-4 font-mono text-xs text-[#6e6a60]">
                  <span className="uppercase text-[#c5301a]">{insights[0].category}</span>
                  <span>·</span>
                  <span>{insights[0].date}</span>
                  <span>·</span>
                  <span>{insights[0].readTime}</span>
                </div>
                <h2 className="section-title mt-4 text-[#141310]">
                  {insights[0].title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#45423b]">
                  {insights[0].excerpt}
                </p>
                <div className="mt-8">
                  <span className="editorial-link">
                    Read executive note <span>→</span>
                  </span>
                </div>
              </div>
              <div className="aspect-[16/10] overflow-hidden bg-[#141310]">
                <img
                  src={insights[0].image}
                  alt={insights[0].title}
                  className="h-full w-full object-cover opacity-90"
                />
              </div>
            </div>
          </Reveal>
        )}

        {/* Remaining Insights Grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {insights.slice(1).map((item, index) => (
            <Reveal key={item.title} className="h-full">
              <article className="group flex h-full flex-col justify-between border border-[#ded8cb] bg-[#fcfbf8] p-8 transition-all hover:border-[#141310] hover:bg-[#f4f0e6]">
                <div>
                  <div className="aspect-[16/9] w-full overflow-hidden bg-[#141310]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                    />
                  </div>
                  <div className="mt-6 flex items-center justify-between font-mono text-xs text-[#6e6a60]">
                    <span className="uppercase text-[#c5301a]">{item.category}</span>
                    <span>{item.date}</span>
                  </div>
                  <h3 className="mt-4 font-serif text-2xl text-[#141310] group-hover:text-[#c5301a] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#45423b]">
                    {item.excerpt}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#ded8cb]">
                  <span className="editorial-link">
                    Read perspective <span>→</span>
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
