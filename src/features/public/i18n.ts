import { useCallback } from 'react';
import { useI18n, type Language } from '../../i18n';

const es = {
  // --- Listing Types & Directory ---
  'public.type.ALL': 'Todos',
  'public.type.SERVICIO': 'Servicios',
  'public.type.PRODUCTO': 'Productos',
  'public.type.AUXILIO': 'Auxilio',
  'public.favoritesChip': 'Favoritos',
  'public.inboxButton': 'Mensajes',
  'public.inboxA11y': 'Abrir bandeja de mensajes y solicitudes',
  'public.homePinTitle': 'Tu hogar registrado',
  'public.homePinDesc': 'Centro de cálculo del radio caminable',
  'public.mapClosePreview': 'Cerrar ficha',
  'public.reportA11y': 'Reportar servicio de {name}',
  'public.cat.Costura': 'Costura',
  'public.cat.Cuidado': 'Cuidado',

  // --- Report Modal ---
  'report.title': 'Reportar publicación',
  'report.warningWithProvider':
    'Reportarás la atención de {name}. La dirigencia vecinal revisará el caso.',
  'report.warningGeneric':
    'Tu reporte será evaluado por los dirigentes vecinales del sector.',
  'report.reasonLabel': 'Motivo principal:',
  'report.reason.COBRO_ABUSIVO': 'Cobro abusivo',
  'report.reason.INCUMPLIMIENTO': 'No se presentó / Incumplimiento',
  'report.reason.PERFIL_FALSO': 'Perfil falso o sospechoso',
  'report.reason.FALTA_RESPETO': 'Falta de respeto',
  'report.reason.OTRO': 'Otro motivo',
  'report.detailsLabel': 'Detalles adicionales (opcional):',
  'report.detailsPlaceholder':
    'Describe brevemente lo ocurrido para ayudar a la dirigencia...',
  'report.cancel': 'Cancelar',
  'report.submit': 'Enviar reporte',
  'report.submitting': 'Enviando...',
  'report.authTitle': 'Sesión requerida',
  'report.authBody': 'Debes iniciar sesión para reportar una incidencia.',
  'report.missingReasonTitle': 'Selecciona un motivo',
  'report.missingReasonBody': 'Por favor elige una de las razones de la lista.',
  'report.successTitle': 'Reporte enviado',
  'report.successBody':
    'Tu reporte fue remitido a la dirigencia vecinal para su revisión comunitaria.',
  'report.understood': 'Entendido',
  'report.errorTitle': 'Error',
  'report.errorBody': 'No se pudo enviar el reporte. Inténtalo de nuevo.',

  // --- Service Chat ---
  'chat.backA11y': 'Volver',
  'chat.defaultProvider': 'Prestador de oficio',
  'chat.defaultClient': 'Vecino',
  'chat.defaultService': 'Servicio vecinal',
  'chat.reportA11y': 'Reportar irregularidad o prestador',
  'chat.requestReviewBtn': 'Solicitar Visto Bueno Vecinal',
  'chat.requestReviewA11y': 'Solicitar Visto Bueno Vecinal al cliente',
  'chat.requestReviewSentMsg': 'He solicitado el Visto Bueno Vecinal para este servicio.',
  'chat.reviewConfirmedMsg': 'Otorgué el Visto Bueno Vecinal con calificación {rating}/5.',
  'chat.reviewCardTitle': 'Visto Bueno Vecinal en 1 Tap',
  'chat.reviewCardQuestion': '¿{name} completó el trabajo?',
  'chat.reviewSelectRating': 'Selecciona tu calificación:',
  'chat.reviewStarA11y': '{n} estrellas',
  'chat.reviewCommentPlaceholder': 'Comentario breve (ej. Puntual y buen trabajo)...',
  'chat.reviewSubmitBtn': 'Otorgar Visto Bueno ({rating}/5)',
  'chat.reviewSubmitA11y': 'Otorgar Visto Bueno Vecinal',
  'chat.reviewDoneTitle': 'Visto Bueno Vecinal registrado',
  'chat.reviewDoneBody': 'Calificación otorgada: {rating} de 5 estrellas',
  'chat.reviewPendingTitle': 'Solicitud de Visto Bueno enviada',
  'chat.reviewPendingBody':
    'Esperando a que tu vecino califique y confirme la atención en 1 tap.',
  'chat.emptyTitle': 'Conversación segura y de proximidad',
  'chat.emptyBody':
    'Acuerda los detalles directamente con tu vecino sin comisiones ni intermediarios.',
  'chat.inputPlaceholder': 'Escribe un mensaje a tu vecino...',
  'chat.inputA11y': 'Escribir mensaje',
  'chat.sendA11y': 'Enviar mensaje',

  // --- Chat Inbox ---
  'inbox.title': 'Mensajes vecinales',
  'inbox.subtitle': 'Consultas y solicitudes de Visto Bueno',
  'inbox.filterAll': 'Todos',
  'inbox.filterProvider': 'Como prestador',
  'inbox.filterClient': 'Mis consultas',
  'inbox.roleProvider': 'Tu oferta',
  'inbox.roleClient': 'Tu consulta',
  'inbox.emptyTitle': 'Sin conversaciones activas',
  'inbox.emptyBody':
    'Cuando consultes un oficio o un vecino te escriba, tus chats aparecerán aquí.',
  'inbox.noMessagesYet': 'Conversación iniciada. Toca para responder.',
  'inbox.reviewRequestedBadge': 'Visto Bueno solicitado',
  'inbox.authRequired': 'Inicia sesión para ver tus conversaciones.',
} as const;

