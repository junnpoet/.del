import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Linking,
  Share,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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
  Check,
  X,
  Heart,
  Bell,
  MessageSquare,
  Send,
  CheckCheck,
  Phone,
  Mic,
  Calendar,
} from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { Chip } from '../../src/components/ui/Chip';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Modal } from '../../src/components/ui/Modal';
import { useDemo } from '../../src/services/demoStore';

interface PostComment {
  id: string;
  author: string;
  timeAgo: string;
  content: string;
  isAccepted?: boolean;
}

interface PostDemoItem {
  id: string;
  type: 'PRESTAMO' | 'DONACION' | 'TRUEQUE' | 'VOLUNTARIADO' | 'CUIDADO' | 'AYUDA';
  categoryLabel: string;
  title: string;
  author: string;
  authorPhone?: string;
  description: string;
  timeAgo: string;
  urgency: 'BAJA' | 'MEDIA' | 'ALTA_CRITICA';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  statusNote?: string;
  isFromVoice: boolean;
  isFromWhatsApp: boolean;
  coordinates: { latitude: number; longitude: number };
  volunteersGoal?: number;
  volunteersCurrent?: number;
  volunteersList?: string[];
  comments: PostComment[];
}

interface NeighborhoodNotice {
  id: string;
  title: string;
  content: string;
  source: string;
  date: string;
  isRead: boolean;
}

const INITIAL_NOTICES: NeighborhoodNotice[] = [
  {
    id: 'n-1',
    title: 'Corte programado de agua por Sedapal',
    content: 'Mantenimiento de tubería matriz en el sector. Suspensión temporal este martes de 2:00 pm a 6:00 pm. Se recomienda juntar agua en depósitos limpios.',
    source: 'Elena Mendoza (Dirigenta)',
    date: 'Hoy, hace 1 hora',
    isRead: false,
  },
  {
    id: 'n-2',
    title: 'Asamblea general de vecinos',
    content: 'Reunión de coordinación sobre alumbrado público y plan de seguridad vecinal. Lugar: Losa Las Dalias este domingo a las 10:00 am.',
    source: 'Junta Directiva Sector 4',
    date: 'Ayer',
    isRead: false,
  },
];

