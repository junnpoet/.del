export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Lee un punto de PostGIS (hex EWKB, WKT o GeoJSON) y devuelve lat/lng. */
export function parseGeoPoint(value: unknown): GeoPoint | null {
  if (!value) return null;

  if (typeof value === 'object') {
    const coords = (value as { coordinates?: unknown }).coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      return { lng: Number(coords[0]), lat: Number(coords[1]) };
    }
    return null;
  }
  if (typeof value !== 'string') return null;

  const wkt = value.match(/POINT\s*\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s*\)/i);
  if (wkt) return { lng: parseFloat(wkt[1]), lat: parseFloat(wkt[2]) };

  if (!/^[0-9a-fA-F]+$/.test(value) || value.length < 42) return null;
  const bytes = new Uint8Array(value.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(value.substr(i * 2, 2), 16);
  }
  const view = new DataView(bytes.buffer);
  const little = bytes[0] === 1;
  const type = view.getUint32(1, little);
  const hasSrid = (type & 0x20000000) !== 0;
  const offset = 5 + (hasSrid ? 4 : 0);
  if (bytes.length < offset + 16) return null;
  return {
    lng: view.getFloat64(offset, little),
    lat: view.getFloat64(offset + 8, little),
  };
}
