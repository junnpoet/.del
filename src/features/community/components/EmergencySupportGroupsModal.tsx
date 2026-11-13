import React, { useEffect, useRef, useState } from 'react';
import {
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
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  HeartHandshake,
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
 * puede ingresar a cualquier grupo, y cada grupo funciona como un chat grupal.
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
  const [activeGroup, setActiveGroup] = useState<SupportGroupDef | null>(null);
  const [messagesByGroup, setMessagesByGroup] = useState<Record<string, GroupChatMessage[]>>({});
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView> | null>(null);

  useEffect(() => {
    if (!visible) {
      setActiveGroup(null);
      setDraft('');
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

  const handleSend = () => {
    const clean = draft.trim();
    if (!clean || !activeGroup || !eventId || readOnly) return;

    const newMsg: GroupChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: profile?.id ?? 'member-local',
      senderName: profile?.full_name ?? 'Vecino',
      text: clean,
      createdAt: new Date().toISOString(),
    };

    const groupId = activeGroup.id;
    setMessagesByGroup((prev) => {
      const nextList = [...(prev[groupId] ?? []), newMsg];
      void AsyncStorage.setItem(chatStorageKey(eventId, groupId), JSON.stringify(nextList));
      return { ...prev, [groupId]: nextList };
    });
    setDraft('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const activeMessages = activeGroup ? messagesByGroup[activeGroup.id] ?? [] : [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 bg-black/45 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-neutral-surface rounded-t-3xl h-[86%] p-5">
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
                        : 'Cualquier miembro de la comunidad puede escribir aquí para coordinar.'}
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
                          <Text
                            className={isMine ? 'text-white' : 'text-neutral-textMain'}
                            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}
                          >
                            {msg.text}
                          </Text>
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

              {/* Caja de envío */}
              {!readOnly && (
                <View className="flex-row items-center gap-2 pt-2 border-t border-neutral-border/70">
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
                    disabled={!draft.trim()}
                    className={`w-11 h-11 rounded-2xl items-center justify-center ${
                      draft.trim() ? 'bg-primary' : 'bg-neutral-mutedBg'
                    }`}
                  >
                    <Send size={18} color={draft.trim() ? '#FFFFFF' : '#9EA3AE'} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
