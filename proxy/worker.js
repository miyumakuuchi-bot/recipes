// Cloudflare Worker: Anthropic API CORS プロキシ
export default {
  async fetch(request) {
    // プリフライト (OPTIONS) に応答
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-use',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Anthropic API へ転送
    const body = await request.text();
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': request.headers.get('x-api-key') ?? '',
        'anthropic-version': request.headers.get('anthropic-version') ?? '2023-06-01',
        'anthropic-dangerous-direct-browser-use': 'true',
      },
      body,
    });

    const resBody = await anthropicRes.text();
    return new Response(resBody, {
      status: anthropicRes.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
