import type { NextPage } from "next";
import {
  Box,
  Flex,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  Spinner,
  Text,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAuth, useFirestore, useFirestoreDocData } from "reactfire";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import QRCode from "qrcode";
import { update } from "@firebase/database";
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
import Notes, { Note } from "../../components/videopage/Notes";
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  console.log(video);

  const [shareQr, setShareQr] = useState("");

  const share = () => {
    QRCode.toDataURL(location.href)
      .then((url) => {
        setShareQr(url);
        onOpen();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onSetColor = (c: string) => {
    console.log(c);
    setColor(c);
  };

  const onSave = async () => {
    if (typeof window === "undefined") return;
    const canvas = window.document.querySelector("canvas");
    if (!canvas) return;
    await updateDoc(videoDocRef, {
      notes: arrayUnion({
        content: canvas.toDataURL(),
        time: videoRef.current?.currentTime ?? 0,
        timestamp: Date.now(),
        isImage: true,
        creator: {
          uid: authUser?.uid,
          name: authUser?.displayName,
          avatar: authUser?.photoURL,
        },
      }),
    });
  };

  const onAddNote = (note: Partial<Note>) => {
    console.log(note);
    updateDoc(videoDocRef, {
      notes: arrayUnion({
        ...note,
        time: videoRef.current?.currentTime ?? 0,
        timestamp: Date.now(),
        creator: {
          uid: authUser?.uid,
          name: authUser?.displayName,
          avatar: authUser?.photoURL,
        },
      }),
    }).then(() => console.log("updated notes"));
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

  const NOTES = (
    <>
      <Text fontSize={"xl"} fontWeight={"bold"}>
        Notes
      </Text>
      <Notes vid={vid} videoRef={videoRef} notes={video.notes || []} />
    </>
  );

  const TRANSCRIPT = (
    <>
      <Text fontSize={"xl"} fontWeight={"bold"}>
        {video.done
          ? "Transcript"
          : `${video.processingMessage}...${
              Math.round(video.progress * 1000) / 10
            }%`}
      </Text>
      <Transcript videoRef={videoRef} videoData={video as VideoData} />
    </>
  );

  return (
    <PageLayout
      title={`${video.name} | vibeo - your personal video repository`}
    >
      <Box
        minHeight={"100vh"}
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

        <HStack
          justify={"space-between"}
          spacing={8}
          alignItems={"stretch"}
          h={"97vh"}
        >
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
                  <NewNote addNote={onAddNote} />
                  <Flex direction={"column"} justify={"center"} ml={5}>
                    <CanvasToolbar onSetColor={onSetColor} onSave={onSave} />
                  </Flex>
                </Flex>
              </>
            )}
            <Card
              flexGrow={1}
              px={8}
              py={4}
              mt={!isAudioOnly ? 8 : 0}
              h={0}
              display={"flex"}
              flexDirection={"column"}
            >
              {NOTES}
            </Card>
          </Flex>
          <Card flexGrow={1} px={8} py={4}>
            {TRANSCRIPT}
          </Card>
        </HStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          bg={"white"}
          p={4}
          border={"3px solid black !important"}
          boxShadow={"-5px 7px 0px black !important"}
          borderRadius={"lg"}
        >
          <Text fontSize={"xl"} textAlign={"center"}>
            Scan the QR code for the link
          </Text>
          <Image src={shareQr} />
        </ModalContent>
      </Modal>
      <Footer mt={10} />
    </PageLayout>
  );
};

export default Vid;
