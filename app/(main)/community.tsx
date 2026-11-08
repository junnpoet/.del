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
        <View className="flex-row bg-neutral-mutedBg p-1.5 rounded-2xl border-2 border-neutral-border mb-4">
          <TouchableOpacity
            onPress={() => setActiveTab('feed')}
            className={`flex-1 flex-row items-center justify-center min-h-[50px] rounded-xl ${
              activeTab === 'feed'
                ? 'bg-primary shadow-sm'
                : 'bg-transparent'
            }`}
          >
            <LayoutGrid
              size={22}
              color={activeTab === 'feed' ? '#FFFFFF' : '#5C564F'}
              strokeWidth={2.5}
            />
            <Text
              className={`ml-2 ${
                activeTab === 'feed' ? 'text-white' : 'text-neutral-textMain'
              }`}
              style={{
                fontFamily:
                  activeTab === 'feed'
                    ? 'Nunito_800ExtraBold'
                    : 'Nunito_700Bold',
                fontSize: 17,
              }}
            >
              Muro Feed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('map')}
            className={`flex-1 flex-row items-center justify-center min-h-[50px] rounded-xl ${
              activeTab === 'map'
                ? 'bg-primary shadow-sm'
                : 'bg-transparent'
            }`}
          >
            <Map
              size={22}
              color={activeTab === 'map' ? '#FFFFFF' : '#5C564F'}
              strokeWidth={2.5}
            />
            <Text
              className={`ml-2 ${
                activeTab === 'map' ? 'text-white' : 'text-neutral-textMain'
              }`}
              style={{
                fontFamily:
                  activeTab === 'map'
                    ? 'Nunito_800ExtraBold'
                    : 'Nunito_700Bold',
                fontSize: 17,
              }}
            >
              Mapa Barrial
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View className="mb-3">
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
          <ScrollView contentContainerClassName="pb-32 pt-2">
            {DEMO_POSTS.map((post) => (
              <Card key={post.id} className="mb-4 p-5">
                <View className="flex-row items-center justify-between mb-3 flex-wrap gap-2">
                  <View className="flex-row items-center flex-wrap gap-2">
                    <View
                      className={`px-3.5 py-1.5 rounded-xl border ${
                        post.type === 'AYUDA'
                          ? 'bg-emergency-pastel border-emergency-alert/40'
                          : post.type === 'PRESTAMO'
                          ? 'bg-primary-pastel border-primary-light/60'
                          : 'bg-earth-pastel border-earth-light'
                      }`}
                    >
                      <Text
                        className={
                          post.type === 'AYUDA'
                            ? 'text-emergency-alert'
                            : post.type === 'PRESTAMO'
                            ? 'text-primary-dark'
                            : 'text-earth-dark'
                        }
                        style={{ fontFamily: 'Nunito_900Black', fontSize: 14 }}
                      >
                        {post.type}
                      </Text>
                    </View>

                    {post.isFromVoice && (
                      <View className="flex-row items-center bg-sun-pastel px-3 py-1.5 rounded-xl border border-sun/40">
                        <Sparkles size={15} color="#7C4D12" />
                        <Text
                          className="text-sun-dark ml-1"
                          style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 14 }}
                        >
                          Voz IA
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row items-center">
                    <Clock size={16} color="#5C564F" />
                    <Text
                      className="text-neutral-textMuted ml-1.5"
                      style={{ fontFamily: 'Nunito_700Bold', fontSize: 14 }}
                    >
                      {post.timeAgo}
                    </Text>
                  </View>
                </View>

                <Text
                  className="text-neutral-textMain mb-1 leading-7"
                  style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 20 }}
                >
                  {post.title}
                </Text>
                <Text
                  className="text-neutral-textMuted mb-2.5"
                  style={{ fontFamily: 'Nunito_700Bold', fontSize: 15 }}
                >
                  Por {post.author}
                </Text>
                <Text
                  className="text-neutral-textMain leading-6 mb-4"
                  style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 16 }}
                >
                  {post.description}
                </Text>

                <View className="pt-3 border-t-2 border-neutral-mutedBg flex-row justify-between items-center">
                  <TouchableOpacity className="min-h-[48px] px-5 bg-primary-pastel border border-primary-light/60 rounded-2xl justify-center">
                    <Text
                      className="text-primary-dark"
                      style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}
                    >
                      Responder / Ayudar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="w-12 h-12 rounded-2xl bg-neutral-mutedBg items-center justify-center">
                    <Share2 size={22} color="#5C564F" />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </ScrollView>
        ) : (
          <View className="flex-1 bg-neutral-surface border-2 border-neutral-border rounded-3xl items-center justify-center p-6 mb-24">
            <View className="w-20 h-20 rounded-full bg-primary-pastel items-center justify-center mb-4">
              <Map size={42} color="#1B4332" strokeWidth={2.5} />
            </View>
            <Text
              className="text-neutral-textMain text-center"
              style={{ fontFamily: 'Nunito_900Black', fontSize: 22 }}
            >
              Mapa Barrial de Solidaridad
            </Text>
            <Text
              className="text-neutral-textMuted text-center mt-2 px-3 leading-6"
              style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 16 }}
            >
              Geolocalización protegida de pedidos y préstamos vecinales en radio de 500m.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
