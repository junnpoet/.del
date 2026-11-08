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
    <SafeAreaView className="flex-1 bg-neutral-background">
      <Header
        title="Muro Solidario"
        subtitle="Junta Vecinal Sector 4 · Apoyo mutuo"
      />

      <View className="p-4 flex-1">
        {/* Toggle [ Muro Feed | Mapa Barrial ] */}
        <View className="flex-row bg-neutral-surface p-1 rounded-2xl border border-neutral-border mb-3">
          <TouchableOpacity
            onPress={() => setActiveTab('feed')}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
              activeTab === 'feed' ? 'bg-primary' : 'bg-transparent'
            }`}
          >
            <LayoutGrid
              size={18}
              color={activeTab === 'feed' ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              className={`text-xs font-bold ml-1.5 ${
                activeTab === 'feed' ? 'text-white' : 'text-neutral-textMuted'
              }`}
            >
              Muro Feed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('map')}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
              activeTab === 'map' ? 'bg-primary' : 'bg-transparent'
            }`}
          >
            <Map
              size={18}
              color={activeTab === 'map' ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              className={`text-xs font-bold ml-1.5 ${
                activeTab === 'map' ? 'text-white' : 'text-neutral-textMuted'
              }`}
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
          <ScrollView contentContainerClassName="pb-24 pt-2">
            {DEMO_POSTS.map((post) => (
              <Card key={post.id} className="mb-3 p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <View
                      className={`px-2 py-0.5 rounded-full ${
                        post.type === 'AYUDA'
                          ? 'bg-emergency-alert/15'
                          : post.type === 'PRESTAMO'
                          ? 'bg-primary/15'
                          : 'bg-earth/20'
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${
                          post.type === 'AYUDA'
                            ? 'text-emergency-alert'
                            : post.type === 'PRESTAMO'
                            ? 'text-primary'
                            : 'text-earth-dark'
                        }`}
                      >
                        {post.type}
                      </Text>
                    </View>

                    {post.isFromVoice && (
                      <View className="flex-row items-center ml-2 bg-neutral-border px-1.5 py-0.5 rounded">
                        <Sparkles size={11} color="#2D6A4F" />
                        <Text className="text-[10px] text-primary font-medium ml-1">
                          Voz IA
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row items-center">
                    <Clock size={12} color="#9CA3AF" />
                    <Text className="text-xs text-neutral-textMuted ml-1">
                      {post.timeAgo}
                    </Text>
                  </View>
                </View>

                <Text className="text-base font-bold text-neutral-textMain mb-1">
                  {post.title}
                </Text>
                <Text className="text-xs font-semibold text-neutral-textMuted mb-2">
                  Por {post.author}
                </Text>
                <Text className="text-sm text-neutral-textMain leading-5 mb-3">
                  {post.description}
                </Text>

                <View className="pt-2 border-t border-neutral-border flex-row justify-between items-center">
                  <TouchableOpacity className="min-h-[40px] px-3 bg-primary/10 rounded-lg justify-center">
                    <Text className="text-xs font-bold text-primary">
                      Responder / Ayudar
                    </Text>
                  </TouchableOpacity>
                  <Share2 size={18} color="#9CA3AF" />
                </View>
              </Card>
            ))}
          </ScrollView>
        ) : (
          <View className="flex-1 bg-neutral-surface border border-neutral-border rounded-2xl items-center justify-center p-6">
            <Map size={48} color="#2D6A4F" />
            <Text className="text-base font-bold text-neutral-textMain mt-3 text-center">
              Mapa Barrial de Solidaridad
            </Text>
            <Text className="text-xs text-neutral-textMuted text-center mt-1 px-4">
              Geolocalización protegida de pedidos y préstamos vecinales en radio de 500m.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
