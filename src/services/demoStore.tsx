import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MembershipStatus = 'NO_SOLICITADO' | 'PENDIENTE' | 'MIEMBRO' | 'DIRIGENTE';

export interface DemoUser {
  id: string;
  name: string;
  roleTitle: string;
  role: 'vecino' | 'dirigente' | 'padrino';
  phone: string;
  homeAddress: string;
  homeLocation: { latitude: number; longitude: number };
  membershipStatus: MembershipStatus;
  isVulnerable: boolean;
  accessibleMode: boolean;
  avatarIcon: string;
  avatarUrl?: string | null;
  description: string;
}

export type OfferingType = 'SERVICIO' | 'PRODUCTO' | 'AUXILIO';

export interface OfferingItem {
  name: string;
  price: string;
  description?: string;
}

export interface HomeOffering {
  id: string;
  type: OfferingType;
  category: string;
  title: string;
  priceRef?: string;
  description: string;
  schedule?: string;
  rating: number;
  reviewsCount: number;
  hasNeighborhoodSeal: boolean;
  phone: string;
  imageUrl?: string;
  items?: OfferingItem[];
}

export interface NeighborhoodHomeItem {
  id: string;
  name: string;
  owner: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  distance: string;
  distanceMeters: number;
  phone?: string;
  vistosBuenosCount?: number;
  offerings: HomeOffering[];
}

export interface ServiceLocationItem {
  id: string;
  title: string;
  provider: string;
  category: string;
  categoryIcon: string;
  distance: string;
  distanceMeters: number;
  rating: number;
  reviewsCount: number;
  hasNeighborhoodSeal: boolean;
  coordinates: { latitude: number; longitude: number };
  phone: string;
  address: string;
}

