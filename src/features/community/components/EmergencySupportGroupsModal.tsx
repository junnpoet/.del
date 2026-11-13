import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  HeartHandshake,
  ImagePlus,
  Megaphone,
  MessageCircle,
  Send,
  ShieldPlus,
  X,
} from 'lucide-react-native';
import { useAuth } from '../../../services/auth';
import { timeAgo } from '../utils';

export interface SupportGroupDef {
  id: string;
  title: string;
  description: string;
  color: string;
  tint: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}

export interface GroupChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUri?: string;
  createdAt: string;
}

export const EMERGENCY_SUPPORT_GROUPS: SupportGroupDef[] = [
  {
    id: 'first-aid',
    title: 'Brigada de Primeros Auxilios',
    description: 'Atención básica, botiquín vecinal y apoyo en evacuación segura.',
    color: '#B91C1C',
    tint: '#FEE2E2',
    Icon: ShieldPlus,
  },
  {
    id: 'supplies',
    title: 'Acopio de Víveres y Agua',
    description: 'Recepción y reparto equitativo de agua, alimentos y abrigo.',
    color: '#B45309',
    tint: '#FEF3C7',
    Icon: Droplets,
  },
  {
    id: 'care-vulnerable',
    title: 'Apoyo a Adultos Mayores y Vulnerables',
    description: 'Acompañamiento directo a vecinos con movilidad reducida o riesgo.',
    color: '#1E5E45',
    tint: '#E8F3EE',
    Icon: HeartHandshake,
  },
  {
    id: 'comms',
    title: 'Comunicaciones y Alerta',
    description: 'Verificación de novedades oficiales y reporte de incidencias de la cuadra.',
    color: '#0369A1',
    tint: '#E0F2FE',
    Icon: Megaphone,
  },
];

const chatStorageKey = (eventId: string, groupId: string) =>
  `@sumayni/emergency_group_chat:${eventId}:${groupId}`;

interface Props {
  visible: boolean;
  onClose: () => void;
  eventId: string | null | undefined;
  eventType?: string | null;
  description?: string | null;
  readOnly?: boolean;
}

/**
 * Modal de grupos de apoyo de una emergencia: cualquier miembro de la comunidad
 * puede ingresar a cualquier grupo, y cada grupo funciona como un chat grupal
 * con soporte de texto e imágenes.
 */
