import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Archive, CheckCircle2, ChevronRight, Pin, X } from 'lucide-react-native';
import type { SolidaryPost } from '../hooks/useSolidaryFeed';
import type { EmergencyEventRow } from '../../emergency/hooks/useEmergencyRealtime';
import { SolidaryPostCard } from './SolidaryPostCard';
import { CommunityActionCard } from './CommunityActionCard';
import { CareVolunteerCard } from './CareVolunteerCard';
import { isCareVolunteerPost } from '../constants';
import { EmergencySupportGroupsModal } from './EmergencySupportGroupsModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  resolvedPosts: SolidaryPost[];
  pastEmergencies: EmergencyEventRow[];
  currentUserId: string | null;
  onCoordinate: (post: SolidaryPost) => void;
  onToggleVolunteer: (post: SolidaryPost, isJoined: boolean) => void;
}

/**
 * Sección Archivo: publicaciones resueltas y grupos de apoyo de emergencias pasadas.
 */
export function SolidaryArchiveModal({
  visible,
  onClose,
  resolvedPosts,
  pastEmergencies,
  currentUserId,
  onCoordinate,
  onToggleVolunteer,
}: Props) {
  const [tab, setTab] = useState<'posts' | 'emergencies'>('posts');
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyEventRow | null>(null);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/45 justify-end" onPress={onClose}>
        <Pressable
          className="bg-neutral-background rounded-t-3xl h-[85%] p-5"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-10 h-10 rounded-2xl bg-neutral-mutedBg items-center justify-center mr-3">
                <Archive size={20} color="#1A1D20" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-neutral-textMain"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}
                >
                  Archivo
                </Text>
                <Text
                  className="text-neutral-textMuted"
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12.5 }}
                >
                  Publicaciones resueltas y emergencias pasadas
                </Text>
              </View>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-neutral-mutedBg items-center justify-center"
            >
              <X size={20} color="#1A1D20" />
            </TouchableOpacity>
          </View>

          <View className="flex-row bg-neutral-mutedBg p-1 rounded-2xl mb-4">
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === 'posts' }}
              onPress={() => setTab('posts')}
              className={`flex-1 min-h-[42px] rounded-xl items-center justify-center ${
                tab === 'posts' ? 'bg-neutral-surface' : ''
              }`}
            >
              <Text
                className={tab === 'posts' ? 'text-neutral-textMain' : 'text-neutral-textMuted'}
                style={{
                  fontFamily: tab === 'posts' ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                  fontSize: 13,
                }}
              >
                Resueltas ({resolvedPosts.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === 'emergencies' }}
              onPress={() => setTab('emergencies')}
              className={`flex-1 min-h-[42px] rounded-xl items-center justify-center ${
                tab === 'emergencies' ? 'bg-neutral-surface' : ''
              }`}
            >
              <Text
                className={tab === 'emergencies' ? 'text-neutral-textMain' : 'text-neutral-textMuted'}
                style={{
                  fontFamily: tab === 'emergencies' ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                  fontSize: 13,
                }}
              >
                Emergencias ({pastEmergencies.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-8">
            {tab === 'posts' ? (
              resolvedPosts.length === 0 ? (
                <View className="items-center justify-center py-12 px-6">
                  <CheckCircle2 size={32} color="#9EA3AE" />
                  <Text
                    className="text-neutral-textMain mt-3 text-center"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
                  >
                    Sin publicaciones resueltas aún
                  </Text>
                  <Text
                    className="text-neutral-textMuted mt-1 text-center"
                    style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                  >
                    Cuando una publicación del muro se marque como resuelta, aparecerá aquí.
                  </Text>
                </View>
              ) : (
                resolvedPosts.map((post) => {
                  if (post.postType === 'VOLUNTARIADO') {
                    return (
                      <CommunityActionCard
                        key={post.id}
                        post={post}
                        currentUserId={currentUserId}
                        canResolve={false}
                        onCoordinate={onCoordinate}
                        onToggleVolunteer={onToggleVolunteer}
                        onMarkResolved={() => {}}
                      />
                    );
                  }
                  if (isCareVolunteerPost(post.postType, post.category)) {
                    return (
                      <CareVolunteerCard
                        key={post.id}
                        post={post}
                        currentUserId={currentUserId}
                        canResolve={false}
                        onCoordinate={onCoordinate}
                        onToggleVolunteer={onToggleVolunteer}
                        onMarkResolved={() => {}}
                      />
                    );
                  }
                  return (
                    <SolidaryPostCard
                      key={post.id}
                      post={post}
                      canResolve={false}
                      onCoordinate={onCoordinate}
                      onMarkResolved={() => {}}
                    />
                  );
                })
              )
            ) : pastEmergencies.length === 0 ? (
              <View className="items-center justify-center py-12 px-6">
                <Pin size={32} color="#9EA3AE" />
                <Text
                  className="text-neutral-textMain mt-3 text-center"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
                >
                  Sin emergencias archivadas
                </Text>
                <Text
                  className="text-neutral-textMuted mt-1 text-center"
                  style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                >
                  Cuando finalice una emergencia, su publicación fijada y grupos de apoyo pasarán aquí.
                </Text>
              </View>
            ) : (
              pastEmergencies.map((ev) => (
                <TouchableOpacity
                  key={ev.id}
                  accessibilityRole="button"
                  activeOpacity={0.85}
                  onPress={() => setSelectedEmergency(ev)}
                  className="mb-3 rounded-2xl border border-neutral-border bg-neutral-surface p-4"
                >
                  <View className="flex-row items-center justify-between mb-1.5">
                    <View className="flex-row items-center rounded-xl bg-neutral-mutedBg px-2.5 py-1">
                      <Pin size={12} color="#4B5563" />
                      <Text
                        className="ml-1.5 text-neutral-textMuted uppercase tracking-wider"
                        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10.5 }}
                      >
                        Publicación fijada · Finalizada
                      </Text>
                    </View>
                    {ev.activated_at && (
                      <Text
                        className="text-neutral-textMuted"
                        style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11.5 }}
                      >
                        {new Date(ev.activated_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>

                  <Text
                    className="text-neutral-textMain"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
                  >
                    Emergencia · {ev.event_type}
                  </Text>
                  {ev.description ? (
                    <Text
                      numberOfLines={2}
                      className="text-neutral-textMuted mt-1"
                      style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                    >
                      {ev.description}
                    </Text>
                  ) : null}

                  <View className="mt-3 pt-2.5 border-t border-neutral-border/60 flex-row items-center justify-between">
                    <Text
                      className="text-primary-dark"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12.5 }}
                    >
                      Ver grupos de apoyo de esta emergencia
                    </Text>
                    <ChevronRight size={16} color="#1E5E45" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>

      <EmergencySupportGroupsModal
        visible={Boolean(selectedEmergency)}
        onClose={() => setSelectedEmergency(null)}
        eventId={selectedEmergency?.id}
        eventType={selectedEmergency?.event_type}
        description={selectedEmergency?.description}
        readOnly
      />
    </Modal>
  );
}
