/**
 * LLM Provider Abstraction Layer for Sind & Sind Operating Agent.
 * Encapsulates backend-only communication with LLM providers (OpenAI, Gemini, Anthropic, or OpenAI-compatible).
 * Does NOT expose keys to the client. Handles timeouts, format errors, and fallback detection.
 */

function getEnv() {
  return typeof process !== 'undefined' && process.env ? process.env : {};
}

export class LLMProvider {
  constructor(config = {}) {
    const env = getEnv();
    this.provider = config.provider || env.LLM_PROVIDER || this.detectProvider();
    this.apiKey = config.apiKey || this.getApiKeyForProvider(this.provider);
    this.model = config.model || env.LLM_MODEL || this.getDefaultModel(this.provider);
    this.baseUrl = config.baseUrl || env.LLM_BASE_URL || this.getDefaultBaseUrl(this.provider);
    this.timeoutMs = config.timeoutMs || parseInt(env.LLM_TIMEOUT_MS, 10) || 25000;
  }

  detectProvider() {
    const env = getEnv();
    if (env.OPENAI_API_KEY) return 'openai';
    if (env.GEMINI_API_KEY || env.GOOGLE_API_KEY) return 'gemini';
    if (env.ANTHROPIC_API_KEY) return 'anthropic';
    return 'none';
  }

  getApiKeyForProvider(provider) {
    const env = getEnv();
    switch (provider) {
      case 'openai':
        return env.OPENAI_API_KEY || null;
      case 'gemini':
        return env.GEMINI_API_KEY || env.GOOGLE_API_KEY || null;
      case 'anthropic':
        return env.ANTHROPIC_API_KEY || null;
      default:
        return env.OPENAI_API_KEY || env.GEMINI_API_KEY || env.GOOGLE_API_KEY || null;
    }
  }

  getDefaultModel(provider) {
    switch (provider) {
      case 'openai':
        return 'gpt-4o-mini';
      case 'gemini':
        return 'gemini-1.5-flash';
      case 'anthropic':
        return 'claude-3-5-sonnet-20241022';
      default:
        return 'gpt-4o-mini';
    }
  }

  getDefaultBaseUrl(provider) {
    switch (provider) {
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'gemini':
        return 'https://generativelanguage.googleapis.com/v1beta';
      case 'anthropic':
        return 'https://api.anthropic.com/v1';
      default:
        return 'https://api.openai.com/v1';
    }
  }

  isConfigured() {
    return Boolean(this.apiKey && this.provider !== 'none');
  }

  getStatus() {
    return {
      configured: this.isConfigured(),
      provider: this.provider,
      model: this.isConfigured() ? this.model : 'none',
      mode: this.isConfigured() ? 'LLM_SYNTHESIS' : 'DETERMINISTIC_ENGINE'
    };
  }

  /**
   * Generates completion from LLM with strict error handling and timeout.
   */
  async generateCompletion({ systemPrompt, userPrompt, temperature = 0.2, maxTokens = 1500 }) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'LLM provider not configured',
        status: this.getStatus()
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      if (this.provider === 'openai') {
        return await this._callOpenAI({ systemPrompt, userPrompt, temperature, maxTokens, signal: controller.signal });
      } else if (this.provider === 'gemini') {
        return await this._callGemini({ systemPrompt, userPrompt, temperature, maxTokens, signal: controller.signal });
      } else if (this.provider === 'anthropic') {
        return await this._callAnthropic({ systemPrompt, userPrompt, temperature, maxTokens, signal: controller.signal });
      } else {
        // Default to OpenAI-compatible interface
        return await this._callOpenAI({ systemPrompt, userPrompt, temperature, maxTokens, signal: controller.signal });
      }
    } catch (err) {
      const isTimeout = err.name === 'AbortError';
      return {
        success: false,
        error: isTimeout ? `LLM request timed out after ${this.timeoutMs}ms` : err.message,
        status: this.getStatus()
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async _callOpenAI({ systemPrompt, userPrompt, temperature, maxTokens, signal }) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' }
      }),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
      success: true,
      data: parsed,
      rawContent: content,
      usage: data.usage || null,
      status: this.getStatus()
    };
  }

  async _callGemini({ systemPrompt, userPrompt, temperature, maxTokens, signal }) {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json'
        }
      }),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text);

    return {
      success: true,
      data: parsed,
      rawContent: text,
      usage: data.usageMetadata || null,
      status: this.getStatus()
    };
  }

  async _callAnthropic({ systemPrompt, userPrompt, temperature, maxTokens, signal }) {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        temperature,
        max_tokens: maxTokens
      }),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    const parsed = JSON.parse(text);

    return {
      success: true,
      data: parsed,
      rawContent: text,
      usage: data.usage || null,
      status: this.getStatus()
    };
  }
}

export const defaultLLMProvider = new LLMProvider();
