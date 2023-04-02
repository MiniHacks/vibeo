import {
  Avatar,
  Badge,
  Box,
  Image,
  Tag,
  TagProps,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { defaultUsers, VideoControlsUser } from "./VideoControls";

export type NoteUser = {
  uid: string;
  name?: string;
  avatar?: string;
};
export type Note = {
  creator: NoteUser;
  time: number;
  content: string;
  isImage: boolean;
};

export type NotesProps = {
  notes?: Note[];
  users?: VideoControlsUser[];
  videoRef: React.RefObject<HTMLVideoElement> | null;
};
const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString()}:${seconds.toString().padStart(2, "0")}`;
};

export function TimeTag({
  time,
  ...props
}: {
  time: number;
  props?: TagProps;
}): JSX.Element {
  return (
    <Tag
      bg={"gray.200"}
      py={0}
      pr={2}
      borderRadius={"full"}
      mr={2}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
      minW={"50px"}
      {...props}
    >
      {formatTime(time)}
    </Tag>
  );
}

const dummyNotes: Note[] = [
  {
    time: 3,
    creator: {
      uid: "1",
      name: "Sasha",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    content: "Interesting point about 'Hello world'",
    isImage: false,
  },
  {
    time: 4,
    creator: {
      uid: "4",
      name: "Sasha",
    },

    content:
      "https://www.wwf.org.uk/sites/default/files/styles/social_share_image/public/2016-12/Original_WW22791.jpg",
    isImage: true,
  },
  {
    time: 7,
    creator: {
      uid: "3",
      name: "Mini",
    },
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

  return (
    <Box w={"100%"}>
      {notes
        ?.sort((a, b) => (a.time < b.time ? -1 : 1))
        .map((note: Note) => {
          const { creator } = note;
          return (
            <Box
              key={note.time}
              display={"flex"}
              alignItems={"center"}
              mt={"10px"}
              onClick={() => handleNoteClick(note.time)}
              _hover={{ cursor: "pointer" }}
              role={"group"}
            >
              <TimeTag time={note.time} />
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
              <Box flexGrow={1} />
              <Avatar
                _groupHover={{
                  opacity: 0.9,
                  transitionDelay: "0s",
                  transitionDuration: "0.1s",
                }}
                opacity={0.1}
                transitionDuration={"500ms"}
                transitionDelay={"200ms"}
                size={"sm"}
                name={creator.name}
                src={creator.avatar}
                // mr={-2}
                // ml={-5}
              />
            </Box>
          );
        })}
    </Box>
  );
};

export default Notes;
