import type { NextPage } from "next";
import { Box, Flex, HStack, Spinner, Text } from "@chakra-ui/react";
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
        py={5}
        display={"flex"}
        flexDirection={"column"}
      >
        <Flex mb={10}>
          <Box flexGrow={1}>
            <VideoControls videoRef={videoRef} />
          </Box>
          <Button px={12} ml={10} onClick={share}>
            <Text fontSize={"2xl"}>Share</Text>
          </Button>
        </Flex>

        <Flex h={"90vh"} justify={"space-between"}>
          <Flex w={"55vw"} direction={"column"} justify={"start"}>
            <VideoPlayer ref={videoRef} />
            <Card h={"50%"} px={8} py={4} mt={8}>
              <Text fontSize={"xl"} fontWeight={"bold"}>
                Notes
              </Text>
              <Text>
                insert cool component here that shows the annotation notes idk
              </Text>
            </Card>
          </Flex>
          <Card w={"35vw"} px={8} py={4}>
            <Text fontSize={"xl"} fontWeight={"bold"}>
              Transcript
            </Text>
            <Text>
              timestamp | this is where you would put the component for the transcript :3
            </Text>
          </Card>
        </Flex>
      </Box>
    </PageLayout>
  );
};

export default Video;
