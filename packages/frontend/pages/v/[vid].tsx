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
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  useAuth,
  useDatabase,
  useDatabaseObjectData,
  useFirestore,
  useFirestoreDocData,
} from "reactfire";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import QRCode from "qrcode";
import {
  getAuth,
  getDatabase,
  ref,
  onDisconnect,
  set,
} from "firebase/database";

import dynamic from "next/dynamic";
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
import { stringToColor } from "../../lib/generic/toInt";

const RecordingTranscript = dynamic(
  () => import("../../components/RecordingTranscript"),
  { ssr: false }
);

const Vid: NextPage = () => {
  const { authUser, loading } = useAuthUser();
  // login with oauth
  const [signInWithProvider] = useSignInWithProvider();
  const videoRef = useRef<HTMLVideoElement>(null);
  const auth = useAuth();

  const [color, setColor] = useState<string>("red");
  const voidFunc = () => {};
  const [undo, setUndo] = useState<() => void>(voidFunc);
  const [isRecording, setRecording] = useState(true);
  const [isAudioOnly, setAudioOnly] = useState(true);
  const database = useDatabase();
  const router = useRouter();
  const vid = router.query.vid as string;
  const { status: presenceStatus, data: presenceData } = useDatabaseObjectData(
    ref(database, `videos/${vid}/`),
    { idField: "id" }
  );
  const { status: userStatus, data: userData } = useDatabaseObjectData(
    ref(database, `users/`),
    { idField: "id" }
  );

  const users = Object.keys(presenceData ?? {}).filter(
    (k) => k.length > 9 && k !== authUser?.uid && presenceData[k].loc >= 0
  );

  const presence = users.map((u) => {
    const { name, photoURL } = userData[u].nameandpic;
    return {
      id: u,
      name,
      color: stringToColor(name),
      iconUrl: photoURL,
      progress: presenceData[u].loc,
    };
  });

  // get video from firebase
  const firestore = useFirestore();
  const videoDocRef = doc(firestore, "videos", vid ?? " ");
  const { status, data: video } = useFirestoreDocData(videoDocRef, {
    idField: "id",
  });

  useEffect(() => {
    const rdbref = ref(getDatabase(), `videos/${vid}/${authUser?.uid}/loc`);
    const userRef = ref(getDatabase(), `users/${authUser?.uid}/nameandpic`);

    set(userRef, {
      name: authUser?.displayName || "",
      photoURL: authUser?.photoURL || "",
    });

    const onDisconnectRef = onDisconnect(rdbref);
    const setLoc = (loc: number) => {
      set(rdbref, loc);
    };

    onDisconnectRef.set(-1).then(() => {
      setLoc(0);
    });

    setLoc(10);

    const updateTime = () => {
      setLoc(videoRef.current?.currentTime ?? 0);
    };
    videoRef.current?.addEventListener("timeupdate", updateTime);

    return () => {
      setLoc(-1);
      videoRef.current?.removeEventListener("timeupdate", updateTime);
    };
  }, [vid, authUser, videoRef.current]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  console.log(video);

  const [shareQr, setShareQr] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = parseInt(params.get("t") || "0", 10);
    if (videoRef?.current) {
      videoRef.current.currentTime = t;
    }
  }, [videoRef.current]);
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

  const HIDER = ["none", null, "block"];

  const NOTES = (
    <>
      <Text fontSize={"xl"} fontWeight={"bold"}>
        Notes
      </Text>
      <Notes vid={vid} videoRef={videoRef} notes={video?.notes || []} />
    </>
  );

  const TRANSCRIPT = isRecording ? (
    <RecordingTranscript />
  ) : (
    <>
      <Text fontSize={"xl"} fontWeight={"bold"}>
        {video?.done
          ? "Transcript"
          : `${video?.processingMessage ?? ""}...${
              Math.round((video?.progress ?? 0) * 1000) / 10
            }%`}
      </Text>
      <Transcript videoRef={videoRef} videoData={video as VideoData} />
    </>
  );

  return (
    <PageLayout
      title={`${
        video?.name ?? "Recording..."
      } | vibeo - your personal video repository`}
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
              videoTitle={video?.name}
              href={video?.youtube}
              videoRef={videoRef}
              users={presence}
              endRecording={() =>
                console.log("Yoo use this to stop the recording")
              }
            />
          </Box>
          <Button px={12} ml={6} onClick={share} display={HIDER}>
            <Text fontSize={"2xl"}>Share</Text>
          </Button>
        </Flex>

        <HStack
          justify={"space-between"}
          spacing={8}
          alignItems={"stretch"}
          h={"97vh"}
        >
          <Flex direction={"column"} justify={"start"} maxW={"100%"}>
            {!isAudioOnly && (
              <VideoPlayer
                source={`https://backend.vibeo.video/video/${vid}`}
                ref={videoRef}
                color={color}
                setUndoFunction={(func) => {
                  setUndo(func);
                }}
              />
            )}
            <Flex
              direction={"row"}
              justify={"space-between"}
              mt={isAudioOnly ? 0 : 4}
              height={14}
            >
              <NewNote addNote={onAddNote} />
              {!isAudioOnly && (
                <Flex direction={"column"} justify={"center"} ml={5}>
                  <CanvasToolbar onSetColor={onSetColor} onSave={onSave} />
                </Flex>
              )}
            </Flex>
            <Card
              flexGrow={1}
              px={8}
              py={4}
              mt={isAudioOnly ? 4 : 8}
              h={0}
              display={"flex"}
              flexDirection={"column"}
            >
              {NOTES}
            </Card>
          </Flex>
          <Card flexGrow={1} px={8} py={4} display={HIDER}>
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
