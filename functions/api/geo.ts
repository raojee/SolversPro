interface Env {}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const request = context.request;
  const cf = (request as any).cf;
  const country = cf?.country || request.headers.get('cf-ipcountry') || null;

  return new Response(JSON.stringify({ country }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
