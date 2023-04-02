import {
  Divider,
  HStack,
  Input,
  Modal,
  ModalContent,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { nanoid } from "nanoid";
import { useRouter } from "next/router";
import Button from "./Button";
import { CardProps } from "./Card";

const AddVideoModal = ({
  uid,
  open,
  onClose,
}: {
  uid: string;
  open: boolean;
  onClose: () => void;
}): JSX.Element => {
  const router = useRouter();
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loading, setLoading] = useState(false);
  const inputFile = useRef<HTMLInputElement | null>(null);

  const handleYoutubeLinkChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setYoutubeLink(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    console.log("before if");
    if (selectedFile) {
      console.log("after if");
      const url = `https://backend.vibeo.video/upload`;
      const formData = new FormData();
      formData.append("uid", uid);
      formData.append("file", selectedFile);
      console.log(formData);
      fetch(url, {
        method: "POST",
        body: formData,
      }).then(() => {
        setLoading(false);
      });
      // onClose();
    }
  };

  const uploadYoutube = () => {
    if (youtubeLink.length > 0) {
      const url = `https://backend.vibeo.video/download`;
      const data = {
        uid,
        url: youtubeLink,
      };
      console.log(data);
      fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      onClose();
    } else {
      setLoading(true);
      openFilePicker();
    }
  };

  const openFilePicker = () => {
    inputFile.current?.click();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      uploadYoutube();
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p={8} {...CardProps}>
        <VStack spacing={8}>
          <HStack spacing={4}>
            <Button onClick={uploadYoutube} isLoading={loading}>
              Upload
            </Button>
            <Divider orientation={"vertical"} />
            <Button
              onClick={() => {
                router.push(`/v/${nanoid()}?recording=true`);
              }}
            >
              Record
            </Button>
          </HStack>
          <Input
            placeholder={"Youtube Link"}
            border={"2px solid black !important"}
            value={youtubeLink}
            onChange={handleYoutubeLinkChange}
            onKeyDown={handleKeyDown}
          />
          <input
            type={"file"}
            id={"file"}
            ref={inputFile}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </VStack>
      </ModalContent>
    </Modal>
  );
};
export default AddVideoModal;
