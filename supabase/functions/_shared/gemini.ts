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
  const cleanBase64 = base64
    .replace(/^data:[^;]+;base64,/i, '')
    .replace(/\s+/g, '');
  const binary = atob(cleanBase64);
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

async function transcribeAudioWithGroq(
  audioBase64: string,
  normalizedMimeType: string,
  groqKey: string
): Promise<string> {
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
  return transcript;
}

export async function transcribeVoiceAudio(
  audioBase64: string,
  mimeType = 'audio/ogg'
): Promise<string> {
  const groqKey = Deno.env.get('GROQ_API_KEY')?.trim();
  if (!groqKey) {
    throw new Error('GROQ_API_KEY is missing for voice transcription');
  }
  return transcribeAudioWithGroq(audioBase64, normalizeAudioMimeType(mimeType), groqKey);
}

const CRITICAL_EMERGENCY_REGEX =
  /\b(emergencia|urgencia\s+m[eé]dica|auxilio|socorro|ambulancia|infarto|hemorragia|accidente|incendio|peligro|desmay[oó]|no\s+respira|asfixia|desesperad[oa]|en\s+peligro|muy\s+grave)\b/i;

export async function structureTranscriptToPost(transcript: string): Promise<ParsedVoicePost> {
  const isCriticalTranscript = CRITICAL_EMERGENCY_REGEX.test(transcript);
  const groqKey = Deno.env.get('GROQ_API_KEY')?.trim();
  if (!groqKey) {
    return {
      tipo: 'AYUDA',
      categoria: 'General',
      urgencia: isCriticalTranscript ? 'ALTA_CRITICA' : 'MEDIA',
      resumen: transcript.trim(),
    };
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
                'Eres el asistente de la plataforma barrial Sumayni. Responde únicamente con un objeto JSON válido con las claves: tipo (PRESTAMO, DONACION, TRUEQUE, VOLUNTARIADO o AYUDA), categoria (rubro breve), urgencia (BAJA, MEDIA o ALTA_CRITICA) y resumen (síntesis clara en 1 o 2 oraciones).\n' +
                'Criterio estricto de urgencia:\n' +
                '- ALTA_CRITICA: cualquier emergencia médica, accidente, incendio, robo/peligro inmediato, persona en riesgo grave, o uso de palabras como "emergencia", "auxilio", "socorro", "ambulancia", "grave", "urgente".\n' +
                '- MEDIA: necesidades importantes sin riesgo inmediato (conseguir algo hoy, reparación, apoyo).\n' +
                '- BAJA: ofertas, trueques, voluntariado o avisos sin prisa.',
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

      const parsed = parseStructuredPostJson(content);
      if (isCriticalTranscript && parsed.urgencia !== 'ALTA_CRITICA') {
        parsed.urgencia = 'ALTA_CRITICA';
      }
      return parsed;
    } catch (err) {
      console.warn(`[groq] model ${model} failed, trying fallback:`, err);
    }
  }

  return {
    tipo: 'AYUDA',
    categoria: 'General',
    urgencia: isCriticalTranscript ? 'ALTA_CRITICA' : 'MEDIA',
    resumen: transcript,
  };
}

async function processVoiceWithGroq(
  audioBase64: string,
  normalizedMimeType: string,
  groqKey: string
): Promise<ParsedVoicePost> {
  const transcript = await transcribeAudioWithGroq(audioBase64, normalizedMimeType, groqKey);
  return structureTranscriptToPost(transcript);
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

export type WhatsAppTextIntent =
  | 'SEARCH_SERVICE'
  | 'SEARCH_POST'
  | 'SEARCH_BOTH'
  | 'MY_POSTS'
  | 'PUBLISH_POST'
  | 'GREETING_HELP';

export interface InterpretedTextQuery {
  intent: WhatsAppTextIntent;
  keywords: string[];
  summaryForUser: string;
  postDraft?: ParsedVoicePost;
}

const ALLOWED_INTENTS: ReadonlySet<WhatsAppTextIntent> = new Set([
  'SEARCH_SERVICE',
  'SEARCH_POST',
  'SEARCH_BOTH',
  'MY_POSTS',
  'PUBLISH_POST',
  'GREETING_HELP',
]);

function fallbackInterpretText(rawText: string): InterpretedTextQuery {
  const trimmed = rawText.trim();
  const lower = trimmed.toLowerCase();

  if (/\b(mis\s+publicaciones|mis\s+pedidos|mis\s+avisos|qu[eé]\s+(publicaciones|pedidos)\s+(he\s+hecho|tengo|publiqu[eé])|qu[eé]\s+publiqu[eé])\b/i.test(lower)) {
    return {
      intent: 'MY_POSTS',
      keywords: [],
      summaryForUser: 'mis publicaciones',
    };
  }

  if (/^(hola|buen[oa]s|hey|hi|ayuda|menu|menú|comandos|qu[eé]\s+puedes\s+hacer)/i.test(lower)) {
    return {
      intent: 'GREETING_HELP',
      keywords: [],
      summaryForUser: 'ayuda',
    };
  }

  if (/^(publicar|publica|aviso|alerta)\s*:/i.test(lower)) {
    const cleanDesc = trimmed.replace(/^(publicar|publica|aviso|alerta)\s*:\s*/i, '').trim() || trimmed;
    return {
      intent: 'PUBLISH_POST',
      keywords: [],
      summaryForUser: cleanDesc,
      postDraft: {
        tipo: 'AYUDA',
        categoria: 'Comunidad',
        urgencia: 'MEDIA',
        resumen: cleanDesc,
      },
    };
  }

  const stopWords = new Set([
    'alguien', 'tendra', 'tendrá', 'tiene', 'tienen', 'sabe', 'sabes', 'conoce',
    'hay', 'donde', 'dónde', 'necesito', 'busco', 'quiero', 'quien', 'quién',
    'por', 'para', 'con', 'una', 'uno', 'unos', 'unas', 'los', 'las', 'del',
    'que', 'qué', 'como', 'cómo', 'esta', 'está', 'favor', 'hola', 'buenas',
  ]);

  const keywords = lower
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w))
    .slice(0, 4);

  return {
    intent: 'SEARCH_BOTH',
    keywords: keywords.length > 0 ? keywords : [trimmed],
    summaryForUser: keywords[0] ?? trimmed,
  };
}