const INITIAL_POSTS: PostDemoItem[] = [
  {
    id: 'p-1',
    type: 'VOLUNTARIADO',
    categoryLabel: 'Faena Comunal',
    title: 'Faena Barrial: Pintado y Limpieza de Losa Las Dalias',
    author: 'Junta Vecinal Sector 4',
    description: 'Jornada comunitaria para pintar arcos y líneas de la losa para los niños del barrio. Se requiere apoyo con brochas, espátulas y mano de obra.',
    timeAgo: 'Hace 15 min',
    urgency: 'MEDIA',
    status: 'IN_PROGRESS',
    statusNote: 'Programado: Sábado 9:00 am en la losa',
    isFromVoice: false,
    isFromWhatsApp: false,
    coordinates: { latitude: -12.0142, longitude: -77.0818 },
    volunteersGoal: 10,
    volunteersCurrent: 6,
    volunteersList: ['Don Segundo Morales', 'Elena Mendoza', 'Rosa Flores', 'Carlos Toledo', 'Sra. Martha', 'Jorge Huamán'],
    comments: [
      {
        id: 'c-1',
        author: 'Don Segundo Morales (Gasfitero)',
        timeAgo: 'Hace 10 min',
        content: 'Cuenten conmigo, llevo dos galones de solvente y espátulas.',
        isAccepted: true,
      },
      {
        id: 'c-2',
        author: 'Elena Mendoza (Dirigenta)',
        timeAgo: 'Hace 5 min',
        content: 'Excelente vecinos, coordinaremos bebidas para los participantes.',
      },
    ],
  },
  {
    id: 'p-2',
    type: 'CUIDADO',
    categoryLabel: 'Acompañamiento',
    title: 'Acompañamiento a Don Jacinto al Policlínico',
    author: 'Red de Padrinos Vecinales',
    description: 'Don Jacinto (82 años) tiene control médico este martes a las 9:00 am. Su padrino asignado está trabajando y se requiere un vecino voluntario para acompañarlo.',
    timeAgo: 'Hace 40 min',
    urgency: 'ALTA_CRITICA',
    status: 'IN_PROGRESS',
    statusNote: 'Acompañante confirmada: Carmen Rosa Mamani',
    isFromVoice: true,
    isFromWhatsApp: false,
    coordinates: { latitude: -12.0135, longitude: -77.0825 },
    comments: [
      {
        id: 'c-3',
        author: 'Carmen Rosa Mamani',
        timeAgo: 'Hace 25 min',
        content: 'Paso por su casa en la Mz. C a las 8:30 am. Vivo a dos casas.',
        isAccepted: true,
      },
    ],
  },
  {
    id: 'p-3',
    type: 'PRESTAMO',
    categoryLabel: 'Herramientas',
    title: 'Préstamo de Escalera Telescópica (4.5 metros)',
    author: 'Familia Quispe (Mz. C)',
    description: 'Desocupada todo el fin de semana por si algún vecino la requiere para limpieza de techos o reparaciones menores.',
    timeAgo: 'Hace 1 hora',
    urgency: 'BAJA',
    status: 'OPEN',
    isFromVoice: false,
    isFromWhatsApp: false,
    coordinates: { latitude: -12.0128, longitude: -77.0818 },
    comments: [
      {
        id: 'c-4',
        author: 'Hernán Ramos (Carpintero)',
        timeAgo: 'Hace 20 min',
        content: 'Vecino, ¿me la prestaría mañana de 3 a 5 pm para fijar una canaleta?',
      },
    ],
  },
  {
    id: 'p-4',
    type: 'AYUDA',
    categoryLabel: 'Apoyo Vecinal',
    title: 'Baldes de agua limpia para adultos mayores Mz. B',
    author: 'Doña Teófila Gómez (76 años)',
    authorPhone: '51987654321',
    description: 'Vecinos buenos días, por baja de presión no subió agua a mi tanque. ¿Alguien en planta baja que me pueda convidar dos baldes de agua?',
    timeAgo: 'Hace 2 horas',
    urgency: 'MEDIA',
    status: 'IN_PROGRESS',
    statusNote: 'Apoyo en camino por Mz. B Lt. 3',
    isFromVoice: true,
    isFromWhatsApp: true,
    coordinates: { latitude: -12.0115, longitude: -77.0830 },
    comments: [
      {
        id: 'c-5',
        author: 'Don Segundo Morales',
        timeAgo: 'Hace 1 hora',
        content: 'Doña Teófila, en 20 minutos le llevo dos baldes llenos de mi cisterna.',
        isAccepted: true,
      },
    ],
  },
  {
    id: 'p-5',
    type: 'DONACION',
    categoryLabel: 'Donaciones',
    title: 'Libros escolares primaria y secundaria en buen estado',
    author: 'Rosa Flores (Mz. F)',
    description: 'Enciclopedias de ciencias, diccionarios y lecturas escolares para las familias del sector.',
    timeAgo: 'Hace 3 horas',
    urgency: 'BAJA',
    status: 'RESOLVED',
    statusNote: 'Entregados con éxito a la familia Huamán',
    isFromVoice: false,
    isFromWhatsApp: false,
    coordinates: { latitude: -12.0112, longitude: -77.0810 },
    comments: [
      {
        id: 'c-6',
        author: 'Jorge Huamán',
        timeAgo: 'Hace 2 horas',
        content: 'Muchas gracias vecina Rosa. Son de gran utilidad para los chicos.',
        isAccepted: true,
      },
    ],
  },
];

