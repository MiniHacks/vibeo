import { Box, Text, Image } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { VideoControlsUser, defaultUsers } from "./VideoControls";

export type Note = {
  creatorUid: string;
  time: number;
  content: string;
  isImage: boolean;
};

export type NotesProps = {
  notes?: Note[];
  users?: VideoControlsUser[];
  videoRef: React.RefObject<HTMLVideoElement> | null;
};

const dummyNotes: Note[] = [
  {
    time: 3,
    creatorUid: "1",
    content: "Interesting point about 'Hello world'",
    isImage: false,
  },
  {
    time: 4,
    creatorUid: "1",
    content:
      "https://www.wwf.org.uk/sites/default/files/styles/social_share_image/public/2016-12/Original_WW22791.jpg",
    isImage: true,
  },
  {
    time: 7,
    creatorUid: "2",
    content: "This is a great example of effective communication",
    isImage: false,
  },
];

const Notes = ({
  notes = dummyNotes,
  users = defaultUsers,
  videoRef,
}: NotesProps) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const onUpdate = () => {
      const { currentTime } = videoRef?.current || {};
      if (currentTime) {
        setCurrentTime(currentTime);
      }
    };

    if (videoRef?.current) {
      videoRef.current.addEventListener("timeupdate", onUpdate);
    }

    return () => {
      if (videoRef?.current) {
        videoRef.current.removeEventListener("timeupdate", onUpdate);
      }
    };
  }, [videoRef]);

  const handleNoteClick = (time: number) => {
    if (videoRef?.current) {
      videoRef!.current!.currentTime = time;
    }
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString()}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Box w={"100%"}>
      {notes.map((note: Note) => {
        const creator = users.find((user) => user.id === note.creatorUid);
        return (
          <Box
            key={note.time}
            display={"flex"}
            alignItems={"flex-start"}
            mt={"10px"}
            onClick={() => handleNoteClick(note.time)}
            _hover={{ cursor: "pointer" }}
          >
            <Box
              bg={"gray.200"}
              py={1}
              px={2}
              borderRadius={"20px"}
              textAlign={"center"}
              mr={2}
              display={"flex"}
              alignItems={"center"}
            >
              {creator && (
                <Image
                  src={creator.iconUrl}
                  alt={creator.name}
                  boxSize={"20px"}
                  borderRadius={"50%"}
                  marginRight={"5px"}
                />
              )}
              {formatTime(note.time)}
            </Box>
            <Box display={"flex"}>
              {note.isImage ? (
                <Image
                  src={note.content}
                  boxSize={"40px"}
                  objectFit={"cover"}
                />
              ) : (
                <Text _hover={{ bgColor: "yellow" }}>{note.content}</Text>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default Notes;
