import {
  Divider,
  HStack,
  Input,
  Modal,
  ModalContent,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import Button from "./Button";
import { CardProps } from "./Card";

const AddVideoModal = ({
  uid,
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): JSX.Element => {
  const [youtubeLink, setYoutubeLink] = useState("");

  const handleYoutubeLinkChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setYoutubeLink(event.target.value);
  };

  const uploadYoutube = () => {
    const url = `https://backend.vibeo.video/download?uid=${uid}&url=${youtubeLink}`;
    fetch(url);
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p={8} {...CardProps}>
        <VStack spacing={8}>
          <HStack spacing={4}>
            <Button onClick={uploadYoutube}>Upload</Button>
            <Divider orientation={"vertical"} />
            <Button onClick={onClose}>Record</Button>
          </HStack>
          <Input
            placeholder={"Youtube Link"}
            border={"2px solid black !important"}
            value={youtubeLink}
            onChange={handleYoutubeLinkChange}
          />
        </VStack>
      </ModalContent>
    </Modal>
  );
};
export default AddVideoModal;
