import type { NextPage } from "next";
import {
  Box,
  Heading,
  HStack,
  Spinner,
  Text,
  Image,
  Wrap,
  WrapItem,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { useAuth } from "reactfire";
import { useRouter } from "next/router";
import PageLayout from "../components/Layout/PageLayout";
import useAuthUser from "../lib/hooks/useAuthUser";
import Card from "../components/Card";
import Button from "../components/Button";
import SearchBar from "../components/SearchBar";
import { useSignInWithProvider } from "../lib/hooks/useSignInWithProvider";
import AddVideoModal from "../components/AddVideoModal";
import Tooltip from "../components/Tooltip";

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

  const filterSearch = (query: string): void => {
    console.log("Searching for: ", query);
    if (query.includes("?")) {
      console.log("This is a context search query.");
    } else {
      console.log("This is a filter search query.");
    }
  };

  // shows tooltip upon question search query

  // shows relevant cards given a filter
  const showCards = () => {};

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
            onSearch={filterSearch}
            ml={2}
            py={5}
            placeholder={
              "Where are Sasha and Samyok being insufferable people?"
            }
          />
        </HStack>
        <Wrap overflow={"unset"} spacing={6}>
          <WrapItem>
            <Card p={2} w={328}>
              <Image
                src={"https://via.placeholder.com/640x360"}
                alt={"placeholder"}
                width={"100%"}
                borderRadius={"md"}
              />
              <Text fontSize={"xl"} fontWeight={600} mt={3} mb={0} mx={2}>
                Schoology
              </Text>
              <Text fontSize={"sm"} fontWeight={300} my={2} mx={2}>
                Here's a summary of what was discussed during the video
              </Text>
            </Card>
          </WrapItem>
        </Wrap>
      </Box>
      <AddVideoModal open={isOpen} onClose={onClose} />
    </PageLayout>
  );
};

export default Dashboard;
