/**
 * Cloudflare Pages Function: /api/meta
 * Returns client IP, ISP, city, and nearest Cloudflare edge datacenter
 */
export async function onRequest(context: any) {
  const request = context.request;
  const cf = request.cf || {};
  const clientIp = request.headers.get('cf-connecting-ip') || '';

  const data = {
    clientIp,
    asOrganization: cf.asOrganization || 'Detected ISP',
    asn: cf.asn || '',
    city: cf.city || '',
    region: cf.region || '',
    country: cf.country || '',
    colo: cf.colo || 'Cloudflare Edge'
  };

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
