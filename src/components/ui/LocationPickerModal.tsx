import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Home, LocateFixed, X } from 'lucide-react-native';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPickerModalProps {
  visible: boolean;
  initialCoords: Coordinates;
  gpsCoords: Coordinates;
  onConfirm: (coords: Coordinates) => void;
  onClose: () => void;
  onRecenterGps?: () => Promise<Coordinates | null>;
}

function buildPickerHtml(initial: Coordinates): string {
  const initialJson = JSON.stringify(initial);
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
    }
    .gps-dot {
      width: 14px;
      height: 14px;
      border-radius: 9999px;
      background: #2563EB;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.22);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    (function () {
      var initial = ${initialJson};
      var map = L.map('map', {
        zoomControl: false,
        attributionControl: false
      }).setView([initial.latitude, initial.longitude], 17);

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

      var gpsMarker = null;
      window.__setGpsMarker = function (lat, lng) {
        if (gpsMarker) {
          gpsMarker.setLatLng([lat, lng]);
        } else {
          var icon = L.divIcon({
            className: '',
            html: '<div class="gps-dot"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          gpsMarker = L.marker([lat, lng], { icon: icon, interactive: false }).addTo(map);
        }
      };

      window.__recenterMap = function (lat, lng) {
        map.setView([lat, lng], 17, { animate: true });
      };

      function notifyCenter() {
        var c = map.getCenter();
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'centerChange',
            latitude: c.lat,
            longitude: c.lng
          }));
        }
      }

      map.on('moveend', notifyCenter);
      window.__setGpsMarker(initial.latitude, initial.longitude);
    })();
  </script>
</body>
</html>`;
}

export function LocationPickerModal({
  visible,
  initialCoords,
  gpsCoords,
  onConfirm,
  onClose,
  onRecenterGps,
}: LocationPickerModalProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<{ injectJavaScript: (script: string) => void } | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<Coordinates>(initialCoords);
  const [isRecentering, setIsRecentering] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedCoords(initialCoords);
    }
  }, [visible, initialCoords]);

  useEffect(() => {
    if (!visible) return;
    webViewRef.current?.injectJavaScript(
      `window.__setGpsMarker && window.__setGpsMarker(${gpsCoords.latitude}, ${gpsCoords.longitude}); true;`
    );
  }, [visible, gpsCoords.latitude, gpsCoords.longitude]);

  const handleReturnToGps = async () => {
    setIsRecentering(true);
    try {
      const fresh = onRecenterGps ? await onRecenterGps() : null;
      const target = fresh ?? gpsCoords;
      setSelectedCoords(target);
      webViewRef.current?.injectJavaScript(
        `window.__setGpsMarker && window.__setGpsMarker(${target.latitude}, ${target.longitude}); window.__recenterMap && window.__recenterMap(${target.latitude}, ${target.longitude}); true;`
      );
    } finally {
      setIsRecentering(false);
    }
  };

  if (!visible) return null;

  const { WebView } =
    Platform.OS !== 'web'
      ? (require('react-native-webview') as typeof import('react-native-webview'))
      : { WebView: null };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-neutral-background">
        {/* Top Header */}
        <View
          className="flex-row items-center justify-between border-b border-neutral-border/70 bg-neutral-surface px-4 pb-3"
          style={{ paddingTop: Math.max(insets.top + 8, 20) }}
        >
          <View className="flex-1 pr-3">
            <Text
              className="text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17 }}
            >
              Ubica tu hogar en el mapa
            </Text>
            <Text
              className="mt-0.5 text-neutral-textMuted"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12.5 }}
            >
              Mueve el mapa para ajustar el puntero con precisión
            </Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Cerrar mapa"
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full bg-neutral-mutedBg"
          >
            <X size={18} color="#6C727A" />
          </TouchableOpacity>
        </View>

        {/* Map + Fixed Center Pin */}
        <View className="relative flex-1">
          {WebView ? (
            <WebView
              ref={webViewRef as any}
              originWhitelist={['*']}
              source={{
                html: buildPickerHtml(initialCoords),
                baseUrl: 'https://sumayni.app',
              }}
              javaScriptEnabled
              domStorageEnabled
              style={{ flex: 1, backgroundColor: '#E8F0EC' }}
              onMessage={(event) => {
                try {
                  const parsed = JSON.parse(event.nativeEvent.data);
                  if (
                    parsed?.type === 'centerChange' &&
                    typeof parsed.latitude === 'number' &&
                    typeof parsed.longitude === 'number'
                  ) {
                    setSelectedCoords({
                      latitude: parsed.latitude,
                      longitude: parsed.longitude,
                    });
                  }
                } catch {
                  // Ignore malformed messages
                }
              }}
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-neutral-mutedBg p-6">
              <Text className="text-neutral-textMuted">
                Mapa interactivo disponible en dispositivo móvil.
              </Text>
            </View>
          )}

          {/* Fixed Center Pointer */}
          <View
            pointerEvents="none"
            className="absolute inset-0 items-center justify-center"
          >
            <View className="-mt-7 items-center">
              <View className="h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-primary shadow-lg">
                <Home size={20} color="#FFFFFF" strokeWidth={2.3} />
              </View>
              <View className="h-2.5 w-1 rounded-b-full bg-primary" />
              <View className="mt-0.5 h-2 w-3 rounded-full bg-black/25" />
            </View>
          </View>

          {/* Return to GPS Location Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Volver a mi ubicación actual por GPS"
            onPress={handleReturnToGps}
            disabled={isRecentering}
            activeOpacity={0.85}
            className="absolute bottom-4 right-4 flex-row items-center rounded-full border border-neutral-border bg-white px-3.5 py-2.5"
            style={{ elevation: 4 }}
          >
            <LocateFixed size={18} color="#1E5E45" strokeWidth={2.3} />
            <Text
              className="ml-1.5 text-primary"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12.5 }}
            >
              Mi GPS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Confirm Bar */}
        <View
          className="border-t border-neutral-border/70 bg-neutral-surface px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom + 12, 20) }}
        >
          <Text
            className="mb-2.5 text-center text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
          >
            Lat: {selectedCoords.latitude.toFixed(5)} · Lng: {selectedCoords.longitude.toFixed(5)}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => onConfirm(selectedCoords)}
            activeOpacity={0.9}
            className="min-h-[50px] flex-row items-center justify-center rounded-2xl bg-primary px-4"
          >
            <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text
              className="ml-2 text-white"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              Confirmar ubicación
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
