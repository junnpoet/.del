import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import {
  HELP_CATEGORIES,
  QUICK_PUBLISH_PRODUCT_CATEGORIES,
  QUICK_PUBLISH_SERVICE_CATEGORIES,
  SOLIDARY_CATEGORIES,
  SOLIDARY_POST_TYPE_BY_CATEGORY,
} from '../../constants/categories';
import { useI18n } from '../../i18n';
import type { ListingType, PostType, UrgencyLevel } from '../../types';
import { useMyPublications } from '../../features/profile/hooks/useMyPublications';
import { errorMessage, showMessage } from '../../features/community/utils';
import { BottomSheetModal } from './BottomSheetModal';
import { Button } from './Button';
import { Chip } from './Chip';
import { Input } from './Input';

export type EditPublicationTarget =
  | {
      kind: 'service';
      id: string;
      listingType: ListingType;
      title: string;
      category: string;
      description: string;
    }
  | {
      kind: 'solidary';
      id: string;
      postType: PostType;
      category: string;
      description: string;
      urgency: UrgencyLevel;
    };

interface Props {
  target: EditPublicationTarget | null;
  onClose: () => void;
}

function getPresetCategories(target: EditPublicationTarget): readonly string[] {
  if (target.kind === 'service') {
    return target.listingType === 'PRODUCTO'
      ? QUICK_PUBLISH_PRODUCT_CATEGORIES
      : QUICK_PUBLISH_SERVICE_CATEGORIES;
  }
  return target.postType === 'AYUDA' ? HELP_CATEGORIES : SOLIDARY_CATEGORIES;
}

export function EditPublicationModal({ target, onClose }: Props) {
  const { t, tCategory } = useI18n();
  const { updateService, updateSolidaryPost } = useMyPublications();

  const [listingType, setListingType] = useState<ListingType>('SERVICIO');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('MEDIA');

  useEffect(() => {
    if (!target) return;
    const presets = getPresetCategories(target);
    const matchesPreset = presets.includes(target.category);

    setCategory(matchesPreset ? target.category : '');
    setIsCustomCategory(!matchesPreset);
    setCustomCategory(matchesPreset ? '' : target.category);
    setDescription(target.description);

    if (target.kind === 'service') {
      setListingType(target.listingType);
      setTitle(target.title);
    } else {
      setUrgency(target.urgency);
    }
  }, [target]);

  if (!target) return null;

  const presets =
    target.kind === 'service'
      ? listingType === 'PRODUCTO'
        ? QUICK_PUBLISH_PRODUCT_CATEGORIES
        : QUICK_PUBLISH_SERVICE_CATEGORIES
      : target.postType === 'AYUDA'
      ? HELP_CATEGORIES
      : SOLIDARY_CATEGORIES;

  const isSaving = updateService.isPending || updateSolidaryPost.isPending;

  const handleSave = async () => {
    const resolvedCategory = isCustomCategory ? customCategory.trim() : category;
    const cleanDescription = description.trim();
    const cleanTitle = title.trim();

    if (!resolvedCategory) {
      showMessage(t('common.attention'), t('fab.selectCategory'));
      return;
    }
    if (target.kind === 'service' && !cleanTitle) {
      showMessage(t('common.attention'), 'Ingresa un título para tu publicación.');
      return;
    }
    if (!cleanDescription) {
      showMessage(t('common.attention'), t('fab.needDetail'));
      return;
    }

    try {
      if (target.kind === 'service') {
        await updateService.mutateAsync({
          id: target.id,
          listingType,
          title: cleanTitle.slice(0, 80),
          category: resolvedCategory,
          description: cleanDescription,
        });
      } else {
        const nextPostType =
          target.postType === 'AYUDA'
            ? 'AYUDA'
            : SOLIDARY_POST_TYPE_BY_CATEGORY[resolvedCategory] ?? target.postType;

        await updateSolidaryPost.mutateAsync({
          id: target.id,
          postType: nextPostType,
          category: resolvedCategory,
          description: cleanDescription,
          urgency,
        });
      }
      onClose();
    } catch (err) {
      showMessage(t('common.attention'), errorMessage(err));
    }
  };

  return (
    <BottomSheetModal
      visible={Boolean(target)}
      onClose={onClose}
      maxHeight="90%"
      backdropColor="rgba(0,0,0,0.45)"
    >
      <View className="flex-row items-center justify-between pb-3 border-b border-neutral-border/60">
        <View className="flex-1 pr-2">
          <Text
            className="text-neutral-textMain"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}
          >
            Editar publicación
          </Text>
          <Text
            className="text-neutral-textMuted mt-0.5"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
          >
            {target.kind === 'service' ? 'Directorio público' : 'Muro solidario'}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('common.closeModal')}
          onPress={onClose}
          className="h-9 w-9 rounded-full bg-neutral-mutedBg items-center justify-center"
        >
          <X size={18} color="#6C727A" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <View className="py-3">
        {target.kind === 'service' && target.listingType !== 'AUXILIO' && (
          <View className="mb-3">
            <Text
              className="text-neutral-textMain mb-2"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
            >
              Tipo
            </Text>
            <View className="flex-row flex-wrap">
              <Chip
                label="Servicio"
                isActive={listingType === 'SERVICIO'}
                onPress={() => setListingType('SERVICIO')}
              />
              <Chip
                label="Producto"
                isActive={listingType === 'PRODUCTO'}
                onPress={() => setListingType('PRODUCTO')}
              />
            </View>
          </View>
        )}

        {target.kind === 'service' && (
          <Input
            label="Título"
            placeholder="Ej: Gasfitería a domicilio"
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />
        )}

        <Text
          className="text-neutral-textMain mb-2"
          style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
        >
          Categoría
        </Text>
        <View className="flex-row flex-wrap mb-3">
          {presets.map((cat) => (
            <Chip
              key={cat}
              label={tCategory(cat)}
              isActive={!isCustomCategory && category === cat}
              onPress={() => {
                setIsCustomCategory(false);
                setCategory(cat);
              }}
            />
          ))}
          <Chip
            label={t('fab.customCategory')}
            isActive={isCustomCategory}
            onPress={() => {
              setIsCustomCategory(true);
              setCategory('');
            }}
          />
        </View>

        {isCustomCategory && (
          <Input
            label={t('fab.customCategoryLabel')}
            placeholder={t('fab.customCategoryPlaceholder')}
            value={customCategory}
            onChangeText={setCustomCategory}
            maxLength={40}
          />
        )}

        {target.kind === 'solidary' && target.postType === 'AYUDA' && (
          <View className="mb-3">
            <Text
              className="text-neutral-textMain mb-2"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
            >
              Urgencia
            </Text>
            <View className="flex-row flex-wrap">
              <Chip
                label="Baja"
                isActive={urgency === 'BAJA'}
                onPress={() => setUrgency('BAJA')}
              />
              <Chip
                label="Media"
                isActive={urgency === 'MEDIA'}
                onPress={() => setUrgency('MEDIA')}
              />
              <Chip
                label="Urgente"
                isActive={urgency === 'ALTA_CRITICA'}
                onPress={() => setUrgency('ALTA_CRITICA')}
              />
            </View>
          </View>
        )}

        <Input
          label={t('fab.description')}
          placeholder={t('fab.descriptionPlaceholder')}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Button
          title="Guardar cambios"
          onPress={handleSave}
          isLoading={isSaving}
          className="mt-1"
        />
      </View>
    </BottomSheetModal>
  );
}
