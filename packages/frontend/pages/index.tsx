import type { NextPage } from "next";
import { Box, Text, Image, Heading } from "@chakra-ui/react";
import PageLayout from "../components/Layout/PageLayout";
import Footer from "../components/Layout/Footer";
import Card from "../components/Card";
import Button from "../components/Button";

const Home: NextPage = () => {
  return (
    <PageLayout title={"vibeo"}>
      <Box flexDirection={"column"} minH={"100vh"} display={"flex"}>
        <Box userSelect={"none"} flex={"1"}>
          <Card w={600} left={100} top={240} position={"absolute"} p={"3em"}>
            <Heading flexGrow={1} fontWeight={"normal"} fontSize={"7xl"}>
              vibeo
            </Heading>
            <Text mb={"2em"} fontWeight={"light"} fontSize={"3xl"}>
              your shareable vault for everything audio and video
            </Text>
            <Button fontSize={"3xl"} py={3} px={12}>
              Login
            </Button>
          </Card>

          <Image
            fit={"fill"}
            src={"bg-marker.png"}
            style={{
              userSelect: "none",
              position: "absolute",
              zIndex: "1",
            }}
          />
          <Image fit={"fill"} src={"bg-base.png"} zIndex={"0"} />
        </Box>
      </Box>
      <Footer />
    </PageLayout>
  );
};

export default Home;
