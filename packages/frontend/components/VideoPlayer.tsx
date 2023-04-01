import { Box } from "@chakra-ui/react";
import { ReactNode, useState, useRef, useEffect } from "react";

export type VideoPlayerProps = {
  source?: string;
};

const VideoPlayer = (props: VideoPlayerProps): JSX.Element => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [videoRef]);

  const source = props.source || "https://www.w3schools.com/html/mov_bbb.mp4"; // TODO: Remove this temp for testing

  const handleVideoClick = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 2;
    }
  };

  return (
    <Box bg="blue" w="500px" h="500px" onClick={handleVideoClick}>
        Current time: {currentTime}
        <video ref={videoRef} width="100%" height="100%" autoPlay preload="auto" >
          <source src={source} type="video/mp4" />
          Your browser does not support the video tag.
        </video> 
    </Box>
  );
};

export default VideoPlayer;
