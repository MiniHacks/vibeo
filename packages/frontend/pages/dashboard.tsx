import type { NextPage } from "next";
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
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { useRouter } from "next/router";
import { collection, query, where } from "firebase/firestore";
import debounce from "lodash/debounce";
import PageLayout from "../components/Layout/PageLayout";
import useAuthUser from "../lib/hooks/useAuthUser";
import Card from "../components/Card";
import Button from "../components/Button";
import SearchBar from "../components/SearchBar";
import { useSignInWithProvider } from "../lib/hooks/useSignInWithProvider";
import AddVideoModal from "../components/AddVideoModal";

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

  const [searchResponse, setSearchResults] = useState(null);

  const filterSearch = (qry: string): void => {
    console.log("Searching for: ", qry);
    const data = {
      uid,
      query: qry,
    };
    if (!qry.includes("?")) {
      const params = new URLSearchParams(data);
      const url = `https://backend.vibeo.video/search?${params.toString()}`;
      fetch(url)
        .then((response) => response.json())
        .then((result) => setSearchResults(result));
    } else {
      const params = new URLSearchParams(data);
      const url = `https://backend.vibeo.video/question?${params.toString()}`;
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((result) => setSearchResults(result));
    }
  };
  const debouncedSearch = useRef(debounce(filterSearch, 400)).current;

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

  return (
    <PageLayout title={"dashboard | vibeo - your personal video repository"}>
      <Box px={[5, 10]} py={10}>
        <HStack spacing={5}>
          <Heading flexGrow={1} size={"3xl"}>
            vibeo
          </Heading>
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
            ml={2}
            py={5}
            placeholder={
              "Where are Sasha and Samyok being insufferable people?"
            }
          />
        </HStack>
        <Wrap overflow={"unset"} spacing={6}>
          {videos == null
            ? status
            : videos.map((video) => (
                <WrapItem>
                  <Card p={2} w={328}>
                    <Image
                      src={"https://via.placeholder.com/640x360"}
                      alt={"placeholder"}
                      width={"100%"}
                      borderRadius={"md"}
                    />
                    <Text fontSize={"xl"} fontWeight={600} mt={3} mb={0} mx={2}>
                      {video.name}
                    </Text>
                    <Text fontSize={"sm"} fontWeight={300} my={2} mx={2}>
                      {new Date(video.created.seconds * 1000).toLocaleString()}
                    </Text>
                  </Card>
                </WrapItem>
              ))}
        </Wrap>
      </Box>
      <AddVideoModal open={isOpen} onClose={onClose} uid={uid} />
    </PageLayout>
  );
};

export default Dashboard;
