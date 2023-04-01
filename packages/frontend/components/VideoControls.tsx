import { Box, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";

export type VideoControlsProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  videoRef: React.RefObject<HTMLVideoElement> | null;
  videoTitle?: string;
};

const VideoControls = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  videoRef,
  videoTitle,
}: VideoControlsProps): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [progress, setProgress] = useState(0.4);

  //   const handleVideoClick = () => {
  //     if (props.videoRef?.current) {
  //       props.videoRef.current.pause();
  //     }
  //   };

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

  return (
    <Box
      position={"absolute"}
      w={"1000px"}
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
        <svg
          width={"18"}
          height={"18"}
          viewBox={"0 0 18 18"}
          fill={"none"}
          xmlns={"http://www.w3.org/2000/svg"}
        >
          <path
            d={
              "M10.5716 15.4265V3.29898C10.5716 2.63196 10.8129 2.06076 11.2955 1.58536C11.7781 1.10996 12.3576 0.872668 13.0339 0.873476H15.4961C16.1732 0.873476 16.7531 1.11118 17.2357 1.58657C17.7183 2.06197 17.9592 2.63277 17.9584 3.29898V15.4265C17.9584 16.0935 17.7171 16.6647 17.2345 17.1401C16.7519 17.6155 16.1724 17.8528 15.4961 17.852H13.0339C12.3567 17.852 11.7769 17.6143 11.2943 17.1389C10.8117 16.6635 10.5708 16.0927 10.5716 15.4265ZM0.722597 15.4265V3.29898C0.722597 2.63196 0.963898 2.06076 1.4465 1.58536C1.9291 1.10996 2.50855 0.872668 3.18485 0.873476H5.6471C6.32422 0.873476 6.90408 1.11118 7.38668 1.58657C7.86928 2.06197 8.11017 2.63277 8.10935 3.29898V15.4265C8.10935 16.0935 7.86805 16.6647 7.38545 17.1401C6.90285 17.6155 6.3234 17.8528 5.6471 17.852H3.18485C2.50773 17.852 1.92787 17.6143 1.44527 17.1389C0.962667 16.6635 0.721777 16.0927 0.722597 15.4265ZM13.0339 15.4265H15.4961V3.29898H13.0339V15.4265ZM3.18485 15.4265H5.6471V3.29898H3.18485V15.4265Z"
            }
            fill={"black"}
          />
        </svg>

        <Box display={"flex"} alignItems={"center"} w={"100%"} padding={"5px"}>
          <Box
            bg={"#C4C4C4"}
            h={"2px"}
            w={"100%"}
            borderRadius={"2px"}
            mr={"10px"}
          >
            <Box bg={"#000000"} h={"100%"} w={`${progress * 100}%`} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoControls;