export const DEMO_NEIGHBORHOOD_HOMES: NeighborhoodHomeItem[] = [
  {
    id: 'home-1',
    name: 'Hogar Don Segundo',
    owner: 'Don Segundo Morales',
    address: 'Jr. Los Jazmines 380, Sector 4',
    coordinates: { latitude: -12.0118, longitude: -77.0805 },
    distance: '180 m a pie',
    distanceMeters: 180,
    phone: '987654321',
    vistosBuenosCount: 38,
    offerings: [
      {
        id: 'off-1',
        type: 'SERVICIO',
        category: 'Gasfitería',
        title: 'Gasfitería y Reparación de Fugas',
        description: 'Reparaciones domiciliarias de cañerías, sanitarios y desatoros inmediatos.',
        schedule: 'Lunes a Sábado: 8:00 am – 7:00 pm',
        rating: 4.9,
        reviewsCount: 38,
        hasNeighborhoodSeal: true,
        phone: '987654321',
        imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'off-2',
        type: 'PRODUCTO',
        category: 'Repuestos',
        title: 'Repuestos y Accesorios de Gasfitería',
        priceRef: 'Desde S/ 2.50',
        description: 'Válvulas, cintas teflón, empaquetaduras y pegamento para tubos en stock en ventana.',
        schedule: 'Todos los días: 7:30 am – 8:30 pm',
        rating: 4.8,
        reviewsCount: 14,
        hasNeighborhoodSeal: true,
        phone: '987654321',
        imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
        items: [
          { name: 'Cinta teflón industrial', price: 'S/ 2.50', description: 'Para sellado hermético de roscas' },
          { name: 'Válvula de paso 1/2" pesada', price: 'S/ 14.00', description: 'Bronce reforzado para corte de agua' },
          { name: 'Set de empaquetaduras surtidas', price: 'S/ 3.00', description: 'Para grifería de lavadero y ducha' },
          { name: 'Pegamento PVC Oatey (tubo)', price: 'S/ 6.50', description: 'Soldadura rápida para desagüe y agua fría' },
        ],
      },
    ],
  },
  {
    id: 'home-2',
    name: 'Hogar Doña Rosa',
    owner: 'Doña Rosa Mamani',
    address: 'Jr. Los Jazmines 312, Sector 4',
    coordinates: { latitude: -12.0126, longitude: -77.0811 },
    distance: '90 m a pie',
    distanceMeters: 90,
    phone: '998877665',
    vistosBuenosCount: 42,
    offerings: [
      {
        id: 'off-3',
        type: 'PRODUCTO',
        category: 'Panadería',
        title: 'Pan Casero y Queques Artesanales',
        priceRef: 'Pan S/ 0.40 · Queques S/ 14',
        description: 'Pan calientito de masa madre todas las mañanas y queques de naranja y plátano recién horneados.',
        schedule: 'Lunes a Domingo: 6:30 am – 11:00 am y 5:00 pm – 8:00 pm',
        rating: 4.9,
        reviewsCount: 42,
        hasNeighborhoodSeal: true,
        phone: '998877665',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        items: [
          { name: 'Pan de piso / masa madre', price: 'S/ 0.40 c/u', description: 'Horneado a las 6:30 am y 5:00 pm' },
          { name: 'Queque de naranja artesanal', price: 'S/ 14.00', description: 'Molde entero familiar, húmedo con jugo natural' },
          { name: 'Tajada de queque de plátano', price: 'S/ 2.50', description: 'Porción individual con frutos secos' },
          { name: 'Empanadas de carne al horno', price: 'S/ 3.50 c/u', description: 'Relleno de carne picada y aceituna' },
        ],
      },
      {
        id: 'off-4',
        type: 'AUXILIO',
        category: 'Botiquín Comunal',
        title: 'Botiquín Vecinal de Primeros Auxilios',
        description: 'Botiquín comunitario con alcohol, gasas, vendas, tensiómetro digital y oxímetro.',
        schedule: 'Atención 24 horas ante urgencias vecinales',
        rating: 5.0,
        reviewsCount: 19,
        hasNeighborhoodSeal: true,
        phone: '998877665',
        imageUrl: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'home-3',
    name: 'Hogar Luis Quispe',
    owner: 'Luis Quispe',
    address: 'Calle Las Orquídeas 215, Sector 4',
    coordinates: { latitude: -12.0138, longitude: -77.0822 },
    distance: '260 m a pie',
    distanceMeters: 260,
    phone: '992233445',
    vistosBuenosCount: 22,
    offerings: [
      {
        id: 'off-5',
        type: 'SERVICIO',
        category: 'Electricidad',
        title: 'Electricidad e Instalaciones Domiciliarias',
        description: 'Instalaciones de tomacorrientes, cableado, tableros térmicos y luminarias LED.',
        schedule: 'Lunes a Sábado: 8:00 am – 6:00 pm',
        rating: 4.8,
        reviewsCount: 22,
        hasNeighborhoodSeal: true,
        phone: '992233445',
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'home-4',
    name: 'Hogar Sra. Gladys',
    owner: 'Sra. Gladys Huamán',
    address: 'Calle Las Dalias 140, Sector 4',
    coordinates: { latitude: -12.0132, longitude: -77.0800 },
    distance: '290 m a pie',
    distanceMeters: 290,
    phone: '993344556',
    vistosBuenosCount: 29,
    offerings: [
      {
        id: 'off-6',
        type: 'PRODUCTO',
        category: 'Comida Casera',
        title: 'Almuerzos Caseros y Viandas del Día',
        priceRef: 'Menú completo S/ 11.00',
        description: 'Comida casera limpia y balanceada, sopa + segundo. Opción para llevar o entrega en puerta.',
        schedule: 'Lunes a Sábado: 12:00 pm – 3:30 pm',
        rating: 4.9,
        reviewsCount: 29,
        hasNeighborhoodSeal: true,
        phone: '993344556',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        items: [
          { name: 'Menú del día (Sopa criolla + Seco de res)', price: 'S/ 11.00', description: 'Incluye refresco natural del día' },
          { name: 'Menú económico (Solo segundo + refresco)', price: 'S/ 9.50', description: 'Plato fondo servido generoso' },
          { name: 'Jarra de Chicha Morada casera (1L)', price: 'S/ 5.00', description: 'De maíz morado con fruta y canela' },
          { name: 'Porción extra de palta fuerte / ensalada', price: 'S/ 2.50', description: 'Acompañamiento fresco' },
        ],
      },
    ],
  },
  {
    id: 'home-5',
    name: 'Hogar Sra. Martha',
    owner: 'Sra. Martha Valdivia',
    address: 'Jr. Los Jazmines 290, Sector 4',
    coordinates: { latitude: -12.0110, longitude: -77.0828 },
    distance: '310 m a pie',
    distanceMeters: 310,
    phone: '994455667',
    vistosBuenosCount: 15,
    offerings: [
      {
        id: 'off-7',
        type: 'SERVICIO',
        category: 'Costura',
        title: 'Costura y Bastas Express',
        description: 'Bastas de pantalón al instante, cambios de cierre y ajustes de prendas.',
        schedule: 'Lunes a Viernes: 9:00 am – 6:30 pm',
        rating: 5.0,
        reviewsCount: 15,
        hasNeighborhoodSeal: true,
        phone: '994455667',
        imageUrl: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'home-6',
    name: 'Punto Comunitario Losa Las Dalias',
    owner: 'Junta Vecinal Sector 4',
    address: 'Losa Deportiva Las Dalias, Sector 4',
    coordinates: { latitude: -12.0142, longitude: -77.0818 },
    distance: '240 m a pie',
    distanceMeters: 240,
    phone: '991122334',
    vistosBuenosCount: 30,
    offerings: [
      {
        id: 'off-8',
        type: 'AUXILIO',
        category: 'Zona Segura',
        title: 'Zona Segura de Evacuación (Defensa Civil)',
        description: 'Área abierta libre de cables y estructuras para concentración vecinal en emergencias.',
        schedule: 'Abierto 24/7 permanente',
        rating: 5.0,
        reviewsCount: 30,
        hasNeighborhoodSeal: true,
        phone: '991122334',
        imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
];

export const DEMO_PERSONAS: DemoUser[] = [
  {
    id: 'carmen_vecina',
    name: 'Carmen Rosa Mamani',
    roleTitle: 'Vecina Nueva (Capa Pública)',
    role: 'vecino',
    phone: '998877665',
    homeAddress: 'Jr. Los Jazmines 340, Sector 4',
    homeLocation: { latitude: -12.0125, longitude: -77.0815 },
    membershipStatus: 'NO_SOLICITADO',
    isVulnerable: false,
    accessibleMode: false,
    avatarIcon: 'user',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    description: 'Explora oficios a pie en la capa pública y puede solicitar unirse a la Junta Vecinal.',
  },
  {
    id: 'don_segundo_prestador',
    name: 'Don Segundo Morales',
    roleTitle: 'Prestador Barrial (Gasfitero)',
    role: 'vecino',
    phone: '987654321',
    homeAddress: 'Jr. Los Jazmines 380, Sector 4',
    homeLocation: { latitude: -12.0118, longitude: -77.0805 },
    membershipStatus: 'MIEMBRO',
    isVulnerable: false,
    accessibleMode: false,
    avatarIcon: 'wrench',
    avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
    description: 'Aparece en el mapa público con Visto Bueno Vecinal y es miembro activo del sector.',
  },
  {
    id: 'don_jacinto_vulnerable',
    name: 'Don Jacinto Valdés (82 años)',
    roleTitle: 'Adulto Mayor (Modo Asistido)',
    role: 'vecino',
    phone: '976543210',
    homeAddress: 'Calle Las Dalias 120, Mz. C Lt. 8',
    homeLocation: { latitude: -12.0135, longitude: -77.0825 },
    membershipStatus: 'MIEMBRO',
    isVulnerable: true,
    accessibleMode: true,
    avatarIcon: 'heart',
    avatarUrl: 'https://randomuser.me/api/portraits/men/68.jpg',
    description: 'Cuenta con interfaz adaptativa gigante, botón central SOS de 2s y asistencia por voz.',
  },
  {
    id: 'elena_dirigente',
    name: 'Elena Mendoza',
    roleTitle: 'Dirigenta Barrial (Sector 4)',
    role: 'dirigente',
    phone: '991122334',
    homeAddress: 'Jr. Los Jazmines 310, Mz. D Lt. 4',
    homeLocation: { latitude: -12.0120, longitude: -77.0810 },
    membershipStatus: 'DIRIGENTE',
    isVulnerable: false,
    accessibleMode: false,
    avatarIcon: 'shield',
    avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
    description: 'Valida solicitudes de ingreso a la capa privada y coordina la red preventiva del sector.',
  },
];

export const DEMO_MAP_SERVICES: ServiceLocationItem[] = [
  {
    id: 's-1',
    title: 'Gasfitería y Fugas de Agua',
    provider: 'Don Segundo Morales',
    category: 'Gasfitería',
    categoryIcon: 'wrench',
    distance: '180 m a pie',
    distanceMeters: 180,
    rating: 4.9,
    reviewsCount: 38,
    hasNeighborhoodSeal: true,
    coordinates: { latitude: -12.0118, longitude: -77.0805 },
    phone: '987654321',
    address: 'Jr. Los Jazmines 380',
  },
  {
    id: 's-2',
    title: 'Electricidad e Instalaciones',
    provider: 'Luis Quispe',
    category: 'Electricidad',
    categoryIcon: 'zap',
    distance: '260 m a pie',
    distanceMeters: 260,
    rating: 4.8,
    reviewsCount: 22,
    hasNeighborhoodSeal: true,
    coordinates: { latitude: -12.0138, longitude: -77.0822 },
    phone: '992233445',
    address: 'Calle Las Orquídeas 215',
  },
  {
    id: 's-3',
    title: 'Costura y Bastas Express',
    provider: 'Sra. Martha Valdivia',
    category: 'Costura',
    categoryIcon: 'scissors',
    distance: '310 m a pie',
    distanceMeters: 310,
    rating: 5.0,
    reviewsCount: 15,
    hasNeighborhoodSeal: true,
    coordinates: { latitude: -12.0110, longitude: -77.0828 },
    phone: '994455667',
    address: 'Jr. Los Jazmines 290',
  },
  {
    id: 's-4',
    title: 'Cerrajería y Copia de Llaves',
    provider: 'Taller San Martín',
    category: 'Cerrajería',
    categoryIcon: 'key',
    distance: '480 m a pie',
    distanceMeters: 480,
    rating: 4.6,
    reviewsCount: 19,
    hasNeighborhoodSeal: false,
    coordinates: { latitude: -12.0145, longitude: -77.0790 },
    phone: '995566778',
    address: 'Av. Perú 1420',
  },
  {
    id: 's-5',
    title: 'Carpintería y Muebles de Madera',
    provider: 'Hernán Ramos',
    category: 'Carpintería',
    categoryIcon: 'hammer',
    distance: '590 m a pie',
    distanceMeters: 590,
    rating: 4.7,
    reviewsCount: 12,
    hasNeighborhoodSeal: true,
    coordinates: { latitude: -12.0152, longitude: -77.0835 },
    phone: '997788990',
    address: 'Calle Los Claveles 140',
  },
];

interface DemoContextType {
  currentUser: DemoUser;
  switchUser: (userId: string) => void;
  requestMembership: () => void;
  approveMembership: (userId: string) => void;
  pendingRequests: { id: string; name: string; address: string; time: string }[];
  favorites: string[];
  toggleFavorite: (serviceId: string) => void;
  fabOffset: number;
  setFabOffset: (offset: number) => void;
  hideGlobalFAB: boolean;
  setHideGlobalFAB: (hide: boolean) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const STORAGE_KEY = '@sumayni_active_persona_v2';
const MEMBERSHIP_KEY = '@sumayni_membership_status_v2';
const FAVORITES_KEY = '@sumayni_favorites_v2';

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<DemoUser>(DEMO_PERSONAS[0]);
  const [favorites, setFavorites] = useState<string[]>(['s-1']);
  const [fabOffset, setFabOffset] = useState<number>(0);
  const [hideGlobalFAB, setHideGlobalFAB] = useState<boolean>(false);
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 'req-1',
      name: 'Carmen Rosa Mamani',
      address: 'Jr. Los Jazmines 340, Sector 4',
      time: 'Hace 10 min',
    },
    {
      id: 'req-2',
      name: 'Jorge Huamán',
      address: 'Calle Las Dalias 180, Mz. C Lt. 14',
      time: 'Hace 45 min',
    },
  ]);

  useEffect(() => {
    const init = async () => {
      try {
        const savedId = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedId) {
          const found = DEMO_PERSONAS.find((p) => p.id === savedId);
          if (found) setCurrentUser(found);
        }
        const savedFavs = await AsyncStorage.getItem(FAVORITES_KEY);
        if (savedFavs) {
          setFavorites(JSON.parse(savedFavs));
        }
      } catch (err) {
        console.warn('Error loading demo state', err);
      }
    };
    init();
  }, []);

  const switchUser = async (userId: string) => {
    const selected = DEMO_PERSONAS.find((p) => p.id === userId);
    if (selected) {
      setCurrentUser(selected);
      await AsyncStorage.setItem(STORAGE_KEY, selected.id);
      await AsyncStorage.setItem('accessible_mode', selected.accessibleMode ? 'true' : 'false');
    }
  };

  const requestMembership = () => {
    setCurrentUser((prev) => ({
      ...prev,
      membershipStatus: 'PENDIENTE',
    }));
  };

  const approveMembership = (userId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== userId));
  };

  const toggleFavorite = async (serviceId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <DemoContext.Provider
      value={{
        currentUser,
        switchUser,
        requestMembership,
        approveMembership,
        pendingRequests,
        favorites,
        toggleFavorite,
        fabOffset,
        setFabOffset,
        hideGlobalFAB,
        setHideGlobalFAB,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error('useDemo must be used within DemoProvider');
  }
  return ctx;
};
