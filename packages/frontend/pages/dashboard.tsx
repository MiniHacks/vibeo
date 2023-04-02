import type { NextPage } from "next";
import { formatRelative } from "date-fns";

import {
  Box,
  Heading,
  HStack,
  Image,
  Spinner,
  Text,
  useDisclosure,
  Wrap,
  WrapItem,
  Flex,
  VStack,
} from "@chakra-ui/react";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { useRouter } from "next/router";
import { collection, query, where } from "firebase/firestore";
import debounce from "lodash/debounce";
import { nanoid } from "nanoid";
import PageLayout from "../components/Layout/PageLayout";
import useAuthUser from "../lib/hooks/useAuthUser";
import Card from "../components/Card";
import Button from "../components/Button";
import SearchBar, {
  QuestionResult,
  SearchResult,
} from "../components/SearchBar";
import { useSignInWithProvider } from "../lib/hooks/useSignInWithProvider";
import AddVideoModal from "../components/AddVideoModal";
import RenderTitle from "../components/RenderTitle";

const Dashboard: NextPage = () => {
  const { authUser, loading } = useAuthUser();
  // login with oauth
  const [signInWithProvider] = useSignInWithProvider();
  const auth = useAuth();

  const { isOpen, onClose, onOpen } = useDisclosure();
  const router = useRouter();

  const signOut = () => {
    auth.signOut().then(() => router.push("/"));
  };

  // set up query
  const firestore = useFirestore();
  const videosCollection = collection(firestore, "videos/");
  const uid: string = authUser?.uid ?? "sasha";
  console.log("uid: ", uid);
  const videosQuery = query(videosCollection, where("uid", "==", uid));
  const { status, data: videos } = useFirestoreCollectionData(videosQuery, {
    idField: "id", // this field will be added to the object created from each document
  });

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [questionResult, setQuestionResult] = useState<QuestionResult | null>(
    null
  );
  const [videoFilter, setVideoFilter] = useState<string[] | null>(null);

  const filterSearch = (qry: string): void => {
    console.log("Searching for: ", qry, "with uid", authUser?.uid.toString());
    const data = {
      uid: authUser?.uid.toString() || "jack",
      query: qry,
    };
    setVideoFilter(null);
    if (!qry.includes("?") && qry.length > 0) {
      const params = new URLSearchParams(data);
      const url = `https://backend.vibeo.video/search?${params.toString()}`;
      fetch(url)
        .then((response) => response.json())
        .then((result: SearchResult[]) => {
          console.log("search");
          console.log(result);
          setVideoFilter(null /* result.map((ele) => ele.vid) */);
          setQuestionResult(null);
          setSearchResults(result);
        });
    } else if (qry.length > 0) {
      const params = new URLSearchParams(data);
      const url = `https://backend.vibeo.video/question?${params.toString()}`;
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((result: QuestionResult) => {
          console.log("search");
          console.log(result);
          setVideoFilter(null /* result.content.map((ele) => ele.vid) */);
          setSearchResults(null);
          setQuestionResult(result);
        });
    }
  };

  const debouncedSearch = useCallback(debounce(filterSearch, 300), [uid]);

  console.log({ status, videos });

  if (loading) {
    return (
      <PageLayout title={"dashboard | vibeo - your personal video repository"}>
        <Box px={[5, 10]} py={10}>
          <HStack spacing={5} alignItems={"stretch"}>
            <Card>
              <Spinner />
            </Card>
          </HStack>
        </Box>
      </PageLayout>
    );
  }

  if (!authUser) {
    return (
      <PageLayout title={"dashboard | vibeo - your personal video repository"}>
        <Box px={[5, 10]} py={10}>
          <HStack spacing={5} alignItems={"stretch"}>
            <Card>
              <Text>You are not logged in. </Text>
            </Card>
            <Button onClick={signInWithProvider}>Login</Button>
          </HStack>
        </Box>
      </PageLayout>
    );
  }

  console.log(videos);

  return (
    <PageLayout title={"dashboard | vibeo - your personal video repository"}>
      <Box px={[5, 10]} py={10}>
        <HStack spacing={5}>
          <VStack flexGrow={1} alignItems={"start"}>
            <Heading size={"3xl"}>vibeo</Heading>
            {/* <Text>find your vibe</Text> */}
          </VStack>
          <Card>Logged in as {authUser.displayName || authUser.email}</Card>
          <Button colorScheme={"orange"} onClick={signOut}>
            Logout
          </Button>
        </HStack>
        <HStack>
          <Button my={6} colorScheme={"green"} onClick={onOpen}>
            Add Video
          </Button>
          <SearchBar
            onSearch={debouncedSearch}
            searchResults={questionResult == null ? searchResults : null}
            questionResult={questionResult}
            videos={videos}
            py={5}
            placeholder={
              "Where are Sasha and Samyok being insufferable people?"
            }
          />
        </HStack>
        <Wrap overflow={"unset"} spacing={6}>
          {videos == null
            ? status
            : videos
                .filter(
                  (ele) =>
                    videoFilter == null || videoFilter.includes(ele.videoId)
                )
                .map((video) => (
                  <WrapItem>
                    <Button
                      p={2}
                      w={328}
                      display={"block"}
                      textAlign={"left"}
                      bg={"white"}
                      _hover={{ bg: "gray.100" }}
                      _active={{ bg: "gray.200" }}
                      onClick={() => {
                        router.push(`/v/${video.id}`);
                      }}
                      height={"100%"}
                    >
                      {video?.done && (
                        <Image
                          src={`https://backend.vibeo.video/video/${video.id}_5.png`}
                          alt={"placeholder"}
                          width={"100%"}
                          borderRadius={"md"}
                        />
                      )}

                      <Text
                        fontSize={"xs"}
                        fontWeight={300}
                        mt={2}
                        mb={1}
                        mx={2}
                        color={"gray.500"}
                      >
                        {formatRelative(
                          new Date(video.created.seconds * 1000),
                          new Date()
                        )}
                      </Text>
                      <Flex
                        justifyContent={"space-between"}
                        direction={"row"}
                        alignItems={"flex-end"}
                      >
                        <RenderTitle title={video?.name ?? "Unnamed Video"} />
                        <Text
                          color={"gray.500"}
                          mx={2}
                          mb={3}
                          fontWeight={300}
                          fontSize={"xs"}
                        >
                          {!video?.done && video?.progressMessage.toLowerCase()}
                        </Text>
                      </Flex>
                      <Box
                        bg={
                          video?.progressMessage != null && video!.progress != 1
                            ? "#C4C4C4"
                            : "transparent"
                        }
                        h={"2px"}
                        w={"100%"}
                        borderRadius={"2px"}
                      >
                        <Box
                          bg={
                            video?.progressMessage != null &&
                            video!.progress != 1
                              ? "#000000"
                              : "transparent"
                          }
                          h={"100%"}
                          w={`${video.progress * 100}%`}
                        />
                      </Box>
                    </Button>
                  </WrapItem>
                ))}
        </Wrap>
      </Box>
      <AddVideoModal open={isOpen} onClose={onClose} uid={uid} />
    </PageLayout>
  );
};

export default Dashboard;
