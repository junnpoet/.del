import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, Region } from 'react-native-maps';
import {
  Store,
  MapPin,
  Star,
  ShieldCheck,
  AlertTriangle,
  Map as MapIcon,
  List as ListIcon,
  Home,
  MessageCircle,
  Bookmark,
  Wrench,
  Zap,
  Scissors,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  Phone,
  Clock,
  Coins,
  Navigation,
  ShoppingBag,
  UtensilsCrossed,
  HeartPulse,
} from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Modal } from '../../src/components/ui/Modal';
import { QuickPublishFAB } from '../../src/components/ui/QuickPublishFAB';
import { CLEAN_NEIGHBORHOOD_MAP_STYLE } from '../../src/theme/cleanMapStyle';
import {
  useDemo,
  DEMO_NEIGHBORHOOD_HOMES,
  NeighborhoodHomeItem,
  HomeOffering,
  OfferingType,
} from '../../src/services/demoStore';

export default function PublicServicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, favorites, toggleFavorite, setHideGlobalFAB } = useDemo();
  const mapRef = useRef<MapView | null>(null);

  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const MAX_SHEET_HEIGHT = Math.max(SCREEN_HEIGHT - (insets.top + 105), 380);
  const PEEK_HEIGHT = 285;
  const SNAP_EXPANDED = 0;
  const SNAP_PEEK = MAX_SHEET_HEIGHT - PEEK_HEIGHT;
  const SNAP_HIDDEN = MAX_SHEET_HEIGHT + 80;

  const MIDPOINT_HEIGHT = Math.round(SCREEN_HEIGHT * 0.54);
  const SNAP_HALF = Math.max(30, Math.round(MAX_SHEET_HEIGHT - MIDPOINT_HEIGHT));
  const SNAP_HALF_COVERED = Math.max(15, Math.round(SNAP_HALF - 45));

  const sheetTranslateY = useRef(new Animated.Value(SNAP_PEEK)).current;
  const currentSnapRef = useRef<'peek' | 'expanded' | 'hidden'>('peek');
  const [sheetState, setSheetState] = useState<'peek' | 'expanded' | 'hidden'>('peek');
  const lastOffsetY = useRef(SNAP_PEEK);

  const fabTranslateY = sheetTranslateY.interpolate({
    inputRange: [SNAP_EXPANDED, SNAP_HALF_COVERED, SNAP_HALF, SNAP_PEEK, SNAP_HIDDEN],
    outputRange: [
      -MIDPOINT_HEIGHT,
      -MIDPOINT_HEIGHT,
      -MIDPOINT_HEIGHT,
      -PEEK_HEIGHT,
      0,
    ],
    extrapolate: 'clamp',
  });

  const fabOpacity = sheetTranslateY.interpolate({
    inputRange: [SNAP_EXPANDED, SNAP_HALF_COVERED, SNAP_HALF, SNAP_PEEK, SNAP_HIDDEN],
    outputRange: [0, 0, 1, 1, 1],
    extrapolate: 'clamp',
  });

  const [activeView, setActiveView] = useState<'map' | 'list'>('map');
  const [selectedRadius, setSelectedRadius] = useState<'300m' | '500m' | '1km'>('500m');
  const [filterType, setFilterType] = useState<'TODOS' | 'SERVICIO' | 'PRODUCTO' | 'AUXILIO'>('TODOS');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHome, setSelectedHome] = useState<NeighborhoodHomeItem | null>(
    DEMO_NEIGHBORHOOD_HOMES[0]
  );
  const [selectedOfferingIndex, setSelectedOfferingIndex] = useState<number>(0);
  const [vistoBuenoModalVisible, setVistoBuenoModalVisible] = useState(false);
  const [vistoBuenoSubmitted, setVistoBuenoSubmitted] = useState(false);
  const [targetOfferingForVistoBueno, setTargetOfferingForVistoBueno] = useState<HomeOffering | null>(null);

  const activeOffering: HomeOffering | null = selectedHome
    ? selectedHome.offerings[selectedOfferingIndex] || selectedHome.offerings[0]
    : null;

  useEffect(() => {
    if (activeView === 'map') {
      setHideGlobalFAB(true);
    } else {
      setHideGlobalFAB(false);
    }
    return () => {
      setHideGlobalFAB(false);
    };
  }, [activeView]);

  const openSheet = (home: NeighborhoodHomeItem, offeringIndex = 0) => {
    setSelectedHome(home);
    setSelectedOfferingIndex(offeringIndex);
    currentSnapRef.current = 'peek';
    setSheetState('peek');
    lastOffsetY.current = SNAP_PEEK;
    Animated.spring(sheetTranslateY, {
      toValue: SNAP_PEEK,
      useNativeDriver: true,
      bounciness: 4,
      speed: 14,
    }).start();
  };

  const closeSheet = () => {
    currentSnapRef.current = 'hidden';
    setSheetState('hidden');
    lastOffsetY.current = SNAP_HIDDEN;
    Animated.timing(sheetTranslateY, {
      toValue: SNAP_HIDDEN,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setSelectedHome(null);
    });
  };

  const expandSheet = () => {
    currentSnapRef.current = 'expanded';
    setSheetState('expanded');
    lastOffsetY.current = SNAP_EXPANDED;
    Animated.spring(sheetTranslateY, {
      toValue: SNAP_EXPANDED,
      useNativeDriver: true,
      bounciness: 3,
      speed: 14,
    }).start();
  };

  const collapseToPeek = () => {
    currentSnapRef.current = 'peek';
    setSheetState('peek');
    lastOffsetY.current = SNAP_PEEK;
    Animated.spring(sheetTranslateY, {
      toValue: SNAP_PEEK,
      useNativeDriver: true,
      bounciness: 4,
      speed: 14,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 4;
      },
      onPanResponderGrant: () => {
        lastOffsetY.current =
          currentSnapRef.current === 'expanded' ? SNAP_EXPANDED : SNAP_PEEK;
      },
      onPanResponderMove: (_, gestureState) => {
        const rawY = lastOffsetY.current + gestureState.dy;
        const clamped = Math.max(0, Math.min(SNAP_HIDDEN, rawY));
        sheetTranslateY.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.vy > 0.5 || gestureState.dy > 100) {
          if (currentSnapRef.current === 'expanded') {
            collapseToPeek();
          } else {
            closeSheet();
          }
        } else if (gestureState.vy < -0.5 || gestureState.dy < -80) {
          expandSheet();
        } else {
          const currentY = lastOffsetY.current + gestureState.dy;
          const distToExpanded = Math.abs(currentY - SNAP_EXPANDED);
          const distToPeek = Math.abs(currentY - SNAP_PEEK);

          if (currentY > SNAP_PEEK + 70) {
            closeSheet();
          } else if (distToExpanded < distToPeek) {
            expandSheet();
          } else {
            collapseToPeek();
          }
        }
      },
    })
  ).current;

  const categoriesByType: Record<'TODOS' | 'SERVICIO' | 'PRODUCTO' | 'AUXILIO', string[]> = {
    TODOS: ['Todos', 'Gasfitería', 'Panadería', 'Electricidad', 'Comida Casera', 'Costura', 'Repuestos', 'Botiquín Comunal', 'Zona Segura'],
    SERVICIO: ['Todos', 'Gasfitería', 'Electricidad', 'Costura'],
    PRODUCTO: ['Todos', 'Panadería', 'Comida Casera', 'Repuestos'],
    AUXILIO: ['Todos', 'Botiquín Comunal', 'Zona Segura'],
  };

  const categories = categoriesByType[filterType];

  const radiusMeters =
    selectedRadius === '300m' ? 300 : selectedRadius === '500m' ? 500 : 1000;

  const filteredHomes = DEMO_NEIGHBORHOOD_HOMES.filter((home) => {
    const matchesRadius = home.distanceMeters <= radiusMeters;
    if (!matchesRadius) return false;

    const matchesOfferings = home.offerings.some((off) => {
      const matchesType = filterType === 'TODOS' || off.type === filterType;
      const matchesCategory =
        selectedCategory === 'Todos' || off.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        off.title.toLowerCase().includes(query) ||
        off.category.toLowerCase().includes(query) ||
        home.owner.toLowerCase().includes(query) ||
        home.name.toLowerCase().includes(query);

      return matchesType && matchesCategory && matchesQuery;
    });

    return matchesOfferings;
  });

  const getCategoryIcon = (category: string, color: string, size = 14) => {
    switch (category) {
      case 'Gasfitería':
        return <Wrench size={size} color={color} strokeWidth={2.2} />;
      case 'Electricidad':
        return <Zap size={size} color={color} strokeWidth={2.2} />;
      case 'Costura':
        return <Scissors size={size} color={color} strokeWidth={2.2} />;
      case 'Panadería':
      case 'Repuestos':
      case 'Abarrotes':
        return <ShoppingBag size={size} color={color} strokeWidth={2.2} />;
      case 'Comida Casera':
        return <UtensilsCrossed size={size} color={color} strokeWidth={2.2} />;
      case 'Botiquín Comunal':
        return <HeartPulse size={size} color={color} strokeWidth={2.2} />;
      case 'Zona Segura':
        return <ShieldCheck size={size} color={color} strokeWidth={2.2} />;
      default:
        return <Store size={size} color={color} strokeWidth={2.2} />;
    }
  };

  const handleSelectHomeOnMap = (home: NeighborhoodHomeItem) => {
    openSheet(home, 0);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: home.coordinates.latitude - 0.0018,
          longitude: home.coordinates.longitude,
          latitudeDelta: 0.007,
          longitudeDelta: 0.007,
        },
        500
      );
    }
  };

  const handleRecenterMap = () => {
    const delta = selectedRadius === '300m' ? 0.007 : selectedRadius === '500m' ? 0.010 : 0.016;
    mapRef.current?.animateToRegion(
      {
        latitude: currentUser.homeLocation.latitude,
        longitude: currentUser.homeLocation.longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      },
      450
    );
  };

  const handleSelectRadius = (r: '300m' | '500m' | '1km') => {
    setSelectedRadius(r);
    const delta = r === '300m' ? 0.007 : r === '500m' ? 0.010 : 0.016;
    mapRef.current?.animateToRegion(
      {
        latitude: currentUser.homeLocation.latitude,
        longitude: currentUser.homeLocation.longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      },
      400
    );
  };

  const handleRegionChangeComplete = (region: Region) => {
    const latDiff = region.latitude - currentUser.homeLocation.latitude;
    const lngDiff = region.longitude - currentUser.homeLocation.longitude;
    if (Math.abs(latDiff) > 0.012 || Math.abs(lngDiff) > 0.012) {
      const clampedLat = Math.max(
        currentUser.homeLocation.latitude - 0.009,
        Math.min(currentUser.homeLocation.latitude + 0.009, region.latitude)
      );
      const clampedLng = Math.max(
        currentUser.homeLocation.longitude - 0.009,
        Math.min(currentUser.homeLocation.longitude + 0.009, region.longitude)
      );
      mapRef.current?.animateToRegion(
        {
          ...region,
          latitude: clampedLat,
          longitude: clampedLng,
        },
        350
      );
    }
  };

  const handleOpenVistoBueno = (offering: HomeOffering) => {
    setTargetOfferingForVistoBueno(offering);
    setVistoBuenoSubmitted(false);
    setVistoBuenoModalVisible(true);
  };

  const handleConfirmVistoBueno = () => {
    setVistoBuenoSubmitted(true);
    setTimeout(() => {
      setVistoBuenoModalVisible(false);
      Alert.alert(
        '¡Visto Bueno Otorgado!',
        `Has registrado tu recomendación comunitaria para ${targetOfferingForVistoBueno?.title}. Su reputación en el sector ha aumentado.`
      );
    }, 600);
  };

  const getTypeLabel = (type: OfferingType) => {
    switch (type) {
      case 'SERVICIO':
        return 'Servicio';
      case 'PRODUCTO':
        return 'Producto';
      case 'AUXILIO':
        return 'Auxilio';
    }
  };

  const getTypeColor = (type: OfferingType) => {
    switch (type) {
      case 'SERVICIO':
        return '#1E5E45';
      case 'PRODUCTO':
        return '#0284C7';
      case 'AUXILIO':
        return '#EAB308';
    }
  };

  return (
    <View className="flex-1 bg-neutral-background">
      {/* ============================================================== */}
      {/* FLOATING HEADER & SEARCH BAR                                   */}
      {/* ============================================================== */}
      <View
        className="absolute left-3.5 right-3.5 z-40"
        style={{ top: Math.max(insets.top + 4, 14) }}
        pointerEvents="box-none"
      >
        {/* Floating Capsule: Logo + Search Bar + SOS */}
        <View className="bg-neutral-surface rounded-3xl p-1.5 shadow-md shadow-black/15 flex-row items-center min-h-[50px]">
          <View className="pl-1.5 pr-2">
            <Image
              source={require('../../assets/images/logo.png')}
              style={{ width: 34, height: 34, borderRadius: 10 }}
              resizeMode="contain"
            />
          </View>

          <View className="flex-1 flex-row items-center bg-neutral-mutedBg rounded-2xl px-3 py-1 mr-2 min-h-[38px]">
            <Search size={15} color="#6C727A" strokeWidth={2.2} />
            <TextInput
              placeholder="Buscar en el barrio (gasfitería, pan, auxilio)..."
              placeholderTextColor="#9EA3AE"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-neutral-textMain py-1"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                <X size={14} color="#6C727A" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.push('/emergency-board')}
            className="bg-emergency-alert px-3 py-2 rounded-2xl flex-row items-center shadow-xs"
          >
            <AlertTriangle size={14} color="#FFFFFF" strokeWidth={2.5} />
            <Text
              className="text-white ml-1 font-bold"
              style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 12 }}
            >
              SOS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Floating Controls Row: [Mapa/Lista] + Radius */}
        <View className="flex-row items-center mt-2" pointerEvents="box-none">
          <View className="bg-neutral-surface/95 rounded-2xl p-1 shadow-sm border border-neutral-border/50 mr-2 flex-row items-center">
            <TouchableOpacity
              onPress={() => setActiveView(activeView === 'map' ? 'list' : 'map')}
              className="px-2.5 py-1 bg-neutral-mutedBg rounded-xl flex-row items-center mr-1"
            >
              {activeView === 'map' ? (
                <>
                  <ListIcon size={13} color="#1A1D20" strokeWidth={2} />
                  <Text
                    className="text-neutral-textMain ml-1"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11 }}
                  >
                    Lista
                  </Text>
                </>
              ) : (
                <>
                  <MapIcon size={13} color="#1A1D20" strokeWidth={2} />
                  <Text
                    className="text-neutral-textMain ml-1"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11 }}
                  >
                    Mapa
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {(['300m', '500m', '1km'] as const).map((r) => {
              const isSelected = selectedRadius === r;
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => handleSelectRadius(r)}
                  className={`px-2 py-1 rounded-lg ${
                    isSelected ? 'bg-primary' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={isSelected ? 'text-white' : 'text-neutral-textMuted'}
                    style={{
                      fontFamily: isSelected ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                      fontSize: 11,
                    }}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Type Filter Pills: [ Todos | 🟢 Servicios | 🔵 Productos | 🟡 Auxilio ] */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingRight: 6 }}
          >
            {[
              { key: 'TODOS', label: 'Todos', dot: null },
              { key: 'SERVICIO', label: 'Servicios', dot: '#1E5E45' },
              { key: 'PRODUCTO', label: 'Productos', dot: '#0284C7' },
              { key: 'AUXILIO', label: 'Auxilio', dot: '#EAB308' },
            ].map((tab) => {
              const isSelected = filterType === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => {
                    setFilterType(tab.key as any);
                    setSelectedCategory('Todos');
                  }}
                  className={`px-2.5 py-1.5 rounded-2xl mr-1.5 flex-row items-center shadow-sm border ${
                    isSelected
                      ? 'bg-neutral-textMain border-neutral-textMain'
                      : 'bg-neutral-surface/95 border-neutral-border/50'
                  }`}
                >
                  {tab.dot && (
                    <View
                      className="w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: tab.dot }}
                    />
                  )}
                  <Text
                    className={isSelected ? 'text-white' : 'text-neutral-textMain'}
                    style={{
                      fontFamily: isSelected ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_600SemiBold',
                      fontSize: 11,
                    }}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Categories Pills Row (when specific type is chosen or general) */}
        {categories.length > 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-1.5"
            contentContainerStyle={{ paddingRight: 6 }}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl mr-1.5 shadow-xs border ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-neutral-surface/90 border-neutral-border/50'
                  }`}
                >
                  <Text
                    className={isSelected ? 'text-white' : 'text-neutral-textMuted'}
                    style={{
                      fontFamily: isSelected
                        ? 'PlusJakartaSans_700Bold'
                        : 'PlusJakartaSans_500Medium',
                      fontSize: 11,
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* ============================================================== */}
      {/* MAIN VIEW: FULLSCREEN MAP VS CLEAN LIST VIEW                  */}
      {/* ============================================================== */}
      {activeView === 'map' ? (
        <View className="flex-1 relative">
          <MapView
            ref={mapRef}
            style={{ width: '100%', height: '100%' }}
            initialRegion={{
              latitude: currentUser.homeLocation.latitude,
              longitude: currentUser.homeLocation.longitude,
              latitudeDelta:
                selectedRadius === '300m' ? 0.007 : selectedRadius === '500m' ? 0.010 : 0.016,
              longitudeDelta:
                selectedRadius === '300m' ? 0.007 : selectedRadius === '500m' ? 0.010 : 0.016,
            }}
            customMapStyle={CLEAN_NEIGHBORHOOD_MAP_STYLE}
            toolbarEnabled={false}
            showsPointsOfInterests={false}
            showsCompass={false}
            showsTraffic={false}
            showsBuildings={false}
            showsIndoors={false}
            minZoomLevel={14.5}
            maxZoomLevel={19}
            onRegionChangeComplete={handleRegionChangeComplete}
          >
            {/* Walkable Circle Radius Overlay */}
            <Circle
              center={currentUser.homeLocation}
              radius={radiusMeters}
              fillColor="rgba(30, 94, 69, 0.08)"
              strokeColor="rgba(30, 94, 69, 0.4)"
              strokeWidth={1.5}
            />

            {/* User Home Location Marker */}
            <Marker
              coordinate={currentUser.homeLocation}
              title="Tu Hogar"
              description={currentUser.homeAddress}
            >
              <View className="items-center">
                <View className="bg-primary px-2.5 py-1 rounded-full shadow-md shadow-black/20 flex-row items-center border border-white">
                  <Home size={11} color="#FFFFFF" />
                  <Text
                    className="text-white ml-1"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 }}
                  >
                    Mi Hogar
                  </Text>
                </View>
                <View className="w-1.5 h-1.5 bg-primary rounded-full mt-0.5" />
              </View>
            </Marker>

            {/* Neighborhood Home Markers with Tricolor Indicator Dots */}
            {filteredHomes.map((home) => {
              const isSelected = selectedHome?.id === home.id;
              const hasServicio = home.offerings.some((o) => o.type === 'SERVICIO');
              const hasProducto = home.offerings.some((o) => o.type === 'PRODUCTO');
              const hasAuxilio = home.offerings.some((o) => o.type === 'AUXILIO');

              return (
                <Marker
                  key={home.id}
                  coordinate={home.coordinates}
                  onPress={() => handleSelectHomeOnMap(home)}
                >
                  <View className="items-center">
                    <View
                      className={`w-9 h-9 rounded-full shadow-md items-center justify-center ${
                        isSelected
                          ? 'bg-neutral-textMain border-2 border-primary scale-110'
                          : 'bg-neutral-surface border border-neutral-border'
                      }`}
                    >
                      {/* Home icon */}
                      <Home
                        size={13}
                        color={isSelected ? '#FFFFFF' : '#1A1D20'}
                        strokeWidth={2.4}
                      />

                      {/* Tricolor Indicator Dots at the bottom of the circle */}
                      <View className="flex-row items-center justify-center gap-0.5 mt-0.5">
                        {hasServicio && (
                          <View
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: '#1E5E45' }}
                          />
                        )}
                        {hasProducto && (
                          <View
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: '#0284C7' }}
                          />
                        )}
                        {hasAuxilio && (
                          <View
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: '#EAB308' }}
                          />
                        )}
                      </View>
                    </View>

                    {/* Small anchor pin indicator */}
                    <View
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isSelected ? 'bg-primary' : 'bg-neutral-textMuted'
                      }`}
                    />
                  </View>
                </Marker>
              );
            })}
          </MapView>

          {/* Floating Recenter Neighborhood Capsule */}
          <TouchableOpacity
            onPress={handleRecenterMap}
            activeOpacity={0.85}
            className="absolute left-4 bg-neutral-surface/95 px-3 py-1.5 rounded-full shadow-md shadow-black/10 flex-row items-center border border-neutral-border/60 z-30"
            style={{ top: Math.max(insets.top + (categories.length > 2 ? 134 : 98), 120) }}
            accessibilityLabel="Recentrar en mi sector barrial"
          >
            <Home size={12} color="#1E5E45" strokeWidth={2.4} />
            <Text
              className="text-neutral-textMain ml-1.5"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11 }}
            >
              Sector 4 · Mi Hogar
            </Text>
          </TouchableOpacity>

          {/* Synchronized '+' FAB */}
          <QuickPublishFAB
            animatedTranslateY={fabTranslateY}
            animatedOpacity={fabOpacity}
            baseBottom={16}
            zIndex={35}
            pointerEvents={sheetState === 'expanded' ? 'none' : 'auto'}
          />

          {/* Interactive Animated Bottom Sheet */}
          {selectedHome && activeOffering && (
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: MAX_SHEET_HEIGHT,
                transform: [{ translateY: sheetTranslateY }],
                zIndex: 40,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 20,
              }}
              className="bg-neutral-surface rounded-t-3xl border-t border-neutral-border/60"
            >
              {/* Drag Handle & Peek Gesture Area */}
              <View
                {...panResponder.panHandlers}
                className="pt-2.5 pb-2 px-5 bg-neutral-surface rounded-t-3xl"
              >
                {/* Visual drag pill */}
                <View className="w-12 h-1.5 rounded-full bg-neutral-border/80 self-center mb-2" />

                {/* Multi-role Offering Segmented Switcher (if home offers > 1) */}
                {selectedHome.offerings.length > 1 ? (
                  <View className="flex-row items-center bg-neutral-mutedBg p-1 rounded-xl mb-2">
                    {selectedHome.offerings.map((off, idx) => {
                      const isActive = idx === selectedOfferingIndex;
                      const dotColor = getTypeColor(off.type);
                      const typeLabel = getTypeLabel(off.type);

                      return (
                        <TouchableOpacity
                          key={off.id}
                          onPress={() => setSelectedOfferingIndex(idx)}
                          className={`flex-1 flex-row items-center justify-center py-1.5 px-2 rounded-lg ${
                            isActive ? 'bg-white shadow-xs' : 'bg-transparent'
                          }`}
                        >
                          <View
                            className="w-2 h-2 rounded-full mr-1.5"
                            style={{ backgroundColor: dotColor }}
                          />
                          <Text
                            className={isActive ? 'text-neutral-textMain' : 'text-neutral-textMuted'}
                            style={{
                              fontFamily: isActive ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                              fontSize: 11,
                            }}
                            numberOfLines={1}
                          >
                            {typeLabel}: {off.category}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center bg-neutral-mutedBg px-2.5 py-0.5 rounded-lg">
                      <View
                        className="w-2 h-2 rounded-full mr-1.5"
                        style={{ backgroundColor: getTypeColor(activeOffering.type) }}
                      />
                      <Text
                        className="text-neutral-textMain uppercase"
                        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 }}
                      >
                        {getTypeLabel(activeOffering.type)} barrial
                      </Text>
                    </View>
                  </View>
                )}

                {/* Top status bar: Category Icon + Seal + Expand/Collapse & Close */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="bg-neutral-mutedBg px-2.5 py-0.5 rounded-lg flex-row items-center mr-2">
                      {getCategoryIcon(activeOffering.category, '#1A1D20', 12)}
                      <Text
                        className="text-neutral-textMain ml-1 uppercase"
                        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11 }}
                      >
                        {activeOffering.category}
                      </Text>
                    </View>

                    {activeOffering.hasNeighborhoodSeal && (
                      <View className="flex-row items-center bg-neutral-mutedBg px-2 py-0.5 rounded-md">
                        <ShieldCheck size={12} color="#1E5E45" strokeWidth={2.2} />
                        <Text
                          className="text-neutral-textMain ml-1"
                          style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11 }}
                        >
                          Visto Bueno
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row items-center gap-1.5">
                    <TouchableOpacity
                      onPress={sheetState === 'expanded' ? collapseToPeek : expandSheet}
                      className="h-8 w-8 rounded-full bg-neutral-mutedBg items-center justify-center"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel={sheetState === 'expanded' ? 'Minimizar tarjeta' : 'Expandir tarjeta a pantalla completa'}
                    >
                      {sheetState === 'expanded' ? (
                        <ChevronDown size={18} color="#6C727A" strokeWidth={2.2} />
                      ) : (
                        <ChevronUp size={18} color="#6C727A" strokeWidth={2.2} />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={closeSheet}
                      className="h-8 w-8 rounded-full bg-neutral-mutedBg items-center justify-center"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Cerrar tarjeta"
                    >
                      <X size={16} color="#6C727A" strokeWidth={2.2} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Offering title & Home Owner */}
                <View className="flex-row justify-between items-start mt-2">
                  <View className="flex-1 mr-2">
                    <Text
                      className="text-neutral-textMain"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17 }}
                      numberOfLines={1}
                    >
                      {activeOffering.title}
                    </Text>
                    <Text
                      className="text-neutral-textMuted mt-0.5"
                      style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                    >
                      Hogar de {selectedHome.owner} · {selectedHome.address}
                    </Text>
                    {activeOffering.items && activeOffering.items.length > 0 && (
                      <Text
                        className="text-primary mt-1"
                        style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
                      >
                        {activeOffering.items.length} productos en vitrina vecinal
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleFavorite(activeOffering.id)}
                    className="h-9 w-9 rounded-full bg-neutral-mutedBg items-center justify-center"
                  >
                    <Bookmark
                      size={16}
                      color={favorites.includes(activeOffering.id) ? '#D97706' : '#6C727A'}
                      fill={favorites.includes(activeOffering.id) ? '#D97706' : 'transparent'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Distance & Rating / Free Tag */}
                <View className="flex-row items-center justify-between pt-2 border-t border-neutral-border/50 mt-2 mb-2">
                  <View className="flex-row items-center">
                    <MapPin size={14} color="#1E5E45" strokeWidth={2.2} />
                    <Text
                      className="text-neutral-textMain ml-1 font-bold"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                    >
                      {selectedHome.distanceMeters}m a pie
                    </Text>
                    {activeOffering.priceRef && (
                      <Text
                        className="text-neutral-textLight ml-2"
                        style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
                      >
                        · {activeOffering.priceRef}
                      </Text>
                    )}
                  </View>

                  <View className="flex-row items-center bg-neutral-mutedBg px-2.5 py-1 rounded-xl">
                    <Star size={13} color="#D97706" fill="#D97706" />
                    <Text
                      className="text-neutral-textMain ml-1"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                    >
                      {activeOffering.rating.toFixed(1)} ({activeOffering.reviewsCount})
                    </Text>
                  </View>
                </View>

                {/* Direct Action CTAs in Peek Mode */}
                <View className="flex-row gap-2">
                  {activeOffering.type === 'PRODUCTO' ? (
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          'Pedido Directo de Ventana',
                          `Iniciando WhatsApp con ${selectedHome.owner} (${selectedHome.phone}) para consultar disponibilidad de ${activeOffering.title}.`
                        )
                      }
                      className="flex-1 bg-primary py-2.5 rounded-xl flex-row items-center justify-center min-h-[42px]"
                    >
                      <ShoppingBag size={16} color="#FFFFFF" strokeWidth={2.2} />
                      <Text
                        className="text-white ml-1.5"
                        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                      >
                        Pedir por WhatsApp
                      </Text>
                    </TouchableOpacity>
                  ) : activeOffering.type === 'AUXILIO' ? (
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          'Auxilio Barrial Directo',
                          `Llamando al punto de auxilio vecinal: ${selectedHome.owner} (${selectedHome.phone}).`
                        )
                      }
                      className="flex-1 bg-emergency-alert py-2.5 rounded-xl flex-row items-center justify-center min-h-[42px]"
                    >
                      <Phone size={16} color="#FFFFFF" strokeWidth={2.2} />
                      <Text
                        className="text-white ml-1.5"
                        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                      >
                        Llamar al Punto
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          'Contacto Vecinal Directo',
                          `Iniciando chat con ${selectedHome.owner} (${selectedHome.phone}). Sin comisiones.`
                        )
                      }
                      className="flex-1 bg-primary py-2.5 rounded-xl flex-row items-center justify-center min-h-[42px]"
                    >
                      <MessageCircle size={16} color="#FFFFFF" strokeWidth={2.2} />
                      <Text
                        className="text-white ml-1.5"
                        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                      >
                        Contactar
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => handleOpenVistoBueno(activeOffering)}
                    className="bg-neutral-mutedBg px-3.5 py-2.5 rounded-xl flex-row items-center justify-center min-h-[42px]"
                  >
                    <ShieldCheck size={16} color="#1A1D20" strokeWidth={2.2} />
                    <Text
                      className="text-neutral-textMain ml-1"
                      style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                    >
                      Dar Visto Bueno
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Extended Details Section (Revealed when card slides up) */}
              <ScrollView
                className="flex-1 px-5 pt-3"
                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 36) }}
                showsVerticalScrollIndicator={false}
              >
                {/* Visual Banner Preview */}
                {activeOffering.imageUrl && (
                  <View className="rounded-2xl overflow-hidden mb-3 border border-neutral-border/50">
                    <Image
                      source={{ uri: activeOffering.imageUrl }}
                      style={{ width: '100%', height: 135 }}
                      resizeMode="cover"
                    />
                  </View>
                )}

                {/* Vitrina de Ventana / Lista de Productos del Hogar */}
                {activeOffering.items && activeOffering.items.length > 0 && (
                  <View className="bg-neutral-mutedBg/60 p-4 rounded-2xl mb-3">
                    <View className="flex-row items-center justify-between mb-2.5">
                      <View className="flex-row items-center">
                        <ShoppingBag size={16} color="#0284C7" strokeWidth={2.2} />
                        <Text
                          className="text-neutral-textMain ml-2 font-bold"
                          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                        >
                          Vitrina de Ventana
                        </Text>
                      </View>
                      <Text
                        className="text-primary font-bold"
                        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                      >
                        {activeOffering.items.length} productos
                      </Text>
                    </View>

                    <View className="gap-2">
                      {activeOffering.items.map((item, idx) => (
                        <View
                          key={idx}
                          className="p-3 bg-neutral-surface rounded-xl flex-row items-center justify-between border border-neutral-border/40"
                        >
                          <View className="flex-1 mr-3">
                            <Text
                              className="text-neutral-textMain font-bold"
                              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                            >
                              {item.name}
                            </Text>
                            {item.description && (
                              <Text
                                className="text-neutral-textMuted mt-0.5"
                                style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11 }}
                              >
                                {item.description}
                              </Text>
                            )}
                          </View>

                          <View className="bg-neutral-mutedBg px-2.5 py-1 rounded-lg">
                            <Text
                              className="text-primary font-bold"
                              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                            >
                              {item.price}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Description */}
                <View className="bg-neutral-mutedBg/60 p-4 rounded-2xl mb-3">
                  <Text
                    className="text-neutral-textMain mb-1.5"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                  >
                    Sobre el {getTypeLabel(activeOffering.type).toLowerCase()}
                  </Text>
                  <Text
                    className="text-neutral-textMuted"
                    style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 19 }}
                  >
                    {activeOffering.description}
                  </Text>
                </View>

                {/* Schedule & Availability */}
                <View className="bg-neutral-mutedBg/60 p-4 rounded-2xl mb-3">
                  <View className="flex-row items-center mb-2">
                    <Clock size={16} color="#1E5E45" strokeWidth={2.2} />
                    <Text
                      className="text-neutral-textMain ml-2"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                    >
                      Horario & Disponibilidad
                    </Text>
                  </View>
                  <Text
                    className="text-neutral-textMain"
                    style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                  >
                    {activeOffering.schedule}
                  </Text>
                  <Text
                    className="text-neutral-textLight mt-0.5"
                    style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 }}
                  >
                    Coordinación directa de vecino a vecino en Sector 4.
                  </Text>
                </View>

                {/* Price and payment details */}
                <View className="bg-neutral-mutedBg/60 p-4 rounded-2xl mb-3">
                  <View className="flex-row items-center mb-2">
                    <Coins size={16} color="#1E5E45" strokeWidth={2.2} />
                    <Text
                      className="text-neutral-textMain ml-2"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                    >
                      Tarifa y Forma de Pago
                    </Text>
                  </View>
                  <Text
                    className="text-neutral-textMain"
                    style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                  >
                    {activeOffering.priceRef || 'Acceso Libre y Solidario'} · Efectivo · Yape · Plin
                  </Text>
                  <Text
                    className="text-neutral-textLight mt-0.5"
                    style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 }}
                  >
                    Trato directo sin comisiones ni intermediarios de plataforma.
                  </Text>
                </View>

                {/* Community Endorsement / Visto Bueno */}
                <View className="bg-neutral-mutedBg/60 p-4 rounded-2xl mb-4">
                  <View className="flex-row items-center justify-between mb-2.5">
                    <View className="flex-row items-center">
                      <ShieldCheck size={16} color="#1E5E45" strokeWidth={2.2} />
                      <Text
                        className="text-neutral-textMain ml-2"
                        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                      >
                        Respaldo Comunitario
                      </Text>
                    </View>
                    <Text
                      className="text-primary font-bold"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                    >
                      {selectedHome.vistosBuenosCount} Vistos Buenos
                    </Text>
                  </View>

                  <View className="p-3 bg-neutral-surface rounded-xl">
                    <Text
                      className="text-neutral-textMuted"
                      style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 }}
                    >
                      Vecino verificado del Sector 4 con recomendación de las manzanas colindantes.
                    </Text>
                  </View>
                </View>

                {/* Call Button in Full Screen View */}
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      'Llamada Telefónica',
                      `Llamando a ${selectedHome.owner} al ${selectedHome.phone}...`
                    )
                  }
                  className="w-full bg-neutral-surface border border-neutral-border py-3 rounded-xl flex-row items-center justify-center mb-4 min-h-[44px]"
                >
                  <Phone size={16} color="#1A1D20" strokeWidth={2.2} />
                  <Text
                    className="text-neutral-textMain ml-2"
                    style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                  >
                    Llamar a {selectedHome.owner} ({selectedHome.phone})
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          )}
        </View>
      ) : (
        /* ============================================================== */
        /* CLEAN LIST VIEW: OFFERINGS BY HOMES                            */
        /* ============================================================== */
        <ScrollView
          contentContainerClassName="p-4 pb-28"
          style={{ paddingTop: Math.max(insets.top + (categories.length > 2 ? 144 : 108), 120) }}
        >
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text
              className="text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              Hogares del barrio ({filteredHomes.length})
            </Text>
            <Text
              className="text-neutral-textLight"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
            >
              Radio: {selectedRadius} desde tu casa
            </Text>
          </View>

          {filteredHomes.map((home) => {
            const visibleOfferings = home.offerings.filter((off) => {
              const matchesType = filterType === 'TODOS' || off.type === filterType;
              const matchesCategory =
                selectedCategory === 'Todos' || off.category === selectedCategory;
              return matchesType && matchesCategory;
            });

            if (visibleOfferings.length === 0) return null;

            return (
              <Card key={home.id} className="mb-3.5 p-4">
                {/* Home Header */}
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center mb-1">
                      <Home size={14} color="#1E5E45" strokeWidth={2.2} />
                      <Text
                        className="text-neutral-textMain ml-1.5 font-bold"
                        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                      >
                        {home.name}
                      </Text>
                    </View>
                    <Text
                      className="text-neutral-textMuted"
                      style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
                    >
                      {home.owner} · {home.address} · {home.distanceMeters}m a pie
                    </Text>
                  </View>

                  <View className="bg-neutral-mutedBg px-2 py-0.5 rounded-md flex-row items-center">
                    <ShieldCheck size={12} color="#1E5E45" strokeWidth={2.2} />
                    <Text
                      className="text-neutral-textMain ml-1"
                      style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11 }}
                    >
                      {home.vistosBuenosCount} V.B.
                    </Text>
                  </View>
                </View>

                {/* Offerings within this Home */}
                <View className="mt-2 pt-2 border-t border-neutral-border/50 gap-2.5">
                  {visibleOfferings.map((off) => {
                    const dotColor = getTypeColor(off.type);
                    const typeLabel = getTypeLabel(off.type);

                    return (
                      <View
                        key={off.id}
                        className="bg-neutral-mutedBg/50 p-3 rounded-2xl border border-neutral-border/40"
                      >
                        <View className="flex-row items-center justify-between mb-1.5">
                          <View className="flex-row items-center">
                            <View
                              className="w-2 h-2 rounded-full mr-1.5"
                              style={{ backgroundColor: dotColor }}
                            />
                            <Text
                              className="text-neutral-textMain uppercase"
                              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 }}
                            >
                              {typeLabel} · {off.category}
                            </Text>
                          </View>

                          <View className="flex-row items-center">
                            <Star size={11} color="#D97706" fill="#D97706" />
                            <Text
                              className="text-neutral-textMain ml-1"
                              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11 }}
                            >
                              {off.rating.toFixed(1)}
                            </Text>
                          </View>
                        </View>

                        <Text
                          className="text-neutral-textMain mb-1"
                          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                        >
                          {off.title}
                        </Text>
                        <Text
                          className="text-neutral-textMuted mb-2"
                          style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, lineHeight: 17 }}
                          numberOfLines={2}
                        >
                          {off.description}
                        </Text>

                        {off.priceRef && (
                          <Text
                            className="text-primary mb-2 font-bold"
                            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                          >
                            {off.priceRef}
                          </Text>
                        )}

                        {/* Vitrina Preview if multiple items exist */}
                        {off.items && off.items.length > 0 && (
                          <View className="bg-neutral-surface/90 p-2.5 rounded-xl border border-neutral-border/40 mb-2 gap-1.5">
                            <Text
                              className="text-neutral-textLight uppercase"
                              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 }}
                            >
                              En vitrina ({off.items.length} productos):
                            </Text>
                            {off.items.slice(0, 3).map((item, idx) => (
                              <View key={idx} className="flex-row items-center justify-between">
                                <Text
                                  className="text-neutral-textMain text-xs flex-1 mr-2"
                                  style={{ fontFamily: 'PlusJakartaSans_500Medium' }}
                                  numberOfLines={1}
                                >
                                  • {item.name}
                                </Text>
                                <Text
                                  className="text-primary font-bold text-xs"
                                  style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                                >
                                  {item.price}
                                </Text>
                              </View>
                            ))}
                            {off.items.length > 3 && (
                              <Text
                                className="text-neutral-textMuted text-right text-xs"
                                style={{ fontFamily: 'PlusJakartaSans_500Medium' }}
                              >
                                +{off.items.length - 3} más en ventana
                              </Text>
                            )}
                          </View>
                        )}

                        <View className="flex-row gap-2 pt-1 border-t border-neutral-border/40">
                          <TouchableOpacity
                            onPress={() => {
                              openSheet(home, home.offerings.findIndex((o) => o.id === off.id));
                              setActiveView('map');
                            }}
                            className="flex-1 bg-neutral-surface border border-neutral-border py-1.5 rounded-xl flex-row items-center justify-center"
                          >
                            <MapPin size={13} color="#1A1D20" strokeWidth={2} />
                            <Text
                              className="text-neutral-textMain ml-1"
                              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
                            >
                              Ver en Mapa
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() =>
                              Alert.alert(
                                'Contacto Vecinal',
                                `Contactando a ${home.owner} (${home.phone}) para ${off.title}.`
                              )
                            }
                            className="flex-1 bg-primary py-1.5 rounded-xl flex-row items-center justify-center"
                          >
                            {off.type === 'PRODUCTO' ? (
                              <ShoppingBag size={13} color="#FFFFFF" strokeWidth={2} />
                            ) : off.type === 'AUXILIO' ? (
                              <Phone size={13} color="#FFFFFF" strokeWidth={2} />
                            ) : (
                              <MessageCircle size={13} color="#FFFFFF" strokeWidth={2} />
                            )}
                            <Text
                              className="text-white ml-1 font-bold"
                              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                            >
                              {off.type === 'PRODUCTO' ? 'Pedir' : off.type === 'AUXILIO' ? 'Llamar' : 'Contactar'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Card>
            );
          })}
        </ScrollView>
      )}

      {/* Modal de Visto Bueno Vecinal */}
      <Modal
        visible={vistoBuenoModalVisible}
        onClose={() => setVistoBuenoModalVisible(false)}
        title="Visto Bueno Vecinal"
      >
        <View className="py-2">
          <Text
            className="text-neutral-textMain mb-1"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
          >
            ¿Recomiendas este servicio u oficio vecinal?
          </Text>
          <Text
            className="text-neutral-textMuted mb-4 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            En Sumayni no usamos comisiones ni intermediarios comerciales. Tu Visto Bueno
            respalda la confianza de los vecinos del Sector 4.
          </Text>

          <View className="flex-row justify-center gap-2 mb-5">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                className="w-12 h-12 rounded-2xl bg-neutral-mutedBg items-center justify-center"
              >
                <Star size={24} color="#D97706" fill="#D97706" />
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Confirmar Visto Bueno (5 estrellas)"
            variant="primary"
            onPress={handleConfirmVistoBueno}
            isLoading={vistoBuenoSubmitted}
          />
        </View>
      </Modal>
    </View>
  );
}
