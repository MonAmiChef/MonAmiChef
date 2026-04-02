/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useState } from 'react';
import { View, Pressable, FlatList, ActivityIndicator } from 'react-native';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from '@/components/ui/modal';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Icon, CloseIcon } from '@/components/ui/icon';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { savedRecipesApi } from '@/services/saved-recipes.api';
import { capitalizeFull } from '@/utils/text';
import { Check, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MealType } from '@/services/meal-plan.api';

interface RecipePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: MealType;
  onSelect: (recipeId: string, servings: number) => void;
}

export default function RecipePickerModal({
  isOpen,
  onClose,
  mealType,
  onSelect,
}: RecipePickerModalProps) {
  const { session } = useAuth();
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [servings, setServings] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['saved-recipes'],
    queryFn: () => savedRecipesApi.getSavedRecipes(session!),
    enabled: !!session && isOpen,
  });

  const handleConfirm = () => {
    if (selectedId) {
      onSelect(selectedId, servings);
      setSelectedId(null);
      setServings(1);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedId(null);
    setServings(1);
    onClose();
  };

  const mealLabel = t(`meal_plan.${mealType.toLowerCase()}`);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalBackdrop />
      <ModalContent style={{ maxHeight: '80%', borderRadius: 24 }}>
        <ModalHeader>
          <Heading size="md" className="font-inter-bold">
            {t('meal_plan.select_recipe')}
          </Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} color="#999" />
          </ModalCloseButton>
        </ModalHeader>
          <View className="mt-2 mb-6" style={{ paddingBottom: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginBottom: 16,
                backgroundColor: '#f8fafc',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
              }}
            >
              <Text className="text-slate-500 text-xs font-inter-medium">
                {/* eslint-disable-next-line i18next/no-literal-string */}
                {t('meal_plan.planning_for')} {mealLabel}
              </Text>
            </View>

            {isLoading ? (
              <ActivityIndicator color="#ff6900" style={{ marginTop: 40 }} />
            ) : !data || data.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text className="text-slate-400 font-inter-medium">
                  {t('saved_recipes.empty')}
                </Text>
              </View>
            ) : (
              <FlatList
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                data={data}
                keyExtractor={(item) => item.recipeId}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 350 }}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => {
                  const r = item.recipe;
                  const isSelected = selectedId === item.recipeId;
                  const accentColor = r.isVegan
                    ? '#10b981'
                    : r.isVegetarian
                      ? '#4ade80'
                      : '#fb923c';

                  return (
                    <Pressable
                      onPress={() => {
                        setSelectedId(item.recipeId);
                        setServings(item.servings ?? 1);
                      }}
                      style={{
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? '#f97316' : '#f1f5f9',
                        borderRadius: 16,
                        padding: 14,
                        backgroundColor: isSelected ? '#fff7ed' : '#ffffff',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1,
                            gap: 10,
                          }}
                        >
                          <View
                            style={{
                              width: 3,
                              height: 32,
                              borderRadius: 2,
                              backgroundColor: accentColor,
                            }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              numberOfLines={1}
                              className="font-inter-semibold text-slate-900 text-sm"
                            >
                              {capitalizeFull(r.name)}
                            </Text>
                            <Text className="text-slate-400 text-xs mt-0.5">
                              {/* eslint-disable-next-line i18next/no-literal-string */}
                              {r.calories} kcal • {r.proteins}g prot
                            </Text>
                          </View>
                        </View>
                        {isSelected && (
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              backgroundColor: '#f97316',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Check size={14} color="#ffffff" />
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}

            {/* Servings + Confirm section */}
            {selectedId && (
              <View style={{ marginTop: 16 }}>
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#f1f5f9',
                    marginBottom: 16,
                  }}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#f8fafc',
                      borderRadius: 20,
                      paddingHorizontal: 4,
                    }}
                  >
                    <Pressable
                      onPress={() => setServings(Math.max(1, servings - 1))}
                      style={{
                        width: 32,
                        height: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 16,
                      }}
                      className="active:bg-slate-200"
                    >
                      <Text className="text-slate-500 text-lg font-inter-medium">
                        −
                      </Text>
                    </Pressable>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        width: 54,
                        justifyContent: 'center',
                      }}
                    >
                      <User size={12} color="#64748b" />
                      <Text className="text-slate-700 font-inter-semibold text-sm">
                        {servings}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setServings(servings + 1)}
                      style={{
                        width: 32,
                        height: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 16,
                      }}
                      className="active:bg-slate-200"
                    >
                      <Text className="text-slate-500 text-lg font-inter-medium">
                        +
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={handleConfirm}
                    style={{
                      backgroundColor: '#f97316',
                      borderRadius: 14,
                      paddingHorizontal: 24,
                      paddingVertical: 10,
                    }}
                    className="active:bg-orange-600"
                  >
                    <Text className="text-white font-inter-semibold text-sm">
                      {t('meal_plan.plan_meal')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
      </ModalContent>
    </Modal>
  );
}
