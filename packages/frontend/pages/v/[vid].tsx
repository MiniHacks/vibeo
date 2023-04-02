import type { NextPage } from "next";
import { Box, Flex, HStack, Spinner, Text } from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAuth, useFirestore, useFirestoreDocData } from "reactfire";
import { doc } from "firebase/firestore";
import PageLayout from "../../components/Layout/PageLayout";
import useAuthUser from "../../lib/hooks/useAuthUser";
import Card from "../../components/Card";
import Button from "../../components/Button";
import VideoControls from "../../components/videopage/VideoControls";
import { useSignInWithProvider } from "../../lib/hooks/useSignInWithProvider";
import VideoPlayer from "../../components/videopage/VideoPlayer";
import CanvasToolbar from "../../components/videopage/CanvasToolbar";
import Transcript, { VideoData } from "../../components/Transcript";
import NewNote from "../../components/videopage/NewNote";
import Notes from "../../components/videopage/Notes";
import Footer from "../../components/Layout/Footer";

const Vid: NextPage = () => {
  const { authUser, loading } = useAuthUser();
  // login with oauth
  const [signInWithProvider] = useSignInWithProvider();
  const videoRef = useRef<HTMLVideoElement>(null);
  const auth = useAuth();

  const [color, setColor] = useState<string>("red");
  const voidFunc = () => {};
  const [undo, setUndo] = useState<() => void>(voidFunc);
  const [isRecording, setRecording] = useState(false);
  const [isAudioOnly, setAudioOnly] = useState(false);

  const router = useRouter();
  const vid = router.query.vid as string;

  // get video from firebase
  const firestore = useFirestore();
  const videoDocRef = doc(firestore, "videos", vid ?? " ");
  const { status, data: video } = useFirestoreDocData(videoDocRef, {
    idField: "id",
  });
  console.log(video);
  const share = () => {};

  const onSetColor = (c: string) => {
    console.log(c);
    setColor(c);
  };

  if (loading || status === "loading" || !vid) {
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

  return (
    <PageLayout
      title={`${video.name} | vibeo - your personal video repository`}
    >
      <Box
        minH={"100vh"}
        px={10}
        pt={10}
        display={"flex"}
        flexDirection={"column"}
      >
        <Flex mb={10}>
          <Box flexGrow={1}>
            <VideoControls
              videoTitle={video.name}
              href={video.youtube}
              videoRef={videoRef}
              endRecording={() =>
                console.log("Yoo use this to stop the recording")
              }
            />
          </Box>
          <Button px={12} ml={6} onClick={share}>
            <Text fontSize={"2xl"}>Share</Text>
          </Button>
        </Flex>

        <HStack justify={"space-between"} spacing={8} alignItems={"stretch"}>
          <Flex direction={"column"} justify={"start"}>
            {!isAudioOnly && (
              <>
                <VideoPlayer
                  source={`https://backend.vibeo.video/video/${vid}`}
                  ref={videoRef}
                  color={color}
                  setUndoFunction={(func) => {
                    setUndo(func);
                  }}
                />
                <Flex direction={"row"} justify={"space-between"} mt={4}>
                  <NewNote addNote={() => console.log("note added")} />
                  <Flex direction={"column"} justify={"center"} ml={5}>
                    <CanvasToolbar onSetColor={onSetColor} />
                  </Flex>
                </Flex>
              </>
            )}
            <Card
              flexGrow={1}
              px={8}
              py={4}
              mt={!isAudioOnly ? 8 : 0}
              borderBottomLeftRadius={"0px"}
              borderBottomRightRadius={"0px"}
              borderBottom={"0px"}
            >
              <Text fontSize={"xl"} fontWeight={"bold"}>
                Notes
              </Text>
              <Notes videoRef={videoRef} />
            </Card>
          </Flex>
          <Card
            flexGrow={1}
            px={8}
            py={4}
            borderBottomLeftRadius={"0px"}
            borderBottomRightRadius={"0px"}
            borderBottom={"0px"}
          >
            <Text fontSize={"xl"} fontWeight={"bold"}>
              Transcript
            </Text>
            <Transcript videoRef={videoRef} videoData={video as VideoData} />
          </Card>
        </HStack>
      </Box>
      <Footer mt={10} />
    </PageLayout>
  );
};

export default Vid;
