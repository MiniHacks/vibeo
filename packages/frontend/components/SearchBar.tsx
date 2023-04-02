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
  Tag,
  Badge,
} from "@chakra-ui/react";
import React, { ChangeEvent, useState } from "react";
import { DocumentData } from "firebase/firestore";
import { useRouter } from "next/router";

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
  const router = useRouter();
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

  const formatTime = (timeInSeconds: number, id: number): JSX.Element => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const reference = `./v/${id}`;
    // reference += `&t=${minutes}m${seconds}s` // TODO: implement
    return (
      <a href={`${reference}?t=${timeInSeconds | 0}`}>
        {minutes.toString()}:{seconds.toString().padStart(2, "0")}
      </a>
    );
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

  // 1.
  // const formatTags = (msg: string): string => {
  //   if (msg) {
  //     const tags = msg.match(/\[\d+\]/g);
  //     console.log("----------------------");
  //     console.log(tags);

  //     tags?.map((tag: string) => {
  //       <a href={"#"}>{tag}</a>;
  //     });
  //   }
  //   return "test";
  // };

  const formatTags = (msg: string): any[] => {
    if (!msg || !searchResults) return [];
    const acc = [];
    for (let i = 0; i < msg.length; i++) {
      if (msg[i] === "[") {
        const tag = msg.slice(i, msg.indexOf("]", i) + 1);
        console.log(tag);
        const tagNum = tag.slice(1, tag.length - 1);
        const video = videos.find(
          (video) => video.id === searchResults[+tagNum - 1].vid
        );
        const time = video?.data().time;
        const id = video?.id;
        const link = `/v/${id}?t=${+time}`;
        const tagLink = (
          <Tag
            colorScheme={"blue"}
            p={1}
            mb={-2}
            display={"inline-block"}
            _hover={{
              cursor: "pointer",
              bg: "blue.200",
            }}
            onClick={() => {
              router.push(link);
            }}
          >
            [{tagNum}]
          </Tag>
        );
        acc.push(tagLink);
        i = msg.indexOf("]", i);
      } else {
        console.log(msg[i]);
        acc.push(<span>{msg[i]}</span>);
      }
    }
    return acc;
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
            <Text fontWeight={400} fontSize={"md"} mb={2}>
              {formatTags(questionResult?.answer?.message.content)}
            </Text>
          </Collapse>
          {((searchResults != null && searchResults.length > 0) ||
            (questionResult && questionResult?.content.length > 0)) && (
            <Divider my={4} />
          )}
          {(searchResults || questionResult?.content)?.map((result, i) => {
            const video = videos.find((ele) => ele.id === result.vid);

            return (
              <Flex
                key={i}
                my={0}
                _hover={{
                  bg: "gray.200",
                }}
                py={6}
                px={4}
                borderRadius={"md"}
                cursor={"pointer"}
                onClick={() => {
                  router.push(`/v/${result.vid}?t=${result.context.start}`);
                }}
              >
                <Image
                  fill={"cover"}
                  w={"128px"}
                  h={"72px"}
                  src={`https://backend.vibeo.video/video/${video?.id}_0.png`}
                  borderRadius={"md"}
                  objectFit={"cover"}
                />
                <Flex direction={"column"} ml={4}>
                  <Text fontWeight={400} fontSize={"xl"}>
                    {video?.name}
                  </Text>
                  <Text fontWeight={300} fontSize={"sm"}>
                    <Badge mr={2}>
                      {formatTime(result.context.start, video?.id)}
                    </Badge>
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
