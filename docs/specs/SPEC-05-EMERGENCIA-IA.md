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

---

## 3. Pipeline de Inteligencia Artificial: Audio a Ficha (Gemini Flash)

Implementación en Supabase Edge Function (`supabase/functions/process-voice-post/index.ts`):

```typescript
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);

export async function processVoiceToPost(audioBase64: string, mimeType: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          tipo: { 
            type: SchemaType.STRING, 
            enum: ['SOLICITUD_AYUDA', 'OFERTA_SERVICIO', 'EMERGENCIA'] 
          },
          categoria: { type: SchemaType.STRING },
          urgencia: { 
            type: SchemaType.STRING, 
            enum: ['BAJA', 'MEDIA', 'ALTA_CRITICA'] 
          },
          resumen: { type: SchemaType.STRING },
        },
        required: ['tipo', 'categoria', 'urgencia', 'resumen'],
      },
    },
  });

  const result = await model.generateContent([
    {
      inlineData: {
        data: audioBase64,
        mimeType: mimeType,
      },
    },
    'Extrae la intención de ayuda o servicio vecinal de esta nota de voz para la app barrial Sumayni.',
  ]);

  return JSON.parse(result.response.text());
}
```

---

## 4. Webhook de WhatsApp Cloud API (`supabase/functions/whatsapp-webhook/index.ts`)

Conexión directa serverless sin herramientas intermedias:

```typescript
// Flujo simplificado del Webhook
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

    // Caso A: Nota de voz recibida
    if (message.type === 'audio') {
      const audioId = message.audio.id;
      // Descargar audio desde Meta Media API y procesar con Gemini Flash
      const parsedPost = await processVoiceFromMeta(audioId);
      // Guardar en solidary_posts con flag is_from_whatsapp = true
      await insertSolidaryPost(parsedPost, fromPhone);
      // Responder confirmación por WhatsApp
      await sendWhatsAppText(fromPhone, `✅ Tu requerimiento fue publicado en Sumayni: "${parsedPost.resumen}". Tus vecinos te contactarán.`);
    }

    // Caso B: Consulta por texto ("gasfitero", "botiquin")
    if (message.type === 'text') {
      const query = message.text.body.toLowerCase();
      const results = await searchNearbyKeyword(query, fromPhone);
      await sendWhatsAppResults(fromPhone, results);
    }

    return new Response('EVENT_RECEIVED', { status: 200 });
  }

  return new Response('Not Found', { status: 404 });
});
```

---

## 5. Criterios de Aceptación (Checklist de Ronald)

- [ ] Control "Slide to Activate" funciona con cuenta regresiva de 5 segundos cancelable.
- [ ] La app muta inmediatamente al Tablero de Ayuda Humanitaria en dispositivos reales al cambiar el estado de la emergencia en Supabase.
- [ ] Banner de contingencia aparece para usuarios en la Capa Pública con botón de incorporación express.
- [ ] Edge Function de Gemini procesa un archivo de audio real y retorna el JSON estructurado en $< 2$ segundos.
- [ ] Webhook de WhatsApp responde consultas de texto con fichas formateadas y enlaces directos `wa.me`.
- [ ] Nota de voz enviada al número de prueba de WhatsApp se transcribe e inserta automáticamente en la app móvil.
