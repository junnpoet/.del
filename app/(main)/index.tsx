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
            className="flex-row items-center bg-emergency-pastel px-4 py-2.5 rounded-2xl border-2 border-emergency-alert/40 min-h-[46px]"
          >
            <AlertTriangle size={20} color="#E03131" strokeWidth={2.5} />
            <Text
              className="text-emergency-alert ml-1.5"
              style={{ fontFamily: 'Nunito_900Black', fontSize: 15 }}
            >
              SOS
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerClassName="p-4 pb-32">
        {/* Walkable Radius Selector */}
        <View className="mb-5 bg-primary-pastel/70 p-4 rounded-3xl border-2 border-primary-light/60">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-primary items-center justify-center mr-2.5">
                <MapPin size={20} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text
                className="text-primary-dark flex-1"
                style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}
              >
                Radio caminable desde tu hogar:
              </Text>
            </View>
            <View className="bg-primary px-3 py-1 rounded-xl">
              <Text
                className="text-white"
                style={{ fontFamily: 'Nunito_900Black', fontSize: 16 }}
              >
                {selectedRadius}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2.5">
            {(['300m', '500m', '1km'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setSelectedRadius(r)}
                className={`flex-1 min-h-[52px] items-center justify-center rounded-2xl border-2 ${
                  selectedRadius === r
                    ? 'bg-primary border-primary-dark shadow-sm'
                    : 'bg-neutral-surface border-primary-light/50'
                }`}
              >
                <Text
                  className={
                    selectedRadius === r ? 'text-white' : 'text-primary-dark'
                  }
                  style={{
                    fontFamily:
                      selectedRadius === r
                        ? 'Nunito_900Black'
                        : 'Nunito_700Bold',
                    fontSize: 17,
                  }}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories Chips */}
        <View className="mb-4">
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
        <Text
          className="text-neutral-textMain mb-3.5 px-1"
          style={{ fontFamily: 'Nunito_900Black', fontSize: 18 }}
        >
          Vecinos Prestadores en tu Sector ({filteredServices.length})
        </Text>

        {filteredServices.map((service) => (
          <Card key={service.id} className="mb-4 p-5">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-3">
                <Text
                  className="text-neutral-textMain mb-1 leading-7"
                  style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 20 }}
                >
                  {service.title}
                </Text>
                <Text
                  className="text-neutral-textMuted"
                  style={{ fontFamily: 'Nunito_700Bold', fontSize: 16 }}
                >
                  Por {service.provider}
                </Text>
              </View>

              <View className="bg-sun-pastel px-3.5 py-1.5 rounded-2xl border border-sun/40 flex-row items-center">
                <Star size={18} color="#B45309" fill="#F59E0B" />
                <Text
                  className="text-sun-dark ml-1.5"
                  style={{ fontFamily: 'Nunito_900Black', fontSize: 16 }}
                >
                  {service.rating.toFixed(1)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between pt-3 mt-1 border-t-2 border-neutral-mutedBg flex-wrap gap-2">
              <View className="flex-row items-center bg-neutral-mutedBg px-3 py-1.5 rounded-xl">
                <MapPin size={18} color="#2D6A4F" strokeWidth={2.5} />
                <Text
                  className="text-neutral-textMain ml-1.5"
                  style={{ fontFamily: 'Nunito_700Bold', fontSize: 15 }}
                >
                  {service.distance}
                </Text>
              </View>

              {service.hasNeighborhoodSeal && (
                <View className="flex-row items-center bg-earth-pastel px-3 py-1.5 rounded-xl border border-earth-light">
                  <ShieldCheck size={18} color="#6D3B1E" strokeWidth={2.5} />
                  <Text
                    className="text-earth-dark ml-1.5"
                    style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 14 }}
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
