import React, { useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlertTriangle, CheckCircle } from 'lucide-react-native';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import { usePublicI18n, type PublicTranslationKey } from '../i18n';

export type ReportReasonCode =
  | 'COBRO_ABUSIVO'
  | 'INCUMPLIMIENTO'
  | 'PERFIL_FALSO'
  | 'FALTA_RESPETO'
  | 'OTRO';

const REPORT_REASONS: readonly {
  code: ReportReasonCode;
  labelKey: PublicTranslationKey;
}[] = [
  { code: 'COBRO_ABUSIVO', labelKey: 'report.reason.COBRO_ABUSIVO' },
  { code: 'INCUMPLIMIENTO', labelKey: 'report.reason.INCUMPLIMIENTO' },
  { code: 'PERFIL_FALSO', labelKey: 'report.reason.PERFIL_FALSO' },
  { code: 'FALTA_RESPETO', labelKey: 'report.reason.FALTA_RESPETO' },
  { code: 'OTRO', labelKey: 'report.reason.OTRO' },
];

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  serviceId: string;
  providerName?: string;
  serviceTitle?: string;
  onReportSuccess?: () => void;
}

export function ReportModal({
  visible,
  onClose,
  serviceId,
  providerName,
  onReportSuccess,
}: ReportModalProps) {
  const { session } = useAuth();
  const { tp } = usePublicI18n();
  const [selectedReason, setSelectedReason] = useState<ReportReasonCode | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReset = () => {
    setSelectedReason(null);
    setDetails('');
    setSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      Alert.alert(tp('report.authTitle'), tp('report.authBody'));
      return;
    }
    if (!selectedReason) {
      Alert.alert(tp('report.missingReasonTitle'), tp('report.missingReasonBody'));
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from('service_reports').insert({
        service_id: serviceId,
        reporter_id: session.user.id,
        reason: selectedReason,
        details: details.trim() ? details.trim() : null,
        status: 'PENDING',
      });

      if (error) throw error;

      Alert.alert(tp('report.successTitle'), tp('report.successBody'), [
        {
          text: tp('report.understood'),
          onPress: () => {
            handleClose();
            onReportSuccess?.();
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert(tp('report.errorTitle'), err?.message ?? tp('report.errorBody'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} onClose={handleClose} title={tp('report.title')}>
      <View className="pt-2">
        <View className="mb-4 flex-row items-center rounded-2xl bg-[#FEF3C7] p-3">
          <AlertTriangle size={20} color="#D97706" />
          <Text
            className="ml-2.5 flex-1 text-[#92400E]"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, lineHeight: 18 }}
          >
            {providerName
              ? tp('report.warningWithProvider', { name: providerName })
              : tp('report.warningGeneric')}
          </Text>
        </View>

        <Text
          className="mb-2 text-neutral-textMain"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
        >
          {tp('report.reasonLabel')}
        </Text>

        <View className="gap-2 mb-4">
          {REPORT_REASONS.map(({ code, labelKey }) => {
            const isSelected = selectedReason === code;
            return (
              <TouchableOpacity
                key={code}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelectedReason(code)}
                className={`min-h-[48px] flex-row items-center justify-between rounded-2xl border px-3.5 py-2.5 ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-border bg-neutral-surface'
                }`}
              >
                <Text
                  className={isSelected ? 'text-primary' : 'text-neutral-textMain'}
                  style={{
                    fontFamily: isSelected
                      ? 'PlusJakartaSans_700Bold'
                      : 'PlusJakartaSans_500Medium',
                    fontSize: 14,
                  }}
                >
                  {tp(labelKey)}
                </Text>
                {isSelected && <CheckCircle size={18} color="#1E5E45" />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text
          className="mb-1.5 text-neutral-textMain"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
        >
          {tp('report.detailsLabel')}
        </Text>
        <TextInput
          accessibilityLabel={tp('report.detailsLabel')}
          multiline
          numberOfLines={3}
          value={details}
          onChangeText={setDetails}
          placeholder={tp('report.detailsPlaceholder')}
          placeholderTextColor="#9EA3AE"
          className="rounded-2xl border border-neutral-border bg-neutral-mutedBg/40 p-3 text-neutral-textMain min-h-[76px]"
          style={{
            fontFamily: 'PlusJakartaSans_500Medium',
            fontSize: 13,
            textAlignVertical: 'top',
          }}
        />

        <View className="mt-5 flex-row gap-2">
          <Button
            title={tp('report.cancel')}
            variant="outline"
            onPress={handleClose}
            className="flex-1 min-h-[48px]"
          />
          <Button
            title={submitting ? tp('report.submitting') : tp('report.submit')}
            variant="emergency"
            onPress={handleSubmit}
            disabled={!selectedReason || submitting}
            isLoading={submitting}
            className="flex-1 min-h-[48px]"
          />
        </View>
      </View>
    </Modal>
  );
}
