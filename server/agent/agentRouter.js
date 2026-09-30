import express from 'express';
import { runAgentInvestigation } from './agentService.js';
import { AGENT_TOOLS } from './toolRegistry.js';

const router = express.Router();

router.post('/investigate', async (req, res) => {
  try {
    const { query, activeSKU, currentRoute, dataset, storeName, dataMode } = req.body || {};
    const result = await runAgentInvestigation({
      query,
      activeSKU,
      currentRoute,
      dataset,
      storeName,
      dataMode
    });
    return res.json(result);
  } catch (error) {
    console.error('Agent investigation error:', error);
    return res.status(500).json({
      error: 'Failed to complete operating investigation',
      details: error.message
    });
  }
});

router.get('/tools', (_req, res) => {
  const tools = Object.entries(AGENT_TOOLS).map(([name, tool]) => ({
    name,
    description: tool.description
  }));
  return res.json({ tools });
});

export default router;
