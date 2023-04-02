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
  Text,
  Collapse,
} from "@chakra-ui/react";
import React, { ChangeEvent, useState } from "react";
import { DocumentData } from "firebase/firestore";
import Tooltip from "./Tooltip";

export type Context = {
  text: string;
  start: number;
  end: number;
};

export type SearchResult = {
  vid: string;
  context: Context;
  highlight: Context;
};

export type QuestionResult = {
  content: SearchResult[];
  answer: any;
};

export type SearchBarProps = {
  onSearch: (query: string) => void;
  searchResults: SearchResult[] | null;
  questionResult: QuestionResult | null;
  videos: DocumentData;
} & BoxProps;

export default function SearchBar({
  onSearch,
  searchResults,
  questionResult,
  videos,
  ...props
}: SearchBarProps): JSX.Element {
  const [searchText, setSearchText] = useState("");
  const [showingSearchResponse, setShowingSearchResponse] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    return onSearch(event.target.value);
  };

  if (questionResult && questionResult.answer && !showingSearchResponse) {
    setShowingSearchResponse(true);
  }

  const { isOpen, onOpen, onClose } = useDisclosure();
  const defaultVideos = [
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

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString()}:${seconds.toString().padStart(2, "0")}`;
  };

  const highlightText = (text: string, highlight: string) => {
    const lowerText = text.toLowerCase();
    const lowerHighlight = highlight.toLowerCase();

    const result: JSX.Element[] = [];

    let i = 0;
    while (i < text.length) {
      let match = false;
      for (let j = 0; j < highlight.length && i + j < text.length; j++) {
        if (lowerText[i + j] !== lowerHighlight[j]) {
          break;
        }
        if (j === highlight.length - 1) {
          match = true;
        }
      }

      if (match) {
        result.push(
          <Text as={"span"} fontWeight={"bold"}>
            {text.slice(i, i + highlight.length)}
          </Text>
        );
        i += highlight.length;
      } else {
        result.push(<Text as={"span"}>{text[i]}</Text>);
        i += 1;
      }
    }

    return result;
  };

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

          <Collapse in={showingSearchResponse} animateOpacity>
            <Divider my={4} />
            <Text fontWeight={"semibold"} fontSize={"xl"} mb={2}>
              {questionResult?.answer?.message.content}
            </Text>
          </Collapse>
          {((searchResults != null && searchResults.length > 0) ||
            (questionResult && questionResult?.content.length > 0)) && (
            <Divider my={4} />
          )}
          {(searchResults || questionResult?.content)?.map((result, i) => {
            const video = videos.find((ele) => ele.id === result.vid);

            return (
              <Flex key={i} my={2}>
                <Image
                  fill={"co"}
                  w={"20%"}
                  src={`https://backend.vibeo.video/video/${video.id}_0.png`}
                  borderRadius={"md"}
                  objectFit={"cover"}
                />
                <Flex direction={"column"} ml={4}>
                  <Text fontWeight={"bold"} fontSize={"xl"}>
                    {video.name}
                  </Text>
                  <Text>
                    [{formatTime(result.context.start)}]{" "}
                    {highlightText(result.context.text, result.highlight.text)}
                  </Text>
                </Flex>
              </Flex>
            );
          })}
        </ModalContent>
      </Modal>
    </>
  );
}
