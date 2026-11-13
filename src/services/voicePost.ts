import { supabase } from './supabase';
import type { PostType, UrgencyLevel } from '../types';

export interface ParsedVoicePost {
  tipo: PostType;
  categoria: string;
  urgencia: UrgencyLevel;
  resumen: string;
}

function inferAudioMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.ogg') || lower.endsWith('.opus')) return 'audio/ogg';
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.3gp')) return 'audio/3gpp';
  return 'audio/m4a';
}

async function audioUriToBase64(uri: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const mimeType = blob.type && blob.type !== 'application/octet-stream'
    ? blob.type
    : inferAudioMimeType(uri);

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      if (commaIdx === -1) {
        reject(new Error('No se pudo convertir el audio a base64.'));
        return;
      }
      resolve(result.slice(commaIdx + 1));
    };
    reader.onerror = () => reject(new Error('Error leyendo archivo de audio local.'));
    reader.readAsDataURL(blob);
  });

  return { base64, mimeType };
}

/**
 * Envía una nota de voz grabada localmente a la Edge Function `process-voice-post` (Gemini Flash).
 */
export async function processAudioWithGemini(audioUri: string): Promise<ParsedVoicePost> {
  const { base64, mimeType } = await audioUriToBase64(audioUri);

  const { data, error } = await supabase.functions.invoke<ParsedVoicePost>('process-voice-post', {
    body: {
      audioBase64: base64,
      mimeType,
    },
  });

  if (error) {
    throw error;
  }

  if (!data || !data.resumen) {
    throw new Error('Respuesta vacía del servicio de transcripción.');
  }

  return data;
}
