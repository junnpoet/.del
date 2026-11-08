# Conexión a Supabase · Sumayni

Guía para que cada integrante conecte la app (Expo) a la base de datos del proyecto.

| Archivo | Qué es |
|---|---|
| [`database.ts`](./database.ts) | Tipos **generados** desde Supabase (no editar a mano; se regeneran) |
| [`index.ts`](./index.ts) | Uniones de valores (`UserRole`, `PostType`, …) e interfaces de la UI |
| [`../services/supabase.ts`](../services/supabase.ts) | Cliente único de Supabase, ya configurado con `Database` y `AsyncStorage` |
| [`../../supabase/`](../../supabase/README.md) | Migraciones SQL de la SPEC-02 y scripts de prueba |

---

## 1. Variables de entorno

Los valores reales **no se guardan en el repo**: viven en `.env.local` (raíz del proyecto),
que está en el `.gitignore`. El repo solo incluye la plantilla [`.env.example`](../../.env.example).

| Variable | Qué es | Dónde se obtiene |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Dirección del proyecto (`https://<project-ref>.supabase.co`) | Dashboard → botón **Connect**, o Project Settings → Data API (sin `/rest/v1/`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de la app | Dashboard → botón **Connect**, o Project Settings → API Keys |

Los valores se piden a Mauro o al dueño del proyecto por mensaje privado.

### ¿Anon key o publishable key?

La **publishable key** (`sb_publishable_…`) es el **reemplazo nuevo de la anon key** y
cumple la misma función. Los proyectos nuevos de Supabase la entregan por defecto, así que
su valor va en `EXPO_PUBLIC_SUPABASE_ANON_KEY` (el nombre de la variable se mantiene porque
así lo lee `src/services/supabase.ts`).

> 🔒 Es pública por diseño: solo da los permisos que permiten las políticas **RLS**
> (SPEC-02 §4 y §4.1). Quien la tenga no puede saltarse esas reglas.

### ⛔ Lo que NUNCA va en la app ni en el repo

| Clave | Dónde se usa |
|---|---|
| **Secret key** (`sb_secret_…`) / **service_role** | Solo en Edge Functions (WhatsApp, IA, push): ignora todas las políticas RLS |
| Contraseña de la base de datos | Solo para `supabase link` / `db push` (Mauro) |

---

## 2. Configuración

1. Copiar la plantilla en la raíz del proyecto y completar los valores reales:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxx
   ```

2. Reiniciar Expo limpiando caché para que tome las variables:

   ```bash
   npx expo start -c
   ```

- Expo solo expone a la app las variables que empiezan con `EXPO_PUBLIC_`.
- Si faltan, `src/services/supabase.ts` usa valores `placeholder` y todas las consultas fallan.

---

## 3. Uso en una pantalla

Todo el equipo importa **el mismo** cliente:

```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase'; // o la ruta relativa a src/services/supabase

export function useNoticias() {
  return useQuery({
    queryKey: ['neighborhood_news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('neighborhood_news')
        .select('id, title, content, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data; // tipado automáticamente por database.ts
    },
  });
}
```

> ⚠️ Casi todas las políticas RLS son `TO authenticated`: **sin sesión iniciada las
> consultas devuelven una lista vacía** (no un error).

---

## 4. Referencia rápida por módulo

### Autenticación y perfil (Juan · SPEC-01)

```ts
await supabase.auth.signUp({ email, password });
await supabase.auth.signInWithPassword({ email, password });

// Crear el perfil: sin role ni group_id (se registra como 'vecino')
await supabase.from('profiles').insert({
  id: user.id, full_name, phone, home_address,
  home_location: `SRID=4326;POINT(${lng} ${lat})`, // longitud primero, luego latitud
});

await supabase.from('profiles').update({ push_token }).eq('id', user.id);
```

### Capa pública (Gadiel · SPEC-03)

```ts
await supabase.rpc('get_nearby_services', {
  user_home_lat: -12.07, user_home_lng: -77.035, radius_meters: 500,
});
await supabase.from('user_favorites').insert({ user_id, service_id });
await supabase.from('chat_conversations').insert({ service_id, client_id, provider_id });
await supabase.from('chat_messages').insert({ conversation_id, sender_id, content, is_review_request: true });
await supabase.from('reviews').insert({ service_id, client_id, rating: 5, comment });
await supabase.from('service_reports').insert({ reporter_id, service_id, reason: 'COBRO_ABUSIVO' });
```

### Capa privada (Mauricio · SPEC-04)

```ts
await supabase.from('solidary_posts').select('*').order('created_at', { ascending: false });
await supabase.from('solidary_posts').insert({ author_id, group_id, post_type: 'PRESTAMO', category, description });
await supabase.from('care_assignments').update({ status: 'AL_DIA' }).eq('id', assignmentId);
await supabase.from('sos_alerts').insert({ sender_id, group_id, location: `SRID=4326;POINT(${lng} ${lat})` });
await supabase.rpc('approve_join_request', { request_id });
```

### Emergencias (Ronald · SPEC-05)

```ts
await supabase.from('emergency_events').insert({ group_id, event_type: 'SISMO', activated_by });
await supabase.from('emergency_events').update({ status: 'RESOLVED' }).eq('id', eventId);

supabase
  .channel('emergencias')
  .on('postgres_changes',
      { event: '*', schema: 'public', table: 'emergency_events' },
      (payload) => console.log('Cambio de emergencia', payload))
  .subscribe();
```

Tablas con Realtime (SPEC-02 §5): `emergency_events`, `solidary_posts`,
`group_join_requests`, `chat_messages`.

---

## 5. Quién puede hacer qué (RLS · SPEC-02 §4 y §4.1)

| Operación | Quién puede | Nota para la app |
|---|---|---|
| Crear el perfil (`profiles` INSERT) | El propio usuario | Se crea como `vecino` y sin grupo; enviar `role` o `group_id` hace fallar el insert |
| Editar el perfil (`profiles` UPDATE) | El propio usuario | Solo `full_name`, `phone`, `home_address`, `home_location`, `is_vulnerable`, `push_token` |
| Otorgar Visto Bueno (`reviews` INSERT) | El cliente del chat | Solo después de un mensaje del prestador con `is_review_request = true` |
| Ver y asignar padrinos (`care_assignments`) | Padrino (lo suyo) y dirigentes | El padrino actualiza `status` / `notes`; el dirigente asigna y quita |
| Publicar noticias (`neighborhood_news` INSERT) | Dirigentes | Todos con sesión pueden leerlas |
| Activar / cerrar emergencia (`emergency_events`) | Dirigentes | Cerrar = `status: 'RESOLVED'` |
| Enviar un SOS (`sos_alerts` INSERT) | El propio usuario | `sender_id` debe ser el usuario con sesión |
| Ver un SOS (`sos_alerts` SELECT) | Remitente, sus padrinos y dirigentes | Un vecino común no ve SOS ajenos |
| Ver grupos vecinales (`neighborhood_groups`) | Todos con sesión | Se crean desde el panel de Supabase |

> Las cuentas con rol `dirigente` o `padrino` se asignan desde el panel de Supabase
> (o por SQL); desde la app solo se crean vecinos.

---

## 6. Ubicaciones (`geography`)

Las columnas `home_location`, `boundary` y `location` se **envían** como texto
`SRID=4326;POINT(lng lat)`, pero se **reciben** en formato binario (en `database.ts` aparecen
como `unknown`). Para mostrar distancias usen las RPC `get_nearby_services` y
`get_nearby_groups`, que ya devuelven metros.

---

## 7. Regenerar los tipos

Después de cada migración nueva, desde la raíz del proyecto:

```bash
npx supabase gen types typescript --remote --schema public > src/types/database.ts
```

No editar `database.ts` a mano: los tipos auxiliares van en `index.ts`.
