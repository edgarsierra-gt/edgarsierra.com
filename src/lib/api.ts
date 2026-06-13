export interface ApiResult {
  success: boolean;
  message?: string;
}

const API_BASE =
  (import.meta.env.PUBLIC_API_URL as string | undefined) ??
  "https://api.edgarsierra.com";

export async function sendContact(data: {
  name: string;
  email: string;
  message: string;
}): Promise<ApiResult> {
  const res = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, website: "" }),
  });
  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      typeof json === "object" && json !== null && "detail" in json
        ? String((json as Record<string, unknown>).detail)
        : "Error al enviar el mensaje.";
    throw new Error(detail);
  }
  return json as ApiResult;
}

export async function subscribeNewsletter(email: string): Promise<ApiResult> {
  const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, website: "" }),
  });
  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      typeof json === "object" && json !== null && "detail" in json
        ? String((json as Record<string, unknown>).detail)
        : "Error al procesar la suscripción.";
    throw new Error(detail);
  }
  return json as ApiResult;
}
