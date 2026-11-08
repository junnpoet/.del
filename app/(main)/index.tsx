import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Store,
  MapPin,
  Star,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Filter,
} from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { Chip } from '../../src/components/ui/Chip';
import { Header } from '../../src/components/ui/Header';

interface ServiceDemoItem {
  id: string;
  title: string;
  provider: string;
  category: string;
  distance: string;
  rating: number;
  reviewsCount: number;
  hasNeighborhoodSeal: boolean;
}

const DEMO_SERVICES: ServiceDemoItem[] = [
  {
    id: 's-1',
    title: 'Gasfitería y Reparación de Fugas',
    provider: 'Don Segundo Morales',
    category: 'Gasfitería',
    distance: '240 m a pie',
    rating: 4.9,
    reviewsCount: 38,
    hasNeighborhoodSeal: true,
  },
  {
    id: 's-2',
    title: 'Electricidad Domiciliaria e Instalaciones',
    provider: 'Luis Quispe',
    category: 'Electricidad',
    distance: '410 m a pie',
    rating: 4.8,
    reviewsCount: 22,
    hasNeighborhoodSeal: true,
  },
  {
    id: 's-3',
    title: 'Arreglos de Ropa y Bastas Express',
    provider: 'Sra. Martha Valdivia',
    category: 'Costura',
    distance: '180 m a pie',
    rating: 5.0,
    reviewsCount: 15,
    hasNeighborhoodSeal: true,
  },
  {
    id: 's-4',
    title: 'Cerrajería y Duplicado de Llaves',
    provider: 'Taller San Martín',
    category: 'Cerrajería',
    distance: '620 m a pie',
    rating: 4.6,
    reviewsCount: 19,
    hasNeighborhoodSeal: false,
  },
];

export default function PublicServicesScreen() {
  const router = useRouter();
  const [selectedRadius, setSelectedRadius] = useState<'300m' | '500m' | '1km'>('500m');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Gasfitería', 'Electricidad', 'Costura', 'Cerrajería'];

  const filteredServices = DEMO_SERVICES.filter((item) => {
    if (selectedCategory === 'Todos') return true;
    return item.category === selectedCategory;
  });

  return (
    <View className="flex-1 bg-neutral-background">
      <Header
        title="Directorio de Oficios"
        subtitle="Tu barrio a pie · Radio desde tu hogar"
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/emergency-board')}
            className="flex-row items-center bg-emergency-tint px-3 py-1.5 rounded-full"
          >
            <AlertTriangle size={15} color="#DC2626" strokeWidth={2.2} />
            <Text
              className="text-emergency-alert ml-1"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
            >
              SOS
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerClassName="p-4 pb-28">
        {/* Walkable Radius Segmented Control */}
        <View className="mb-4 bg-neutral-surface p-3.5 rounded-3xl shadow-sm shadow-black/5">
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center">
              <MapPin size={16} color="#1E5E45" strokeWidth={2.2} />
              <Text
                className="text-neutral-textMain ml-1.5"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
              >
                Radio caminable:
              </Text>
            </View>
            <Text
              className="text-neutral-textMuted"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
            >
              Fijo desde tu hogar
            </Text>
          </View>

          {/* Clean Segmented Control */}
          <View className="flex-row bg-neutral-mutedBg p-1 rounded-2xl">
            {(['300m', '500m', '1km'] as const).map((r) => {
              const isSelected = selectedRadius === r;
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => setSelectedRadius(r)}
                  className={`flex-1 min-h-[38px] items-center justify-center rounded-xl ${
                    isSelected ? 'bg-neutral-surface shadow-xs' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={isSelected ? 'text-neutral-textMain' : 'text-neutral-textMuted'}
                    style={{
                      fontFamily: isSelected ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                      fontSize: 14,
                    }}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Categories Chips */}
        <View className="mb-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                isActive={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Services List Header */}
        <View className="flex-row items-center justify-between mb-3 px-1">
          <Text
            className="text-neutral-textMain"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
          >
            Vecinos Prestadores ({filteredServices.length})
          </Text>
          <Text
            className="text-neutral-textLight"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
          >
            Ordenados por cercanía
          </Text>
        </View>

        {filteredServices.map((service) => (
          <Card key={service.id} className="mb-3 p-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-2">
                <Text
                  className="text-neutral-textMain mb-0.5 leading-6"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
                >
                  {service.title}
                </Text>
                <Text
                  className="text-neutral-textMuted"
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                >
                  Por {service.provider}
                </Text>
              </View>

              <View className="flex-row items-center bg-neutral-mutedBg px-2.5 py-1 rounded-xl">
                <Star size={13} color="#D97706" fill="#D97706" />
                <Text
                  className="text-neutral-textMain ml-1"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                >
                  {service.rating.toFixed(1)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between pt-2.5 mt-1 border-t border-neutral-border/50">
              <View className="flex-row items-center">
                <MapPin size={14} color="#6C727A" strokeWidth={2} />
                <Text
                  className="text-neutral-textMuted ml-1"
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                >
                  {service.distance}
                </Text>
              </View>

              {service.hasNeighborhoodSeal && (
                <View className="flex-row items-center bg-neutral-mutedBg px-2.5 py-1 rounded-xl">
                  <ShieldCheck size={14} color="#1E5E45" strokeWidth={2.2} />
                  <Text
                    className="text-neutral-textMain ml-1"
                    style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
                  >
                    Visto Bueno Barrial
                  </Text>
                </View>
              )}
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
