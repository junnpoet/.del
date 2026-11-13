import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Check,
  Flag,
  HeartHandshake,
  Lock,
  MapPin,
  Megaphone,
  Smartphone,
  Siren,
  UserPlus,
  X,
} from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useI18n, type TranslationKey } from '../../../i18n';
import { useMembership } from '../hooks/useMembership';
import { useCareNetwork, type CareAssignment } from '../hooks/useCareNetwork';
import { reportReasonLabel, useLeaderDashboard } from '../hooks/useLeaderDashboard';
import { CareAssignmentCard } from '../components/CareAssignmentCard';
import { StateMessage } from '../components/StateMessage';
import { confirmAction, errorMessage, showMessage, timeAgo } from '../utils';

type Section = 'requests' | 'reports' | 'padrinos' | 'news';

const SECTIONS: { key: Section; label: TranslationKey }[] = [
  { key: 'requests', label: 'leader.tab.requests' },
  { key: 'reports', label: 'leader.tab.reports' },
  { key: 'padrinos', label: 'leader.tab.padrinos' },
  { key: 'news', label: 'leader.tab.news' },
];

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <View className="mb-3">
      <View className="flex-row items-center">
        {icon}
        <Text className="text-neutral-textMain ml-2" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17 }}>
          {title}
        </Text>
      </View>
      <Text className="text-neutral-textMuted mt-1" style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}>
        {subtitle}
      </Text>
    </View>
  );
}

function Badge({ label, color, bg, icon }: { label: string; color: string; bg: string; icon?: React.ReactNode }) {
  return (
    <View className="flex-row items-center px-2 py-0.5 rounded-lg mr-1.5 mb-1" style={{ backgroundColor: bg }}>
      {icon}
      <Text style={{ color, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, marginLeft: icon ? 4 : 0 }}>
        {label}
      </Text>
    </View>
  );
}

