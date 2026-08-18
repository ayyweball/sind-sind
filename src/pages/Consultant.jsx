import { useState } from 'react';
import Reveal from '../components/Reveal.jsx';

const prompts = ['Should I raise my ad spend or fix conversion first?', 'My cart abandonment rate is high—where do I start?', 'Should I expand to Amazon or TikTok Shop?', 'My supplier raised prices 20%. What should I review?'];

export default function Consultant() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/advice`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: question.trim() }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to match a playbook right now.');
      setResult(body);
    } catch (caught) { setError(caught.message); } finally { setLoading(false); }
  }

  return <section className="px-[5vw] py-16 md:py-24"><div className="mx-auto max-w-5xl"><Reveal><p className="eyebrow">Free e-commerce consultant</p><h1 className="display mt-5">Start with the decision, not the tool.</h1><p className="mt-7 max-w-3xl text-xl leading-8 text-[#625d54]">This is a free, rules-based playbook matcher—not a human consultant or an AI model. It uses the text of your question to find a relevant e-commerce decision guide. No account required.</p></Reveal><Reveal className="mt-12 border border-[#1b1914] bg-[#fffdf9] shadow-[6px_6px_0_#1b1914]"><div className="flex flex-wrap justify-between gap-3 border-b border-[#d6d1c3] px-6 py-4"><span className="mono text-xs tracking-[0.1em]">PLAYBOOK MATCHER</span><span className="mono text-xs text-[#d8321e]">FREE · LOCAL KNOWLEDGE BASE</span></div><form onSubmit={submit} className="p-6"><label htmlFor="question" className="sr-only">Describe your e-commerce question</label><textarea id="question" value={question} onChange={event => setQuestion(event.target.value)} maxLength="600" required rows="4" placeholder="Describe the business decision you are facing…" className="w-full resize-y border border-[#d6d1c3] bg-[#f6f4ee] p-4 text-lg outline-none transition focus:border-[#d8321e]" /><div className="mt-4 flex flex-wrap items-center justify-between gap-4"><span className="text-sm text-[#6f6a60]">Your question is sent only to this app’s local advice endpoint.</span><button type="submit" disabled={loading} className="button-primary disabled:cursor-wait disabled:opacity-60">{loading ? 'Matching…' : 'Get guidance'} <span>↗</span></button></div></form><div className="border-t border-[#d6d1c3] p-6"><p className="mono text-xs tracking-[0.1em] text-[#6f6a60]">TRY A QUESTION</p><div className="mt-3 flex flex-wrap gap-2">{prompts.map(prompt => <button type="button" onClick={() => setQuestion(prompt)} key={prompt} className="border border-[#1b1914] px-3 py-2 text-left text-xs hover:bg-[#1b1914] hover:text-[#fffdf9]">{prompt}</button>)}</div></div></Reveal>{error && <p role="alert" className="mt-10 border-l-4 border-[#d8321e] bg-[#efebe1] p-5">{error}</p>}{result && <Reveal className="mt-12"><article className="border border-[#d6d1c3] bg-[#fffdf9] p-7 md:p-10"><div className="flex flex-wrap justify-between gap-4"><p className="eyebrow">Your playbook match</p><p className="mono text-xs text-[#d8321e]">{result.match}</p></div><div className="mt-8 space-y-8">{[['Situation', result.situation], ['Recommendation', result.recommendation], ['Risk to watch', result.risk]].map(([heading, text]) => <section key={heading}><h2 className="mono text-xs uppercase tracking-[0.1em] text-[#3f5a6b]">{heading}</h2><p className="mt-3 max-w-3xl text-lg leading-8">{text}</p></section>)}</div></article></Reveal>}</div></section>;
}
