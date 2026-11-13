import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { supabase } from './supabase';
import type { PostType, UrgencyLevel } from '../types';

export interface ParsedVoicePost {
  tipo: PostType;
  categoria: string;
  urgencia: UrgencyLevel;
  resumen: string;
}

function inferAudioMimeType(uri: string): string {
  const cleanUri = uri.split('?')[0].toLowerCase();
  if (cleanUri.endsWith('.webm')) return 'audio/webm';
  if (cleanUri.endsWith('.ogg') || cleanUri.endsWith('.opus')) return 'audio/ogg';
  if (cleanUri.endsWith('.mp3')) return 'audio/mpeg';
  if (cleanUri.endsWith('.wav')) return 'audio/wav';
  if (cleanUri.endsWith('.aac')) return 'audio/aac';
  if (cleanUri.endsWith('.flac')) return 'audio/flac';
  if (cleanUri.endsWith('.mp4') || cleanUri.endsWith('.3gp')) return 'audio/mp4';
  return 'audio/m4a';
}

function normalizeMimeType(rawType: string | undefined, uri: string): string {
  const base = (rawType ?? '').split(';')[0].trim().toLowerCase();
  if (!base || base === 'application/octet-stream') {
    return inferAudioMimeType(uri);
  }
  if (base === 'audio/x-m4a') return 'audio/m4a';
  if (base === 'audio/x-wav') return 'audio/wav';
  if (base === 'audio/x-aac') return 'audio/aac';
  if (base === 'audio/mp3') return 'audio/mpeg';
  if (base === 'audio/3gpp') return 'audio/mp4';
  return base;
}

async function blobUriToBase64(uri: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const mimeType = normalizeMimeType(blob.type, uri);

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

async function audioUriToBase64(uri: string): Promise<{ base64: string; mimeType: string }> {
  if (Platform.OS !== 'web' && uri.startsWith('file://')) {
    try {
      const file = new File(uri);
      const base64 = await file.base64();
      if (base64) {
        return {
          base64,
          mimeType: normalizeMimeType(file.type, uri),
        };
      }
    } catch {
      // Fallback a fetch + FileReader si File API no está disponible
    }
  }

  return blobUriToBase64(uri);
}

/**
 * Envía una nota de voz grabada localmente a la Edge Function `process-voice-post` (Gemini Flash).
 */
export async function processAudioWithGemini(audioUri: string): Promise<ParsedVoicePost> {
  if (!audioUri || audioUri.startsWith('file://simulated-')) {
    throw new Error('URI de audio inválido o simulado.');
  }

  const { base64, mimeType } = await audioUriToBase64(audioUri);
  if (!base64) {
    throw new Error('El archivo de audio está vacío.');
  }

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
