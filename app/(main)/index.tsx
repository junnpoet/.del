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
    <SafeAreaView className="flex-1 bg-neutral-background">
      <Header
        title="Directorio de Oficios"
        subtitle="Tu barrio a pie · Radio desde tu hogar"
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/emergency-board')}
            className="flex-row items-center bg-emergency-alert/15 px-3 py-1.5 rounded-full border border-emergency-alert/30"
          >
            <AlertTriangle size={16} color="#D90429" />
            <Text className="text-xs font-bold text-emergency-alert ml-1">
              SOS
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerClassName="p-4 pb-28">
        {/* Walkable Radius Selector */}
        <View className="mb-4 bg-neutral-surface p-3 rounded-2xl border border-neutral-border">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MapPin size={18} color="#2D6A4F" />
              <Text className="text-xs font-bold text-neutral-textMain ml-1">
                Radio caminable desde tu domicilio:
              </Text>
            </View>
            <Text className="text-xs font-bold text-primary">
              {selectedRadius}
            </Text>
          </View>

          <View className="flex-row space-x-2">
            {(['300m', '500m', '1km'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setSelectedRadius(r)}
                className={`flex-1 min-h-[44px] items-center justify-center rounded-xl border ${
                  selectedRadius === r
                    ? 'bg-primary border-primary'
                    : 'bg-neutral-background border-neutral-border'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    selectedRadius === r ? 'text-white' : 'text-neutral-textMain'
                  }`}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
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

        {/* Services List */}
        <Text className="text-sm font-bold text-neutral-textMain mb-3 uppercase tracking-wide">
          Vecinos Prestadores en tu Sector ({filteredServices.length})
        </Text>

        {filteredServices.map((service) => (
          <Card key={service.id} className="mb-3 p-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-2">
                <Text className="text-base font-bold text-neutral-textMain mb-1">
                  {service.title}
                </Text>
                <Text className="text-sm text-neutral-textMuted mb-2">
                  Por {service.provider}
                </Text>
              </View>

              <View className="bg-primary/10 px-2.5 py-1 rounded-full flex-row items-center">
                <Star size={14} color="#2D6A4F" fill="#2D6A4F" />
                <Text className="text-xs font-bold text-primary ml-1">
                  {service.rating.toFixed(1)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between pt-2 border-t border-neutral-border">
              <View className="flex-row items-center">
                <MapPin size={14} color="#6B7280" />
                <Text className="text-xs text-neutral-textMuted ml-1">
                  {service.distance}
                </Text>
              </View>

              {service.hasNeighborhoodSeal && (
                <View className="flex-row items-center bg-earth/20 px-2 py-0.5 rounded-md">
                  <ShieldCheck size={14} color="#7F5539" />
                  <Text className="text-[11px] font-semibold text-earth-dark ml-1">
                    Visto Bueno Barrial
                  </Text>
                </View>
              )}
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