export function EmergencySupportGroupsModal({
  visible,
  onClose,
  eventId,
  eventType,
  description,
  readOnly = false,
}: Props) {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeGroup, setActiveGroup] = useState<SupportGroupDef | null>(null);
  const [messagesByGroup, setMessagesByGroup] = useState<Record<string, GroupChatMessage[]>>({});
  const [draft, setDraft] = useState('');
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView> | null>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      setActiveGroup(null);
      setDraft('');
      setPendingImageUri(null);
      setKeyboardHeight(0);
      return;
    }
    if (!eventId) {
      setMessagesByGroup({});
      return;
    }
    Promise.all(
      EMERGENCY_SUPPORT_GROUPS.map(async (g) => {
        try {
          const raw = await AsyncStorage.getItem(chatStorageKey(eventId, g.id));
          const parsed = raw ? JSON.parse(raw) : [];
          return [g.id, Array.isArray(parsed) ? parsed : []] as const;
        } catch {
          return [g.id, []] as const;
        }
      })
    ).then((entries) => {
      setMessagesByGroup(Object.fromEntries(entries));
    });
  }, [visible, eventId]);

  const handlePickImage = async () => {
    if (readOnly) return;
    if (!requireOptionalNativeModule('ExponentImagePicker')) {
      Alert.alert(
        'Módulo de galería no disponible',
        'El cliente de desarrollo actual no incluye ExponentImagePicker. Recompila el dev client (npx expo run:android) para habilitar el envío de fotos.'
      );
      return;
    }
    try {
      const ImagePicker = await import('expo-image-picker');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permiso necesario',
          'Autoriza el acceso a tus fotos para enviar imágenes en el chat grupal.'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.75,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setPendingImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert(
        'No se pudo abrir la galería',
        'Verifica los permisos o recompila el dev client para usar el selector de imágenes.'
      );
    }
  };

  const handleSend = () => {
    const clean = draft.trim();
    if ((!clean && !pendingImageUri) || !activeGroup || !eventId || readOnly) return;

    const newMsg: GroupChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: profile?.id ?? 'member-local',
      senderName: profile?.full_name ?? 'Vecino',
      text: clean,
      imageUri: pendingImageUri ?? undefined,
      createdAt: new Date().toISOString(),
    };

    const groupId = activeGroup.id;
    setMessagesByGroup((prev) => {
      const nextList = [...(prev[groupId] ?? []), newMsg];
      void AsyncStorage.setItem(chatStorageKey(eventId, groupId), JSON.stringify(nextList));
      return { ...prev, [groupId]: nextList };
    });
    setDraft('');
    setPendingImageUri(null);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const activeMessages = activeGroup ? messagesByGroup[activeGroup.id] ?? [] : [];
  const canSend = Boolean(draft.trim() || pendingImageUri);
  const bottomPadding =
    Platform.OS === 'android' && keyboardHeight > 0
      ? keyboardHeight + 10
      : Math.max(insets.bottom + 12, 20);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="bg-neutral-surface rounded-t-3xl h-[86%] px-5 pt-5 border-t border-neutral-border shadow-2xl"
          style={{ paddingBottom: bottomPadding }}
        >
          {!activeGroup ? (
            <>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1 mr-3">
                  <Text
                    className="text-[#991B1B] uppercase tracking-wider"
                    style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 11 }}
                  >
                    {readOnly ? 'Emergencia archivada' : 'Emergencia en curso'}
                  </Text>
                  <Text
                    className="text-neutral-textMain mt-0.5"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}
                  >
                    Grupos de apoyo · {eventType || 'Contingencia'}
                  </Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={onClose}
                  className="w-10 h-10 rounded-full bg-neutral-mutedBg items-center justify-center"
                >
                  <X size={20} color="#1A1D20" />
                </TouchableOpacity>
              </View>

              {description ? (
                <View className="rounded-2xl bg-[#FFF1F2] border border-red-200 px-3.5 py-2.5 mb-4">
                  <Text
                    className="text-[#7F1D1D]"
                    style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                  >
                    {description}
                  </Text>
                </View>
              ) : null}

              <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
                {EMERGENCY_SUPPORT_GROUPS.map((group) => {
                  const Icon = group.Icon;
                  const msgCount = (messagesByGroup[group.id] ?? []).length;
                  return (
                    <TouchableOpacity
                      key={group.id}
                      accessibilityRole="button"
                      activeOpacity={0.85}
                      onPress={() => setActiveGroup(group)}
                      className="mb-3 rounded-2xl border border-neutral-border bg-neutral-background p-3.5"
                    >
                      <View className="flex-row items-start">
                        <View
                          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                          style={{ backgroundColor: group.tint }}
                        >
                          <Icon size={20} color={group.color} />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-neutral-textMain"
                            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14.5 }}
                          >
                            {group.title}
                          </Text>
                          <Text
                            className="text-neutral-textMuted mt-0.5 leading-4"
                            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12.5 }}
                          >
                            {group.description}
                          </Text>
                        </View>
                      </View>

                      <View className="mt-3 flex-row items-center justify-between pt-2.5 border-t border-neutral-border/60">
                        <View className="flex-row items-center">
                          <MessageCircle size={14} color="#6C727A" />
                          <Text
                            className="ml-1.5 text-neutral-textMuted"
                            style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
                          >
                            {msgCount === 0
                              ? 'Sin mensajes aún'
                              : msgCount === 1
                              ? '1 mensaje'
                              : `${msgCount} mensajes`}
                          </Text>
                        </View>

                        <View className="flex-row items-center rounded-xl bg-primary-tint px-3 py-1.5">
                          <Text
                            className="text-primary-dark"
                            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                          >
                            {readOnly ? 'Ver chat' : 'Ingresar al chat'}
                          </Text>
                          <ChevronRight size={14} color="#1E5E45" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          ) : (
            <>
              {/* Cabecera del chat grupal */}
              <View className="flex-row items-center justify-between pb-3 border-b border-neutral-border/70">
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => setActiveGroup(null)}
                  className="w-10 h-10 rounded-2xl bg-neutral-mutedBg items-center justify-center mr-2.5"
                >
                  <ChevronLeft size={20} color="#1A1D20" />
                </TouchableOpacity>

                <View
                  className="w-9 h-9 rounded-xl items-center justify-center mr-2.5"
                  style={{ backgroundColor: activeGroup.tint }}
                >
                  <activeGroup.Icon size={18} color={activeGroup.color} />
                </View>

                <View className="flex-1 mr-2">
                  <Text
                    numberOfLines={1}
                    className="text-neutral-textMain"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
                  >
                    {activeGroup.title}
                  </Text>
                  <Text
                    className="text-neutral-textMuted"
                    style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11.5 }}
                  >
                    {readOnly
                      ? `Archivo · ${eventType || 'Emergencia'}`
                      : `Chat grupal · ${eventType || 'Emergencia'}`}
                  </Text>
                </View>

                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={onClose}
                  className="w-10 h-10 rounded-full bg-neutral-mutedBg items-center justify-center"
                >
                  <X size={20} color="#1A1D20" />
                </TouchableOpacity>
              </View>

              {/* Mensajes del chat */}
              <ScrollView
                ref={scrollRef}
                className="flex-1 my-3"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerClassName="pb-2"
              >
                {activeMessages.length === 0 ? (
                  <View className="items-center justify-center py-14 px-6">
                    <MessageCircle size={32} color="#9EA3AE" />
                    <Text
                      className="text-neutral-textMain mt-3 text-center"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
                    >
                      {readOnly ? 'No hubo mensajes en este grupo' : 'Inicia la coordinación del grupo'}
                    </Text>
                    <Text
                      className="text-neutral-textMuted mt-1 text-center"
                      style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                    >
                      {readOnly
                        ? 'Este chat pertenece a una emergencia archivada.'
                        : 'Cualquier miembro de la comunidad puede escribir o enviar fotos aquí.'}
                    </Text>
                  </View>
                ) : (
                  activeMessages.map((msg) => {
                    const isMine = msg.senderId === (profile?.id ?? 'member-local');
                    return (
                      <View
                        key={msg.id}
                        className={`mb-2.5 max-w-[84%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        {!isMine && (
                          <Text
                            className="text-neutral-textMuted mb-0.5 ml-1"
                            style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11 }}
                          >
                            {msg.senderName}
                          </Text>
                        )}
                        <View
                          className={`rounded-2xl px-3.5 py-2.5 ${
                            isMine
                              ? 'bg-primary rounded-br-sm'
                              : 'bg-neutral-background border border-neutral-border rounded-bl-sm'
                          }`}
                        >
                          {msg.imageUri ? (
                            <Image
                              source={{ uri: msg.imageUri }}
                              className="w-52 h-40 rounded-xl mb-1.5"
                              resizeMode="cover"
                            />
                          ) : null}
                          {msg.text ? (
                            <Text
                              className={isMine ? 'text-white' : 'text-neutral-textMain'}
                              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}
                            >
                              {msg.text}
                            </Text>
                          ) : null}
                        </View>
                        <Text
                          className="text-neutral-textMuted mt-0.5 mx-1"
                          style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10.5 }}
                        >
                          {timeAgo(msg.createdAt)}
                        </Text>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              {/* Previsualización de imagen adjunta + Caja de envío */}
              {!readOnly && (
                <View className="pt-2 border-t border-neutral-border/70">
                  {pendingImageUri ? (
                    <View className="mb-2 flex-row items-center">
                      <View className="relative">
                        <Image
                          source={{ uri: pendingImageUri }}
                          className="w-16 h-16 rounded-xl"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          accessibilityRole="button"
                          accessibilityLabel="Quitar imagen"
                          onPress={() => setPendingImageUri(null)}
                          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-neutral-textMain items-center justify-center"
                        >
                          <X size={13} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : null}

                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Adjuntar imagen"
                      onPress={handlePickImage}
                      className="w-11 h-11 rounded-2xl border border-neutral-border bg-neutral-background items-center justify-center"
                    >
                      <ImagePlus size={19} color="#1E5E45" />
                    </TouchableOpacity>
                    <TextInput
                      value={draft}
                      onChangeText={setDraft}
                      placeholder="Escribe un mensaje al grupo..."
                      placeholderTextColor="#9EA3AE"
                      multiline
                      className="flex-1 min-h-[44px] max-h-[100px] rounded-2xl border border-neutral-border bg-neutral-background px-3.5 py-2.5 text-neutral-textMain"
                      style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}
                    />
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Enviar mensaje"
                      onPress={handleSend}
                      disabled={!canSend}
                      className={`w-11 h-11 rounded-2xl items-center justify-center ${
                        canSend ? 'bg-primary' : 'bg-neutral-mutedBg'
                      }`}
                    >
                      <Send size={18} color={canSend ? '#FFFFFF' : '#9EA3AE'} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
