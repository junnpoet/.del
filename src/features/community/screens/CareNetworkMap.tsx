import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { HeartHandshake, Lock } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { useI18n } from '../../../i18n';
import { NeighborhoodMap } from '../components/NeighborhoodMap';
import { CareAssignmentCard } from '../components/CareAssignmentCard';
import { StateMessage } from '../components/StateMessage';
import { CARE_STATUS_META, careStatusKey } from '../constants';
import { useCareNetwork, type CareAssignment } from '../hooks/useCareNetwork';
import { useMembership } from '../hooks/useMembership';
import { confirmAction, errorMessage, showMessage } from '../utils';
import type { CareStatus } from '../../../types';

/**
 * Capa protegida de la Red de Acompañamiento (SPEC-04 §2.3).
 * Solo para dirigentes y padrinos: la RLS ya filtra las filas y además la UI
 * no renderiza nada a un vecino sin asignaciones.
 */
export default function CareNetworkMap() {
  const { t } = useI18n();
  const { profile, isLeader, isPadrino, state } = useMembership();
  const care = useCareNetwork(state === 'MIEMBRO');
  const authorized = isLeader || isPadrino || care.assignments.length > 0;

  const handleRegisterVisit = async (assignment: CareAssignment) => {
    const ok = await confirmAction(
      t('care.registerVisit'),
      t('care.registerConfirm', { name: assignment.vulnerable.name }),
      t('care.register')
    );
    if (!ok) return;
    care.registerVisit.mutate(
      {
        assignment,
        note: t('care.visitNote', { name: profile?.full_name ?? t('care.visitNoteFallback') }),
      },
      { onError: (error) => showMessage(t('care.registerFailed'), errorMessage(error)) }
    );
  };

  const handleFollowUp = (assignment: CareAssignment) => {
    care.requestFollowUp.mutate(assignment, {
      onError: (error) => showMessage(t('care.updateFailed'), errorMessage(error)),
    });
  };

  const counts = care.assignments.reduce<Record<CareStatus, number>>(
    (acc, item) => ({ ...acc, [item.status]: acc[item.status] + 1 }),
    { AL_DIA: 0, SEGUIMIENTO_REQUERIDO: 0, ALERTA_ACTIVA: 0 }
  );
  const center =
    profile?.lat !== null && profile?.lat !== undefined && profile?.lng !== null && profile?.lng !== undefined
      ? { latitude: profile.lat, longitude: profile.lng }
      : null;

  return (
    <View className="flex-1 bg-neutral-background">
      <Header
        title={t('care.title')}
        subtitle={isLeader ? t('care.subtitleLeader') : t('care.subtitlePadrino')}
        showBack
      />

      <ScrollView
        contentContainerClassName="p-4 pb-16"
        refreshControl={<RefreshControl refreshing={care.isRefetching} onRefresh={() => void care.refetch()} />}
      >
        {state === 'LOADING' || (care.isLoading && state === 'MIEMBRO') ? (
          <StateMessage loading title={t('care.loading')} />
        ) : !authorized ? (
          <StateMessage
            icon={<Lock size={28} color="#1E5E45" />}
            title={t('care.protectedTitle')}
            message={t('care.protectedBody')}
          />
        ) : care.isError ? (
          <StateMessage
            title={t('care.loadError')}
            message={errorMessage(care.error)}
            actionLabel={t('common.retry')}
            onAction={() => care.refetch()}
          />
        ) : (
          <>
            <View className="flex-row gap-2 mb-3">
              {(Object.keys(CARE_STATUS_META) as CareStatus[]).map((status) => {
                const meta = CARE_STATUS_META[status];
                return (
                  <View key={status} className="flex-1 rounded-2xl p-3" style={{ backgroundColor: meta.tint }}>
                    <Text style={{ color: meta.color, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22 }}>
                      {counts[status]}
                    </Text>
                    <Text style={{ color: meta.color, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}>
                      {meta.emoji} {t(careStatusKey(status))}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View className="h-[280px] mb-4">
              <NeighborhoodMap careAssignments={care.assignments} center={center} webHint={t('care.webHint')} />
            </View>

            {care.assignments.length === 0 ? (
              <StateMessage
                icon={<HeartHandshake size={28} color="#1E5E45" />}
                title={t('care.emptyTitle')}
                message={isLeader ? t('care.emptyLeader') : t('care.emptyPadrino')}
              />
            ) : (
              care.assignments.map((assignment) => (
                <CareAssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  showBuddy={isLeader}
                  busy={
                    care.registerVisit.isPending &&
                    care.registerVisit.variables?.assignment.id === assignment.id
                  }
                  onRegisterVisit={handleRegisterVisit}
                  onRequestFollowUp={handleFollowUp}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
