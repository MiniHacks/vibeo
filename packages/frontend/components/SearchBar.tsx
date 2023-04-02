import {
  InputGroup,
  InputRightElement,
  Input,
  Image,
  BoxProps,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  Divider,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import React, { ChangeEvent, useState } from "react";

export type SearchResult = {
  vid: number;
  timestamp: number;
};

export type SearchResponse = {
  answer: string | null;
  moments: SearchResult[];
};

export type SearchBarProps = {
  onSearch: (query: string) => void;
  searchResponse?: SearchResponse | null;
} & BoxProps;

export default function SearchBar({
  onSearch,
  searchResponse,
  ...props
}: SearchBarProps): JSX.Element {
  const [searchText, setSearchText] = useState("");
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    return onSearch(event.target.value);
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <InputGroup onClick={onOpen}>
        <Input
          bg={"white"}
          type={"text"}
          border={"3px solid black !important"}
          boxShadow={"-5px 7px 0px black !important"}
          borderRadius={"lg"}
          onChange={handleChange}
          value={searchText}
          {...props}
        />
        <InputRightElement
          cursor={"pointer"}
          h={"100%"}
          p={3}
          bg={"transparent"}
          border={"none"}
        >
          <Image alt={"magnifying glass search icon"} src={"search.svg"} />
        </InputRightElement>
      </InputGroup>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          bg={"white"}
          p={4}
          border={"3px solid black !important"}
          boxShadow={"-5px 7px 0px black !important"}
          borderRadius={"lg"}
          minW={"50%"}
        >
          <InputGroup p={0}>
            <Input
              type={"text"}
              onChange={handleChange}
              value={searchText}
              fontSize={"xl"}
              border={"none"}
              {...props}
            />
            <InputRightElement
              cursor={"pointer"}
              h={"100%"}
              p={3}
              bg={"transparent"}
              border={"none"}
            >
              <Image alt={"magnifying glass search icon"} src={"search.svg"} />
            </InputRightElement>
          </InputGroup>
          <Divider my={2} />
          <div>
            Quote from some video. Something something we are really cool
            people.
          </div>
          <div>↪ [XX:XX] of Video Title</div>
          <Divider my={2} />

          <Flex>
            <Image
              w={"20%"}
              src={"https://via.placeholder.com/400x300"}
              alt={"placeholder"}
              borderRadius={"md"}
            />
            <Flex direction={"column"}>
              <Text>Video Title</Text>
              <Text>
                Insert quote or context of where the searched term appears here.
              </Text>
            </Flex>
          </Flex>
        </ModalContent>
      </Modal>
    </>
  );
}
