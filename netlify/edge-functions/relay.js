export default async (request, context) => {
  const targetDomain = Deno.env.get("TARGET_DOMAIN");

  if (!targetDomain) {
    return new Response("TARGET_DOMAIN is not set", { status: 500 });
  }

  const url = new URL(request.url);
  const targetUrl = targetDomain + url.pathname + url.search;

  const headers = new Headers(request.headers);
  headers.set("host", new URL(targetDomain).hostname);

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response("Relay error: " + err.message, { status: 502 });
  }
};

export const config = {
  path: "/*",
};
