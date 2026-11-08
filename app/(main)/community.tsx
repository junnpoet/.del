import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  HeartHandshake,
  LayoutGrid,
  Map,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { Chip } from '../../src/components/ui/Chip';
import { Header } from '../../src/components/ui/Header';

interface PostDemoItem {
  id: string;
  type: 'PRESTAMO' | 'DONACION' | 'TRUEQUE' | 'VOLUNTARIADO' | 'AYUDA';
  title: string;
  author: string;
  description: string;
  timeAgo: string;
  urgency: 'BAJA' | 'MEDIA' | 'ALTA_CRITICA';
  isFromVoice: boolean;
}

const DEMO_POSTS: PostDemoItem[] = [
  {
    id: 'p-1',
    type: 'PRESTAMO',
    title: 'Préstamo de Escalera Telescópica',
    author: 'Familia Quispe (Mz. C)',
    description: 'La tenemos libre todo el fin de semana por si algún vecino la requiere para limpieza o techado.',
    timeAgo: 'Hace 25 min',
    urgency: 'BAJA',
    isFromVoice: false,
  },
  {
    id: 'p-2',
    type: 'AYUDA',
    title: 'Apoyo para adulto mayor en compras',
    author: 'Don Jacinto (82 años)',
    description: 'Requiero apoyo para traer bolsa pesada del mercado de la esquina. Mi padrino está en turno de trabajo.',
    timeAgo: 'Hace 40 min',
    urgency: 'ALTA_CRITICA',
    isFromVoice: true,
  },
  {
    id: 'p-3',
    type: 'DONACION',
    title: 'Libros escolares primaria y secundaria',
    author: 'Rosa Flores (Mz. F)',
    description: 'Enciclopedias y textos en excelente estado para los niños del barrio.',
    timeAgo: 'Hace 2 horas',
    urgency: 'BAJA',
    isFromVoice: false,
  },
];

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<'feed' | 'map'>('feed');
  const [selectedFilter, setSelectedFilter] = useState('TODOS');

  const filters = ['TODOS', 'PRESTAMO', 'DONACION', 'TRUEQUE', 'VOLUNTARIADO', 'AYUDA'];

  return (
    <View className="flex-1 bg-neutral-background">
      <Header
        title="Muro Solidario"
        subtitle="Junta Vecinal Sector 4 · Apoyo mutuo"
      />

      <View className="p-4 flex-1">
        {/* Toggle [ Muro Feed | Mapa Barrial ] */}
        <View className="flex-row bg-neutral-mutedBg p-1 rounded-2xl mb-3">
          <TouchableOpacity
            onPress={() => setActiveTab('feed')}
            className={`flex-1 flex-row items-center justify-center min-h-[38px] rounded-xl ${
              activeTab === 'feed'
                ? 'bg-neutral-surface shadow-xs'
                : 'bg-transparent'
            }`}
          >
            <LayoutGrid
              size={16}
              color={activeTab === 'feed' ? '#1A1D20' : '#6C727A'}
              strokeWidth={2}
            />
            <Text
              className={`ml-1.5 ${
                activeTab === 'feed' ? 'text-neutral-textMain' : 'text-neutral-textMuted'
              }`}
              style={{
                fontFamily:
                  activeTab === 'feed'
                    ? 'PlusJakartaSans_700Bold'
                    : 'PlusJakartaSans_500Medium',
                fontSize: 14,
              }}
            >
              Muro Feed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('map')}
            className={`flex-1 flex-row items-center justify-center min-h-[38px] rounded-xl ${
              activeTab === 'map'
                ? 'bg-neutral-surface shadow-xs'
                : 'bg-transparent'
            }`}
          >
            <Map
              size={16}
              color={activeTab === 'map' ? '#1A1D20' : '#6C727A'}
              strokeWidth={2}
            />
            <Text
              className={`ml-1.5 ${
                activeTab === 'map' ? 'text-neutral-textMain' : 'text-neutral-textMuted'
              }`}
              style={{
                fontFamily:
                  activeTab === 'map'
                    ? 'PlusJakartaSans_700Bold'
                    : 'PlusJakartaSans_500Medium',
                fontSize: 14,
              }}
            >
              Mapa Barrial
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View className="mb-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((f) => (
              <Chip
                key={f}
                label={f}
                isActive={selectedFilter === f}
                onPress={() => setSelectedFilter(f)}
              />
            ))}
          </ScrollView>
        </View>

        {activeTab === 'feed' ? (
          <ScrollView contentContainerClassName="pb-28 pt-1">
            {DEMO_POSTS.map((post) => (
              <Card key={post.id} className="mb-3 p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <View
                      className={`px-2.5 py-1 rounded-xl ${
                        post.type === 'AYUDA'
                          ? 'bg-emergency-tint'
                          : 'bg-neutral-mutedBg'
                      }`}
                    >
                      <Text
                        className={
                          post.type === 'AYUDA'
                            ? 'text-emergency-alert'
                            : 'text-neutral-textMain'
                        }
                        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                      >
                        {post.type}
                      </Text>
                    </View>

                    {post.isFromVoice && (
                      <View className="flex-row items-center ml-2 bg-neutral-mutedBg px-2 py-0.5 rounded-lg">
                        <Sparkles size={12} color="#1E5E45" />
                        <Text
                          className="text-neutral-textMain ml-1"
                          style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11 }}
                        >
                          Voz IA
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row items-center">
                    <Clock size={13} color="#9EA3AE" />
                    <Text
                      className="text-neutral-textLight ml-1"
                      style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
                    >
                      {post.timeAgo}
                    </Text>
                  </View>
                </View>

                <Text
                  className="text-neutral-textMain mb-0.5 leading-6"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
                >
                  {post.title}
                </Text>
                <Text
                  className="text-neutral-textMuted mb-2"
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                >
                  Por {post.author}
                </Text>
                <Text
                  className="text-neutral-textMain leading-5 mb-3"
                  style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}
                >
                  {post.description}
                </Text>

                <View className="pt-2.5 border-t border-neutral-border/50 flex-row justify-between items-center">
                  <TouchableOpacity className="min-h-[36px] px-4 bg-neutral-mutedBg rounded-xl justify-center">
                    <Text
                      className="text-neutral-textMain"
                      style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                    >
                      Responder / Ayudar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="h-9 w-9 rounded-xl bg-neutral-mutedBg items-center justify-center">
                    <Share2 size={16} color="#6C727A" />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </ScrollView>
        ) : (
          <View className="flex-1 bg-neutral-surface rounded-3xl shadow-sm shadow-black/5 items-center justify-center p-6 mb-20">
            <View className="w-16 h-16 rounded-full bg-neutral-mutedBg items-center justify-center mb-3">
              <Map size={32} color="#1E5E45" strokeWidth={2} />
            </View>
            <Text
              className="text-neutral-textMain text-center"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}
            >
              Mapa Barrial de Solidaridad
            </Text>
            <Text
              className="text-neutral-textMuted text-center mt-1.5 px-4 leading-5"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
            >
              Geolocalización protegida de pedidos y préstamos vecinales en radio de 500m.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
