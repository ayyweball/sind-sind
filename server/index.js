import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playbooks } from './data/playbooks.js';

const app = express();
const port = process.env.PORT || 5174;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '8kb' }));

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.post('/api/advice', (request, response) => {
  const question = typeof request.body?.question === 'string' ? request.body.question.trim() : '';
  if (!question || question.length > 600) return response.status(400).json({ error: 'Please enter a question of up to 600 characters.' });
  const query = question.toLowerCase();
  const ranked = playbooks.map(playbook => ({ ...playbook, score: playbook.keywords.reduce((sum, keyword) => sum + (query.includes(keyword) ? keyword.split(' ').length : 0), 0) })).sort((a, b) => b.score - a.score);
  if (!ranked[0].score) return response.json({ match: 'More context needed', situation: 'Your question needs a little more context before a focused playbook can help.', recommendation: 'Share the product type, metric or decision you are weighing, and the options in front of you. For example: “My returning-customer rate is 12%; should I add a loyalty offer or improve email flows?”', risk: 'A generic answer can point you toward a tactic that does not fit your margin, customer or operating constraints.' });
  const { match, situation, recommendation, risk } = ranked[0];
  return response.json({ match, situation, recommendation, risk });
});

app.use(express.static(path.join(root, 'dist')));
app.use((request, response, next) => request.path.startsWith('/api/') ? next() : response.sendFile(path.join(root, 'dist', 'index.html')));
app.listen(port, () => console.log(`Sind & Sind API listening on ${port}`));
