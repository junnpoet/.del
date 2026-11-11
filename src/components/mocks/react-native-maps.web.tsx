import React from 'react';
import { View, Text } from 'react-native';
import { MapPin, Map as MapIcon } from 'lucide-react-native';

export const Marker = ({ children, title, description, coordinate, ...props }: any) => {
  return (
    <View style={{ margin: 4 }} {...props}>
      {children || (
        <View style={{ alignItems: 'center' }}>
          <MapPin size={24} color="#1E5E45" />
          {title && (
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1E293B', backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 4, borderRadius: 4 }}>
              {title}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export const Circle = (props: any) => null;
export const Polygon = (props: any) => null;
export const Polyline = (props: any) => null;
export const Callout = ({ children, ...props }: any) => <View {...props}>{children}</View>;

export const PROVIDER_DEFAULT = 'default';
export const PROVIDER_GOOGLE = 'google';

const MapView = React.forwardRef(({ children, style, initialRegion, ...props }: any, ref) => {
  return (
    <View
      ref={ref}
      style={[
        {
          backgroundColor: '#E8F0EC',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: 16,
          minHeight: 280,
        },
        style,
      ]}
      {...props}
    >
      <View
        style={{
          alignItems: 'center',
          maxWidth: 360,
          zIndex: 1,
          backgroundColor: 'rgba(255,255,255,0.95)',
          padding: 18,
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <MapIcon size={36} color="#1E5E45" />
        <Text style={{ marginTop: 8, fontSize: 15, fontWeight: '700', color: '#1E293B', textAlign: 'center' }}>
          Mapa Comunitario (Modo Web)
        </Text>
        <Text style={{ marginTop: 4, fontSize: 12, color: '#64748B', textAlign: 'center' }}>
          Visualización disponible. En la app móvil (Expo Go) se despliega con mapa nativo interactivo completo.
        </Text>
      </View>
      <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', zIndex: 2 }}>
        {children}
      </View>
    </View>
  );
});

export default MapView;

