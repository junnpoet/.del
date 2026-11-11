import React, { useState } from 'react';
import {
  ActivityIndicator,
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

const REPORT_REASONS = [
  'Cobro abusivo',
  'No se presentó',
  'Perfil falso/Sospechoso',
  'Falta de respeto',
] as const;

type ReportReason = (typeof REPORT_REASONS)[number];

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
  serviceTitle,
  onReportSuccess,
}: ReportModalProps) {
  const { session } = useAuth();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
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
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para reportar una incidencia.');
      return;
    }
    if (!selectedReason) {
      Alert.alert('Selecciona un motivo', 'Por favor elige una de las razones de la lista.');
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

      Alert.alert(
        'Reporte enviado',
        'Tu reporte ha sido remitido a la dirigencia vecinal para su revisión comunitaria.',
        [
          {
            text: 'Entendido',
            onPress: () => {
              handleClose();
              onReportSuccess?.();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo enviar el reporte. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} onClose={handleClose} title="Reportar Servicio">
      <View className="pt-2">
        <View className="mb-4 flex-row items-center rounded-2xl bg-[#FEF3C7] p-3">
          <AlertTriangle size={20} color="#D97706" />
          <Text
            className="ml-2.5 flex-1 text-[#92400E]"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, lineHeight: 18 }}
          >
            {providerName
              ? `Reportarás la atención brindada por ${providerName}. La dirigencia revisará el caso.`
              : 'Tu reporte será evaluado por los dirigentes vecinales del sector.'}
          </Text>
        </View>

        <Text
          className="mb-2 text-neutral-textMain"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
        >
          Motivo principal:
        </Text>

        <View className="space-y-2 mb-4">
          {REPORT_REASONS.map((reason) => {
            const isSelected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={reason}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelectedReason(reason)}
                className={`flex-row items-center justify-between rounded-2xl border p-3.5 ${
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
                  {reason}
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
          Detalles adicionales (opcional):
        </Text>
        <TextInput
          accessibilityLabel="Detalles adicionales del reporte"
          multiline
          numberOfLines={3}
          value={details}
          onChangeText={setDetails}
          placeholder="Describe brevemente lo ocurrido para ayudar a la dirigencia..."
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
            title="Cancelar"
            variant="outline"
            onPress={handleClose}
            className="flex-1"
          />
          <Button
            title={submitting ? 'Enviando...' : 'Enviar reporte'}
            variant="emergency"
            onPress={handleSubmit}
            disabled={!selectedReason || submitting}
            isLoading={submitting}
            className="flex-1"
          />
        </View>
      </View>
    </Modal>
  );
}
