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
  const videos = [
    {
      src: "https://via.placeholder.com/400x300",
      alt: "placeholder",
      title: "llm time",
      timestamp: "XX:XX",
      context: "sasha makes a friend",
    },
    {
      src: "https://via.placeholder.com/400x300",
      alt: "placeholder",
      title: "jack debut episode",
      timestamp: "XX:XX",
      context: "there's a hottub",
    },
    {
      src: "https://via.placeholder.com/400x300",
      alt: "placeholder",
      title: "cookie mukbang",
      timestamp: "XX:XX",
      context: "samyok ate my cookie",
    },
  ];

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
          <InputGroup>
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
          <Divider my={4} />
          <Text fontSize={"xl"}>
            Quote from some video. Something something we are really cool
            people.
          </Text>
          <Text fontSize={"xl"}>↪ [XX:XX] of Video Title</Text>
          <Divider my={6} />
          {videos.map((video, i) => (
            <Flex key={i} my={2} >
              <Image
                fill={"co"}
                w={"20%"}
                src={video.src}
                alt={video.alt}
                borderRadius={"md"}
                objectFit={"cover"}
              />
              <Flex direction={"column"} ml={4}>
                <Text fontWeight={"bold"} fontSize={"xl"}>
                  {video.title}
                </Text>
                <Text>
                  [{video.timestamp}] {video.context}
                </Text>
              </Flex>
            </Flex>
          ))}
        </ModalContent>
      </Modal>
    </>
  );
}
