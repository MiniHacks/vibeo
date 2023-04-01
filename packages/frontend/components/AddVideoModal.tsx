import {
  Divider,
  HStack,
  Input,
  Modal,
  ModalContent,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import Button from "./Button";
import { CardProps } from "./Card";

const AddVideoModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): JSX.Element => {
  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p={8} {...CardProps}>
        <VStack spacing={8}>
          <HStack spacing={4}>
            <Button onClick={onClose}>Upload</Button>
            <Divider orientation={"vertical"} />
            <Button onClick={onClose}>Record</Button>
          </HStack>
          <Input
            placeholder={"Youtube Link"}
            border={"2px solid black !important"}
          />
        </VStack>
      </ModalContent>
    </Modal>
  );
};

export default AddVideoModal;
