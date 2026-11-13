import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

export interface LeafletMarkerItem {
  id: string;
  latitude: number;
  longitude: number;
  color: string;
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
    .sumayni-pin {
      width: 24px;
      height: 24px;
      border-radius: 9999px;
      border: 3px solid #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.28);
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
      width: 20px;
      height: 20px;
      border-radius: 9999px;
      background: #1E5E45;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 0 4px rgba(30, 94, 69, 0.22);
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
      osm.on('tileerror', function () {
        if (!map.hasLayer(arcgis)) {
          arcgis.addTo(map);
        }
      });
      osm.addTo(map);

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
          var homeIcon = L.divIcon({
            className: '',
            html: '<div class="sumayni-home"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          var homeMarker = L.marker([lat, lng], { icon: homeIcon }).addTo(layerGroup);
          if (payload.homeTitle) {
            homeMarker.bindPopup(
              '<strong>' + escapeHtml(payload.homeTitle) + '</strong>' +
              (payload.homeSubtitle ? '<br/><span>' + escapeHtml(payload.homeSubtitle) + '</span>' : '')
            );
          }
        }

        (payload.markers || []).forEach(function (m) {
          var html = m.badgeText
            ? '<div class="sumayni-badge-pin" style="background:' + escapeHtml(m.color) + '">' + escapeHtml(m.badgeText) + '</div>'
            : '<div class="sumayni-pin" style="background:' + escapeHtml(m.color) + '"></div>';

          var icon = L.divIcon({
            className: '',
            html: html,
            iconSize: m.badgeText ? null : [24, 24],
            iconAnchor: m.badgeText ? [40, 14] : [12, 12]
          });

          var marker = L.marker([m.latitude, m.longitude], { icon: icon }).addTo(layerGroup);
          if (m.title) {
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
  onMarkerPress,
  style,
  webFallback,
}: LeafletMapProps) {
  const webViewRef = useRef<{ injectJavaScript: (script: string) => void } | null>(null);
  const resolvedZoom = zoom ?? radiusToZoom(radiusMeters);

  const payload = useMemo(
    () => ({
      center,
      radiusMeters,
      zoom: resolvedZoom,
      showHomePin,
      homeTitle,
      homeSubtitle,
      markers,
    }),
    [center, radiusMeters, resolvedZoom, showHomePin, homeTitle, homeSubtitle, markers]
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
    </View>
  );
}
