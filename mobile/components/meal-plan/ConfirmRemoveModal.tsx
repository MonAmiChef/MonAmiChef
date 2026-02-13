import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Icon, CloseIcon } from '@/components/ui/icon';
import { useTranslation } from 'react-i18next';

export default function ConfirmRemoveModal({
  showModal,
  onClose,
  onConfirm,
}: {
  showModal: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <Modal isOpen={showModal} onClose={onClose} size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">{t('remove_modal.title')}</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} color="#999" />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>{t('remove_modal.confirm_text')}</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              className="mr-3"
              onPress={onClose}
            >
              <ButtonText>{t('remove_modal.cancel')}</ButtonText>
            </Button>
            <Button
              onPressIn={() => {
                onConfirm();
                onClose();
              }}
              variant="solid"
              className="bg-red-500"
              onPress={onClose}
            >
              <ButtonText>{t('remove_modal.confirm')}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
