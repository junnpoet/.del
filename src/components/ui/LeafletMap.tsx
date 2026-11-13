import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { Layers } from 'lucide-react-native';

export interface LeafletMarkerItem {
  id: string;
  latitude: number;
  longitude: number;
  color: string;
  colors?: string[];
  iconType?: 'servicio' | 'producto' | 'auxilio' | 'multi';
  count?: number;
  title: string;
  subtitle?: string;
  badgeText?: string;
}

export interface LeafletMapProps {
  center: { latitude: number; longitude: number };
  radiusMeters?: number;
  zoom?: number;
  showHomePin?: boolean;
  homeTitle?: string;
  homeSubtitle?: string;
  markers: LeafletMarkerItem[];
  showMarkerPopup?: boolean;
  onMarkerPress?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
  webFallback?: React.ReactNode;
}

function radiusToZoom(radiusMeters?: number): number {
  if (!radiusMeters) return 15;
  if (radiusMeters <= 350) return 16;
  if (radiusMeters <= 700) return 15;
  return 14;
}

function buildLeafletHtml(initialPayloadJson: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #E8F0EC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .sumayni-pin-wrap {
      position: relative;
      width: 32px;
      height: 38px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .sumayni-pin {
      width: 30px;
      height: 30px;
      border-radius: 9999px;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 3px 8px rgba(0,0,0,0.28);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sumayni-pin-tail {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 7px solid #FFFFFF;
      margin-top: -2px;
      filter: drop-shadow(0 2px 2px rgba(0,0,0,0.22));
    }
    .sumayni-pin-core {
      width: 17px;
      height: 17px;
      border-radius: 9999px;
      background: #FFFFFF;
      color: #111827;
      font-size: 10px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 2px rgba(0,0,0,0.18);
    }
    .sumayni-pin-count {
      position: absolute;
      top: -4px;
      right: -3px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 9999px;
      background: #111827;
      border: 1.5px solid #FFFFFF;
      color: #FFFFFF;
      font-size: 9px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sumayni-badge-pin {
      padding: 4px 10px;
      border-radius: 9999px;
      border: 2px solid #FFFFFF;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.28);
    }
    .sumayni-home {
      width: 36px;
      height: 36px;
      border-radius: 9999px;
      background: #1E5E45;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 0 6px rgba(30, 94, 69, 0.22), 0 3px 8px rgba(0,0,0,0.28);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .leaflet-popup-content {
      margin: 8px 12px;
      font-size: 13px;
      line-height: 1.35;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    (function () {
      var initial = ${initialPayloadJson};
      var map = L.map('map', {
        zoomControl: false,
        attributionControl: false
      }).setView([initial.center.latitude, initial.center.longitude], initial.zoom || 15);

      var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      });
      var arcgis = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });
      var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });
      var useArcgisStreet = false;
      osm.on('tileerror', function () {
        useArcgisStreet = true;
        if (!map.hasLayer(satellite) && !map.hasLayer(arcgis)) {
          arcgis.addTo(map);
        }
      });
      osm.addTo(map);

      window.__setMapMode = function (mode) {
        if (mode === 'satellite') {
          if (map.hasLayer(osm)) map.removeLayer(osm);
          if (map.hasLayer(arcgis)) map.removeLayer(arcgis);
          if (!map.hasLayer(satellite)) satellite.addTo(map);
        } else {
          if (map.hasLayer(satellite)) map.removeLayer(satellite);
          var street = useArcgisStreet ? arcgis : osm;
          if (!map.hasLayer(street)) street.addTo(map);
        }
      };

      var layerGroup = L.layerGroup().addTo(map);

      function escapeHtml(str) {
        return String(str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }

      window.__updateSumayniMap = function (payload) {
        layerGroup.clearLayers();
        if (!payload || !payload.center) return;

        var lat = payload.center.latitude;
        var lng = payload.center.longitude;

        if (payload.radiusMeters) {
          L.circle([lat, lng], {
            radius: payload.radiusMeters,
            color: '#1E5E45',
            weight: 2,
            fillColor: '#1E5E45',
            fillOpacity: 0.12
          }).addTo(layerGroup);
        }

        if (payload.showHomePin) {
          var homeSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></svg>';
          var homeIcon = L.divIcon({
            className: '',
            html: '<div class="sumayni-home">' + homeSvg + '</div>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });
          var homeMarker = L.marker([lat, lng], { icon: homeIcon }).addTo(layerGroup);
          if (payload.homeTitle) {
            homeMarker.bindPopup(
              '<strong>' + escapeHtml(payload.homeTitle) + '</strong>' +
              (payload.homeSubtitle ? '<br/><span>' + escapeHtml(payload.homeSubtitle) + '</span>' : '')
            );
          }
        }

        function getPinIconSvg(iconType) {
          if (iconType === 'servicio') {
            return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
          }
          if (iconType === 'producto') {
            return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
          }
          if (iconType === 'auxilio') {
            return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
          }
          return '<svg width="13" height="13" viewBox="0 0 24 24" fill="#FFFFFF"><circle cx="12" cy="12" r="5"/></svg>';
        }

        function buildConicGradient(colors) {
          var step = 100 / colors.length;
          var stops = colors.map(function (c, idx) {
            return escapeHtml(c) + ' ' + (idx * step).toFixed(1) + '% ' + ((idx + 1) * step).toFixed(1) + '%';
          });
          return 'conic-gradient(' + stops.join(', ') + ')';
        }

        (payload.markers || []).forEach(function (m) {
          var html;
          var iconSize;
          var iconAnchor;

          if (m.badgeText) {
            html = '<div class="sumayni-badge-pin" style="background:' + escapeHtml(m.color) + '">' + escapeHtml(m.badgeText) + '</div>';
            iconSize = null;
            iconAnchor = [40, 14];
          } else {
            var hasMultiColors = Array.isArray(m.colors) && m.colors.length > 1;
            var bgStyle = hasMultiColors ? buildConicGradient(m.colors) : escapeHtml(m.color);
            var inner = hasMultiColors
              ? '<div class="sumayni-pin-core">' + (m.count || m.colors.length) + '</div>'
              : getPinIconSvg(m.iconType);
            var countBadge = !hasMultiColors && m.count && m.count > 1
              ? '<div class="sumayni-pin-count">' + m.count + '</div>'
              : '';
            html =
              '<div class="sumayni-pin-wrap">' +
                '<div class="sumayni-pin" style="background:' + bgStyle + '">' + inner + '</div>' +
                '<div class="sumayni-pin-tail"></div>' +
                countBadge +
              '</div>';
            iconSize = [32, 38];
            iconAnchor = [16, 36];
          }

          var icon = L.divIcon({
            className: '',
            html: html,
            iconSize: iconSize,
            iconAnchor: iconAnchor
          });

          var marker = L.marker([m.latitude, m.longitude], { icon: icon }).addTo(layerGroup);
          if (payload.showMarkerPopup && m.title) {
            marker.bindPopup(
              '<strong>' + escapeHtml(m.title) + '</strong>' +
              (m.subtitle ? '<br/><span>' + escapeHtml(m.subtitle) + '</span>' : '')
            );
          }
          marker.on('click', function () {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: m.id }));
            }
          });
        });

        map.setView([lat, lng], payload.zoom || 15, { animate: true });
      };

      window.__updateSumayniMap(initial);
    })();
  </script>
