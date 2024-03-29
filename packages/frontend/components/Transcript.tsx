import { Box, Text } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { TimeTag } from "./videopage/Notes";

export type TranscriptWord = {
  start: number;
  end: number;
  content: string;
};

export type TranscriptSentence = {
  start: number;
  end: number;
  words: TranscriptWord[];
};

export type TranscriptSection = {
  start: number;
  end: number;
  sentences: TranscriptSentence[];
};

export type VideoData = {
  name: string;
  type: "youtube" | "record" | "upload";
  youtube?: string;
  done: boolean;
  progressMessage?: "Downloading" | "Processing";
  progress: number;
  transcript?: TranscriptSection[];
  uid: string;
  created?: Date;
};

export type TranscriptProps = {
  videoData?: VideoData;
  videoRef: React.RefObject<HTMLVideoElement> | null;
};

const dummyData: VideoData = {
  name: "John Doe",
  type: "youtube",
  youtube: "https://www.youtube.com/watch?v=12345",
  done: true,
  progressMessage: "Processing",
  progress: 0.73456,
  transcript: [
    {
      start: 0,
      end: 10,
      sentences: [
        {
          start: 0,
          end: 4,
          words: [
            {
              start: 0,
              end: 5,
              content: "Hello",
            },
            {
              start: 2,
              end: 3,
              content: "world",
            },
          ],
        },
        {
          start: 5,
          end: 10,
          words: [
            {
              start: 5,
              end: 7,
              content: "How",
            },
            {
              start: 8,
              end: 10,
              content: "are",
            },
          ],
        },
      ],
    },
    {
      start: 11,
      end: 20,
      sentences: [
        {
          start: 11,
          end: 14,
          words: [
            {
              start: 11,
              end: 14,
              content: "I'm",
            },
          ],
        },
        {
          start: 15,
          end: 20,
          words: [
            {
              start: 15,
              end: 20,
              content: "fine.",
            },
          ],
        },
      ],
    },
  ],
  uid: "user123",
};

const Word = ({
  word,
  currentTime,
  setVideoTime,
}: {
  word: TranscriptWord;
  currentTime: number;
  setVideoTime: (time: number) => void;
}): JSX.Element => {
  const isCurrentWord =
    currentTime && currentTime >= word.start - 0.4 && currentTime <= word.end;

  const ref = useRef(null);

  useEffect(() => {
    if (isCurrentWord && ref.current) {
      const current = ref.current as HTMLSpanElement;
      current?.parentElement?.parentElement?.parentElement?.scroll({
        top:
          (current?.parentElement?.parentElement?.offsetTop ?? 0) -
          (current?.parentElement?.parentElement?.parentElement?.parentElement
            ?.offsetTop ?? 0) -
          20,
        behavior: "smooth",
      });
    }
  }, [isCurrentWord]);

  return (
    <Text
      ref={ref}
      onClick={() => setVideoTime(word.start)}
      as={"span"}
      bgColor={isCurrentWord ? "yellow" : "transparent"}
      _hover={{ bgColor: "yellow" }}
    >
      {word.content}{" "}
    </Text>
  );
};

const Transcript = ({ videoRef, videoData = dummyData }: TranscriptProps) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const onUpdate = () => {
      const { currentTime: ct } = videoRef?.current || {};
      if (ct) {
        setCurrentTime(ct);
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

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString()}:${seconds.toString().padStart(2, "0")}`;
  };

  const setVideoTime = (startTime: number) => {
    if (videoRef?.current) {
      videoRef.current.currentTime = startTime;
    }
  };

  return (
    <Box w={"100%"} flexGrow={1} overflow={"hidden"} height={"100%"}>
      <Box mt={4} overflowX={"auto"} maxH={"calc(100% - 10px)"} pb={24}>
        {videoData.transcript?.map((section: TranscriptSection) =>
          section.sentences.map((sentence: TranscriptSentence) => {
            return (
              <Box
                display={"flex"}
                alignItems={"baseline"}
                mt={"10px"}
                // onClick={() => handleSentenceClick(sentence.start)}
                _hover={{ cursor: "pointer" }}
              >
                <TimeTag time={sentence.start} />

                <Box pos={"relative"}>
                  {sentence.words.map((word: TranscriptWord) => (
                    <Word
                      key={word.start}
                      word={word}
                      currentTime={currentTime}
                      setVideoTime={setVideoTime}
                    />
                  ))}
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default Transcript;
