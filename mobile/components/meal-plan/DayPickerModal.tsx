/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Icon, CloseIcon } from '@/components/ui/icon';
import { User, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MealType } from '@/services/meal-plan.api';

interface DaySlotSelection {
  date: string; // YYYY-MM-DD
  mealType: MealType;
  servings: number;
}

interface DayPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeName: string;
  onConfirm: (selections: DaySlotSelection[]) => void;
}

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER'];

function getNext7Days(): { label: string; shortDay: string; date: string; isToday: boolean }[] {
  const days: { label: string; shortDay: string; date: string; isToday: boolean }[] = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const shortDay = d.toLocaleDateString(undefined, { weekday: 'short' });
    const label = d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    days.push({ label, shortDay, date: dateStr, isToday: i === 0 });
  }

  return days;
}

export default function DayPickerModal({
  isOpen,
  onClose,
  recipeName,
  onConfirm,
}: DayPickerModalProps) {
  const { t } = useTranslation();
  // Map: "YYYY-MM-DD::MEAL_TYPE" -> servings
  const [selections, setSelections] = useState<Record<string, number>>({});

  const days = getNext7Days();

  const toggleSlot = (date: string, mealType: MealType) => {
    const key = `${date}::${mealType}`;
    setSelections((prev) => {
      const next = { ...prev };
      if (key in next) {
        delete next[key];
      } else {
        next[key] = 1;
      }
      return next;
    });
  };

  const updateServings = (date: string, mealType: MealType, delta: number) => {
    const key = `${date}::${mealType}`;
    setSelections((prev) => {
      const current = prev[key] ?? 1;
      return { ...prev, [key]: Math.max(1, current + delta) };
    });
  };

  const handleConfirm = () => {
    const result: DaySlotSelection[] = Object.entries(selections).map(
      ([key, servings]) => {
        const [date, mealType] = key.split('::') as [string, MealType];
        return { date, mealType, servings };
      },
    );
    onConfirm(result);
    setSelections({});
    onClose();
  };

  const handleClose = () => {
    setSelections({});
    onClose();
  };

  const selectionCount = Object.keys(selections).length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalBackdrop />
      <ModalContent style={{ maxHeight: '85%', borderRadius: 24 }}>
        <ModalHeader>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Heading size="md" className="font-inter-bold">
              {t('meal_plan.plan_meal')}
            </Heading>
            <Text
              numberOfLines={1}
              className="text-slate-400 text-xs mt-1 font-inter-medium"
            >
              {recipeName}
            </Text>
          </View>
          <ModalCloseButton>
            <Icon as={CloseIcon} color="#999" />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            {days.map((day) => {
              const dayHasSelections = MEAL_TYPES.some(
                (mt) => `${day.date}::${mt}` in selections,
              );

              return (
                <View
                  key={day.date}
                  style={{
                    marginBottom: 12,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: dayHasSelections ? '#fed7aa' : '#f1f5f9',
                    backgroundColor: dayHasSelections ? '#fffbf5' : '#ffffff',
                    overflow: 'hidden',
                  }}
                >
                  {/* Day header */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: dayHasSelections
                        ? '#fed7aa'
                        : '#f8fafc',
                    }}
                  >
                    <Text className="font-inter-semibold text-sm text-slate-800">
                      {day.label}
                    </Text>
                    {day.isToday && (
                      <View
                        style={{
                          backgroundColor: '#f97316',
                          borderRadius: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text className="text-white text-[10px] font-inter-semibold">
                          {t('meal_plan.today')}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Meal slots */}
                  <View style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
                    {MEAL_TYPES.map((mealType) => {
                      const key = `${day.date}::${mealType}`;
                      const isSelected = key in selections;
                      const servings = selections[key] ?? 1;

                      return (
                        <View
                          key={mealType}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingVertical: 6,
                            paddingHorizontal: 4,
                          }}
                        >
                          <Pressable
                            onPress={() => toggleSlot(day.date, mealType)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 10,
                              flex: 1,
                            }}
                          >
                            {/* Checkbox */}
                            <View
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 6,
                                borderWidth: 2,
                                borderColor: isSelected
                                  ? '#f97316'
                                  : '#cbd5e1',
                                backgroundColor: isSelected
                                  ? '#f97316'
                                  : 'transparent',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {isSelected && (
                                <Check size={14} color="#ffffff" />
                              )}
                            </View>
                            <Text
                              className={`text-sm ${isSelected ? 'font-inter-semibold text-slate-800' : 'font-inter-medium text-slate-500'}`}
                            >
                              {t(`meal_plan.${mealType.toLowerCase()}`)}
                            </Text>
                          </Pressable>

                          {/* Servings stepper */}
                          {isSelected && (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#f8fafc',
                                borderRadius: 16,
                                paddingHorizontal: 2,
                              }}
                            >
                              <Pressable
                                onPress={() =>
                                  updateServings(day.date, mealType, -1)
                                }
                                style={{
                                  width: 24,
                                  height: 24,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 12,
                                }}
                              >
                                <Text className="text-slate-500 text-xs font-inter-medium">
                                  −
                                </Text>
                              </Pressable>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 2,
                                  width: 36,
                                  justifyContent: 'center',
                                }}
                              >
                                <User size={9} color="#64748b" />
                                <Text className="text-slate-700 font-inter-semibold text-[11px]">
                                  {servings}
                                </Text>
                              </View>
                              <Pressable
                                onPress={() =>
                                  updateServings(day.date, mealType, 1)
                                }
                                style={{
                                  width: 24,
                                  height: 24,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 12,
                                }}
                              >
                                <Text className="text-slate-500 text-xs font-inter-medium">
                                  +
                                </Text>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </ModalBody>
        <ModalFooter>
          <Pressable
            onPress={handleConfirm}
            disabled={selectionCount === 0}
            style={{
              flex: 1,
              backgroundColor: selectionCount > 0 ? '#f97316' : '#e2e8f0',
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: 'center',
            }}
            className="active:bg-orange-600"
          >
            <Text
              className={`font-inter-semibold text-base ${selectionCount > 0 ? 'text-white' : 'text-slate-400'}`}
            >
              {selectionCount > 0
                ? `${t('meal_plan.plan_meal')} (${selectionCount})`
                : t('meal_plan.plan_meal')}
            </Text>
          </Pressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
