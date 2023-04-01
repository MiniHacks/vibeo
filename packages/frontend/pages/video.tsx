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
  VStack,
} from "@chakra-ui/react";
import React, { useRef } from "react";
import { useAuth } from "reactfire";
import PageLayout from "../components/Layout/PageLayout";
import useAuthUser from "../lib/hooks/useAuthUser";
import Card from "../components/Card";
import Button from "../components/Button";
import VideoControls from "../components/VideoControls";
import { useSignInWithProvider } from "../lib/hooks/useSignInWithProvider";
import VideoPlayer from "../components/VideoPlayer";

const Video: NextPage = () => {
  const { authUser, loading } = useAuthUser();
  // login with oauth
  const [signInWithProvider] = useSignInWithProvider();
  const videoRef = useRef<HTMLVideoElement>(null);
  const auth = useAuth();

  const signOut = () => {
    auth.signOut();
  };

  if (loading) {
    return (
      <PageLayout title={"Video | vibeo - your personal video repository"}>
        <Box height={"100%"} px={[5, 10]} py={10}>
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
      <PageLayout title={"Video | vibeo - your personal video repository"}>
        <Box height={"100%"} px={[5, 10]} py={10}>
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

  const share = () => {};

  return (
    <PageLayout title={"Video | vibeo - your personal video repository"}>
      <Box
        minH={"100vh"}
        px={10}
        paddingTop={5}
        display={"flex"}
        flexDirection={"column"}
      >
        <HStack alignItems={"stretch"}>
          <Box flexGrow={1}>
            <VideoControls videoRef={videoRef} />
          </Box>
          <Button h={"100%"} onClick={share} px={[20, 20]}>
            <Text fontSize={"4xl"}>Share</Text>
          </Button>
        </HStack>
        <Box
          display={"flex"}
          flexDirection={"row"}
          py={[0, 15]}
          bgColor={"red"}
          height={"100%"}
        >
          <Box w={"65%"} height={"100vh"}>
            <VideoPlayer ref={videoRef} />
          </Box>
          <Box display={"flex"} flexDirection={"column"} h={"100%"}>
            <Box>1</Box>
            <Box
              boxSizing={"border-box"}
              height={"100%"}
              right={"15px"}
              bottom={"-10px"}
              bg={"#FFFFFF"}
              border={"4px solid #000000"}
              boxShadow={"-8px 10px 0px #000000"}
              borderRadius={"10px"}
            >
              2
            </Box>
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default Video;
