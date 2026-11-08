# SPEC-05: Gobernanza de Emergencia, WhatsApp Bridge & IA con Gemini

| Metadato | Detalle |
| :--- | :--- |
| **Responsable (Owner)** | **Ronald** (Integración & IA Specialist) |
| **Módulo** | Mutación a Modo Emergencia, Webhook de WhatsApp Cloud API y Pipeline de Voz con Gemini |
| **Dependencias Entrantes** | Requiere Realtime de Mauro ([SPEC-02](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-02-BACKEND-POSTGIS.md)) y Componentes UI de Juan ([SPEC-01](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-01-FRONTEND-CORE.md)) |
| **Stack Técnico** | Supabase Edge Functions (Deno / TypeScript), Google Gemini API (Flash), Meta WhatsApp Cloud API |

---

## 1. Objetivo

Implementar la capacidad más innovadora y crítica de **Sumayni**: la gobernanza segura y mutación instantánea en caso de desastres naturales hacia el **Tablero de Ayuda Humanitaria**, la conexión omnicanal mediante **WhatsApp Cloud API** y la extracción inteligente de notas de voz a publicaciones estructuradas con **Gemini Flash** (cumpliendo la regla de los 3 clics).

---

## 2. Componentes de Emergencia en la Aplicación Móvil

### 2.1. Control Antierror "Slide to Activate" (`features/emergency/components/SlideToActivate.tsx`)
* Solo visible para usuarios con rol `dirigente`.
* Control deslizante táctil que requiere arrastrar de izquierda a derecha.
* Despliega selector de tipo de evento (*Sismo / Terremoto*, *Inundación / Huaico*, *Incendio*, *Corte masivo de servicios*).
* Inicia cuenta regresiva visible de 5 segundos con botón de cancelación inmediata.
* Al completarse, realiza `INSERT` en la tabla `emergency_events`.

### 2.2. Mutación Instantánea: El Tablero de Ayuda Humanitaria (`app/emergency-board.tsx`)
* Escucha el canal Supabase Realtime de `emergency_events`.
* Cuando un evento pasa a `status: 'ACTIVE'`, la app móvil redirige y transforma la vista principal:
  * Alerta superior con tipo de contingencia y hora de inicio.
  * Mapa centrado en puntos de reunión seguros, albergues y botiquines comunitarios.
  * Muro de recursos críticos: agua potable, generadores, herramientas de rescate y medicinas.
  * Alertas de personas vulnerables y botón SOS.

### 2.3. Banner de Emergencia e Incorporación Express (Capa Pública)
* Si un usuario registrado no pertenece al grupo vecinal privado, la app le muestra un banner rojo prioritario:
  > *"⚠️ Tu sector está bajo contingencia. El grupo vecinal más cercano está coordinando víveres y auxilio."*
* Botón directo: **`[ Solicitar Unión Express ]`**.
* Al tocarlo, se envía la solicitud al dirigente del sector con la dirección ya registrada del usuario, permitiendo admitirlo en 1 solo tap.

### 2.4. Algoritmo de Detección de Crisis por Consenso
* Si se registran 3 reportes con `urgencia: 'ALTA_CRITICA'` en la misma manzana en menos de 10 minutos, la Edge Function envía una notificación push de pre-alerta a los dirigentes para activar el Modo Emergencia en 1 toque.

### 2.5. Servicio de Notificaciones Push Móviles (Expo Push API)
* Implementado en Supabase Edge Function (`supabase/functions/send-push-alert/index.ts`):
  * Consulta los `push_token` de los perfiles afectados en `profiles`:
    * En caso de **Alerta SOS**: envía notificación prioritaria inmediata a los teléfonos de los dirigentes y padrinos asignados en `care_assignments`.
    * En caso de **Modo Emergencia**: envía notificación masiva a todos los vecinos registrados en ese sector geográfico.
  * Realiza el despacho mediante llamada POST a `https://exp.host/--/api/v2/push/send` con canal de alta prioridad y sonido de alarma.

---

## 3. Pipeline de Inteligencia Artificial: Audio a Ficha (Gemini Flash)

Implementación en Supabase Edge Function (`supabase/functions/process-voice-post/index.ts`) usando el SDK oficial `@google/genai`:

