import type { NextPage } from "next";
import { Box, Heading } from "@chakra-ui/react";
import { useRef } from "react";
import PageLayout from "../components/Layout/PageLayout";
import Footer from "../components/Layout/Footer";
import VideoPlayer from "../components/VideoPlayer";
import VideoControls from "../components/VideoControls";

const Home: NextPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <PageLayout title={"geese, by minihacks"}>
      <Box px={[5, 10]}>
        <Heading as={"h1"}>geese</Heading>
        <VideoPlayer ref={videoRef} />
        <VideoControls videoRef={videoRef} />
      </Box>
      <Footer />
    </PageLayout>
  );
};

export default Home;
