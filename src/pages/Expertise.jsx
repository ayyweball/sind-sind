import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import { expertise } from '../content.js';

export default function Expertise() {
  return (
    <section className="px-[5vw] py-16 md:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h1 className="display max-w-4xl">
            Commercial questions, resolved through disciplined analysis.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[#45423b]">
            Explore the specialized areas where e-commerce trade-offs most often become expensive: paid acquisition economics, checkout architecture, SKU margins, inventory velocity, and multi-channel expansion.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {expertise.map((item) => (
            <Reveal key={item.slug} className="h-full">
              <Link
                to={`/expertise/${item.slug}`}
                className="group flex h-full flex-col justify-between border border-[#ded8cb] bg-[#fcfbf8] p-8 transition-all hover:border-[#141310] hover:bg-[#f4f0e6]"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#141310]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                    />
                  </div>
                  <div className="mt-6 flex items-center justify-between font-mono text-xs text-[#c5301a]">
                    <span>{item.number}</span>
                  </div>
                  <h2 className="mt-3 font-serif text-2xl text-[#141310] group-hover:text-[#c5301a] transition-colors">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#45423b]">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#ded8cb]">
                  <span className="editorial-link">
                    Explore practice area <span>→</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
