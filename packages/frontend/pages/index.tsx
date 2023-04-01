import type { NextPage } from "next";
import { Box, Text, Image, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import PageLayout from "../components/Layout/PageLayout";
import Footer from "../components/Layout/Footer";
import Card from "../components/Card";
import Button from "../components/Button";
import { useSignInWithProvider } from "../lib/hooks/useSignInWithProvider";
import Boing from "../components/Boing";

// FIXME: turn the imgs into a background img in a box
// so that the cards no longer have to be positioned absolute
// and then parallax can be implemented

const Home: NextPage = () => {
  const [signInWithProvider] = useSignInWithProvider();

  const router = useRouter();
  const login = () => {
    signInWithProvider().then(() => router.push("/dashboard"));
  };

  const markers = [
    { src: "marker4.svg", delay: 0 },
    { src: "marker2.svg", delay: 0 },
    { src: "marker3.svg", delay: 0.25 },
    { src: "marker1.svg", delay: 0.5 },
  ];

  return (
    <PageLayout title={"vibeo - your personal video repository"}>
      <Image
        fit={"fill"}
        position={"absolute"}
        src={"bg-base.svg"}
        zIndex={"-2"}
      />
      {markers.map((marker, i) => (
        <Boing key={i} delayTime={marker.delay}>
          <Image fit={"fill"} position={"absolute"} src={marker.src} zIndex={"-1"} />
        </Boing>
      ))}
      <Box flexDirection={"column"} minH={"2150px"} display={"flex"}>
        <Box userSelect={"none"} flex={"1"}>
          <Card
            w={600}
            left={100}
            top={{ lg: "80px", xl: "200px" }}
            position={"absolute"}
            p={"3em"}
          >
            <Heading flexGrow={1} fontWeight={"normal"} fontSize={"7xl"}>
              vibeo
            </Heading>
            <Text mb={"2em"} fontWeight={"light"} fontSize={"3xl"}>
              your shareable vault for everything audio and video
            </Text>
            <Button fontSize={"3xl"} py={3} px={12} onClick={login}>
              Login
            </Button>
          </Card>

          <Card left={200} top={1384} p={2} position={"absolute"}>
            <Image
              src={"https://via.placeholder.com/439x257"}
              alt={"placeholder"}
              width={"100%"}
              borderRadius={"md"}
            />
          </Card>

          <Card left={824} top={1714} p={2} position={"absolute"}>
            <Image
              src={"https://via.placeholder.com/439x257"}
              alt={"placeholder"}
              width={"100%"}
              borderRadius={"md"}
            />
          </Card>
        </Box>
      </Box>
      <Footer />
    </PageLayout>
  );
};

export default Home;