export type PublicTranslationKey = keyof typeof es;

const qu: Record<PublicTranslationKey, string> = {
  // --- Listing Types & Directory ---
  'public.type.ALL': 'Llapan',
  'public.type.SERVICIO': 'Ruraykuna',
  'public.type.PRODUCTO': 'Rantikuna',
  'public.type.AUXILIO': 'Yanapay',
  'public.favoritesChip': 'Munasqakuna',
  'public.inboxButton': 'Willakuykuna',
  'public.inboxA11y': 'Rimanakuykunata kichay',
  'public.homePinTitle': 'Qillqasqa wasiyki',
  'public.homePinDesc': 'Wasiykimanta karu tupuy',
  'public.mapClosePreview': 'Wichqay',
  'public.reportA11y': '{name} sutiyuqta willay',
  'public.cat.Costura': 'Siray',
  'public.cat.Cuidado': 'Qhaway',

  // --- Report Modal ---
  'report.title': 'Pantayta willay',
  'report.warningWithProvider':
    '{name} rurasqanmanta willanki. Ayllu umalliqkuna qhawanqaku.',
  'report.warningGeneric': 'Willakuyniykita ayllu umalliqkuna qhawanqaku.',
  'report.reasonLabel': 'Imarayku willanki:',
  'report.reason.COBRO_ABUSIVO': 'Nishu qullqi mañakuy',
  'report.reason.INCUMPLIMIENTO': 'Mana hamurqanchu / Mana rurarqanchu',
  'report.reason.PERFIL_FALSO': 'Llulla sutiyuq / Pantachiq',
  'report.reason.FALTA_RESPETO': 'Mana sumaq rimay',
  'report.reason.OTRO': 'Huk pantay',
  'report.detailsLabel': 'Astawan willakuy (munaspaqa):',
  'report.detailsPlaceholder': 'Imachus karqan chayta pisillapi qillqay...',
  'report.cancel': 'Ama',
  'report.submit': 'Willayta apachiy',
  'report.submitting': 'Apachichkan...',
  'report.authTitle': 'Yaykunayki tiyan',
  'report.authBody': 'Willayta apachinapaq ñawpaqta yaykuy.',
  'report.missingReasonTitle': 'Imaraykuchus akllay',
  'report.missingReasonBody': 'Ama hina kaspa huk willayta akllay.',
  'report.successTitle': 'Willay apachisqa',
  'report.successBody': 'Ayllu umalliqkunaman willakuyniyki chayarunñam.',
  'report.understood': 'Allinmi',
  'report.errorTitle': 'Pantay',
  'report.errorBody': 'Manam willayta apachiyta atikunchu. Wakmanta yanay.',

  // --- Service Chat ---
  'chat.backA11y': 'Kutipuy',
  'chat.defaultProvider': 'Llamkaq masi',
  'chat.defaultClient': 'Llaqta masi',
  'chat.defaultService': 'Ayllu ruray',
  'chat.reportA11y': 'Pantaymanta willay',
  'chat.requestReviewBtn': 'Ayllu Allin Rikusqata Mañakuy',
  'chat.requestReviewA11y': 'Llaqta masimanta Allin Rikusqata mañakuy',
  'chat.requestReviewSentMsg': 'Kay ruraymanta Allin Rikusqata mañakuni.',
  'chat.reviewConfirmedMsg': 'Allin Rikusqata quni: {rating}/5 quyllurkuna.',
  'chat.reviewCardTitle': 'Huk Ñitiyllapi Allin Rikusqa',
  'chat.reviewCardQuestion': '¿{name} rurayta tukuchirqanchu?',
  'chat.reviewSelectRating': 'Hayka quyllurta akllay:',
  'chat.reviewStarA11y': '{n} quyllurkuna',
  'chat.reviewCommentPlaceholder': 'Pisillapi qillqay (munaspaqa)...',
  'chat.reviewSubmitBtn': 'Allin Rikusqata Quy ({rating}/5)',
  'chat.reviewSubmitA11y': 'Ayllu Allin Rikusqata Quy',
  'chat.reviewDoneTitle': 'Allin Rikusqa qillqasqa',
  'chat.reviewDoneBody': 'Qusqa tupuy: {rating} / 5 quyllurkuna',
  'chat.reviewPendingTitle': 'Allin Rikusqa mañakuy apachisqa',
  'chat.reviewPendingBody': 'Llaqta masiyki huk ñitiyllapi chaninchananta suyaspa.',
  'chat.emptyTitle': 'Allin takyasqa rimanakuy',
  'chat.emptyBody': 'Llaqta masiykiwan chiqanmanta rimanakuy, mana qullqi quspa.',
  'chat.inputPlaceholder': 'Llaqta masiykiman qillqay...',
  'chat.inputA11y': 'Willayta qillqay',
  'chat.sendA11y': 'Willayta apachiy',

  // --- Chat Inbox ---
  'inbox.title': 'Ayllu willakuykuna',
  'inbox.subtitle': 'Tapukuykuna hinaspa Allin Rikusqa mañakuykuna',
  'inbox.filterAll': 'Llapan',
  'inbox.filterProvider': 'Llamkayniykuna',
  'inbox.filterClient': 'Tapukuyniykuna',
  'inbox.roleProvider': 'Qampa rurayniyki',
  'inbox.roleClient': 'Qampa tapukuyniyki',
  'inbox.emptyTitle': 'Manaraq rimanakuykuna kanchu',
  'inbox.emptyBody':
    'Huk rurayta tapuptiyki utaq qillqamuptinkuqa kaypi rikukunqa.',
  'inbox.noMessagesYet': 'Rimanakuy qallarisqa. Kicharinapaq ñitiy.',
  'inbox.reviewRequestedBadge': 'Allin Rikusqa mañakusqa',
  'inbox.authRequired': 'Rimanakuykunata qhawanapaq yaykuy.',
};

const DICTIONARIES: Record<Language, Record<PublicTranslationKey, string>> = {
  es,
  qu,
};

export function usePublicI18n() {
  const { language, tCategory } = useI18n();

  const tp = useCallback(
    (key: PublicTranslationKey, params?: Record<string, string | number>): string => {
      let text = DICTIONARIES[language]?.[key] ?? es[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return text;
    },
    [language]
  );

  const tpCategory = useCallback(
    (category: string): string => {
      if (language === 'qu') {
        const localKey = `public.cat.${category}` as PublicTranslationKey;
        if (localKey in qu) {
          return qu[localKey];
        }
      }
      return tCategory(category);
    },
    [language, tCategory]
  );

  return { language, tp, tpCategory };
}
