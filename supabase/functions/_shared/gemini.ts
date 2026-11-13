export interface ParsedVoicePost {
  tipo: 'PRESTAMO' | 'DONACION' | 'TRUEQUE' | 'VOLUNTARIADO' | 'AYUDA';
  categoria: string;
  urgencia: 'BAJA' | 'MEDIA' | 'ALTA_CRITICA';
  resumen: string;
}

const GEMINI_FLASH_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
] as const;

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GROQ_CHAT_MODELS = [
  'qwen/qwen3-32b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
] as const;

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

function mimeTypeToExtension(mimeType: string): string {
  if (mimeType === 'audio/wav') return 'wav';
  if (mimeType === 'audio/ogg') return 'ogg';
  if (mimeType === 'audio/webm') return 'webm';
  if (mimeType === 'audio/mpeg') return 'mp3';
  if (mimeType === 'audio/aac') return 'aac';
  if (mimeType === 'audio/flac') return 'flac';
  if (mimeType === 'audio/mp4') return 'mp4';
  return 'm4a';
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function parseStructuredPostJson(rawText: string): ParsedVoicePost {
  const cleaned = rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned) as Partial<ParsedVoicePost>;
  const resumen = typeof parsed.resumen === 'string' ? parsed.resumen.trim() : '';
  if (!resumen) {
    throw new Error('Model response missing resumen');
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

async function processVoiceWithGroq(
  audioBase64: string,
  normalizedMimeType: string,
  groqKey: string
): Promise<ParsedVoicePost> {
  const bytes = base64ToUint8Array(audioBase64);
  const audioCopy = new Uint8Array(bytes.byteLength);
  audioCopy.set(bytes);
  const ext = mimeTypeToExtension(normalizedMimeType);
  const form = new FormData();
  form.append('file', new Blob([audioCopy], { type: normalizedMimeType }), `voice.${ext}`);
  form.append('model', 'whisper-large-v3-turbo');
  form.append('language', 'es');
  form.append('response_format', 'json');

  const sttRes = await fetch(`${GROQ_API_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${groqKey}` },
    signal: AbortSignal.timeout(15000),
    body: form,
  });

  if (!sttRes.ok) {
    const errBody = await sttRes.text().catch(() => '');
    throw new Error(`Groq Whisper HTTP ${sttRes.status}: ${errBody.slice(0, 240)}`);
  }

  const sttJson = (await sttRes.json()) as { text?: string };
  const transcript = typeof sttJson.text === 'string' ? sttJson.text.trim() : '';
  if (!transcript) {
    throw new Error('Groq Whisper returned empty transcript');
  }

  for (const model of GROQ_CHAT_MODELS) {
    try {
      const chatRes = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'Eres el asistente de la plataforma barrial Sumayni. Responde únicamente con un objeto JSON válido con las claves: tipo (PRESTAMO, DONACION, TRUEQUE, VOLUNTARIADO o AYUDA), categoria (rubro breve), urgencia (BAJA, MEDIA o ALTA_CRITICA) y resumen (síntesis clara en 1 o 2 oraciones).',
            },
            {
              role: 'user',
              content: `Transcripción de nota de voz vecinal:\n"${transcript}"`,
            },
          ],
        }),
      });

      if (!chatRes.ok) {
        const errBody = await chatRes.text().catch(() => '');
        throw new Error(`Groq Chat HTTP ${chatRes.status} (${model}): ${errBody.slice(0, 240)}`);
      }

      const chatJson = (await chatRes.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = chatJson.choices?.[0]?.message?.content?.trim() ?? '';
      if (!content) {
        throw new Error(`Groq Chat empty response (${model})`);
      }

      return parseStructuredPostJson(content);
    } catch (err) {
      console.warn(`[groq] model ${model} failed, trying fallback:`, err);
    }
  }

  return {
    tipo: 'AYUDA',
    categoria: 'General',
    urgencia: 'MEDIA',
    resumen: transcript,
  };
}

export async function processVoiceToPost(audioBase64: string, mimeType: string = 'audio/ogg'): Promise<ParsedVoicePost> {
  const normalizedMimeType = normalizeAudioMimeType(mimeType);
  const groqKey = Deno.env.get('GROQ_API_KEY');
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  let lastError: unknown;

  if (groqKey) {
    try {
      return await processVoiceWithGroq(audioBase64, normalizedMimeType, groqKey);
    } catch (err) {
      lastError = err;
      console.warn('[voice] Groq failed, trying Gemini fallback:', err);
    }
  }

  if (!apiKey) {
    if (lastError instanceof Error) throw lastError;
    throw new Error('Neither GROQ_API_KEY nor GEMINI_API_KEY environment variable is set');
  }

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
        if (response.status === 503 || response.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
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

      return parseStructuredPostJson(rawText);
    } catch (err) {
      lastError = err;
      console.warn(`[gemini] model ${model} failed, trying fallback:`, err);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('All Gemini Flash models failed');
}
