/**
 * Optional Free Cloudflare Worker Proxy (100% hides your DeepSeek API Key from Browser DevTools)
 *
 * How to use (Free on Cloudflare Workers):
 * 1. Go to https://dash.cloudflare.com -> Workers & Pages -> Create Worker
 * 2. Paste this code and click Deploy.
 * 3. In Worker Settings -> Variables and Secrets, add Secret:
 *      DEEPSEEK_API_KEY = sk-...
 * 4. Copy your Worker URL (e.g. https://canada-ai.yourname.workers.dev)
 *    and paste it into DEEPSEEK_PROXY_URL in src/config.ts
 */

const ALLOWED_ORIGINS = [
  'https://sharif-git-dev.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const MAX_REQUESTS_PER_IP_PER_HOUR = 8;
const ipHits = new Map();

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.some((o) => origin.startsWith(o));

    const corsHeaders = {
      'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST' || !isAllowed) {
      return new Response(JSON.stringify({ error: { message: 'Forbidden origin' } }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Simple IP rate limit per hour
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const hourKey = `${ip}:${new Date().toISOString().slice(0, 13)}`;
    const count = ipHits.get(hourKey) || 0;
    if (count >= MAX_REQUESTS_PER_IP_PER_HOUR) {
      return new Response(
        JSON.stringify({ error: { message: 'Rate limit exceeded. Try again later.' } }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    ipHits.set(hourKey, count + 1);

    const body = await request.json();
    // Enforce hard limits on model & max_tokens server-side
    const safePayload = {
      model: 'deepseek-chat',
      messages: Array.isArray(body.messages) ? body.messages.slice(-3) : [],
      temperature: 0.2,
      max_tokens: 250,
      stream: false,
    };

    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(safePayload),
    });

    const data = await upstream.text();
    return new Response(data, {
      status: upstream.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
