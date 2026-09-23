interface Env {
  CF_RADAR_TOKEN?: string;
}

const WHITELISTED_PATHS = new Set([
  'entities/locations',
  'http/summary/ip_version',
  'http/summary/http_version',
  'http/summary/device_type',
  'http/summary/os',
  'http/summary/tls_version',
  'netflows/summary',
  'http/top/browser_family',
  'attacks/layer3/summary/vector',
  'attacks/layer3/summary/protocol',
  'attacks/layer3/top/locations/origin',
  'attacks/layer7/summary/managed_rules',
  'attacks/layer7/top/locations/target',
  'quality/speed/summary',
  'quality/speed/top/locations',
  'ranking/top',
  'annotations/outages',
]);

const ALLOWED_QUERY_PARAMS = new Set([
  'location',
  'dateStart',
  'dateEnd',
  'limit',
  'format',
  'name',
  'aggInterval',
]);

export async function onRequestGet(context: {
  request: Request;
  env: Env;
  params: { path?: string | string[] };
  waitUntil: (promise: Promise<any>) => void;
}): Promise<Response> {
  const request = context.request;
  const url = new URL(request.url);

  // Normalize subpath
  const rawPath = context.params.path;
  const subpath = (Array.isArray(rawPath) ? rawPath.join('/') : rawPath || '')
    .replace(/^\/+|\/+$/g, '');

  if (!WHITELISTED_PATHS.has(subpath)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `Endpoint '${subpath}' is not permitted by SolversPro Radar Proxy.`,
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // Check Cloudflare Cache API first
  const cache = (caches as any).default;
  const cacheKey = new Request(url.toString(), {
    method: 'GET',
    headers: request.headers,
  });

  try {
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      const hitHeaders = new Headers(cachedResponse.headers);
      hitHeaders.set('X-Cache-Status', 'HIT');
      hitHeaders.set('Access-Control-Allow-Origin', '*');
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        headers: hitHeaders,
      });
    }
  } catch (err) {
    // Cache lookup failed, continue to origin
  }

  const token = context.env.CF_RADAR_TOKEN;
  if (!token) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'CF_RADAR_TOKEN environment secret is not configured in Cloudflare Pages.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // Build upstream URL with allowed query parameters
  const upstreamUrl = new URL(`https://api.cloudflare.com/client/v4/radar/${subpath}`);
  for (const [key, value] of url.searchParams.entries()) {
    if (ALLOWED_QUERY_PARAMS.has(key)) {
      upstreamUrl.searchParams.set(key, value);
    }
  }

  try {
    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'User-Agent': 'SolversPro-Radar-Proxy/1.0',
      },
    });

    const bodyText = await upstreamRes.text();

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('X-Cache-Status', 'MISS');

    if (upstreamRes.ok) {
      // 1 hour cache TTL
      responseHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');

      const clientResponse = new Response(bodyText, {
        status: 200,
        headers: responseHeaders,
      });

      // Asynchronously store in Cloudflare edge cache
      try {
        const cacheStoreResponse = new Response(bodyText, {
          status: 200,
          headers: responseHeaders,
        });
        context.waitUntil(cache.put(cacheKey, cacheStoreResponse));
      } catch (cacheErr) {
        // Non-fatal if caching fails
      }

      return clientResponse;
    } else {
      // Pass through upstream error with proper status without leaking token
      return new Response(bodyText, {
        status: upstreamRes.status,
        headers: responseHeaders,
      });
    }
  } catch (fetchErr: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to communicate with Cloudflare Radar upstream API.',
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
