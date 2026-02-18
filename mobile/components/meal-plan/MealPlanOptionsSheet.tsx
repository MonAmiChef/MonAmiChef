import { Text } from '../ui/text';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from '../ui/actionsheet';
import { VStack } from '../ui/vstack';
import { Pressable } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function MealPlanOptionsSheet({
  isOpen,
  onClose,
  handleDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  handleDelete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <VStack className="w-full py-4 gap-4" space="md">
          <VStack className="gap-2 items-center">
            <Pressable
              onPress={handleDelete}
              className="flex-row w-full items-center gap-3 p-4 rounded-2xl"
            >
              <Trash2 size={20} color="#dc2626" />
              <Text className="text-red-600 font-inter-bold text-base">
                {t('meal_plan.remove')}
              </Text>
            </Pressable>
          </VStack>
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
}
