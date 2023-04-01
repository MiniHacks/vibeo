import { Box, Text, Image } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export type VideoControlsUser = {
  id: string;
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
  {
    id: "1",
    color: "red",
    iconUrl:
      "https://www.seattleaquarium.org/sites/default/files/images/animal/harborseal/Casey.jpg",
    progress: 0.2,
  },
  {
    id: "2",
    color: "blue",
    iconUrl:
      "https://media.wired.co.uk/photos/60c8730fa81eb7f50b44037e/16:9/w_2560%2Cc_limit/1521-WIRED-Cat.jpeg",
    progress: 0.5,
  },
  {
    id: "3",
    color: "green",
    iconUrl:
      "https://www.thesafaricollection.com/wp-content/uploads/2022/07/The-Safari-Collection-Hey-You-Giraffe-Manor-1.jpg",
    progress: 0.8,
  },
];

const VideoControls = ({
  videoRef,
  videoTitle,
  users = defaultUsers,
}: VideoControlsProps): JSX.Element => {
  const [progress, setProgress] = useState(0.4);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setPaused] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const { currentTime, duration } = videoRef?.current || {};
      if (currentTime && duration) {
        setProgress(currentTime / duration);
      }
    };

    const handleVideoEnd = () => {
      setPaused(true);
    };

    if (videoRef?.current) {
      videoRef.current.addEventListener("timeupdate", updateProgress);
      videoRef.current.addEventListener("ended", handleVideoEnd);
    }

    return () => {
      if (videoRef?.current) {
        videoRef.current.removeEventListener("timeupdate", updateProgress);
        videoRef.current.removeEventListener("ended", handleVideoEnd);
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

  const handlePauseClick = () => {
    if (isPaused) {
      videoRef?.current?.play();
      setPaused(false);
    } else {
      videoRef?.current?.pause();
      setPaused(true); // TODO: Update this to true at the end of the video
    }
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString()}:${seconds.toString().padStart(2, "0")}`;
  };

  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const newDuration = videoRef?.current?.duration || null;
    if (newDuration) {
      setDuration(newDuration);
    }
  }, [videoRef]);

  const progressInSeconds = Math.round(progress * duration);
  const formattedProgressTime = formatTime(progressInSeconds);
  const formattedDurationTime = formatTime(Math.round(duration));

  return (
    <Box
      w={"unset"}
      bg={"#FFFFFF"}
      border={"4px solid #000000"}
      boxShadow={"-8px 10px 0px #000000"}
      borderRadius={"16px"}
      padding={"10px 25px 10px 25px"}
    >
      <Box display={"flex"} justifyContent={"space-between"}>
        <Text fontSize={"4xl"} fontWeight={"bold"}>
          {videoTitle || "Video"}
        </Text>
        <Box position={"relative"}>
          {users.map((user, index) => (
            <Box
              key={user.id}
              position={"absolute"}
              right={`${(index + 1) * 25}px`}
              width={"50px"} // TODO: Scale this with the font size of the header probably
              height={"50px"}
              borderRadius={"50%"}
              border={`2px solid ${user.color}`}
              overflow={"hidden"}
            >
              <Image
                src={user.iconUrl}
                alt={`User ${index + 1}`}
                w={"100%"}
                h={"100%"}
              />
            </Box>
          ))}
        </Box>
      </Box>
      <Box display={"flex"} flexDirection={"row"}>
        <Box
          position={"relative"}
          display={"flex"}
          alignItems={"center"}
          w={"100%"}
          padding={"5px"}
        >
          <motion.div
            onClick={handlePauseClick}
            style={{ display: "flex", alignItems: "center" }}
          >
            {isPaused ? (
              <motion.svg
                xmlns={"http://www.w3.org/2000/svg"}
                width={"18"}
                height={"18"}
                viewBox={"0 0 18 18"}
                initial={"hidden"}
                animate={"visible"}
                exit={"hidden"}
              >
                <path
                  d={
                    "M9 0C4.0275 0 0 4.0275 0 9C0 13.9725 4.0275 18 9 18C13.9725 18 18 13.9725 18 9C18 4.0275 13.9725 0 9 0ZM6.75 4.5L13.5 9L6.75 13.5V4.5Z"
                  }
                  fill={"black"}
                />
              </motion.svg>
            ) : (
              <motion.svg
                xmlns={"http://www.w3.org/2000/svg"}
                width={"18"}
                height={"18"}
                viewBox={"0 0 18 18"}
                initial={"hidden"}
                animate={"visible"}
                exit={"hidden"}
              >
                <path
                  d={
                    "M10.5716 15.4265V3.29898C10.5716 2.63196 10.8129 2.06076 11.2955 1.58536C11.7781 1.10996 12.3576 0.872668 13.0339 0.873476H15.4961C16.1732 0.873476 16.7531 1.11118 17.2357 1.58657C17.7183 2.06197 17.9592 2.63277 17.9584 3.29898V15.4265C17.9584 16.0935 17.7171 16.6647 17.2345 17.1401C16.7519 17.6155 16.1724 17.8528 15.4961 17.852H13.0339C12.3567 17.852 11.7769 17.6143 11.2943 17.1389C10.8117 16.6635 10.5708 16.0927 10.5716 15.4265ZM0.722597 15.4265V3.29898C0.722597 2.63196 0.963898 2.06076 1.4465 1.58536C1.9291 1.10996 2.50855 0.872668 3.18485 0.873476H5.6471C6.32422 0.873476 6.90408 1.11118 7.38668 1.58657C7.86928 2.06197 8.11017 2.63277 8.10935 3.29898V15.4265C8.10935 16.0935 7.86805 16.6647 7.38545 17.1401C6.90285 17.6155 6.3234 17.8528 5.6471 17.852H3.18485C2.50773 17.852 1.92787 17.6143 1.44527 17.1389C0.962667 16.6635 0.721777 16.0927 0.722597 15.4265ZM13.0339 15.4265H15.4961V3.29898H13.0339V15.4265ZM3.18485 15.4265H5.6471V3.29898H3.18485V15.4265Z"
                  }
                  fill={"black"}
                />
              </motion.svg>
            )}
          </motion.div>
          <Box
            h={"18px"}
            w={"100%"}
            ml={"10px"}
            mr={"10px"}
            onClick={handleTimelineClick}
            onMouseDown={handleDragStart} // Add these lines
            onMouseUp={handleDragEnd}
            onMouseMove={handleDragMove}
            onMouseLeave={handleDragEnd}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
          >
            <Box bg={"#C4C4C4"} h={"2px"} w={"100%"} borderRadius={"2px"}>
              {users.map((user) => (
                <Box
                  key={user.id}
                  bg={user.color}
                  h={"10px"}
                  w={"10px"}
                  borderRadius={"50%"}
                  left={`${user.progress * 100}%`}
                  position={"absolute"}
                  top={"9px"}
                />
              ))}
              <Box bg={"#000000"} h={"100%"} w={`${progress * 100}%`} />
            </Box>
          </Box>
          <Text w={"12ch"} textAlign={"center"} fontSize={"xs"}>
            {formattedProgressTime}/{formattedDurationTime}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoControls;
