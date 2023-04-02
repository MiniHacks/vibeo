import type { NextPage } from "next";
import { Box, Text, Image, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import PageLayout from "../components/Layout/PageLayout";
import Footer from "../components/Layout/Footer";
import Card from "../components/Card";
import Button from "../components/Button";
import Parallax from "../components/Parallax";
import { useSignInWithProvider } from "../lib/hooks/useSignInWithProvider";
import Boing from "../components/Boing";

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
          <Image
            fit={"fill"}
            position={"absolute"}
            src={marker.src}
            zIndex={"-1"}
          />
        </Boing>
      ))}
      <Box
        flexDirection={"column"}
        minH={["100vh", null, "2150px"]}
        display={"flex"}
      >
        <Box userSelect={"none"} flex={"1"}>
          <Parallax offset={100}>
            <Card
              w={["80vw", null, 600]}
              left={[8, null, 100]}
              top={{ lg: "80px", xl: "200px" }}
              position={"absolute"}
              p={["1em", null, "3em"]}
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
          </Parallax>
          <Parallax offset={1000}>
            <Card
              left={200}
              top={[0, null, 1584]}
              p={2}
              position={"absolute"}
              display={["none", null, "block"]}
            >
              <Image
                src={"https://via.placeholder.com/439x257"}
                alt={"placeholder"}
                width={"100%"}
                borderRadius={"md"}
              />
            </Card>
            <Card
              left={824}
              top={[0, null, 2114]}
              p={2}
              position={"absolute"}
              display={["none", null, "block"]}
            >
              <Image
                src={"https://via.placeholder.com/439x257"}
                alt={"placeholder"}
                width={"100%"}
                borderRadius={"md"}
              />
            </Card>
          </Parallax>
        </Box>
      </Box>
      <Footer />
    </PageLayout>
  );
};

export default Home;
