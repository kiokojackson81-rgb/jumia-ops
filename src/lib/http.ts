// src/lib/http.ts
export function json(data: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });
}

export function bad(message = "Bad Request", status = 400) {
  return json({ error: message }, { status });
}
