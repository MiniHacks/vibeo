import { Box, useBreakpointValue } from "@chakra-ui/react";
import {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Card from "../Card";

const PenCanvas = dynamic(() => import("./PenCanvas"), { ssr: false });

export type VideoPlayerProps = {
  source?: string;
  color: string;
  setUndoFunction: (func: () => void) => void;
};

const VideoPlayer: ForwardRefRenderFunction<
  HTMLVideoElement,
  VideoPlayerProps
> = ({ source, color, setUndoFunction }, ref) => {
  const sourceUrl = source || "https://www.w3schools.com/html/mov_bbb.mp4"; // TODO: Remove this temp for testing

  const [width, height] = ["825px", "450px"];

  const cardWidth = useBreakpointValue({ base: "100%", lg: width });
  const videoWidth = useBreakpointValue({ base: "100%", lg: width });

  return (
    <Card w={cardWidth} bg={"black"} overflow={"hidden"} p={0} pos={"relative"}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={ref} style={{ width: videoWidth, height }} autoPlay={false}>
        <source src={sourceUrl} type={"video/mp4"} />
        Your browser does not support the video tag.
      </video>
      <Box pos={"absolute"} top={0} left={0}>
        <PenCanvas
          width={width}
          height={height}
          color={color}
          setUndoFunction={setUndoFunction}
        />
      </Box>
    </Card>
  );
};

export default forwardRef(VideoPlayer);