```typescript
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY')! });

export async function processVoiceToPost(audioBase64: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: audioBase64, mimeType } },
          { text: 'Extrae la intención de ayuda o servicio vecinal de esta nota de voz para la app barrial Sumayni.' },
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
            enum: ['SOLICITUD_AYUDA', 'OFERTA_SERVICIO', 'EMERGENCIA'] 
          },
          categoria: { type: Type.STRING },
          urgencia: { 
            type: Type.STRING, 
            enum: ['BAJA', 'MEDIA', 'ALTA_CRITICA'] 
          },
          resumen: { type: Type.STRING },
        },
        required: ['tipo', 'categoria', 'urgencia', 'resumen'],
      },
    },
  });

  return JSON.parse(response.text!);
}
```

---

## 4. Webhook de WhatsApp Cloud API (`supabase/functions/whatsapp-webhook/index.ts`)

Conexión directa serverless para gestión de Onboarding, Difusión Automática Directa y Notas de Voz:

```typescript
Deno.serve(async (req) => {
  // 1. Verificación inicial de Meta (GET)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    if (mode === 'subscribe' && token === Deno.env.get('META_VERIFY_TOKEN')) {
      return new Response(challenge, { status: 200 });
    }
  }

  // 2. Recepción de mensajes (POST)
  if (req.method === 'POST') {
    const body = await req.json();
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) return new Response('OK', { status: 200 });

    const fromPhone = message.from;

    // Caso A: Onboarding y Admisión para vecinos sin la app
    const isRegistered = await checkNeighborRegistered(fromPhone);
    if (!isRegistered) {
      if (message.type === 'location') {
        const { latitude, longitude } = message.location;
        await createJoinRequestFromWhatsApp(fromPhone, latitude, longitude);
        await sendWhatsAppText(fromPhone, '📍 Ubicación recibida. Tu solicitud fue enviada al dirigente de tu cuadra para aprobación.');
        return new Response('EVENT_RECEIVED', { status: 200 });
      }
      if (message.type === 'text') {
        await sendWhatsAppText(fromPhone, '¡Hola! Soy Sumayni. Para conectarte con tu barrio, por favor envíame tu nombre completo y comparte tu ubicación con el botón 📎 de WhatsApp.');
        return new Response('EVENT_RECEIVED', { status: 200 });
      }
    }

    // Caso B: Nota de voz recibida (Publicación asistida por IA)
    if (message.type === 'audio') {
      const audioId = message.audio.id;
      const parsedPost = await processVoiceFromMeta(audioId);
      await insertSolidaryPostFromWhatsApp(parsedPost, fromPhone);
      await sendWhatsAppText(fromPhone, `✅ Tu requerimiento fue publicado en Sumayni: "${parsedPost.resumen}". Tus vecinos te contactarán.`);
    }

    // Caso C: Consulta por texto ("gasfitero", "botiquin")
    if (message.type === 'text') {
      const query = message.text.body.toLowerCase();
      const results = await searchNearbyKeyword(query, fromPhone);
      await sendWhatsAppResults(fromPhone, results);
    }

    return new Response('EVENT_RECEIVED', { status: 200 });
  }

  return new Response('Not Found', { status: 404 });
});

// Función de Difusión Automática Directa (Broadcast de Emergencia sin intervención humana)
export async function broadcastEmergencyAlert(groupId: string, eventType: string, description: string) {
  const verifiedPhones = await getVerifiedWhatsAppPhonesByGroup(groupId);
  for (const phone of verifiedPhones) {
    await sendWhatsAppTemplate(phone, 'alerta_emergencia_comunitaria', {
      tipo: eventType,
      detalle: description,
    });
  }
}
```
```

---

## 5. Criterios de Aceptación (Checklist de Ronald)

- [x] Control "Slide to Activate" funciona con cuenta regresiva de 5 segundos cancelable.
- [x] La app muta inmediatamente al Tablero de Ayuda Humanitaria en dispositivos reales al cambiar el estado de la emergencia en Supabase.
- [x] Banner de contingencia aparece para usuarios en la Capa Pública con botón de incorporación express.
- [x] Edge Function de Gemini procesa un archivo de audio real y retorna el JSON estructurado en $< 2$ segundos.
- [x] Webhook de WhatsApp responde consultas de texto con fichas formateadas y enlaces directos `wa.me`.
- [x] Nota de voz enviada al número de prueba de WhatsApp se transcribe e inserta automáticamente en la app móvil.
