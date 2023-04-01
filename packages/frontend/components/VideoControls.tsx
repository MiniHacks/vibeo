import { Box, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";

export type VideoControlsUser = {
  color: string;
  iconUrl: string;
  progress: number;
};

export type VideoControlsProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  videoRef: React.RefObject<HTMLVideoElement> | null;
  videoTitle?: string;
  users?: VideoControlsUser[];
};

const defaultUsers: VideoControlsUser[] = [
  { color: "red", iconUrl: "https://example.com/user1.png", progress: 0.2 },
  { color: "blue", iconUrl: "https://example.com/user2.png", progress: 0.5 },
  { color: "green", iconUrl: "https://example.com/user3.png", progress: 0.8 },
];

const VideoControls = ({
  videoRef,
  videoTitle,
  users = defaultUsers,
}: VideoControlsProps): JSX.Element => {
  const [progress, setProgress] = useState(0.4);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const { currentTime, duration } = videoRef?.current || {};
      if (currentTime && duration) {
        setProgress(currentTime / duration);
      }
    };

    if (videoRef?.current) {
      videoRef.current.addEventListener("timeupdate", updateProgress);
    }

    return () => {
      if (videoRef?.current) {
        videoRef.current.removeEventListener("timeupdate", updateProgress);
      }
    };
  }, [videoRef]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const timeline = e.currentTarget;
    const timelineWidth = timeline.offsetWidth;
    const clickX = e.clientX - timeline.getBoundingClientRect().left;
    const clickPercentage = clickX / timelineWidth;
    const { duration } = videoRef?.current || {};
    if (duration && videoRef != null && videoRef.current) {
      const newTime = duration * clickPercentage;
      videoRef!.current!.currentTime = newTime;
      setProgress(newTime / duration);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const timeline = e.currentTarget as HTMLDivElement;
      const timelineWidth = timeline.offsetWidth;
      const clickX = e.clientX - timeline.getBoundingClientRect().left;
      const clickPercentage = clickX / timelineWidth;
      const { duration } = videoRef?.current || {};
      if (duration && videoRef != null && videoRef.current) {
        const newTime = duration * clickPercentage;
        videoRef!.current!.currentTime = newTime;
        setProgress(newTime / duration);
      }
    }
  };

  return (
    <Box
      position={"absolute"}
      w={"1000px"} // TODO: Probably change this to 100%
      bg={"#FFFFFF"}
      border={"4px solid #000000"}
      boxShadow={"-8px 10px 0px #000000"}
      borderRadius={"16px"}
      padding={"10px 25px 10px 25px"}
    >
      <Text fontSize={"4xl"} fontWeight={"bold"}>
        {videoTitle || "Video"}
      </Text>
      <Box display={"flex"} flexDirection={"row"}>
        <Box
          position={"relative"}
          display={"flex"}
          alignItems={"center"}
          w={"100%"}
          padding={"5px"}
        >
          <Box
            bg={"#C4C4C4"}
            h={"2px"}
            w={"100%"}
            borderRadius={"2px"}
            mr={"10px"}
            onClick={handleTimelineClick}
            onMouseDown={handleDragStart} // Add these lines
            onMouseUp={handleDragEnd}
            onMouseMove={handleDragMove}
            onMouseLeave={handleDragEnd}
          >
            {users.map((user, index) => (
              <Box
                key={index}
                bg={user.color}
                h={"10px"}
                w={"10px"}
                borderRadius={"50%"}
                left={`${user.progress * 100}%`}
                position={"absolute"}
                top={"1px"}
              />
            ))}
            <Box bg={"#000000"} h={"100%"} w={`${progress * 100}%`} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoControls;
