# Sumayni · Base de datos (SPEC-02)

Implementación literal de [docs/specs/SPEC-02-BACKEND-POSTGIS.md](../docs/specs/SPEC-02-BACKEND-POSTGIS.md).

| Archivo | Sección de la SPEC-02 |
|---|---|
| `migrations/20261108130000_spec02_extensions.sql` | §2.1 · PostGIS |
| `migrations/20261108130100_spec02_tablas.sql` | §2 · 14 tablas + índice `GIST(home_location)` del checklist |
| `migrations/20261108130200_spec02_funciones.sql` | §3 · `is_dirigente`, `is_padrino_of`, trigger de rating, `get_nearby_services`, `get_nearby_groups`, `approve_join_request` |
| `migrations/20261108130300_spec02_rls.sql` | §4 · Políticas RLS |
| `migrations/20261108130400_spec02_realtime.sql` | §5 · Realtime (`emergency_events`, `solidary_posts`, `group_join_requests`, `chat_messages`) |
| `migrations/20261108140000_spec02_rls_operaciones.sql` | §4.1 · Políticas para registro, Visto Bueno, padrinos, noticias, emergencias y SOS |
| `tests/checklist_spec02.sql` | §6 · Verifica el checklist (datos temporales + ROLLBACK) |
| `tests/rls_operaciones.sql` | §4.1 · Prueba cada operación como un usuario real (datos temporales + ROLLBACK) |

Diferencias técnicas con el texto de la spec (no cambian el diseño):
- PostGIS se instala en el esquema `extensions` y cada migración fija `search_path = public, extensions`.
- Se cierra el bloque de código de §3.3 que en la spec quedó abierto.

## Aplicar

```bash
npx supabase db push --remote
```

## Generar tipos (checklist ítem 7)

```bash
npx supabase gen types typescript --remote --schema public > src/types/database.ts
```