</body>
</html>`;
}

export function LeafletMap({
  center,
  radiusMeters,
  zoom,
  showHomePin = false,
  homeTitle,
  homeSubtitle,
  markers,
  showMarkerPopup,
  onMarkerPress,
  style,
  webFallback,
}: LeafletMapProps) {
  const webViewRef = useRef<{ injectJavaScript: (script: string) => void } | null>(null);
  const [satellite, setSatellite] = useState(false);
  const resolvedZoom = zoom ?? radiusToZoom(radiusMeters);
  const resolvedShowMarkerPopup = showMarkerPopup ?? !onMarkerPress;

  const payload = useMemo(
    () => ({
      center,
      radiusMeters,
      zoom: resolvedZoom,
      showHomePin,
      homeTitle,
      homeSubtitle,
      markers,
      showMarkerPopup: resolvedShowMarkerPopup,
    }),
    [
      center,
      radiusMeters,
      resolvedZoom,
      showHomePin,
      homeTitle,
      homeSubtitle,
      markers,
      resolvedShowMarkerPopup,
    ]
  );

  // Keep initial HTML stable so the WebView doesn't reload on filter/radius changes.
  const initialHtmlRef = useRef<string | null>(null);
  if (initialHtmlRef.current === null) {
    initialHtmlRef.current = buildLeafletHtml(JSON.stringify(payload));
  }

  useEffect(() => {
    const serialized = JSON.stringify(payload);
    webViewRef.current?.injectJavaScript(
      `window.__updateSumayniMap && window.__updateSumayniMap(${serialized}); true;`
    );
  }, [payload]);

  useEffect(() => {
    const mode = satellite ? 'satellite' : 'street';
    webViewRef.current?.injectJavaScript(
      `window.__setMapMode && window.__setMapMode('${mode}'); true;`
    );
  }, [satellite]);

  if (Platform.OS === 'web') {
    return <>{webFallback ?? <View style={[{ flex: 1 }, style]} />}</>;
  }

  const { WebView } = require('react-native-webview') as typeof import('react-native-webview');

  return (
    <View style={[{ flex: 1, overflow: 'hidden' }, style]}>
      <WebView
        ref={webViewRef as any}
        originWhitelist={['*']}
        source={{ html: initialHtmlRef.current, baseUrl: 'https://sumayni.app' }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        nestedScrollEnabled
        style={{ flex: 1, backgroundColor: '#E8F0EC' }}
        onMessage={(event) => {
          try {
            const parsed = JSON.parse(event.nativeEvent.data);
            if (parsed?.type === 'markerPress' && typeof parsed.id === 'string') {
              onMarkerPress?.(parsed.id);
            }
          } catch {
            // Ignore malformed messages
          }
        }}
      />

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={satellite ? 'Cambiar a vista mapa' : 'Cambiar a vista satélite'}
        onPress={() => setSatellite((prev) => !prev)}
        activeOpacity={0.85}
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 9999,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: satellite ? '#1E5E45' : 'rgba(255,255,255,0.95)',
          borderWidth: 1,
          borderColor: satellite ? '#1E5E45' : '#E5E7EB',
          elevation: 4,
        }}
      >
        <Layers size={15} color={satellite ? '#FFFFFF' : '#1E5E45'} strokeWidth={2.2} />
        <Text
          style={{
            marginLeft: 6,
            fontFamily: 'PlusJakartaSans_700Bold',
            fontSize: 12,
            color: satellite ? '#FFFFFF' : '#111827',
          }}
        >
          {satellite ? 'Mapa' : 'Satélite'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
