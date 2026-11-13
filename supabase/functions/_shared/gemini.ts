export interface ParsedVoicePost {
  tipo: 'PRESTAMO' | 'DONACION' | 'TRUEQUE' | 'VOLUNTARIADO' | 'AYUDA';
  categoria: string;
  urgencia: 'BAJA' | 'MEDIA' | 'ALTA_CRITICA';
  resumen: string;
}

const GEMINI_FLASH_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
] as const;

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const ALLOWED_POST_TYPES: ReadonlySet<ParsedVoicePost['tipo']> = new Set([
  'PRESTAMO',
  'DONACION',
  'TRUEQUE',
  'VOLUNTARIADO',
  'AYUDA',
]);

const ALLOWED_URGENCIES: ReadonlySet<ParsedVoicePost['urgencia']> = new Set([
  'BAJA',
  'MEDIA',
  'ALTA_CRITICA',
]);

function normalizeAudioMimeType(mimeType?: string): string {
  const base = (mimeType ?? '').split(';')[0].trim().toLowerCase();
  if (!base || base === 'application/octet-stream') return 'audio/m4a';
  if (base === 'audio/x-m4a') return 'audio/m4a';
  if (base === 'audio/x-wav') return 'audio/wav';
  if (base === 'audio/x-aac') return 'audio/aac';
  if (base === 'audio/mp3') return 'audio/mpeg';
  if (base === 'audio/3gpp') return 'audio/mp4';
  return base;
}

function parseGeminiJson(rawText: string): ParsedVoicePost {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned) as Partial<ParsedVoicePost>;
  const resumen = typeof parsed.resumen === 'string' ? parsed.resumen.trim() : '';
  if (!resumen) {
    throw new Error('Gemini API response missing resumen');
  }

  const tipo = ALLOWED_POST_TYPES.has(parsed.tipo as ParsedVoicePost['tipo'])
    ? (parsed.tipo as ParsedVoicePost['tipo'])
    : 'AYUDA';
  const urgencia = ALLOWED_URGENCIES.has(parsed.urgencia as ParsedVoicePost['urgencia'])
    ? (parsed.urgencia as ParsedVoicePost['urgencia'])
    : 'MEDIA';
  const categoria =
    typeof parsed.categoria === 'string' && parsed.categoria.trim()
      ? parsed.categoria.trim()
      : 'General';

  return { tipo, categoria, urgencia, resumen };
}

export async function processVoiceToPost(audioBase64: string, mimeType: string = 'audio/ogg'): Promise<ParsedVoicePost> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const normalizedMimeType = normalizeAudioMimeType(mimeType);
  let lastError: unknown;

  for (const model of GEMINI_FLASH_MODELS) {
    try {
      const response = await fetch(
        `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(15000),
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { inlineData: { data: audioBase64, mimeType: normalizedMimeType } },
                  {
                    text: `Analiza esta nota de voz vecinal en audio para la plataforma barrial Sumayni.
Extrae la intención solidaria clasificándola con exactitud:
- tipo: PRESTAMO, DONACION, TRUEQUE, VOLUNTARIADO o AYUDA.
- categoria: rubro breve (ej. Salud, Herramientas, Alimentos, Cuidado, Mascotas).
- urgencia: BAJA, MEDIA, o ALTA_CRITICA.
- resumen: síntesis clara y concisa en una o dos oraciones en tercera persona.`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  tipo: {
                    type: 'STRING',
                    enum: ['PRESTAMO', 'DONACION', 'TRUEQUE', 'VOLUNTARIADO', 'AYUDA'],
                  },
                  categoria: { type: 'STRING' },
                  urgencia: {
                    type: 'STRING',
                    enum: ['BAJA', 'MEDIA', 'ALTA_CRITICA'],
                  },
                  resumen: { type: 'STRING' },
                },
                required: ['tipo', 'categoria', 'urgencia', 'resumen'],
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`Gemini HTTP ${response.status} (${model}): ${errBody.slice(0, 240)}`);
      }

      const payload = (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };
      const rawText = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? '')
        .join('')
        .trim();

      if (!rawText) {
        throw new Error(`Gemini API returned empty response (${model})`);
      }

      return parseGeminiJson(rawText);
    } catch (err) {
      lastError = err;
      console.warn(`[gemini] model ${model} failed, trying fallback:`, err);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('All Gemini Flash models failed');
}
