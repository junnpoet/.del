import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import {
  HeartHandshake,
  LayoutGrid,
  Map as MapIcon,
  Clock,
  Sparkles,
  Share2,
  Lock,
  ShieldCheck,
  CheckCircle,
  Users,
  Eye,
  Check,
  X,
  AlertCircle,
  Heart,
  ChevronRight,
} from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { Chip } from '../../src/components/ui/Chip';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Modal } from '../../src/components/ui/Modal';
import { useDemo } from '../../src/services/demoStore';

interface PostDemoItem {
  id: string;
  type: 'PRESTAMO' | 'DONACION' | 'TRUEQUE' | 'VOLUNTARIADO' | 'AYUDA';
  title: string;
  author: string;
  description: string;
  timeAgo: string;
  urgency: 'BAJA' | 'MEDIA' | 'ALTA_CRITICA';
  isFromVoice: boolean;
  coordinates: { latitude: number; longitude: number };
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
    coordinates: { latitude: -12.0128, longitude: -77.0818 },
  },
  {
    id: 'p-2',
    type: 'AYUDA',
    title: 'Apoyo para adulto mayor en compras de mercado',
    author: 'Don Jacinto (82 años)',
    description: 'Requiero apoyo para traer bolsa pesada del mercado de la esquina. Mi padrino está en turno de trabajo.',
    timeAgo: 'Hace 40 min',
    urgency: 'ALTA_CRITICA',
    isFromVoice: true,
    coordinates: { latitude: -12.0135, longitude: -77.0825 },
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
    coordinates: { latitude: -12.0112, longitude: -77.0810 },
  },
];

// Vulnerable care households for Dirigente view (PROPUESTA.md Section 3)
const VULNERABLE_CARE_HOUSEHOLDS = [
  {
    id: 'care-1',
    name: 'Don Jacinto Valdés (82 años)',
    address: 'Calle Las Dalias 120, Mz. C Lt. 8',
    status: 'ALERTA', // Rojo
    statusColor: '#DC2626',
    statusLabel: 'Alerta / Apoyo Activo',
    lastContact: 'Hace 40 min (Pedido de compra)',
    coordinates: { latitude: -12.0135, longitude: -77.0825 },
  },
  {
    id: 'care-2',
    name: 'Sra. Teófila Gómez (76 años)',
    address: 'Jr. Los Jazmines 410',
    status: 'SEGUIMIENTO', // Amarillo
    statusColor: '#D97706',
    statusLabel: 'Seguimiento Requerido',
    lastContact: 'Hace 5 días',
    coordinates: { latitude: -12.0115, longitude: -77.0830 },
  },
  {
    id: 'care-3',
    name: 'Don Manuel Huertas (88 años)',
    address: 'Calle Los Claveles 132',
    status: 'AL_DIA', // Verde
    statusColor: '#16A34A',
    statusLabel: 'Al día',
    lastContact: 'Ayer (Visitado por Padrino)',
    coordinates: { latitude: -12.0140, longitude: -77.0808 },
  },
];

