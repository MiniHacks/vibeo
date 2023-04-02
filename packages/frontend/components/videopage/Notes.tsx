import {
  Avatar,
  Badge,
  Box,
  Image,
  Tag,
  TagProps,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
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
  timestamp?: number;
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

const NoteSingle = ({
  note,
  handleNoteClick,
  currentTime,
  arr,
  index,
}: {
  note: Note;
  handleNoteClick: (time: number) => void;
  currentTime: number;
  arr: Note[];
  index: number;
}): JSX.Element => {
  const { creator } = note;
  const ref = useRef<HTMLDivElement>(null);
  let prevTime = -1;
  if (index > 0) {
    prevTime = arr[index - 1].time;
  }
  const isFirst = prevTime !== note.time;
  const isCurrent = currentTime && Math.abs(currentTime - note.time) < 1;

  useEffect(() => {
    if (isCurrent && ref.current && isFirst) {
      const current = ref.current as HTMLDivElement;
      console.log(current);
      current?.parentElement?.scroll({
        top:
          (current?.offsetTop ?? 0) - (current?.parentElement?.offsetTop ?? 0),
        behavior: "smooth",
      });
    }
  }, [isCurrent]);
  return (
    <Box
      ref={ref}
      key={note.time}
      display={"flex"}
      alignItems={"center"}
      mt={"10px"}
      onClick={() => handleNoteClick(note.time)}
      _hover={{ cursor: "pointer" }}
      role={"group"}
    >
      <TimeTag time={note.time} />
      <Box display={"flex"} bg={isCurrent ? "yellow.100" : "white"}>
        {note.isImage ? (
          <Image src={note.content} boxSize={"40px"} objectFit={"cover"} />
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
};

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
    <Box w={"100%"} flexGrow={1} overflow={"hidden"} height={"100%"}>
      <Box mt={4} overflowX={"auto"} maxH={"calc(100% - 10px)"} pb={16}>
        {notes
          ?.sort((a, b) => ((a?.timestamp ?? 0) < (b.timestamp ?? 0) ? -1 : 1))
          ?.sort((a, b) => (a.time < b.time ? -1 : 1))
          .map((note: Note, index, arr) => (
            <NoteSingle
              key={JSON.stringify(note)}
              arr={arr}
              index={index}
              note={note}
              handleNoteClick={handleNoteClick}
              currentTime={currentTime}
            />
          ))}
      </Box>
    </Box>
  );
};

export default Notes;
