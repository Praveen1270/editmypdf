export interface ChatMessage { role: "user" | "model"; text: string; }

export async function streamGemini(
  apiKey: string,
  system: string,
  history: ChatMessage[],
  userMessage: string,
  onToken: (t: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const contents = [
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: userMessage }] },
  ];
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini error ${res.status}: ${txt.slice(0, 200)}`);
  }
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const parts = json?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.text) onToken(part.text);
        }
      } catch {
        /* ignore parse errors */
      }
    }
  }
}

export async function extractPdfTextForContext(pdfBytes: Uint8Array): Promise<string> {
  const { getPdfJs } = await import("../pdf/pdf-loader");
  const pdfjs = await getPdfJs();
  const task = pdfjs.getDocument({ data: pdfBytes.slice() });
  const doc = await task.promise;
  const totalPages = doc.numPages;
  const out: string[] = [];
  for (let p = 1; p <= totalPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const text = (tc.items as any[]).map((i) => i.str).join(" ");
    out.push(`[Page ${p}]\n${text}`);
  }
  await doc.destroy();
  return out.join("\n\n");
}