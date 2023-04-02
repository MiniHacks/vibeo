/* eslint-disable no-nested-ternary */ // 😡 ESlint was getting on my nerves with this one.
import { Box, Text, Image, Link } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export type VideoControlsUser = {
  id: string;
  color: string;
  iconUrl: string;
  progress: number;
};

export type VideoControlsProps = {
  videoRef: React.RefObject<HTMLVideoElement> | null;
  videoTitle?: string;
  users?: VideoControlsUser[];
  endRecording?: () => void;
  href?: string;
};

export const defaultUsers: VideoControlsUser[] = [
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
  href,
  endRecording,
}: VideoControlsProps): JSX.Element => {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setPaused] = useState(true);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const { currentTime, duration } = videoRef?.current || {};
      if (currentTime && duration) {
        setProgress(currentTime / duration);
      }
    };

    const updateDuration = () => {
      const newDuration = videoRef?.current?.duration || null;
      if (newDuration) {
        setDuration(newDuration);
      }
    };

    const handleVideoEnd = () => {
      setPaused(true);
    };

    const onUpdate = () => {
      updateProgress();
      updateDuration();
    };

    if (videoRef?.current) {
      videoRef.current.addEventListener("timeupdate", onUpdate);
      videoRef.current.addEventListener("canplay", onUpdate);
      videoRef.current.addEventListener("ended", handleVideoEnd);
      videoRef.current.addEventListener("durationchange", onUpdate);
    }

    return () => {
      if (videoRef?.current) {
        videoRef.current.removeEventListener("canplay", onUpdate);
        videoRef.current.removeEventListener("durationchange", onUpdate);
        videoRef.current.removeEventListener("timeupdate", onUpdate);
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

  const progressInSeconds = Math.round(progress * duration);
  const formattedProgressTime = formatTime(progressInSeconds);
  const formattedDurationTime = formatTime(Math.round(duration));

  return (
    <Box
      w={"unset"}
      bg={"#FFFFFF"}
      border={"3px solid #000000"}
      boxShadow={"-8px 10px 0px #000000"}
      borderRadius={"10px"}
      px={8}
      py={2}
    >
      <Box display={"flex"} justifyContent={"space-between"}>
        <Text fontSize={"xl"} fontWeight={"bold"}>
          {videoTitle || "Video"}{" "}
          {href && (
            <Link href={href} isExternal>
              <ExternalLinkIcon mx={"2px"} mb={1} />
            </Link>
          )}
        </Text>
        <Box position={"relative"}>
          {users.map((user, index) => (
            <Box
              key={user.id}
              position={"absolute"}
              right={`${(index + 1) * 25 - 6}px`}
              width={"30px"} // TODO: Scale this with the font size of the header probably
              height={"30px"}
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
            onClick={
              videoRef?.current == null ? endRecording : handlePauseClick
            }
            style={{ display: "flex", alignItems: "center" }}
          >
            {videoRef?.current == null ? (
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
                    "M6.71037 0.446894C6.61189 0.46279 6.51459 0.485244 6.41911 0.514107C5.91371 0.627926 5.46337 0.913375 5.14474 1.32187C4.82612 1.73036 4.6589 2.23665 4.67156 2.75455V7.23545C4.67156 7.82965 4.90761 8.39952 5.32777 8.81968C5.74794 9.23985 6.3178 9.4759 6.91201 9.4759C7.50621 9.4759 8.07608 9.23985 8.49624 8.81968C8.91641 8.39952 9.15246 7.82965 9.15246 7.23545V2.75455C9.16329 2.43697 9.10645 2.12071 8.9857 1.82678C8.86495 1.53285 8.68306 1.26796 8.45209 1.04971C8.22113 0.83146 7.94638 0.664838 7.64609 0.560906C7.3458 0.456974 7.02683 0.41811 6.71037 0.446894ZM0.974823 4.995C0.742958 5.07295 0.542979 5.22464 0.405429 5.42692C0.26788 5.6292 0.200321 5.87094 0.213071 6.11522V7.23545C0.213071 10.5513 2.65516 13.2623 5.81419 13.8224V16.1972H4.69397C3.46172 16.1972 2.45352 17.2054 2.45352 18.4377H11.4377C11.4377 17.2054 10.4295 16.1972 9.19726 16.1972H8.07704V13.8224C11.2361 13.2847 13.6782 10.5513 13.6782 7.23545V6.11522C13.6782 5.81812 13.5601 5.53319 13.3501 5.32311C13.14 5.11302 12.855 4.995 12.5579 4.995C12.2608 4.995 11.9759 5.11302 11.7658 5.32311C11.5557 5.53319 11.4377 5.81812 11.4377 6.11522V7.23545C11.4377 9.72234 9.44371 11.7163 6.95682 11.7163C4.46992 11.7163 2.47592 9.72234 2.47592 7.23545V6.11522C2.47863 5.9495 2.44454 5.78524 2.37609 5.63428C2.30764 5.48333 2.20655 5.34945 2.0801 5.24229C1.95365 5.13513 1.805 5.05736 1.64486 5.0146C1.48473 4.97184 1.3171 4.96514 1.15406 4.995C1.10929 4.99231 1.0644 4.99231 1.01963 4.995H0.974823Z"
                  }
                  fill={"black"}
                />
              </motion.svg>
            ) : isPaused ? (
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
