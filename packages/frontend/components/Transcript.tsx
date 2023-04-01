import { Box, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

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

const Transcript = ({ videoRef, videoData = dummyData }: TranscriptProps) => {
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

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString()}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Box w={"100%"}>
      <Box mt={4}>
        {videoData.transcript?.map((section: TranscriptSection) =>
          section.sentences.map((sentence: TranscriptSentence) => {
            return (
              <Box display={"flex"} alignItems={"baseline"} mt={"2px"}>
                <Box
                  bg={"gray.200"}
                  py={1}
                  px={2}
                  borderRadius={"20px"}
                  textAlign={"center"}
                  mr={2}
                >
                  {formatTime(sentence.start)}
                </Box>
                <Box display={"flex"}>
                  {sentence.words.map((word: TranscriptWord, i: number) => {
                    const isCurrentWord =
                      currentTime &&
                      currentTime >= word.start &&
                      currentTime <= word.end;
                    const isNextWordHighlighted =
                      i < sentence.words.length - 1 &&
                      currentTime &&
                      currentTime >= sentence.words[i + 1].start &&
                      currentTime <= sentence.words[i + 1].end;
                    return (
                      <>
                        <Text
                          style={{
                            backgroundColor: isCurrentWord
                              ? "yellow"
                              : "transparent",
                          }}
                        >
                          {word.content}
                        </Text>
                        <Text
                          style={{
                            backgroundColor:
                              isCurrentWord && isNextWordHighlighted
                                ? "yellow"
                                : "transparent",
                          }}
                        >
                          &nbsp;
                        </Text>
                      </>
                    );
                  })}
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
