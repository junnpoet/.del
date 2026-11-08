import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CheckCircle, Clock, MapPin, Phone, Siren } from 'lucide-react-native';
import { Card } from '../../../components/ui/Card';
import { useI18n } from '../../../i18n';
import { CARE_STATUS_META, careStatusKey } from '../constants';
import type { CareAssignment } from '../hooks/useCareNetwork';
import { callPhone, timeAgo } from '../utils';

interface Props {
  assignment: CareAssignment;
  onRegisterVisit: (assignment: CareAssignment) => void;
  onRequestFollowUp?: (assignment: CareAssignment) => void;
  onRemove?: (assignment: CareAssignment) => void;
  busy?: boolean;
  showBuddy?: boolean;
}

export function CareAssignmentCard({
  assignment,
  onRegisterVisit,
  onRequestFollowUp,
  onRemove,
  busy = false,
  showBuddy = false,
}: Props) {
  const { t } = useI18n();
  const meta = CARE_STATUS_META[assignment.status];
  const isAlert = assignment.status === 'ALERTA_ACTIVA';

  return (
    <Card className={`mb-3 p-4 ${isAlert ? 'border-2 border-emergency-alert' : ''}`}>
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-neutral-textMain" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}>
            {assignment.vulnerable.name}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <MapPin size={13} color="#6C727A" />
            <Text className="text-neutral-textMuted ml-1 flex-1" style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}>
              {assignment.vulnerable.address}
            </Text>
          </View>
        </View>
        <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: meta.tint }}>
          <Text style={{ color: meta.color, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}>
            {meta.emoji} {t(careStatusKey(assignment.status))}
          </Text>
        </View>
      </View>

      {isAlert && assignment.activeSosAt && (
        <View className="flex-row items-center bg-emergency-tint rounded-xl px-3 py-2 mb-2">
          <Siren size={16} color="#DC2626" />
          <Text className="text-emergency-alert ml-2 flex-1" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}>
            {t('care.sosActive', { time: timeAgo(assignment.activeSosAt) })}
          </Text>
        </View>
      )}

      <View className="flex-row items-center mb-1">
        <Clock size={13} color="#9EA3AE" />
        <Text className="text-neutral-textMuted ml-1" style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}>
          {t('care.lastContact', {
            time: assignment.updatedAt ? timeAgo(assignment.updatedAt) : t('care.noRecord'),
          })}
        </Text>
      </View>
      {showBuddy && (
        <Text className="text-neutral-textMuted mb-1" style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}>
          {t('care.padrino', { name: assignment.buddy.name ?? t('care.noPadrino') })}
        </Text>
      )}
      {assignment.notes ? (
        <Text className="text-neutral-textMain mt-1" style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}>
          {assignment.notes}
        </Text>
      ) : null}

      <View className="flex-row flex-wrap gap-2 mt-3 pt-2.5 border-t border-neutral-border/50">
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onRegisterVisit(assignment)}
          disabled={busy}
          className="flex-1 min-w-[180px] min-h-[44px] bg-primary rounded-xl flex-row items-center justify-center px-3"
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <CheckCircle size={16} color="#FFFFFF" />
              <Text className="text-white ml-1.5" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}>
                {t('care.registerVisit')}
              </Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('care.callA11y', { name: assignment.vulnerable.name })}
          onPress={() => callPhone(assignment.vulnerable.phone)}
          className="min-h-[44px] px-3.5 bg-neutral-mutedBg rounded-xl flex-row items-center justify-center"
        >
          <Phone size={16} color="#1A1D20" />
          <Text className="text-neutral-textMain ml-1.5" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}>
            {t('common.call')}
          </Text>
        </TouchableOpacity>
        {onRequestFollowUp && assignment.status === 'AL_DIA' && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => onRequestFollowUp(assignment)}
            className="min-h-[44px] px-3.5 bg-sun-tint rounded-xl items-center justify-center"
          >
            <Text className="text-sun-dark" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}>
              {t('care.requestFollowUp')}
            </Text>
          </TouchableOpacity>
        )}
        {onRemove && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => onRemove(assignment)}
            className="min-h-[44px] px-3.5 bg-neutral-surface border border-neutral-border rounded-xl items-center justify-center"
          >
            <Text className="text-neutral-textMuted" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}>
              {t('common.remove')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}