const VULNERABLE_CARE_HOUSEHOLDS = [
  {
    id: 'care-1',
    name: 'Don Jacinto Valdés (82 años)',
    address: 'Calle Las Dalias 120, Mz. C Lt. 8',
    status: 'ALERTA',
    statusColor: '#DC2626',
    statusLabel: 'Alerta / Apoyo Activo',
    lastContact: 'Hace 40 min (Acompañamiento médico)',
    coordinates: { latitude: -12.0135, longitude: -77.0825 },
  },
  {
    id: 'care-2',
    name: 'Sra. Teófila Gómez (76 años)',
    address: 'Jr. Los Jazmines 410',
    status: 'SEGUIMIENTO',
    statusColor: '#D97706',
    statusLabel: 'Seguimiento Requerido',
    lastContact: 'Hace 2 horas (Baja presión de agua)',
    coordinates: { latitude: -12.0115, longitude: -77.0830 },
  },
  {
    id: 'care-3',
    name: 'Don Manuel Huertas (88 años)',
    address: 'Calle Los Claveles 132',
    status: 'AL_DIA',
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
  } = useDemo();

  const [activeTab, setActiveTab] = useState<'feed' | 'map'>('feed');
  const [selectedFilter, setSelectedFilter] = useState<'Todos' | 'Préstamos' | 'Donaciones' | 'Acción Comunal'>('Todos');
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [posts, setPosts] = useState<PostDemoItem[]>(INITIAL_POSTS);

  // Official Announcements Modal state
  const [notices, setNotices] = useState<NeighborhoodNotice[]>(INITIAL_NOTICES);
  const [noticesModalVisible, setNoticesModalVisible] = useState(false);

  // Active Post Coordination Thread Modal state
  const [activeThreadPost, setActiveThreadPost] = useState<PostDemoItem | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // 4 clear, consolidated filters
  const filterOptions: Array<'Todos' | 'Préstamos' | 'Donaciones' | 'Acción Comunal'> = [
    'Todos',
    'Préstamos',
    'Donaciones',
    'Acción Comunal',
  ];

  const unreadNoticesCount = notices.filter((n) => !n.isRead).length;

  const handleOpenNotices = () => {
    setNoticesModalVisible(true);
  };

  const handleMarkNoticesRead = () => {
    setNotices((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setNoticesModalVisible(false);
  };

  const filteredPosts = posts.filter((post) => {
    if (selectedFilter === 'Todos') return true;
    if (selectedFilter === 'Préstamos') return post.type === 'PRESTAMO';
    if (selectedFilter === 'Donaciones') return post.type === 'DONACION';
    if (selectedFilter === 'Acción Comunal') {
      return post.type === 'VOLUNTARIADO' || post.type === 'CUIDADO' || post.type === 'AYUDA';
    }
    return true;
  });

  const handleToggleVolunteer = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const list = p.volunteersList || [];
        const isJoined = list.includes(currentUser.name);
        const nextList = isJoined
          ? list.filter((n) => n !== currentUser.name)
          : [...list, currentUser.name];
        const nextCurrent = isJoined
          ? Math.max(0, (p.volunteersCurrent || 0) - 1)
          : (p.volunteersCurrent || 0) + 1;

        if (!isJoined) {
          Alert.alert(
            'Inscripción Registrada',
            `Gracias por apoyar, ${currentUser.name}. Tu participación fue confirmada para la faena en la Losa Las Dalias.`
          );
        }

        return {
          ...p,
          volunteersList: nextList,
          volunteersCurrent: nextCurrent,
          status: 'IN_PROGRESS',
        };
      })
    );
  };

  const handleAddComment = () => {
    if (!activeThreadPost || !commentInput.trim()) return;

    const newComment: PostComment = {
      id: `c-${Date.now()}`,
      author: currentUser.name,
      timeAgo: 'Justo ahora',
      content: commentInput.trim(),
    };

    const updatedPost: PostDemoItem = {
      ...activeThreadPost,
      comments: [...activeThreadPost.comments, newComment],
      status: activeThreadPost.status === 'OPEN' ? 'IN_PROGRESS' : activeThreadPost.status,
    };

    setPosts((prev) => prev.map((p) => (p.id === activeThreadPost.id ? updatedPost : p)));
    setActiveThreadPost(updatedPost);
    setCommentInput('');
  };

  const handleAcceptSupport = (postId: string, commentId: string, volunteerName: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextComments = p.comments.map((c) => ({
          ...c,
          isAccepted: c.id === commentId,
        }));
        return {
          ...p,
          status: 'IN_PROGRESS',
          statusNote: `Apoyo en coordinación con ${volunteerName}`,
          comments: nextComments,
        };
      })
    );

    if (activeThreadPost && activeThreadPost.id === postId) {
      setActiveThreadPost((prev) =>
        prev
          ? {
              ...prev,
              status: 'IN_PROGRESS',
              statusNote: `Apoyo en coordinación con ${volunteerName}`,
              comments: prev.comments.map((c) => ({
                ...c,
                isAccepted: c.id === commentId,
              })),
            }
          : null
      );
    }

    Alert.alert(
      'Apoyo Aceptado',
      `Se aceptó la colaboración de ${volunteerName}. La solicitud pasó a estado: En coordinación.`
    );
  };

  const handleMarkResolved = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          status: 'RESOLVED',
          statusNote: 'Resuelto con éxito por la comunidad barrial',
        };
      })
    );

    if (activeThreadPost && activeThreadPost.id === postId) {
      setActiveThreadPost((prev) =>
        prev
          ? {
              ...prev,
              status: 'RESOLVED',
              statusNote: 'Resuelto con éxito por la comunidad barrial',
            }
          : null
      );
    }

    Alert.alert(
      'Favor Resuelto',
      'Esta solicitud fue marcada como resuelta. Gracias por fomentar la ayuda mutua en el barrio.'
    );
  };

  const handleDiffuseWhatsApp = async (post: PostDemoItem) => {
    const text = `Sumayni Barrial (Sector 4)\n\n${post.title}\n${post.description}\n\nTipo: ${post.categoryLabel}\nPublicado por: ${post.author}\nIntercambio solidario sin dinero.`;
    const url = `whatsapp://send?text=${encodeURIComponent(text)}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      try {
        await Share.share({
          message: text,
          title: post.title,
        });
      } catch {
        Alert.alert('Difusión Barrial', 'Mensaje preparado para compartir con vecinos.');
      }
    }
  };

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
              className="text-neutral-textMuted text-center leading-6 mb-5 px-2"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15 }}
            >
              Para proteger la integridad y privacidad de los hogares, el Muro Solidario
              y los intercambios vecinales sin dinero están reservados a residentes
              validados por la dirigencia del sector.
            </Text>

            <View className="w-full bg-neutral-mutedBg/60 rounded-2xl p-4 mb-5">
              <View className="flex-row items-center mb-3">
                <CheckCircle size={18} color="#1E5E45" strokeWidth={2.2} />
                <Text
                  className="text-neutral-textMain ml-3 flex-1"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                >
                  Préstamos de herramientas sin dinero
                </Text>
              </View>
              <View className="flex-row items-center mb-3">
                <CheckCircle size={18} color="#1E5E45" strokeWidth={2.2} />
                <Text
                  className="text-neutral-textMain ml-3 flex-1"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                >
                  Faenas, ollas comunes y voluntariado barrial
                </Text>
              </View>
              <View className="flex-row items-center">
                <CheckCircle size={18} color="#1E5E45" strokeWidth={2.2} />
                <Text
                  className="text-neutral-textMain ml-3 flex-1"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                >
                  Red preventiva de cuidado a adultos mayores
                </Text>
              </View>
            </View>

            <Button
              title="Solicitar Ingreso a la Junta Vecinal"
              variant="primary"
              onPress={requestMembership}
              className="w-full min-h-[48px]"
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

            <View className="bg-amber-100/80 px-3.5 py-1 rounded-full mb-3">
              <Text
                className="text-amber-900"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
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
              className="text-neutral-textMuted text-center leading-6 px-2"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15 }}
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
      {/* Header con botón de Avisos Oficiales en esquina superior derecha */}
      <Header
        title="Muro Solidario"
        subtitle="Junta Vecinal Sector 4"
        rightAction={
          <TouchableOpacity
            onPress={handleOpenNotices}
            accessibilityRole="button"
            accessibilityLabel="Ver avisos de la junta vecinal"
            className="w-11 h-11 rounded-2xl bg-neutral-mutedBg items-center justify-center relative border border-neutral-border/60"
          >
            <Bell size={20} color="#1E5E45" strokeWidth={2.2} />
            {unreadNoticesCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-emergency-alert rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center border-2 border-white">
                <Text
                  className="text-white font-bold text-xs"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                >
                  {unreadNoticesCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      {/* Banner de dirigencia si hay solicitudes pendientes */}
      {currentUser.membershipStatus === 'DIRIGENTE' && pendingRequests.length > 0 && (
        <View className="mx-4 mt-3 bg-neutral-surface p-3.5 rounded-2xl shadow-sm border border-primary/20 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center">
              <ShieldCheck size={18} color="#1E5E45" strokeWidth={2.2} />
              <Text
                className="text-neutral-textMain ml-2"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
              >
                Panel de Dirigencia
              </Text>
            </View>
            <Text
              className="text-neutral-textMuted mt-0.5"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
            >
              {pendingRequests.length} vecinos esperan validación de domicilio
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setApprovalModalVisible(true)}
            className="bg-primary px-3.5 py-2 rounded-xl min-h-[40px] justify-center"
          >
            <Text
              className="text-white"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
            >
              Revisar ({pendingRequests.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="p-4 flex-1">
        {/* Selector [ Muro Feed | Mapa Barrial ] */}
        <View className="flex-row bg-neutral-mutedBg p-1.5 rounded-2xl mb-3.5">
          <TouchableOpacity
            onPress={() => setActiveTab('feed')}
            className={`flex-1 flex-row items-center justify-center min-h-[42px] rounded-xl ${
              activeTab === 'feed'
                ? 'bg-neutral-surface shadow-xs'
                : 'bg-transparent'
            }`}
          >
            <LayoutGrid
              size={18}
              color={activeTab === 'feed' ? '#1A1D20' : '#6C727A'}
              strokeWidth={2}
            />
            <Text
              className={`ml-2 ${
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
              Muro Solidario
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('map')}
            className={`flex-1 flex-row items-center justify-center min-h-[42px] rounded-xl ${
              activeTab === 'map'
                ? 'bg-neutral-surface shadow-xs'
                : 'bg-transparent'
            }`}
          >
            <MapIcon
              size={18}
              color={activeTab === 'map' ? '#1A1D20' : '#6C727A'}
              strokeWidth={2}
            />
            <Text
              className={`ml-2 ${
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

        {/* 4 Chips de Filtrado Simplificados y Legibles */}
        <View className="mb-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                isActive={selectedFilter === option}
                onPress={() => setSelectedFilter(option)}
              />
            ))}
          </ScrollView>
        </View>

        {activeTab === 'feed' ? (
          <ScrollView contentContainerClassName="pb-28 pt-1" showsVerticalScrollIndicator={false}>
            {filteredPosts.map((post) => {
              const isJoinedFaena =
                post.type === 'VOLUNTARIADO' &&
                (post.volunteersList || []).includes(currentUser.name);

              return (
                <Card key={post.id} className="mb-4 p-4 border border-neutral-border/60">
                  {/* Encabezado: Categoría clara + Estado visible + Tiempo */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-wrap gap-2">
                      {/* Badge de Categoría legible */}
                      <View className="bg-neutral-mutedBg px-3 py-1 rounded-xl">
                        <Text
                          className="text-neutral-textMain"
                          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                        >
                          {post.categoryLabel}
                        </Text>
                      </View>

                      {/* Semáforo de Estado: Abierto / En coordinación / Resuelto */}
                      <View
                        className={`px-3 py-1 rounded-xl flex-row items-center ${
                          post.status === 'RESOLVED'
                            ? 'bg-emerald-50 border border-emerald-200'
                            : post.status === 'IN_PROGRESS'
                            ? 'bg-sky-50 border border-sky-200'
                            : 'bg-amber-50 border border-amber-200'
                        }`}
                      >
                        <View
                          className={`w-2 h-2 rounded-full mr-2 ${
                            post.status === 'RESOLVED'
                              ? 'bg-emerald-600'
                              : post.status === 'IN_PROGRESS'
                              ? 'bg-sky-600'
                              : 'bg-amber-600'
                          }`}
                        />
                        <Text
                          className={`font-bold text-xs ${
                            post.status === 'RESOLVED'
                              ? 'text-emerald-900'
                              : post.status === 'IN_PROGRESS'
                              ? 'text-sky-900'
                              : 'text-amber-900'
                          }`}
                          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                        >
                          {post.status === 'RESOLVED'
                            ? 'Resuelto'
                            : post.status === 'IN_PROGRESS'
                            ? 'En coordinación'
                            : 'Abierto'}
                        </Text>
                      </View>

                      {/* Canales: WhatsApp / Voz */}
                      {post.isFromWhatsApp && (
                        <View className="bg-emerald-50 px-2.5 py-1 rounded-xl flex-row items-center border border-emerald-200">
                          <Phone size={13} color="#047857" />
                          <Text
                            className="text-emerald-900 ml-1.5 font-bold text-xs"
                            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                          >
                            WhatsApp
                          </Text>
                        </View>
                      )}

                      {post.isFromVoice && (
                        <View className="bg-neutral-mutedBg px-2.5 py-1 rounded-xl flex-row items-center">
                          <Mic size={13} color="#1E5E45" />
                          <Text
                            className="text-neutral-textMain ml-1.5 font-semibold text-xs"
                            style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
                          >
                            Nota de voz
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-row items-center">
                      <Clock size={13} color="#9EA3AE" />
                      <Text
                        className="text-neutral-textLight ml-1.5"
                        style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                      >
                        {post.timeAgo}
                      </Text>
                    </View>
                  </View>

                  {/* Título de la Solicitud */}
                  <Text
                    className="text-neutral-textMain mb-1.5 leading-6"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17 }}
                  >
                    {post.title}
                  </Text>
                  <Text
                    className="text-neutral-textMuted mb-2.5"
                    style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14 }}
                  >
                    Por <Text className="font-bold text-neutral-textMain">{post.author}</Text>
                  </Text>

                  {/* Descripción con texto legible (15px) */}
                  <Text
                    className="text-neutral-textMain leading-6 mb-3.5"
                    style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15 }}
                  >
                    {post.description}
                  </Text>

                  {/* Nota de estado o resolución */}
                  {post.statusNote && (
                    <View
                      className={`p-3 rounded-2xl mb-3 flex-row items-center ${
                        post.status === 'RESOLVED'
                          ? 'bg-emerald-50 border border-emerald-200'
                          : 'bg-neutral-mutedBg/70'
                      }`}
                    >
                      {post.status === 'RESOLVED' ? (
                        <CheckCheck size={18} color="#16A34A" />
                      ) : (
                        <Clock size={16} color="#6C727A" />
                      )}
                      <Text
                        className={`ml-2.5 text-sm flex-1 ${
                          post.status === 'RESOLVED' ? 'text-emerald-950 font-semibold' : 'text-neutral-textMuted'
                        }`}
                        style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
                      >
                        {post.statusNote}
                      </Text>
                    </View>
                  )}

                  {/* Sección de Acción Colectiva (Faenas) */}
                  {post.type === 'VOLUNTARIADO' && post.volunteersGoal && (
                    <View className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 mb-3.5">
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <Users size={16} color="#047857" />
                          <Text
                            className="text-emerald-950 ml-2 font-bold text-sm"
                            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                          >
                            Meta comunitaria: {post.volunteersCurrent} de {post.volunteersGoal} vecinos
                          </Text>
                        </View>
                        <Text
                          className="text-emerald-800 text-sm font-bold"
                          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                        >
                          {Math.round(((post.volunteersCurrent || 0) / post.volunteersGoal) * 100)}%
                        </Text>
                      </View>

                      {/* Barra de progreso */}
                      <View className="w-full h-3 bg-emerald-200/60 rounded-full overflow-hidden mb-3">
                        <View
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(((post.volunteersCurrent || 0) / post.volunteersGoal) * 100)
                            )}%`,
                          }}
                        />
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text
                          className="text-neutral-textMuted text-xs flex-1 mr-3"
                          numberOfLines={1}
                        >
                          Confirmados: {(post.volunteersList || []).join(', ')}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleToggleVolunteer(post.id)}
                          className={`px-4 py-2 rounded-xl flex-row items-center min-h-[40px] ${
                            isJoinedFaena ? 'bg-emerald-800' : 'bg-primary'
                          }`}
                        >
                          <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                          <Text
                            className="text-white text-sm font-bold ml-1.5"
                            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                          >
                            {isJoinedFaena ? 'Sumado' : 'Me sumo'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Barra de Acciones del Card */}
                  <View className="pt-3 border-t border-neutral-border/60 flex-row justify-between items-center gap-2.5">
                    <TouchableOpacity
                      onPress={() => setActiveThreadPost(post)}
                      className="flex-1 min-h-[44px] px-4 bg-neutral-mutedBg rounded-xl flex-row items-center justify-center"
                    >
                      <MessageSquare size={16} color="#1E5E45" strokeWidth={2} />
                      <Text
                        className="text-neutral-textMain ml-2"
                        style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                      >
                        Coordinar ({post.comments.length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDiffuseWhatsApp(post)}
                      className="min-h-[44px] px-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex-row items-center justify-center"
                    >
                      <Share2 size={16} color="#047857" strokeWidth={2} />
                      <Text
                        className="text-emerald-900 ml-1.5 text-sm font-bold"
                        style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                      >
                        Difundir
                      </Text>
                    </TouchableOpacity>

                    {post.status !== 'RESOLVED' &&
                      (currentUser.membershipStatus === 'DIRIGENTE' ||
                        post.author.includes(currentUser.name.split(' ')[0])) && (
                        <TouchableOpacity
                          onPress={() => handleMarkResolved(post.id)}
                          accessibilityLabel="Marcar favor como resuelto"
                          className="min-h-[44px] px-3.5 bg-neutral-surface border border-neutral-border rounded-xl flex-row items-center justify-center"
                        >
                          <CheckCheck size={18} color="#16A34A" />
                        </TouchableOpacity>
                      )}
                  </View>
                </Card>
              );
            })}
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
              {posts.map((post) => (
                <Marker
                  key={post.id}
                  coordinate={post.coordinates}
                  title={post.title}
                  description={`${post.author} · ${post.status}`}
                >
                  <View
                    className={`px-3 py-1.5 rounded-2xl shadow-md border ${
                      post.type === 'VOLUNTARIADO'
                        ? 'bg-emerald-600 border-white'
                        : post.type === 'CUIDADO'
                        ? 'bg-purple-600 border-white'
                        : post.type === 'AYUDA'
                        ? 'bg-emergency-alert border-white'
                        : 'bg-primary border-white'
                    }`}
                  >
                    <Text
                      className="text-white text-xs font-bold"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                    >
                      {post.categoryLabel}
                    </Text>
                  </View>
                </Marker>
              ))}

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
                        className="px-3 py-1 rounded-full shadow-md border-2 border-white flex-row items-center"
                        style={{ backgroundColor: v.statusColor }}
                      >
                        <Heart size={13} color="#FFFFFF" fill="#FFFFFF" />
                        <Text
                          className="text-white text-xs font-bold ml-1.5"
                          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                        >
                          {v.statusLabel}
                        </Text>
                      </View>
                    </View>
                  </Marker>
                ))}
            </MapView>

            {currentUser.membershipStatus === 'DIRIGENTE' && (
              <View className="absolute top-3 left-3 right-3 bg-neutral-surface/95 p-3.5 rounded-2xl shadow-md border border-neutral-border/40">
                <Text
                  className="text-neutral-textMain"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                >
                  Capa de Cuidado Vecinal (Vista Dirigencia)
                </Text>
                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-emerald-600 mr-1.5" />
                    <Text className="text-xs text-neutral-textMuted">Al día</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-amber-500 mr-1.5" />
                    <Text className="text-xs text-neutral-textMuted">Seguimiento</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-red-600 mr-1.5" />
                    <Text className="text-xs text-neutral-textMuted">Alerta SOS</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* MODAL DE AVISOS OFICIALES DE LA JUNTA VECINAL */}
      <Modal
        visible={noticesModalVisible}
        onClose={() => setNoticesModalVisible(false)}
        title="Avisos de la Junta Vecinal"
      >
        <View className="py-1">
          <Text
            className="text-neutral-textMuted mb-3.5 leading-5 text-sm"
            style={{ fontFamily: 'PlusJakartaSans_400Regular' }}
          >
            Comunicados oficiales y alertas comunitarias emitidas por la dirigencia del Sector 4.
          </Text>

          {notices.map((notice) => (
            <Card key={notice.id} className="p-4 mb-3 bg-neutral-mutedBg/60">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text
                  className="text-primary font-bold text-xs uppercase"
                  style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
                >
                  {notice.source}
                </Text>
                <Text className="text-neutral-textLight text-xs">{notice.date}</Text>
              </View>

              <Text
                className="text-neutral-textMain font-bold text-base mb-1.5"
                style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
              >
                {notice.title}
              </Text>

              <Text
                className="text-neutral-textMain leading-5 text-sm"
                style={{ fontFamily: 'PlusJakartaSans_400Regular' }}
              >
                {notice.content}
              </Text>
            </Card>
          ))}

          {unreadNoticesCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkNoticesRead}
              className="mt-2 bg-primary min-h-[44px] rounded-xl items-center justify-center"
            >
              <Text
                className="text-white text-sm font-bold"
                style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
              >
                Marcar todos como leídos
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      {/* HILO DE ACCIÓN COMUNITARIA (MODAL BOTTOM SHEET) */}
      <Modal
        visible={!!activeThreadPost}
        onClose={() => {
          setActiveThreadPost(null);
          setCommentInput('');
        }}
        title="Coordinación Comunitaria"
      >
        {activeThreadPost && (
          <View className="py-1">
            <View className="bg-neutral-mutedBg/60 p-4 rounded-2xl mb-3.5">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text
                  className="text-primary font-bold text-xs"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                >
                  {activeThreadPost.categoryLabel}
                </Text>
                <View
                  className={`px-2.5 py-0.5 rounded-md ${
                    activeThreadPost.status === 'RESOLVED'
                      ? 'bg-emerald-100'
                      : activeThreadPost.status === 'IN_PROGRESS'
                      ? 'bg-sky-100'
                      : 'bg-amber-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      activeThreadPost.status === 'RESOLVED'
                        ? 'text-emerald-900'
                        : activeThreadPost.status === 'IN_PROGRESS'
                        ? 'text-sky-900'
                        : 'text-amber-900'
                    }`}
                  >
                    {activeThreadPost.status === 'RESOLVED'
                      ? 'Resuelto'
                      : activeThreadPost.status === 'IN_PROGRESS'
                      ? 'En coordinación'
                      : 'Abierto'}
                  </Text>
                </View>
              </View>

              <Text
                className="text-neutral-textMain font-bold text-base mb-1.5"
                style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
              >
                {activeThreadPost.title}
              </Text>
              <Text className="text-neutral-textMuted text-sm leading-5">
                {activeThreadPost.description}
              </Text>

              {activeThreadPost.isFromWhatsApp && activeThreadPost.authorPhone && (
                <TouchableOpacity
                  onPress={() => {
                    const text = encodeURIComponent(
                      `Hola ${activeThreadPost.author}, vi tu solicitud en Sumayni Barrial sobre: ${activeThreadPost.title}. Quiero coordinar mi apoyo contigo.`
                    );
                    Linking.openURL(`https://wa.me/${activeThreadPost.authorPhone}?text=${text}`);
                  }}
                  className="mt-3 bg-emerald-700 min-h-[44px] px-3.5 rounded-xl flex-row items-center justify-center"
                >
                  <Phone size={16} color="#FFFFFF" />
                  <Text
                    className="text-white text-sm font-bold ml-2"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                  >
                    Responder por WhatsApp a {activeThreadPost.author}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text
              className="text-neutral-textMain font-bold text-xs uppercase tracking-wide mb-2.5 px-1"
              style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
            >
              Aportes y Coordinaciones ({activeThreadPost.comments.length})
            </Text>

            <ScrollView className="max-h-64 mb-3.5">
              {activeThreadPost.comments.length === 0 ? (
                <View className="py-6 items-center">
                  <Text className="text-neutral-textMuted text-sm">
                    Aún no hay respuestas. Sé el primer vecino en ofrecer apoyo.
                  </Text>
                </View>
              ) : (
                activeThreadPost.comments.map((c) => (
                  <View
                    key={c.id}
                    className={`p-3.5 rounded-2xl mb-2.5 border ${
                      c.isAccepted
                        ? 'bg-emerald-50/80 border-emerald-300'
                        : 'bg-neutral-surface border-neutral-border/60'
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text
                        className="text-neutral-textMain font-bold text-sm"
                        style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                      >
                        {c.author}
                      </Text>
                      <Text className="text-neutral-textLight text-xs">{c.timeAgo}</Text>
                    </View>
                    <Text className="text-neutral-textMain text-sm leading-5">{c.content}</Text>

                    {c.isAccepted ? (
                      <View className="flex-row items-center mt-2 pt-2 border-t border-emerald-200">
                        <CheckCheck size={16} color="#047857" />
                        <Text className="text-emerald-900 text-xs font-bold ml-1.5">
                          Apoyo aceptado por el autor
                        </Text>
                      </View>
                    ) : (
                      (currentUser.membershipStatus === 'DIRIGENTE' ||
                        activeThreadPost.author.includes(currentUser.name.split(' ')[0])) &&
                      activeThreadPost.status !== 'RESOLVED' && (
                        <TouchableOpacity
                          onPress={() => handleAcceptSupport(activeThreadPost.id, c.id, c.author)}
                          className="mt-2.5 self-start bg-neutral-mutedBg px-3 py-1.5 rounded-xl flex-row items-center"
                        >
                          <Check size={14} color="#1E5E45" strokeWidth={2.2} />
                          <Text
                            className="text-neutral-textMain text-xs font-bold ml-1.5"
                            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                          >
                            Aceptar este apoyo
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                ))
              )}
            </ScrollView>

            <View className="flex-row items-center bg-neutral-mutedBg p-1.5 rounded-2xl border border-neutral-border min-h-[48px]">
              <TextInput
                value={commentInput}
                onChangeText={setCommentInput}
                placeholder="Escribe tu mensaje de coordinación..."
                placeholderTextColor="#9EA3AE"
                className="flex-1 px-3 py-2 text-neutral-textMain text-sm"
                style={{ fontFamily: 'PlusJakartaSans_500Medium' }}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!commentInput.trim()}
                className={`w-10 h-10 rounded-xl items-center justify-center ${
                  commentInput.trim() ? 'bg-primary' : 'bg-neutral-border'
                }`}
              >
                <Send size={16} color="#FFFFFF" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {activeThreadPost.status !== 'RESOLVED' &&
              (currentUser.membershipStatus === 'DIRIGENTE' ||
                activeThreadPost.author.includes(currentUser.name.split(' ')[0])) && (
                <TouchableOpacity
                  onPress={() => handleMarkResolved(activeThreadPost.id)}
                  className="mt-3 bg-primary min-h-[46px] rounded-xl items-center justify-center flex-row"
                >
                  <CheckCheck size={18} color="#FFFFFF" strokeWidth={2.2} />
                  <Text
                    className="text-white text-sm font-bold ml-2"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                  >
                    Marcar Favor como Resuelto
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        )}
      </Modal>

      {/* MODAL DE VALIDACIÓN DE DOMICILIOS PARA DIRIGENTES */}
      <Modal
        visible={approvalModalVisible}
        onClose={() => setApprovalModalVisible(false)}
        title="Validación de Domicilios"
      >
        <View className="py-2">
          <Text
            className="text-neutral-textMuted mb-3.5 leading-5 text-sm"
            style={{ fontFamily: 'PlusJakartaSans_400Regular' }}
          >
            Como dirigente de la Junta Vecinal Sector 4, valida que estos vecinos
            residen efectivamente en la manzana antes de admitirlos al Muro Privado.
          </Text>

          {pendingRequests.map((req) => (
            <Card key={req.id} className="p-4 mb-3 bg-neutral-mutedBg/60">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-2">
                  <Text
                    className="text-neutral-textMain"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
                  >
                    {req.name}
                  </Text>
                  <Text
                    className="text-neutral-textMuted mt-0.5"
                    style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14 }}
                  >
                    {req.address}
                  </Text>
                  <Text
                    className="text-neutral-textLight mt-1"
                    style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 }}
                  >
                    Solicitud recibida {req.time}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-2 mt-3 pt-2.5 border-t border-neutral-border/50">
                <TouchableOpacity
                  onPress={() => {
                    approveMembership(req.id);
                    Alert.alert(
                      'Vecino Aprobado',
                      `Se validó el domicilio de ${req.name}. Ahora tiene acceso a la comunidad.`
                    );
                  }}
                  className="flex-1 bg-primary py-2.5 rounded-xl flex-row items-center justify-center min-h-[44px]"
                >
                  <Check size={18} color="#FFFFFF" strokeWidth={2.2} />
                  <Text
                    className="text-white ml-2"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                  >
                    Aprobar Domicilio
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => approveMembership(req.id)}
                  className="bg-neutral-surface px-4 py-2.5 rounded-xl flex-row items-center justify-center min-h-[44px] border border-neutral-border"
                >
                  <X size={18} color="#6C727A" />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      </Modal>
    </View>
  );
}