/** Panel de Gestión del Dirigente Barrial (SPEC-04 §2.5). */
export default function LeaderDashboardScreen() {
  const router = useRouter();
  const { t, tCategory } = useI18n();
  const { isLeader, state } = useMembership();
  const dashboard = useLeaderDashboard(isLeader);
  const care = useCareNetwork(isLeader);
  const [section, setSection] = useState<Section>('requests');

  const [vulnerableId, setVulnerableId] = useState<string | null>(null);
  const [buddyId, setBuddyId] = useState<string | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');

  if (state === 'LOADING') {
    return (
      <View className="flex-1 bg-neutral-background">
        <Header title={t('leader.title')} showBack />
        <View className="p-4">
          <StateMessage loading title={t('leader.loading')} />
        </View>
      </View>
    );
  }

  if (!isLeader) {
    return (
      <View className="flex-1 bg-neutral-background">
        <Header title={t('leader.title')} showBack />
        <View className="p-4">
          <StateMessage
            icon={<Lock size={28} color="#1E5E45" />}
            title={t('leader.onlyLeaders')}
            message={t('leader.onlyLeadersBody')}
            actionLabel={t('common.back')}
            onAction={() => router.back()}
          />
        </View>
      </View>
    );
  }

  const requests = dashboard.joinRequests.data ?? [];
  const reports = dashboard.reports.data ?? [];
  const people = dashboard.people.data;

  const approve = (id: string, name: string | null) =>
    dashboard.approveRequest.mutate(id, {
      onSuccess: () =>
        showMessage(
          t('leader.requests.approvedTitle'),
          t('leader.requests.approved', { name: name ?? t('leader.requests.noName') })
        ),
      onError: (error) => showMessage(t('leader.requests.approveFailed'), errorMessage(error)),
    });

  const reject = async (id: string, name: string | null) => {
    const ok = await confirmAction(
      t('leader.requests.rejectTitle'),
      t('leader.requests.rejectConfirm', { name: name ?? t('leader.requests.someone') }),
      t('leader.requests.reject'),
      true
    );
    if (!ok) return;
    dashboard.rejectRequest.mutate(id, {
      onError: (error) => showMessage(t('leader.requests.rejectFailed'), errorMessage(error)),
    });
  };

  const resolveReport = (id: string, status: 'REVIEWED' | 'DISMISSED') =>
    dashboard.resolveReport.mutate(
      { id, status },
      { onError: (error) => showMessage(t('leader.reports.failed'), errorMessage(error)) }
    );

  const assign = () => {
    if (!vulnerableId || !buddyId) {
      showMessage(t('leader.padrinos.missingTitle'), t('leader.padrinos.missing'));
      return;
    }
    dashboard.assignPadrino.mutate(
      { vulnerableId, buddyId },
      {
        onSuccess: () => {
          setVulnerableId(null);
          setBuddyId(null);
          showMessage(t('leader.padrinos.assignedTitle'), t('leader.padrinos.assigned'));
        },
        onError: (error) => showMessage(t('leader.padrinos.assignFailed'), errorMessage(error)),
      }
    );
  };

  const removeAssignment = async (assignment: CareAssignment) => {
    const ok = await confirmAction(
      t('leader.padrinos.removeTitle'),
      t('leader.padrinos.removeConfirm', {
        buddy: assignment.buddy.name ?? t('care.noPadrino'),
        name: assignment.vulnerable.name,
      }),
      t('common.remove'),
      true
    );
    if (!ok) return;
    dashboard.removeAssignment.mutate(assignment.id, {
      onError: (error) => showMessage(t('leader.padrinos.removeFailed'), errorMessage(error)),
    });
  };

  const registerVisit = (assignment: CareAssignment) =>
    care.registerVisit.mutate(
      { assignment, note: t('leader.padrinos.contactNote') },
      { onError: (error) => showMessage(t('care.registerFailed'), errorMessage(error)) }
    );

  const publishNews = () => {
    if (newsTitle.trim().length < 5 || newsContent.trim().length < 10) {
      showMessage(t('leader.news.incompleteTitle'), t('leader.news.incomplete'));
      return;
    }
    dashboard.publishNews.mutate(
      { title: newsTitle, content: newsContent },
      {
        onSuccess: () => {
          setNewsTitle('');
          setNewsContent('');
          showMessage(t('leader.news.publishedTitle'), t('leader.news.published'));
        },
        onError: (error) => showMessage(t('leader.news.failed'), errorMessage(error)),
      }
    );
  };

  const counts: Record<Section, number | null> = {
    requests: requests.length,
    reports: reports.length,
    padrinos: null,
    news: null,
  };

  return (
    <View className="flex-1 bg-neutral-background">
      <Header
        title={t('leader.title')}
        subtitle={
          dashboard.group ? `${dashboard.group.name} · ${dashboard.group.sector_name}` : t('leader.subtitleFallback')
        }
        showBack
      />

      <View className="px-4 pt-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SECTIONS.map((item) => (
            <Chip
              key={item.key}
              label={counts[item.key] ? `${t(item.label)} (${counts[item.key]})` : t(item.label)}
              isActive={section === item.key}
              onPress={() => setSection(item.key)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerClassName="p-4 pt-2 pb-16" keyboardShouldPersistTaps="handled">
        {/* 1. Solicitudes de unión */}
        {section === 'requests' && (
          <>
            <SectionTitle
              icon={<UserPlus size={18} color="#1E5E45" />}
              title={t('leader.requests.title')}
              subtitle={t('leader.requests.subtitle')}
            />
            {dashboard.joinRequests.isLoading ? (
              <StateMessage loading title={t('leader.requests.loading')} />
            ) : dashboard.joinRequests.isError ? (
              <StateMessage title={t('leader.loadError')} message={errorMessage(dashboard.joinRequests.error)} />
            ) : requests.length === 0 ? (
              <StateMessage title={t('leader.requests.empty')} message={t('leader.requests.emptyBody')} />
            ) : (
              requests.map((req) => {
                const busy =
                  (dashboard.approveRequest.isPending && dashboard.approveRequest.variables === req.id) ||
                  (dashboard.rejectRequest.isPending && dashboard.rejectRequest.variables === req.id);
                return (
                  <Card key={req.id} className={`p-4 mb-3 ${req.is_emergency ? 'border-2 border-emergency-alert' : ''}`}>
                    <View className="flex-row flex-wrap mb-1.5">
                      {req.is_emergency && (
                        <Badge label={t('leader.requests.emergency')} color="#DC2626" bg="#FEE2E2" />
                      )}
                      {req.is_from_whatsapp && (
                        <Badge
                          label="WhatsApp"
                          color="#075E54"
                          bg="#DCF8C6"
                          icon={<Smartphone size={11} color="#128C7E" />}
                        />
                      )}
                    </View>
                    <Text className="text-neutral-textMain" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}>
                      {req.full_name ?? t('leader.requests.noName')}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                      <MapPin size={13} color="#6C727A" />
                      <Text className="text-neutral-textMuted ml-1 flex-1" style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}>
                        {req.address ?? t('leader.requests.noAddress')}
                      </Text>
                    </View>
                    <Text className="text-neutral-textLight mt-0.5" style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 }}>
                      {req.whatsapp_phone ? t('leader.requests.phone', { phone: req.whatsapp_phone }) : ''}
                      {t('leader.requests.received', { time: timeAgo(req.created_at) })}
                    </Text>

                    <View className="flex-row gap-2 mt-3 pt-2.5 border-t border-neutral-border/50">
                      <TouchableOpacity
                        accessibilityRole="button"
                        disabled={busy}
                        onPress={() => approve(req.id, req.full_name)}
                        className="flex-1 bg-primary rounded-xl flex-row items-center justify-center min-h-[48px]"
                      >
                        {busy ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <>
                            <Check size={16} color="#FFFFFF" strokeWidth={2.4} />
                            <Text className="text-white ml-1.5" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}>
                              {t('leader.requests.approve')}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={t('leader.requests.rejectTitle')}
                        disabled={busy}
                        onPress={() => reject(req.id, req.full_name)}
                        className="px-4 bg-neutral-mutedBg rounded-xl flex-row items-center justify-center min-h-[48px]"
                      >
                        <X size={16} color="#6C727A" />
                        <Text className="text-neutral-textMuted ml-1" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}>
                          {t('leader.requests.reject')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })
            )}
          </>
        )}

        {/* 2. Denuncias */}
        {section === 'reports' && (
          <>
            <SectionTitle
              icon={<Flag size={18} color="#DC2626" />}
              title={t('leader.reports.title')}
              subtitle={t('leader.reports.subtitle')}
            />
            {dashboard.reports.isLoading ? (
              <StateMessage loading title={t('leader.reports.loading')} />
            ) : dashboard.reports.isError ? (
              <StateMessage title={t('leader.loadError')} message={errorMessage(dashboard.reports.error)} />
            ) : reports.length === 0 ? (
              <StateMessage title={t('leader.reports.empty')} message={t('leader.reports.emptyBody')} />
            ) : (
              reports.map((report) => (
                <Card key={report.id} className="p-4 mb-3">
                  <View className="flex-row flex-wrap mb-1.5">
                    <Badge label={reportReasonLabel(report.reason)} color="#DC2626" bg="#FEE2E2" />
                    {report.service?.category && (
                      <Badge label={tCategory(report.service.category)} color="#1A1D20" bg="#F1F3F6" />
                    )}
                  </View>
                  <Text className="text-neutral-textMain" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}>
                    {report.service?.title ?? t('leader.reports.deletedService')}
                  </Text>
                  {report.details ? (
                    <Text className="text-neutral-textMain mt-1 leading-5" style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}>
                      “{report.details}”
                    </Text>
                  ) : null}
                  <Text className="text-neutral-textLight mt-1" style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 }}>
                    {t('leader.reports.by', {
                      name: report.reporter?.full_name ?? t('leader.reports.someone'),
                      time: timeAgo(report.created_at),
                    })}
                  </Text>
                  <View className="flex-row gap-2 mt-3 pt-2.5 border-t border-neutral-border/50">
                    <Button
                      title={t('leader.reports.reviewed')}
                      className="flex-1"
                      onPress={() => resolveReport(report.id, 'REVIEWED')}
                      disabled={dashboard.resolveReport.isPending}
                    />
                    <Button
                      title={t('leader.reports.dismiss')}
                      variant="secondary"
                      onPress={() => resolveReport(report.id, 'DISMISSED')}
                      disabled={dashboard.resolveReport.isPending}
                    />
                  </View>
                </Card>
              ))
            )}
          </>
        )}

        {/* 3. Padrinazgo */}
        {section === 'padrinos' && (
          <>
            <SectionTitle
              icon={<HeartHandshake size={18} color="#1E5E45" />}
              title={t('leader.padrinos.title')}
              subtitle={t('leader.padrinos.subtitle')}
            />
            <Card className="p-4 mb-4">
              {dashboard.people.isLoading ? (
                <ActivityIndicator color="#1E5E45" />
              ) : dashboard.people.isError ? (
                <Text className="text-emergency-alert">{errorMessage(dashboard.people.error)}</Text>
              ) : (
                <>
                  <Text className="text-neutral-textMain mb-2" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}>
                    {t('leader.padrinos.vulnerable')}
                  </Text>
                  <View className="flex-row flex-wrap mb-2">
                    {(people?.vulnerable ?? []).length === 0 ? (
                      <Text className="text-neutral-textMuted mb-2">{t('leader.padrinos.noVulnerable')}</Text>
                    ) : (
                      people!.vulnerable.map((person) => (
                        <Chip
                          key={person.id}
                          label={person.name}
                          isActive={vulnerableId === person.id}
                          onPress={() => setVulnerableId(person.id)}
                        />
                      ))
                    )}
                  </View>
                  <Text className="text-neutral-textMain mb-2" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}>
                    {t('leader.padrinos.buddy')}
                  </Text>
                  <View className="flex-row flex-wrap mb-3">
                    {(people?.candidates ?? []).length === 0 ? (
                      <Text className="text-neutral-textMuted mb-2">{t('leader.padrinos.noCandidates')}</Text>
                    ) : (
                      people!.candidates.map((person) => (
                        <Chip
                          key={person.id}
                          label={person.role === 'padrino' ? `⭐ ${person.name}` : person.name}
                          isActive={buddyId === person.id}
                          onPress={() => setBuddyId(person.id)}
                        />
                      ))
                    )}
                  </View>
                  <Button
                    title={t('leader.padrinos.assign')}
                    onPress={assign}
                    isLoading={dashboard.assignPadrino.isPending}
                  />
                </>
              )}
            </Card>

            <Text className="text-neutral-textMain mb-2" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}>
              {t('leader.padrinos.current', { n: care.assignments.length })}
            </Text>
            {care.isLoading ? (
              <StateMessage loading title={t('leader.padrinos.loading')} />
            ) : care.assignments.length === 0 ? (
              <StateMessage title={t('leader.padrinos.empty')} message={t('leader.padrinos.emptyBody')} />
            ) : (
              care.assignments.map((assignment) => (
                <CareAssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  showBuddy
                  onRegisterVisit={registerVisit}
                  onRemove={removeAssignment}
                  busy={
                    care.registerVisit.isPending &&
                    care.registerVisit.variables?.assignment.id === assignment.id
                  }
                />
              ))
            )}
          </>
        )}

        {/* 4. Noticias zonales */}
        {section === 'news' && (
          <>
            <SectionTitle
              icon={<Megaphone size={18} color="#9A5B32" />}
              title={t('leader.news.title')}
              subtitle={t('leader.news.subtitle')}
            />
            <Card className="p-4">
              <Input
                label={t('leader.news.titleLabel')}
                placeholder={t('leader.news.titlePlaceholder')}
                value={newsTitle}
                onChangeText={setNewsTitle}
                maxLength={120}
              />
              <Input
                label={t('leader.news.content')}
                placeholder={t('leader.news.contentPlaceholder')}
                value={newsContent}
                onChangeText={setNewsContent}
                multiline
                numberOfLines={4}
                maxLength={1000}
              />
              <Button
                title={t('leader.news.publish')}
                icon={<Megaphone size={18} color="#FFFFFF" />}
                onPress={publishNews}
                isLoading={dashboard.publishNews.isPending}
              />
            </Card>
          </>
        )}

        {section === 'requests' && care.assignments.some((a) => a.status === 'ALERTA_ACTIVA') && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.push('/care-network')}
            className="mt-2 flex-row items-center bg-emergency-tint rounded-2xl p-3.5"
          >
            <Siren size={18} color="#DC2626" />
            <Text className="text-emergency-alert ml-2 flex-1" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}>
              {t('leader.sosBanner')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