export async function interpretWhatsAppTextQuery(rawText: string): Promise<InterpretedTextQuery> {
  const groqKey = Deno.env.get('GROQ_API_KEY')?.trim();
  if (!groqKey) {
    return fallbackInterpretText(rawText);
  }

  const systemPrompt =
    'Eres el clasificador de intención del bot vecinal Sumayni en WhatsApp. ' +
    'Analiza el mensaje del vecino y responde ÚNICAMENTE con un JSON válido con esta estructura:\n' +
    '{\n' +
    '  "intent": "SEARCH_SERVICE" | "SEARCH_POST" | "SEARCH_BOTH" | "MY_POSTS" | "PUBLISH_POST" | "GREETING_HELP",\n' +
    '  "keywords": ["palabra1", "sinonimo2"],\n' +
    '  "summaryForUser": "tema breve que busca o pregunta",\n' +
    '  "postDraft": { "tipo": "PRESTAMO|DONACION|TRUEQUE|VOLUNTARIADO|AYUDA", "categoria": "rubro", "urgencia": "BAJA|MEDIA|ALTA_CRITICA", "resumen": "texto claro" }\n' +
    '}\n' +
    'Reglas:\n' +
    '- Si saluda o pregunta qué puedes hacer ("hola", "ayuda", "qué haces") -> GREETING_HELP.\n' +
    '- Si pregunta por sus propias publicaciones o pedidos ("qué publicaciones he hecho?", "mis publicaciones", "mis pedidos", "qué publiqué") -> MY_POSTS.\n' +
    '- Si busca un oficio/profesional ("gasfitero", "electricista", "alguien que arregle caños") -> SEARCH_SERVICE.\n' +
    '- Si pregunta si alguien tiene/presta/dona algo o hay recursos ("alguien tendrá medicamentos?", "tienen agua?", "alguien presta escalera?") -> SEARCH_BOTH (para buscar en publicaciones solidarias y servicios relacionados).\n' +
    '- Si pide explícitamente publicar algo ("Publicar: ...", "por favor publica que necesito...") -> PUBLISH_POST e incluye postDraft.\n' +
    '- En keywords incluye de 1 a 5 palabras raíz o sinónimos útiles en español (ej. para "medicamentos": ["medicamento", "medicina", "pastilla", "botiquin", "salud"]).';

  for (const model of GROQ_CHAT_MODELS) {
    try {
      const res = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          model,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: rawText },
          ],
        }),
      });

      if (!res.ok) continue;

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content?.trim();
      if (!content) continue;

      const cleaned = content
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned) as Partial<InterpretedTextQuery>;
      const intent = ALLOWED_INTENTS.has(parsed.intent as WhatsAppTextIntent)
        ? (parsed.intent as WhatsAppTextIntent)
        : 'SEARCH_BOTH';

      const keywords = Array.isArray(parsed.keywords)
        ? parsed.keywords
            .map((k) => (typeof k === 'string' ? k.trim().toLowerCase() : ''))
            .filter((k) => k.length >= 2)
            .slice(0, 5)
        : [];

      const summaryForUser =
        typeof parsed.summaryForUser === 'string' && parsed.summaryForUser.trim()
          ? parsed.summaryForUser.trim()
          : rawText.trim();

      let postDraft: ParsedVoicePost | undefined;
      if (intent === 'PUBLISH_POST' && parsed.postDraft) {
        postDraft = parseStructuredPostJson(JSON.stringify(parsed.postDraft));
      }

      return {
        intent,
        keywords: keywords.length > 0 ? keywords : fallbackInterpretText(rawText).keywords,
        summaryForUser,
        postDraft,
      };
    } catch (err) {
      console.warn(`[interpretWhatsAppTextQuery] model ${model} failed:`, err);
    }
  }

  return fallbackInterpretText(rawText);
}
