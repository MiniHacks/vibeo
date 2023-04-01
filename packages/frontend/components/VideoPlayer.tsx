import { Box } from "@chakra-ui/react";
import { forwardRef, ForwardRefRenderFunction } from "react";

export type VideoPlayerProps = {
  source?: string;
};

const VideoPlayer: ForwardRefRenderFunction<
  HTMLVideoElement,
  VideoPlayerProps
> = ({ source }, ref) => {
  const sourceUrl = source || "https://www.w3schools.com/html/mov_bbb.mp4"; // TODO: Remove this temp for testing

  return (
    <Box bg={"blue"} w={"500px"} h={"500px"}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={ref} width={"100%"} height={"100%"} autoPlay>
        <source src={sourceUrl} type={"video/mp4"} />
        Your browser does not support the video tag.
      </video>
    </Box>
  );
};

export default forwardRef(VideoPlayer);
