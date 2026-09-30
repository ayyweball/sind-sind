import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';

export default function About() {
  return (
    <section className="px-[5vw] py-16 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-[1.15fr_1fr]">
          <Reveal>
            <h1 className="display">
              Strategic guidance must be clear about its reasoning.
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-[#45423b]">
              Sind &amp; Sind is a specialized e-commerce advisory firm. We help founders, executives, and commercial operators turn high-stakes commercial dilemmas into disciplined, actionable next steps.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#45423b]">
              Unlike black-box generative chatbots that hallucinate plausible-sounding tactics without commercial accountability, our Decision Diagnostic operates on audited, deterministic decision trees. Every recommendation is traceable, verifiable, and rooted in order-level unit economics.
            </p>

            <div className="mt-10 pt-8 border-t border-[#ded8cb]">
              <Link to="/consultant" className="button-primary">
                Run a decision diagnosis <span>→</span>
              </Link>
            </div>
          </Reveal>

          <Reveal className="border-l border-[#ded8cb] pl-6 md:pl-12">
            <h2 className="section-title text-2xl">
              Engagement Framework
            </h2>
            <ol className="mt-8 space-y-10">
              {[
                [
                  '01',
                  'Isolate the Economic Problem',
                  'Frame the trade-off around unit margins, inventory turnover, or channel cannibalisation rather than isolated tactical marketing tweaks.'
                ],
                [
                  '02',
                  'Evaluate Decision Playbooks',
                  'The diagnostic scores the problem against an audited repository of commerce playbooks to identify the primary constraint and risk factors.'
                ],
                [
                  '03',
                  'Apply Contextual Governance',
                  'We deliver structured situation assessments, strategic recommendations, and operational guardrails to guide leadership execution.'
                ]
              ].map(([number, heading, text]) => (
                <li key={number}>
                  <p className="font-mono text-xs text-[#c5301a]">{number}</p>
                  <h2 className="mt-2 font-serif text-2xl text-[#141310]">{heading}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#45423b]">{text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