export default function CommunityScreen() {
  const {
    currentUser,
    requestMembership,
    approveMembership,
    pendingRequests,
    switchUser,
  } = useDemo();

  const [activeTab, setActiveTab] = useState<'feed' | 'map'>('feed');
  const [selectedFilter, setSelectedFilter] = useState('TODOS');
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);

  const filters = ['TODOS', 'PRESTAMO', 'DONACION', 'TRUEQUE', 'VOLUNTARIADO', 'AYUDA'];

  const filteredPosts = DEMO_POSTS.filter((post) => {
    if (selectedFilter === 'TODOS') return true;
    return post.type === selectedFilter;
  });

  const isMemberOrDirigente =
    currentUser.membershipStatus === 'MIEMBRO' ||
    currentUser.membershipStatus === 'DIRIGENTE';

  /* -------------------------------------------------------------
   * GATE 1: CASO VECINO NO SOLICITADO
   * ------------------------------------------------------------- */
  if (currentUser.membershipStatus === 'NO_SOLICITADO') {
    return (
      <View className="flex-1 bg-neutral-background">
        <Header
          title="Muro Solidario"
          subtitle="Capa Privada · Junta Vecinal Sector 4"
        />

        <ScrollView contentContainerClassName="p-5 justify-center flex-grow">
          <Card className="p-6 items-center text-center shadow-md shadow-black/8">
            <View className="w-16 h-16 rounded-full bg-neutral-mutedBg items-center justify-center mb-4">
              <Lock size={28} color="#1E5E45" strokeWidth={2.2} />
            </View>

            <Text
              className="text-neutral-textMain text-center mb-2"
              style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20 }}
            >
              Comunidad Barrial Privada
            </Text>

            <Text
              className="text-neutral-textMuted text-center leading-5 mb-5 px-2"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}
            >
              Para proteger la integridad y privacidad de los hogares, el Muro Solidario
              y los intercambios vecinales sin dinero están reservados a residentes
              validados por la dirigencia del sector.
            </Text>

            {/* Feature List */}
            <View className="w-full bg-neutral-mutedBg/60 rounded-2xl p-4 mb-5">
              <View className="flex-row items-center mb-2.5">
                <CheckCircle size={16} color="#1E5E45" strokeWidth={2.2} />
                <Text
                  className="text-neutral-textMain ml-2.5 flex-1"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                >
                  Préstamos de herramientas sin dinero
                </Text>
              </View>
              <View className="flex-row items-center mb-2.5">
                <CheckCircle size={16} color="#1E5E45" strokeWidth={2.2} />
                <Text
                  className="text-neutral-textMain ml-2.5 flex-1"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                >
                  Donaciones, trueques y voluntariado
                </Text>
              </View>
              <View className="flex-row items-center">
                <CheckCircle size={16} color="#1E5E45" strokeWidth={2.2} />
                <Text
                  className="text-neutral-textMain ml-2.5 flex-1"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                >
                  Red preventiva de cuidado a adultos mayores
                </Text>
              </View>
            </View>

            <Button
              title="Solicitar Ingreso a la Junta Vecinal"
              variant="primary"
              onPress={requestMembership}
              className="w-full"
            />
          </Card>
        </ScrollView>
      </View>
    );
  }

  /* -------------------------------------------------------------
   * GATE 2: CASO SOLICITUD EN PROCESO DE VERIFICACIÓN
   * ------------------------------------------------------------- */
  if (currentUser.membershipStatus === 'PENDIENTE') {
    return (
      <View className="flex-1 bg-neutral-background">
        <Header
          title="Muro Solidario"
          subtitle="Capa Privada · Validación de Domicilio"
        />

        <ScrollView contentContainerClassName="p-5 justify-center flex-grow">
          <Card className="p-6 items-center text-center shadow-md shadow-black/8">
            <View className="w-16 h-16 rounded-full bg-amber-50 items-center justify-center mb-4">
              <Clock size={32} color="#D97706" strokeWidth={2.2} />
            </View>

            <View className="bg-amber-100/70 px-3 py-1 rounded-full mb-3">
              <Text
                className="text-amber-800"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
              >
                EN PROCESO DE VALIDACIÓN
              </Text>
            </View>

            <Text
              className="text-neutral-textMain text-center mb-2"
              style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20 }}
            >
              Confirmando tu Residencia
            </Text>

            <Text
              className="text-neutral-textMuted text-center leading-5 px-2"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}
            >
              Tu solicitud fue enviada a la dirigenta barrial <Text className="font-bold text-neutral-textMain">Elena Mendoza</Text>.
              Verificaremos tu domicilio en <Text className="font-semibold text-neutral-textMain">{currentUser.homeAddress}</Text>.
            </Text>
          </Card>
        </ScrollView>
      </View>
    );
  }

  /* -------------------------------------------------------------
   * GATE 3: MIEMBRO ACTIVO O DIRIGENTE BARRIAL
   * ------------------------------------------------------------- */
  return (
    <View className="flex-1 bg-neutral-background">
      <Header
        title="Muro Solidario"
        subtitle="Junta Vecinal Sector 4 · Apoyo mutuo sin dinero"
      />

      {/* Dirigente Barrial Banner when pending requests exist */}
      {currentUser.membershipStatus === 'DIRIGENTE' && pendingRequests.length > 0 && (
        <View className="mx-4 mt-3 bg-neutral-surface p-3.5 rounded-2xl shadow-sm border border-primary/20 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center">
              <ShieldCheck size={16} color="#1E5E45" strokeWidth={2.2} />
              <Text
                className="text-neutral-textMain ml-1.5"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
              >
                Panel de Dirigencia
              </Text>
            </View>
            <Text
              className="text-neutral-textMuted mt-0.5"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
            >
              {pendingRequests.length} vecinos esperan validación de domicilio
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setApprovalModalVisible(true)}
            className="bg-primary px-3 py-2 rounded-xl"
          >
            <Text
              className="text-white"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
            >
              Revisar ({pendingRequests.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
            <MapIcon
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
            {filteredPosts.map((post) => (
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
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        'Respuesta Solidaria',
                        `Conectando con ${post.author}. En Sumayni los intercambios de ayuda mutua son 100% libres de dinero.`
                      )
                    }
                    className="min-h-[36px] px-4 bg-neutral-mutedBg rounded-xl justify-center"
                  >
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
          /* MODO MAPA SOLIDARIO */
          <View className="flex-1 rounded-3xl overflow-hidden relative shadow-sm">
            <MapView
              style={{ width: '100%', height: '100%' }}
              initialRegion={{
                latitude: -12.0125,
                longitude: -77.0815,
                latitudeDelta: 0.012,
                longitudeDelta: 0.012,
              }}
            >
              {/* Solidary items markers */}
              {DEMO_POSTS.map((post) => (
                <Marker
                  key={post.id}
                  coordinate={post.coordinates}
                  title={post.title}
                  description={post.author}
                >
                  <View
                    className={`px-2.5 py-1.5 rounded-2xl shadow-md border ${
                      post.type === 'AYUDA'
                        ? 'bg-emergency-alert border-white'
                        : 'bg-primary border-white'
                    }`}
                  >
                    <Text
                      className="text-white text-xs font-bold"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                    >
                      {post.type}
                    </Text>
                  </View>
                </Marker>
              ))}

              {/* Capa de Cuidado Vecinal: Visible para Dirigente (PROPUESTA.md Section 3) */}
              {currentUser.membershipStatus === 'DIRIGENTE' &&
                VULNERABLE_CARE_HOUSEHOLDS.map((v) => (
                  <Marker
                    key={v.id}
                    coordinate={v.coordinates}
                    title={v.name}
                    description={`${v.statusLabel} · ${v.lastContact}`}
                  >
                    <View className="items-center">
                      <View
                        className="px-2.5 py-1 rounded-full shadow-md border-2 border-white flex-row items-center"
                        style={{ backgroundColor: v.statusColor }}
                      >
                        <Heart size={12} color="#FFFFFF" fill="#FFFFFF" />
                        <Text
                          className="text-white text-[11px] font-bold ml-1"
                          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                        >
                          {v.statusLabel}
                        </Text>
                      </View>
                    </View>
                  </Marker>
                ))}
            </MapView>

            {/* Dirigente Care Layer Legend Overlay */}
            {currentUser.membershipStatus === 'DIRIGENTE' && (
              <View className="absolute top-3 left-3 right-3 bg-neutral-surface/95 p-3 rounded-2xl shadow-md">
                <Text
                  className="text-neutral-textMain"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                >
                  Capa de Cuidado Vecinal (Vista Dirigencia)
                </Text>
                <View className="flex-row items-center justify-between mt-1.5">
                  <View className="flex-row items-center">
                    <View className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-1" />
                    <Text className="text-xs text-neutral-textMuted">Al día</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1" />
                    <Text className="text-xs text-neutral-textMuted">Seguimiento</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-2.5 h-2.5 rounded-full bg-red-600 mr-1" />
                    <Text className="text-xs text-neutral-textMuted">Alerta SOS</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Dirigente Neighbor Approval Modal */}
      <Modal
        visible={approvalModalVisible}
        onClose={() => setApprovalModalVisible(false)}
        title="Validación de Domicilios"
      >
        <View className="py-2">
          <Text
            className="text-neutral-textMuted mb-3 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            Como dirigente de la Junta Vecinal Sector 4, valida que estos vecinos
            residen efectivamente en la manzana antes de admitirlos al Muro Privado.
          </Text>

          {pendingRequests.map((req) => (
            <Card key={req.id} className="p-3.5 mb-2.5 bg-neutral-mutedBg/60">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-2">
                  <Text
                    className="text-neutral-textMain"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
                  >
                    {req.name}
                  </Text>
                  <Text
                    className="text-neutral-textMuted mt-0.5"
                    style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                  >
                    {req.address}
                  </Text>
                  <Text
                    className="text-neutral-textLight mt-0.5"
                    style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11 }}
                  >
                    Solicitud recibida {req.time}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-2 mt-2 pt-2 border-t border-neutral-border/50">
                <TouchableOpacity
                  onPress={() => {
                    approveMembership(req.id);
                    Alert.alert(
                      'Vecino Aprobado',
                      `Se validó el domicilio de ${req.name}. Ahora tiene acceso a la comunidad.`
                    );
                  }}
                  className="flex-1 bg-primary py-2 rounded-xl flex-row items-center justify-center min-h-[38px]"
                >
                  <Check size={16} color="#FFFFFF" strokeWidth={2.2} />
                  <Text
                    className="text-white ml-1.5"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                  >
                    Aprobar Domicilio
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => approveMembership(req.id)}
                  className="bg-neutral-surface px-3 py-2 rounded-xl flex-row items-center justify-center min-h-[38px]"
                >
                  <X size={16} color="#6C727A" />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      </Modal>
    </View>
  );
}
