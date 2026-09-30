import { Link, useParams } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import { expertise } from '../content.js';

export default function ExpertiseDetail() {
  const { slug } = useParams();
  const item = expertise.find((entry) => entry.slug === slug);

  if (!item) {
    return (
      <section className="px-[5vw] py-28 text-center">
        <div className="mx-auto max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a]">
            404 / Practice Not Found
          </p>
          <h1 className="section-title mt-4">Capability Not Located</h1>
          <p className="mt-4 text-base text-[#45423b]">
            The requested practice area monograph could not be found.
          </p>
          <div className="mt-8">
            <Link to="/expertise" className="button-primary">
              Return to capabilities <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-[5vw] py-16 md:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <Link
            to="/expertise"
            className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a] hover:underline"
          >
            ← All Capabilities
          </Link>
          <h1 className="display mt-6">{item.title}</h1>
          <p className="editorial-subhead mt-8 max-w-3xl text-xl">
            {item.focus}
          </p>
        </Reveal>

        {/* Monograph Image */}
        <Reveal className="mt-12 overflow-hidden border border-[#ded8cb]">
          <div className="aspect-[21/9] w-full bg-[#141310] group">
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </Reveal>

        {/* Essential Inquiries */}
        <Reveal className="mt-16 border-y border-[#ded8cb] py-12">
          <h2 className="section-title">
            Questions operators must evaluate
          </h2>
          <ul className="mt-8 space-y-6">
            {item.questions.map((question, qIdx) => (
              <li
                key={question}
                className="flex items-baseline gap-4 border-b border-[#ded8cb] pb-6 text-lg md:text-xl text-[#141310]"
              >
                <span className="font-mono text-xs text-[#c5301a]">
                  0{qIdx + 1}
                </span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Direct Action Banner */}
        <Reveal className="mt-16 border border-[#ded8cb] bg-[#141310] p-8 md:p-12 text-[#fcfbf8]">
          <h3 className="section-title text-[#fcfbf8]">
            Evaluate this decision live.
          </h3>
          <p className="mt-4 max-w-xl text-base text-[#dcd7cb]">
            Submit a situation in {item.title.toLowerCase()} to receive structured situation analysis, recommendations, and risk guardrails.
          </p>
          <div className="mt-8">
            <Link to="/consultant" className="button-light">
              Run a decision diagnosis <span>→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
