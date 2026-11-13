import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CheckCircle2,
  Droplets,
  HeartHandshake,
  Megaphone,
  ShieldPlus,
  Users,
  X,
} from 'lucide-react-native';

export interface SupportGroupDef {
  id: string;
  title: string;
  description: string;
  color: string;
  tint: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
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

const storageKey = (eventId: string) => `@sumayni/emergency_support_groups:${eventId}`;

interface Props {
  visible: boolean;
  onClose: () => void;
  eventId: string | null | undefined;
  eventType?: string | null;
  description?: string | null;
  readOnly?: boolean;
}

/**
 * Modal de grupos de apoyo propios de una emergencia (en curso o archivada).
 */
export function EmergencySupportGroupsModal({
  visible,
  onClose,
  eventId,
  eventType,
  description,
  readOnly = false,
}: Props) {
  const [joinedIds, setJoinedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!visible || !eventId) {
      setJoinedIds([]);
      return;
    }
    AsyncStorage.getItem(storageKey(eventId))
      .then((raw) => {
        if (!raw) {
          setJoinedIds([]);
          return;
        }
        const parsed = JSON.parse(raw);
        setJoinedIds(Array.isArray(parsed) ? parsed : []);
      })
      .catch(() => setJoinedIds([]));
  }, [visible, eventId]);

  const toggleGroup = (groupId: string) => {
    if (readOnly || !eventId) return;
    setJoinedIds((prev) => {
      const next = prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId];
      void AsyncStorage.setItem(storageKey(eventId), JSON.stringify(next));
      return next;
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/45 justify-end" onPress={onClose}>
        <Pressable
          className="bg-neutral-surface rounded-t-3xl max-h-[85%] p-5"
          onPress={(e) => e.stopPropagation()}
        >
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
              const isJoined = joinedIds.includes(group.id);
              return (
                <View
                  key={group.id}
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
                      <Users size={14} color="#6C727A" />
                      <Text
                        className="ml-1.5 text-neutral-textMuted"
                        style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
                      >
                        {isJoined ? 'Participas en este grupo' : 'Grupo vecinal activo'}
                      </Text>
                    </View>

                    {!readOnly && (
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => toggleGroup(group.id)}
                        className={`rounded-xl px-3.5 py-2 flex-row items-center ${
                          isJoined
                            ? 'bg-emerald-50 border border-emerald-200'
                            : 'bg-primary'
                        }`}
                      >
                        {isJoined && <CheckCircle2 size={14} color="#065F46" />}
                        <Text
                          className={`${isJoined ? 'text-[#065F46] ml-1.5' : 'text-white'}`}
                          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                        >
                          {isJoined ? 'Unido' : 'Unirme'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
