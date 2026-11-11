import { GoogleGenAI, Type } from '@google/genai';

export interface ParsedVoicePost {
  tipo: 'PRESTAMO' | 'DONACION' | 'TRUEQUE' | 'VOLUNTARIADO' | 'AYUDA';
  categoria: string;
  urgencia: 'BAJA' | 'MEDIA' | 'ALTA_CRITICA';
  resumen: string;
}

export async function processVoiceToPost(audioBase64: string, mimeType: string = 'audio/ogg'): Promise<ParsedVoicePost> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: audioBase64, mimeType } },
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
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tipo: {
            type: Type.STRING,
            enum: ['PRESTAMO', 'DONACION', 'TRUEQUE', 'VOLUNTARIADO', 'AYUDA'],
          },
          categoria: { type: Type.STRING },
          urgencia: {
            type: Type.STRING,
            enum: ['BAJA', 'MEDIA', 'ALTA_CRITICA'],
          },
          resumen: { type: Type.STRING },
        },
        required: ['tipo', 'categoria', 'urgencia', 'resumen'],
      },
    },
  });

  if (!response.text) {
    throw new Error('Gemini API returned empty response');
  }

  return JSON.parse(response.text) as ParsedVoicePost;
}
